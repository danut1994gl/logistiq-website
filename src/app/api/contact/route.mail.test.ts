import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { NextRequest } from "next/server";
import { readMail, type MailNode } from "@/lib/contact/testing/mail-view";

// The contact form's notification e-mail as the real route composes it with the real nodemailer, compared with what
// nodemailer 6.10.1 composed for the same input (2026-11-19, nodemailer 6 to 10; the design critic's I3).
//
// Nothing is sent: the route gets nodemailer's own transporter, built with
// `{ streamTransport: true, buffer: true, newline: "unix" }` in place of the SMTP options it passes (recorded below),
// so the message is written to memory. The same message also goes through nodemailer's jsonTransport, for the addresses
// as nodemailer parsed them and the envelope.
//
// route.mail.golden.json is 6.10.1's output, written by this test on 6.10.1 (84c31ad) with
//   CONTACT_MAIL_GOLDEN=write npx vitest run src/app/api/contact/route.mail.test.ts
// and kept as the "before": the installed nodemailer must compose the same, but for the differences listed in
// SINCE_6_10_1. Only what changes on every run is normalised (lib/contact/testing/mail-view.ts): the random half of
// Message-ID, the Date and the MIME boundary. Header values are compared decoded, not as folded.
//
// Six more inputs were composed by 6.10.1 and compared on 10.5.0 (84c31ad to a1bc8c6): HTML in the address, a name
// that adds headers, and the four Reply-To forms of critic I3. Since the form's input is closed (lib/contact/input.ts),
// the route refuses them before nodemailer is called, so they left the golden file; how 10.5.0 read three of them
// otherwise than 6.10.1 is recorded in commit a4df56d.

type Mail = Record<string, unknown>;
interface StreamInfo {
  envelope: { from: string | false; to: string[] };
  message: Buffer;
}
interface Transport {
  sendMail(mail: Mail): Promise<StreamInfo>;
}
interface Nodemailer {
  createTransport(options: object): Transport;
}

const { nodemailerOf, configs, sent } = vi.hoisted(() => ({
  /** nodemailer's own module, whether it loads as CommonJS (6.x) or as an ES module (10.x). */
  nodemailerOf: (loaded: unknown): Nodemailer => ((loaded as { default?: Nodemailer }).default ?? loaded) as Nodemailer,
  /** The options the route passed to createTransport. */
  configs: [] as unknown[],
  sent: [] as Array<{ mail: Mail; info: StreamInfo }>,
}));

vi.mock("nodemailer", async (importOriginal) => {
  const real = nodemailerOf(await importOriginal());
  return {
    default: {
      createTransport(config: object) {
        configs.push(config);
        const transport = real.createTransport({ streamTransport: true, buffer: true, newline: "unix" });
        const send = transport.sendMail.bind(transport);
        transport.sendMail = async (mail: Mail) => {
          const info = await send(mail);
          sent.push({ mail, info });
          return info;
        };
        return transport;
      },
    },
  };
});
// Nothing else is reached either: Supabase, BotID and the Vercel firewall are mocked; reCAPTCHA is off (no keys).
vi.mock("@/lib/supabase", () => ({
  createReadClient: () => ({ from: () => ({ insert: async () => ({ error: null }) }) }),
}));
vi.mock("botid/server", () => ({ checkBotId: async () => ({ isBot: false, isHuman: true, isVerifiedBot: false, bypassed: false }) }));
vi.mock("@vercel/firewall", () => ({ checkRateLimit: async () => ({ rateLimited: false }) }));

import { POST } from "@/app/api/contact/route";

const GOLDEN = fileURLToPath(new URL("./route.mail.golden.json", import.meta.url));
const WRITE = process.env.CONTACT_MAIL_GOLDEN === "write";

const installedVersion = (): string =>
  (createRequire(import.meta.url)("nodemailer/package.json") as { version: string }).version;

