import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";

// Nothing real is ever reached: SMTP, Supabase, BotID, the Vercel firewall and
// Google are all mocked.
const sendMail = vi.fn();
const createTransport = vi.fn();
vi.mock("nodemailer", () => ({
  default: {
    createTransport: (...a: unknown[]) => {
      createTransport(...a);
      return { sendMail: (...b: unknown[]) => sendMail(...b) };
    },
  },
}));
const insert = vi.fn();
vi.mock("@/lib/supabase", () => ({
  createReadClient: () => ({ from: () => ({ insert: (...a: unknown[]) => insert(...a) }) }),
}));
const checkBotId = vi.fn();
vi.mock("botid/server", () => ({ checkBotId: (...a: unknown[]) => checkBotId(...a) }));
const checkRateLimit = vi.fn();
vi.mock("@vercel/firewall", () => ({ checkRateLimit: (...a: unknown[]) => checkRateLimit(...a) }));

import { POST } from "@/app/api/contact/route";

const fetchMock = vi.fn();

const human = {
  name: "Ion Popescu",
  email: "ion@firma.ro",
  company: "Transport SRL",
  phone: "+40 771 570 577",
  message: "Avem 3 depozite și vrem o ofertă.",
  reference: "",
  elapsedMs: 42_000,
};

function post(body: unknown) {
  return POST(
    new NextRequest("https://logistiq.ro/api/contact", {
      method: "POST",
      headers: { "content-type": "application/json", "x-real-ip": "203.0.113.7" },
      body: typeof body === "string" ? body : JSON.stringify(body),
    })
  );
}

const nothingSentOrStored = () => {
  expect(sendMail).not.toHaveBeenCalled();
  expect(insert).not.toHaveBeenCalled();
};

const delivered = () => {
  expect(sendMail).toHaveBeenCalledTimes(1);
  expect(insert).toHaveBeenCalledTimes(1);
};

// A fresh Response per call: a body can be read only once.
const google = (answer: Record<string, unknown>) =>
  fetchMock.mockImplementation(async () => new Response(JSON.stringify(answer), { status: 200 }));

const without = (key: string): Record<string, unknown> => {
  const body: Record<string, unknown> = { ...human };
  delete body[key];
  return body;
};

