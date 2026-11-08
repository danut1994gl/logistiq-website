import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";

// Nothing real is ever reached: SMTP, Supabase, BotID, the Vercel firewall and
// Google are all mocked.
const sendMail = vi.fn();
vi.mock("nodemailer", () => ({
  default: { createTransport: () => ({ sendMail: (...a: unknown[]) => sendMail(...a) }) },
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