const human = {
  name: "Ion Popescu",
  email: "ion@firma.ro",
  company: "Transport SRL",
  phone: "+40 771 570 577",
  message: "Avem 3 depozite și vrem o ofertă.",
  reference: "",
  elapsedMs: 42_000,
};
// The inputs: a person; HTML in every field but the address; diacritics and other alphabets, long enough to fold
// the subject, with line breaks in the message.
const CASES: Record<string, Record<string, unknown>> = {
  human,
  "html in every field": {
    ...human,
    name: "<b>Ion</b>",
    company: `<img src=x onerror="alert(1)">`,
    phone: `"><script>alert(1)</script>`,
    message: `<a href="https://evil.example">click</a>\nrândul 2 & <i>3</i>`,
  },
  diacritics: {
    ...human,
    name: "Ștefan-Țăranu Îngheț Ăăâîșț Ионов Pałka Øre Straße",
    company: "Întreprinderea Țărănească de Transport Șoseaua Nordului SRL",
    message: "Bună ziua,\r\nAvem nevoie de o ofertă pentru șase rampe.\r\n\r\nMulțumesc — Ștefan",
  },
};

// What 6.10.1 composed too, and the route now refuses before nodemailer is called (see this file's header).
const REFUSED: Record<string, Record<string, unknown>> = {
  "html in the address": { ...human, email: `"><svg/onload=alert(1)>@evil.ro` },
  "a name that adds headers": { ...human, name: "Ion\r\nBcc: all@corp.example\nX-Injected: yes" },
  "reply-to: a list": { ...human, email: "a,b@c.ro" },
  "reply-to: a quoted local part": { ...human, email: `"x;y"@d.ro` },
  "reply-to: an angle address": { ...human, email: "a<b@evil.example>" },
  "reply-to: a stray quote": { ...human, email: `q"@x.ro` },
};

type Path = Array<string | number>;

// How the installed nodemailer composes these inputs otherwise than 6.10.1 did, one by one: listed, never normalised
// (critic I3); a release that differs fails the test until its differences are listed here. 10.5.0 composes all three
// exactly as 6.10.1 did. (The six differences it showed were all Reply-To parsing of three address forms that the route
// refuses since its input is closed; they are recorded in commit a4df56d.)
const SINCE_6_10_1: Record<string, Array<{ path: Path; was: unknown; now: unknown }>> = {};

/** The golden case with the listed differences applied; each one must still find 6.10.1's value where it says. */
function expectedFor(name: string, golden: Composed): Composed {
  const expected = structuredClone(golden);
  for (const { path, was, now } of SINCE_6_10_1[name] ?? []) {
    const parent = path.slice(0, -1).reduce<Record<string | number, unknown>>(
      (node, key) => node[key] as Record<string | number, unknown>,
      expected as unknown as Record<string | number, unknown>,
    );
    const key = path[path.length - 1];
    expect(parent[key], `${name} ${path.join(".")}: the golden value this difference starts from`).toEqual(was);
    parent[key] = now;
  }
  return expected;
}

interface Composed {
  answer: { status: number; body: unknown };
  /** The envelope the stream transport would have sent to: MAIL FROM and RCPT TO. */
  envelope: StreamInfo["envelope"];
  mail: MailNode;
  /** jsonTransport's view: the addresses as nodemailer parsed them, and its envelope. */
  parsed: { from: unknown; to: unknown; replyTo: unknown; envelope: unknown };
}

const composed: Record<string, Composed> = {};
const transportOptions: Record<string, unknown[]> = {};

async function compose(jsonTransport: Transport, input: Record<string, unknown>): Promise<Composed> {
  configs.length = 0;
  sent.length = 0;
  const res = await POST(
    new NextRequest("https://logistiq.ro/api/contact", {
      method: "POST",
      headers: { "content-type": "application/json", "x-real-ip": "203.0.113.7" },
      body: JSON.stringify(input),
    }),
  );
  const answer = { status: res.status, body: await res.json() };
  if (sent.length !== 1) throw new Error(`the route sent ${sent.length} messages: ${JSON.stringify(answer)}`);
  const { mail, info } = sent[0];
  const asJson = await jsonTransport.sendMail({ ...mail });
  const json = JSON.parse(String(asJson.message)) as Record<string, unknown>;
  return {
    answer,
    envelope: info.envelope,
    mail: readMail(info.message.toString("utf8")),
    parsed: { from: json.from, to: json.to, replyTo: json.replyTo, envelope: asJson.envelope },
  };
}