beforeEach(() => {
  createTransport.mockReset();
  sendMail.mockReset().mockResolvedValue({ messageId: "test" });
  insert.mockReset().mockResolvedValue({ error: null });
  checkBotId.mockReset().mockResolvedValue({ isBot: false, isHuman: true, isVerifiedBot: false, bypassed: false });
  checkRateLimit.mockReset().mockResolvedValue({ rateLimited: false });
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
  vi.stubEnv("RECAPTCHA_SECRET_KEY", "");
  vi.stubEnv("NEXT_PUBLIC_RECAPTCHA_SITE_KEY", "");
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("POST /api/contact — a person", () => {
  it("emails the message and stores the lead", async () => {
    const res = await post(human);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true });
    delivered();
    const mail = sendMail.mock.calls[0][0];
    expect(mail.to).toBe("contact@logistiq.ro");
    expect(mail.replyTo).toBe("ion@firma.ro");
    expect(mail.text).toContain(human.message);
    expect(insert.mock.calls[0][0]).toMatchObject({ name: "Ion Popescu", email: "ion@firma.ro", source: "website_contact" });
  });

  it("escapes every field in the notification email", async () => {
    await post({
      ...human,
      name: "<b>Ion</b>",
      company: `<img src=x onerror="alert(1)">`,
      message: `<a href="https://evil.example">click</a>\nrândul 2`,
    });
    const { html } = sendMail.mock.calls[0][0];
    expect(html).not.toMatch(/<b>Ion|<img|<a href="https:\/\/evil/);
    expect(html).toContain("&lt;b&gt;Ion&lt;/b&gt;");
    expect(html).toContain("&lt;a href=&quot;https://evil.example&quot;&gt;click&lt;/a&gt;<br>rândul 2");
  });

  it("rejects missing fields, a bad email and over-long values with 400", async () => {
    for (const body of [
      { ...human, name: "" },
      { ...human, email: "not-an-email" },
      { ...human, message: "x".repeat(5001) },
      { ...human, name: { first: "Ion" } },
      "not json",
      [],
    ]) {
      const res = await post(body);
      expect(res.status, JSON.stringify(body).slice(0, 40)).toBe(400);
      expect((await res.json()).code).toBe("invalid");
    }
    nothingSentOrStored();
  });

  it("answers 500 and stores nothing when the email can't be sent", async () => {
    sendMail.mockRejectedValue(new Error("SMTP down"));
    const res = await post(human);
    expect(res.status).toBe(500);
    expect((await res.json()).code).toBe("server");
    expect(insert).not.toHaveBeenCalled();
  });

  it("sends through a transport that verifies the mail server's TLS certificate", async () => {
    await post(human);
    expect(createTransport).toHaveBeenCalledTimes(1);
    expect(createTransport.mock.calls[0][0]).toMatchObject({ secure: true, tls: { rejectUnauthorized: true } });
  });

  it("gives the send a deadline of its own: a signal that aborts it (lib/contact/smtp.ts)", async () => {
    await post(human);
    const { signal } = sendMail.mock.calls[0][0];
    expect(signal).toBeInstanceOf(AbortSignal);
    expect(signal.aborted).toBe(false);
  });

  it("gives up on a mail server that hangs: 10 s to connect and greet, 20 s of silence", async () => {
    await post(human);
    expect(createTransport.mock.calls[0][0]).toMatchObject({
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 20_000,
    });
  });
});

// The form's input is closed as qrgo.ro's delete-data form is (c1d6c1b; monorepo 58dee946). The visitor's address
// becomes the e-mail's Reply-To, so it must be a plain mailbox: the old check (/^[^\s@]+@[^\s@]+\.[^\s@]+$/) let
// through the forms nodemailer's address-parser advisories need, which 6.10.1 and 10.5.0 even read differently
// (commit a4df56d). Name, company and phone are one line; the message keeps its line breaks. The answers are the
// route's own 400s; the form shows its own sentence for their code (lib/contact/refusal.ts).
describe("the input is closed", () => {
  const BAD_ADDRESS = "Adresa de email nu este validă";
  const BAD_FIELD = "Un câmp este prea lung sau nu este valid";

  async function refused(body: Record<string, unknown>, error: string) {
    const res = await post(body);
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error, code: "invalid" });
    nothingSentOrStored();
  }

  const addresses: Array<[string, string]> = [
    ["a list", "a,b@c.ro"],
    ["a list with a semicolon", "a;b@c.ro"],
    ["a group", "team:a@c.ro;"],
    ["a quoted local part", `"x;y"@d.ro`],
    ["an angle address", "a<b@evil.example>"],
    ["a stray quote", `q"@x.ro`],
    ["a comment", "ion(evil.example)@firma.ro"],
    ["markup", `"><svg/onload=alert(1)>@evil.ro`],
    ["a domain literal", "ion@[127.0.0.1]"],
    ["a backslash", "ion\\@firma.ro"],
    ["a leading dot", ".ion@firma.ro"],
    ["two dots in a row", "ion..popescu@firma.ro"],
    ["a NUL", "ion\u0000@firma.ro"],
    ["a bidi override", "ion\u202e@firma.ro"],
    ["a numeric top-level domain", "ion@firma.123"],
  ];
  for (const [form, email] of addresses) {
    it(`refuses an address with ${form}: ${JSON.stringify(email)}`, async () => {
      await refused({ ...human, email }, BAD_ADDRESS);
    });
  }

  const oneLine: Array<[string, string, string]> = [
    ["name", "CR/LF and a Bcc: header", "Ion\r\nBcc: all@corp.example"],
    ["name", "a lone LF", "Ion\nX-Injected: yes"],
    ["name", "a lone CR", "Ion\rX-Injected: yes"],
    ["name", "a C1 next line (U+0085)", "Ion\u0085Bcc: all@corp.example"],
    ["name", "DEL", "Ion\u007f"],
    ["name", "a paragraph separator (U+2029)", "Ion\u2029Popescu"],
    ["company", "a line separator (U+2028)", "Transport\u2028SRL"],
    ["company", "a tab", "Transport\tSRL"],
    ["company", "an escape sequence", "Transport \u001b[31mSRL"],
    ["company", "a bidi override (U+202E)", "Transport \u202eLRS"],
    ["phone", "a NUL", "+40 771\u0000570 577"],
    ["phone", "a bidi isolate inside it (U+2066)", "+40 771\u2066570 577"],
  ];
  for (const [field, form, value] of oneLine) {
    it(`refuses a ${field} with ${form}`, async () => {
      await refused({ ...human, [field]: value }, BAD_FIELD);
    });
  }

  for (const [form, message] of [
    ["a NUL", "Bună ziua\u0000"],
    ["an escape sequence", "Bună \u001b[2Jziua"],
    ["a bidi override (U+202E)", "Bună ziua \u202eeroare"],
    ["a C1 control (U+009B)", "Bună \u009b31mziua"],
  ]) {
    it(`refuses a message with ${form}`, async () => {
      await refused({ ...human, message }, BAD_FIELD);
    });
  }

  // Chat apps and contact cards wrap a copied phone number in invisible direction marks (U+202A to U+202E, U+2066 to
  // U+2069). Built from char codes here, so no mark sits in this file.
  const mark = (code: number) => String.fromCharCode(code);
  const isMark = (char: string) => {
    const code = char.charCodeAt(0);
    return (code >= 0x202a && code <= 0x202e) || (code >= 0x2066 && code <= 0x2069);
  };

  it("takes a phone number copied with direction marks around it, and sends and stores it without them", async () => {
    const number = "+40 771 570 577";
    for (const phone of [
      `${mark(0x202a)}${number}${mark(0x202c)}`,
      `${mark(0x2066)}${number}${mark(0x2069)}`,
      ` ${mark(0x202d)} ${mark(0x2068)}${number}${mark(0x2069)} ${mark(0x202e)} `,
    ]) {
      sendMail.mockClear();
      insert.mockClear();
      const res = await post({ ...human, phone });
      expect(res.status, JSON.stringify(phone)).toBe(200);
      const mail = sendMail.mock.calls[0][0];
      expect(mail.text).toContain(`Telefon: ${number}\n`);
      expect(insert.mock.calls[0][0].phone).toBe(number);
      expect([...`${mail.text}${mail.html}${mail.subject}`].some(isMark)).toBe(false);
    }
  });

  it("still refuses a direction mark inside the phone number", async () => {
    for (const phone of [`+40 771${mark(0x202a)}570 577`, `+40${mark(0x2066)} 771 570 577${mark(0x2069)}`]) {
      await refused({ ...human, phone }, BAD_FIELD);
    }
  });

  it("keeps the message's line breaks and tabs", async () => {
    const message = "Rândul 1\r\nRândul 2\n\nRândul 4\tcu tab\rși CR";
    const res = await post({ ...human, message });
    expect(res.status).toBe(200);
    delivered();
    expect(sendMail.mock.calls[0][0].text).toContain(message);
  });

  it("takes the plain mailboxes people have", async () => {
    for (const email of ["ion.popescu+oferte@firma-mea.ro", "o'brien@example.ie", "ION_P@Sub.Firma.CO.UK", "a-b@x.de"]) {
      sendMail.mockClear();
      const res = await post({ ...human, email });
      expect(res.status, email).toBe(200);
      expect(sendMail.mock.calls[0][0].replyTo).toBe(email);
    }
  });

  it("takes every language's letters in the name, company and phone", async () => {
    const res = await post({
      ...human,
      name: "Ștefan Țăranu Îngheț Иван Pałka Øre Straße Ádám Zoë",
      company: "Întreprinderea „Nord” SRL — Șoseaua 7",
      phone: "+40 (771) 570-577 int. 12",
    });
    expect(res.status).toBe(200);
    delivered();
  });
});

describe("SMTP_PORT sets how the connection to the mail server is secured", () => {
  // The route reads its SMTP settings when it loads.
  async function transportFor(port: string) {
    vi.stubEnv("SMTP_PORT", port);
    vi.resetModules();
    const route = await import("@/app/api/contact/route");
    createTransport.mockClear();
    await route.POST(
      new NextRequest("https://logistiq.ro/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json", "x-real-ip": "203.0.113.7" },
        body: JSON.stringify(human),
      })
    );
    expect(createTransport).toHaveBeenCalledTimes(1);
    return createTransport.mock.calls[0][0] as Record<string, unknown>;
  }

  it("465 (the default) and every port but 587 and 25: TLS from the first byte, as before", async () => {
    for (const [port, number] of [["", 465], ["465", 465], ["2525", 2525], ["8465", 8465]] as const) {
      const options = await transportFor(port);
      expect(options, port).toMatchObject({ port: number, secure: true, tls: { rejectUnauthorized: true } });
      expect(options, port).not.toHaveProperty("requireTLS");
    }
  });

  it("587 and 25: plain text upgraded with STARTTLS, which must succeed before the password is sent", async () => {
    for (const port of ["587", "25"]) {
      const options = await transportFor(port);
      expect(options, port).toMatchObject({
        port: Number(port),
        secure: false,
        requireTLS: true,
        tls: { rejectUnauthorized: true },
      });
    }
  });
});