beforeAll(async () => {
  vi.stubEnv("RECAPTCHA_SECRET_KEY", "");
  vi.stubEnv("NEXT_PUBLIC_RECAPTCHA_SITE_KEY", "");
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
  const jsonTransport = nodemailerOf(await vi.importActual("nodemailer")).createTransport({ jsonTransport: true });
  for (const [name, input] of Object.entries(CASES)) {
    composed[name] = await compose(jsonTransport, input);
    transportOptions[name] = [...configs];
  }
});

afterAll(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

const htmlPart = (mail: MailNode): string =>
  mail.parts?.find((p) => /^text\/html/i.test(p.headers["Content-Type"] ?? ""))?.body ?? "";

describe("the notification e-mail, composed by the route and nodemailer", () => {
  for (const name of Object.keys(CASES)) {
    it(`${name}: goes to contact@logistiq.ro alone, through the route's TLS-verifying transport`, () => {
      const result = composed[name];
      expect(result.answer).toEqual({ status: 200, body: { success: true } });
      // Whatever the visitor typed, the envelope names contact@logistiq.ro alone: the form is no relay.
      expect(result.envelope).toEqual({ from: "noreply@logistiq.ro", to: ["contact@logistiq.ro"] });
      expect(result.parsed.envelope).toEqual({ from: "noreply@logistiq.ro", to: ["contact@logistiq.ro"] });
      expect(transportOptions[name]).toHaveLength(1);
      expect(transportOptions[name][0]).toMatchObject({
        host: "cloud342.c-f.ro",
        port: 465,
        secure: true,
        auth: { user: "noreply@logistiq.ro" },
        tls: { rejectUnauthorized: true },
      });
    });
  }

  it("HTML typed in any field arrives escaped in the HTML part", () => {
    const html = htmlPart(composed["html in every field"].mail);
    expect(html).not.toMatch(/<b>Ion|<img|<script|<a href="https:\/\/evil|<i>3/);
    expect(html).toContain("&lt;b&gt;Ion&lt;/b&gt;");
    expect(html).toContain("&lt;img src=x onerror=&quot;alert(1)&quot;&gt;");
    expect(html).toContain("&quot;&gt;&lt;script&gt;alert(1)&lt;/script&gt;");
    expect(html).toContain("&lt;a href=&quot;https://evil.example&quot;&gt;click&lt;/a&gt;<br>rândul 2 &amp; &lt;i&gt;3&lt;/i&gt;");
  });

  for (const [name, input] of Object.entries(REFUSED)) {
    it(`${name}: refused before nodemailer is called`, async () => {
      configs.length = 0;
      sent.length = 0;
      const res = await POST(
        new NextRequest("https://logistiq.ro/api/contact", {
          method: "POST",
          headers: { "content-type": "application/json", "x-real-ip": "203.0.113.7" },
          body: JSON.stringify(input),
        }),
      );
      expect(res.status).toBe(400);
      expect(configs).toEqual([]);
      expect(sent).toEqual([]);
    });
  }

  it(WRITE ? "writes the golden file" : "is what nodemailer 6.10.1 composed for the same input, but for the listed differences", () => {
    if (WRITE) {
      writeFileSync(GOLDEN, `${JSON.stringify({ nodemailer: installedVersion(), cases: composed }, null, 2)}\n`);
      return;
    }
    expect(existsSync(GOLDEN), "route.mail.golden.json is missing: write it on 6.10.1 (see this file's header)").toBe(true);
    const golden = JSON.parse(readFileSync(GOLDEN, "utf8")) as { nodemailer: string; cases: Record<string, Composed> };
    // The golden file is the "before": rewriting it with a newer release would hide what changed.
    expect(golden.nodemailer).toBe("6.10.1");
    expect(Object.keys(golden.cases).sort()).toEqual(Object.keys(CASES).sort());
    expect(Object.keys(SINCE_6_10_1).filter((name) => !(name in CASES))).toEqual([]);
    for (const name of Object.keys(CASES)) {
      expect(composed[name], name).toEqual(expectedFor(name, golden.cases[name]));
    }
  });
});