describe("layer 1: honeypot", () => {
  it("drops a message whose hidden field is filled, with the same 200 a person gets", async () => {
    for (const reference of ["https://spam.example", " ", 0, false]) {
      const res = await post({ ...human, reference });
      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({ success: true });
    }
    nothingSentOrStored();
    expect(checkBotId).not.toHaveBeenCalled();
    expect(checkRateLimit).not.toHaveBeenCalled();
  });

  it("an absent hidden field is a person's (an older open tab)", async () => {
    await post(without("reference"));
    delivered();
  });
});

describe("layer 2: fill time", () => {
  it("drops a form sent under three seconds after it opened", async () => {
    const res = await post({ ...human, elapsedMs: 900 });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true });
    nothingSentOrStored();
  });

  it("drops a form opened more than a day before it was sent", async () => {
    await post({ ...human, elapsedMs: 24 * 60 * 60 * 1000 + 1 });
    nothingSentOrStored();
  });

  it("drops a message with no fill time, or a forged one", async () => {
    for (const body of [without("elapsedMs"), { ...human, elapsedMs: "42000" }, { ...human, elapsedMs: -5 }]) {
      expect((await post(body)).status).toBe(200);
    }
    nothingSentOrStored();
  });

  it("accepts the bounds themselves", async () => {
    await post({ ...human, elapsedMs: 3000 });
    await post({ ...human, elapsedMs: 24 * 60 * 60 * 1000 });
    expect(sendMail).toHaveBeenCalledTimes(2);
  });
});

describe("layer 3: Vercel BotID", () => {
  it("checks at the basic level, the one the client protects", async () => {
    await post(human);
    expect(checkBotId).toHaveBeenCalledWith({ advancedOptions: { checkLevel: "basic" } });
  });

  it("drops what BotID calls a bot, with the same 200", async () => {
    checkBotId.mockResolvedValue({ isBot: true, isHuman: false, isVerifiedBot: false, bypassed: false });
    const res = await post(human);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true });
    nothingSentOrStored();
    expect(checkRateLimit).not.toHaveBeenCalled();
  });

  it("lets the message through when BotID can't answer (off Vercel, OIDC off)", async () => {
    checkBotId.mockRejectedValue(new Error("The 'x-vercel-oidc-token' header is missing"));
    await post(human);
    delivered();
  });
});

describe("layer 4: rate limit per IP (Vercel WAF)", () => {
  it("asks the 'contact' rule about this request, with a timeout", async () => {
    await post(human);
    expect(checkRateLimit).toHaveBeenCalledTimes(1);
    const [id, options] = checkRateLimit.mock.calls[0];
    expect(id).toBe("contact");
    expect(options.request.headers.get("x-real-ip")).toBe("203.0.113.7");
    expect(options.timeout).toBeGreaterThan(0);
  });

  it("answers 429 and sends nothing over the limit", async () => {
    checkRateLimit.mockResolvedValue({ rateLimited: true });
    const res = await post(human);
    expect(res.status).toBe(429);
    expect((await res.json()).code).toBe("rate_limited");
    nothingSentOrStored();
  });

  it("works before the WAF rule exists", async () => {
    checkRateLimit.mockResolvedValue({ rateLimited: false, error: "not-found" });
    await post(human);
    delivered();
  });

  it("lets the message through when the check fails or times out", async () => {
    checkRateLimit.mockRejectedValue(Object.assign(new Error("timed out"), { name: "TimeoutError" }));
    await post(human);
    delivered();
  });
});

describe("layer 5: reCAPTCHA v3", () => {
  const on = () => {
    vi.stubEnv("RECAPTCHA_SECRET_KEY", "test-secret");
    vi.stubEnv("NEXT_PUBLIC_RECAPTCHA_SITE_KEY", "test-site-key");
  };

  it("is off without keys: Google is never called", async () => {
    await post(human);
    expect(fetchMock).not.toHaveBeenCalled();
    delivered();
  });

  it("stays off, loudly, when only the secret is set (the form would send no token)", async () => {
    vi.stubEnv("RECAPTCHA_SECRET_KEY", "test-secret");
    await post(human);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining("NEXT_PUBLIC_RECAPTCHA_SITE_KEY"));
    delivered();
  });

  it("on: verifies the token with the secret and delivers a good score", async () => {
    on();
    google({ success: true, score: 0.9, action: "contact" });
    await post({ ...human, recaptchaToken: "good-token" });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://www.google.com/recaptcha/api/siteverify");
    const params = new URLSearchParams(String(init.body));
    expect(params.get("secret")).toBe("test-secret");
    expect(params.get("response")).toBe("good-token");
    delivered();
  });

  it("on: accepts exactly the 0.5 threshold", async () => {
    on();
    google({ success: true, score: 0.5, action: "contact" });
    await post({ ...human, recaptchaToken: "t" });
    delivered();
  });

  it("on: drops a low score, a wrong action, an invalid or a missing token (fail closed, same 200)", async () => {
    on();
    for (const answer of [
      { success: true, score: 0.3, action: "contact" },
      { success: true, score: 0.9, action: "login" },
      { success: false, "error-codes": ["invalid-input-response"] },
      { success: false, "error-codes": ["timeout-or-duplicate"] },
    ]) {
      google(answer);
      const res = await post({ ...human, recaptchaToken: "t" });
      expect(res.status, JSON.stringify(answer)).toBe(200);
      expect(await res.json()).toEqual({ success: true });
    }
    fetchMock.mockClear();
    expect((await post(human)).status).toBe(200); // no token at all
    expect(fetchMock).not.toHaveBeenCalled();
    nothingSentOrStored();
  });

  it("on: fails closed with 503 when Google can't be reached or rejects our key", async () => {
    on();
    fetchMock.mockRejectedValueOnce(new TypeError("fetch failed"));
    const unreachable = await post({ ...human, recaptchaToken: "t" });
    expect(unreachable.status).toBe(503);
    expect((await unreachable.json()).code).toBe("verify_failed");

    google({ success: false, "error-codes": ["invalid-input-secret"] });
    expect((await post({ ...human, recaptchaToken: "t" })).status).toBe(503);

    fetchMock.mockResolvedValueOnce(new Response("oops", { status: 502 }));
    expect((await post({ ...human, recaptchaToken: "t" })).status).toBe(503);
    nothingSentOrStored();
  });
});
