import { describe, it, expect, vi, beforeAll, afterAll, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { readMail } from "@/lib/contact/testing/mail-view";
import {
  TEST_SMTP_NAME,
  hasOpenssl,
  makeTestCertificates,
  startTestSmtpServer,
  type TestCertificates,
  type TestSmtpServer,
} from "@/lib/contact/testing/smtp-server";

// The route's own SMTP options, run with the real nodemailer and Node's TLS against local SMTP servers
// (2026-11-19, nodemailer 6 to 10; 4605378, a1bc8c6, 88e63d2): one that speaks TLS from the first byte, as the mail
// server does on port 465, one that starts in plain text and offers STARTTLS, as on 587, and one that offers no
// STARTTLS at all. Through both kinds of TLS it re-proves 2760f94's matrix: the server's certificate (for mail.test,
// from a throwaway CA) is refused by default, by the CA alone (127.0.0.1 is not its name), with a wrong name, and even
// under NODE_TLS_REJECT_UNAUTHORIZED=0; with the CA and the name the message is delivered, signed in with SMTP_USER
// over TLS. On 587 and 25 the password is never sent before STARTTLS succeeded.
//
// A test server can't listen on 465 or 587, so the route's port is pointed at the one the system gave the matching
// server: that is the only option changed between the route and nodemailer. Skipped without openssl.

const { nodemailerOf, ports, configs, deadline } = vi.hoisted(() => ({
  nodemailerOf: (loaded: unknown) =>
    ((loaded as { default?: unknown }).default ?? loaded) as { createTransport(options: object): unknown },
  /** The route's port → the test server's. */
  ports: new Map<number, number>(),
  configs: [] as Array<Record<string, unknown>>,
  /** The send's deadline the route reads (lib/contact/smtp.ts): production's, but where a test shortens it. */
  deadline: { ms: 25_000 },
}));

vi.mock("@/lib/contact/smtp", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/contact/smtp")>()),
  get SMTP_SEND_DEADLINE_MS() {
    return deadline.ms;
  },
}));

vi.mock("nodemailer", async (importOriginal) => {
  const real = nodemailerOf(await importOriginal());
  return {
    default: {
      createTransport(config: Record<string, unknown>) {
        configs.push(config);
        // Only ever a local test server.
        const port = ports.get(Number(config.port));
        if (config.host !== "127.0.0.1" || port === undefined) {
          throw new Error(`refusing ${String(config.host)}:${String(config.port)}: not a test server`);
        }
        return real.createTransport({ ...config, port });
      },
    },
  };
});
// The lead goes through submit_website_lead (lib/contact/lead.ts); from() throws and is watched.
const rpc = vi.fn();
const from = vi.fn((..._args: unknown[]): never => {
  throw new Error("a lead is written through submit_website_lead, never from()");
});
vi.mock("@/lib/supabase", () => ({
  createReadClient: () => ({ rpc: (...a: unknown[]) => rpc(...a), from: (...a: unknown[]) => from(...a) }),
}));
// A made-up key for these tests; the real one exists only on the site's Vercel project.
const LEAD_KEY = "tls-test-lead-key-0123456789abcdef0123456789";
vi.mock("botid/server", () => ({ checkBotId: async () => ({ isBot: false, isHuman: true, isVerifiedBot: false, bypassed: false }) }));
vi.mock("@vercel/firewall", () => ({ checkRateLimit: async () => ({ rateLimited: false }) }));

const USER = "noreply@logistiq.test";
const PASS = "smtp-test-secret";

const human = {
  name: "Ion Popescu",
  email: "ion@firma.ro",
  company: "Transport SRL",
  phone: "+40 771 570 577",
  message: "Avem 3 depozite și vrem o ofertă.",
  reference: "",
  elapsedMs: 42_000,
};

let certs: TestCertificates;
/** TLS from the first byte: the route's 465. */
let implicit: TestSmtpServer;
/** Plain text with STARTTLS: the route's 587. */
let starttls: TestSmtpServer;
/** Plain text, no STARTTLS on offer: the route's 25. */
let plain: TestSmtpServer;

/** POSTs a person's message to the route as it loads with `env` (SMTP_PORT unset: the production 465). */
async function send(env: Record<string, string>) {
  vi.stubEnv("RECAPTCHA_SECRET_KEY", "");
  vi.stubEnv("NEXT_PUBLIC_RECAPTCHA_SITE_KEY", "");
  vi.stubEnv("SMTP_HOST", "127.0.0.1");
  vi.stubEnv("SMTP_PORT", "");
  vi.stubEnv("SMTP_USER", USER);
  vi.stubEnv("SMTP_PASS", PASS);
  vi.stubEnv("SMTP_TLS_CA", "");
  vi.stubEnv("SMTP_TLS_SERVERNAME", "");
  vi.stubEnv("CONTACT_LEAD_KEY", LEAD_KEY);
  for (const [key, value] of Object.entries(env)) vi.stubEnv(key, value);
  vi.resetModules(); // the route reads its SMTP settings when it loads
  vi.mocked(console.error).mockClear();
  const { POST } = await import("@/app/api/contact/route");
  const res = await POST(
    new NextRequest("https://logistiq.ro/api/contact", {
      method: "POST",
      headers: { "content-type": "application/json", "x-real-ip": "203.0.113.7" },
      body: JSON.stringify(human),
    }),
  );
  const logged = vi.mocked(console.error).mock.calls.find(([label]) => label === "Contact form error:")?.[1] as
    | (Error & { code?: string })
    | undefined;
  return { status: res.status, body: (await res.json()) as Record<string, unknown>, error: logged };
}

/**
 * Refused before the password is sent: the route answers its error, nothing signed in, nothing was sent and no lead
 * was stored. When the TLS handshake is what failed, the server saw it fail (its side arrives after the client's, so
 * it is awaited) and, for TLS from the first byte, no session began.
 */
async function refused(
  server: TestSmtpServer,
  env: Record<string, string>,
  expected: { code: string; message: RegExp; handshakeFailed: boolean },
) {
  const sessions = server.sessions;
  const failures = server.tlsFailures.length;
  const result = await send(env);
  expect(result.status).toBe(500);
  expect(result.body.code).toBe("server");
  expect(result.error?.code).toBe(expected.code);
  expect(result.error?.message).toMatch(expected.message);
  if (expected.handshakeFailed) await vi.waitFor(() => expect(server.tlsFailures.length).toBeGreaterThan(failures));
  if (server === implicit) expect(server.sessions).toBe(sessions);
  expect(server.auths).toEqual([]);
  expect(server.deliveries).toEqual([]);
  expect(rpc).not.toHaveBeenCalled();
  expect(from).not.toHaveBeenCalled();
}

/** Delivered over TLS, signed in with SMTP_USER, to contact@logistiq.ro alone, as the route composed it. */
function delivered(server: TestSmtpServer, result: Awaited<ReturnType<typeof send>>) {
  expect(result).toMatchObject({ status: 200, body: { success: true } });
  expect(server.auths).toEqual([{ mechanism: "PLAIN", credentials: `\0${USER}\0${PASS}`, overTls: true }]);
  expect(server.deliveries).toHaveLength(1);
  const [delivery] = server.deliveries;
  expect(delivery).toMatchObject({ from: "noreply@logistiq.ro", to: ["contact@logistiq.ro"], overTls: true });
  const mail = readMail(delivery.data);
  expect(mail.headers).toMatchObject({
    From: "Logistiq Contact <noreply@logistiq.ro>",
    To: "contact@logistiq.ro",
    "Reply-To": "ion@firma.ro",
    Subject: "[Contact] Mesaj nou de la Ion Popescu",
  });
  expect(mail.parts?.[0].body).toContain("Avem 3 depozite și vrem o ofertă.");
  expect(rpc).toHaveBeenCalledTimes(1);
  expect(rpc.mock.calls[0]).toEqual([
    "submit_website_lead",
    expect.objectContaining({ p_key: LEAD_KEY, p_name: "Ion Popescu", p_email: "ion@firma.ro" }),
  ]);
  expect(from).not.toHaveBeenCalled();
}

const UNKNOWN_CA = /unable to verify the first certificate/;
const WRONG_NAME = /does not match certificate's altnames|is not in the cert's altnames|is not in the cert's list/;
const TRUSTED = { SMTP_TLS_CA: "", SMTP_TLS_SERVERNAME: TEST_SMTP_NAME };

describe.skipIf(!hasOpenssl())("the route's SMTP transport against local mail servers", () => {
  beforeAll(async () => {
    certs = makeTestCertificates();
    TRUSTED.SMTP_TLS_CA = certs.caPem;
    implicit = await startTestSmtpServer({ mode: "implicit-tls", certs });
    starttls = await startTestSmtpServer({ mode: "starttls", certs });
    plain = await startTestSmtpServer({ mode: "plain" });
    ports.set(465, implicit.port).set(587, starttls.port).set(25, plain.port);
  });

  afterAll(async () => {
    await Promise.all([implicit, starttls, plain].map((server) => server?.close()));
    certs?.remove();
  });

  beforeEach(() => {
    configs.length = 0;
    for (const server of [implicit, starttls, plain]) {
      server.tlsFailures.length = 0;
      server.auths.length = 0;
      server.deliveries.length = 0;
    }
    rpc.mockReset().mockResolvedValue({ data: null, error: null });
    from.mockClear();
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  describe("port 465 (the default): TLS from the first byte", () => {
    it("passes nodemailer the route's own options: TLS from the first byte, the certificate always verified", async () => {
      await send(TRUSTED);
      expect(configs).toHaveLength(1);
      expect(configs[0]).toMatchObject({
        host: "127.0.0.1",
        port: 465,
        secure: true,
        auth: { user: USER, pass: PASS },
        tls: { rejectUnauthorized: true, servername: TEST_SMTP_NAME, ca: certs.caPem.trim() },
      });
    });

    it("refuses the server by default: the public CAs don't know its CA", async () => {
      await refused(implicit, {}, { code: "ESOCKET", message: UNKNOWN_CA, handshakeFailed: true });
    });

    it("refuses it with the CA alone: 127.0.0.1 is not the name its certificate carries", async () => {
      await refused(implicit, { SMTP_TLS_CA: certs.caPem }, { code: "ESOCKET", message: WRONG_NAME, handshakeFailed: true });
    });

    it("refuses it under a wrong name", async () => {
      await refused(
        implicit,
        { SMTP_TLS_CA: certs.caPem, SMTP_TLS_SERVERNAME: "other.test" },
        { code: "ESOCKET", message: WRONG_NAME, handshakeFailed: true },
      );
    });

    it("still refuses it with NODE_TLS_REJECT_UNAUTHORIZED=0, by default and with the CA alone", async () => {
      await refused(implicit, { NODE_TLS_REJECT_UNAUTHORIZED: "0" }, { code: "ESOCKET", message: UNKNOWN_CA, handshakeFailed: true });
      await refused(
        implicit,
        { NODE_TLS_REJECT_UNAUTHORIZED: "0", SMTP_TLS_CA: certs.caPem },
        { code: "ESOCKET", message: WRONG_NAME, handshakeFailed: true },
      );
    });

    // nodemailer's defaults would wait 2 min to connect, 30 s for the greeting and 10 min of silence, holding the
    // request until the platform stops it (6f72982). Since nodemailer 10.1, connectionTimeout also bounds the
    // TLS handshake and the greeting.
    it("answers its error within 10 s when the server completes TLS but never greets", { timeout: 45_000 }, async () => {
      const silent = await startTestSmtpServer({ mode: "implicit-tls", certs, greet: false });
      ports.set(465, silent.port);
      try {
        const started = Date.now();
        const result = await send(TRUSTED);
        const elapsed = Date.now() - started;
        expect(result).toMatchObject({ status: 500, body: { code: "server" } });
        expect(result.error?.code).toBe("ETIMEDOUT");
        expect(result.error?.message).toMatch(/Greeting never received/);
        expect(elapsed).toBeGreaterThanOrEqual(9_000);
        expect(elapsed).toBeLessThan(12_000);
        expect(silent.sessions).toBe(1);
        expect(silent.auths).toEqual([]);
        expect(rpc).not.toHaveBeenCalled();
        expect(from).not.toHaveBeenCalled();
      } finally {
        ports.set(465, implicit.port);
        await silent.close();
      }
    });

    // A server that sends a byte now and then never trips the silence timer, and once it has greeted, the setup bound
    // no longer applies: only a deadline on the whole send stops it (25 s in production, shortened here).
    it("answers its error at the send's deadline when the server trickles its answer", { timeout: 30_000 }, async () => {
      const trickling = await startTestSmtpServer({ mode: "implicit-tls", certs, trickleEhlo: { everyMs: 200, forMs: 8_000 } });
      ports.set(465, trickling.port);
      deadline.ms = 1_500;
      try {
        const started = Date.now();
        const result = await send(TRUSTED);
        const elapsed = Date.now() - started;
        expect(result).toMatchObject({ status: 500, body: { code: "server" } });
        expect(result.error?.code).toBe("EABORT");
        expect(result.error?.name).toBe("AbortError");
        expect(elapsed).toBeGreaterThanOrEqual(1_400);
        expect(elapsed).toBeLessThan(4_000);
        await vi.waitFor(() => expect(trickling.trickles).toHaveLength(1), { timeout: 7_000 });
        expect(trickling.trickles[0].ended).toBe("the client hung up");
        expect(trickling.auths).toEqual([]);
        expect(trickling.deliveries).toEqual([]);
        expect(rpc).not.toHaveBeenCalled();
        expect(from).not.toHaveBeenCalled();
      } finally {
        deadline.ms = 25_000;
        ports.set(465, implicit.port);
        await trickling.close();
      }
    });

    it("delivers with the right CA and name, signed in with SMTP_USER over TLS, to contact@logistiq.ro alone", async () => {
      const sessions = implicit.sessions;
      delivered(implicit, await send(TRUSTED));
      expect(implicit.sessions).toBe(sessions + 1);
    });
  });

  // Since 88e63d2 (2026-11-19): production's SMTP_PORT is set and not read here, so only the ports that can't work with
  // TLS from the first byte change; any other port keeps today's mode.
  describe("any other port (2525 here): TLS from the first byte, as before", () => {
    it("passes nodemailer TLS from the first byte and delivers, signed in over TLS", async () => {
      ports.set(2525, implicit.port);
      const result = await send({ ...TRUSTED, SMTP_PORT: "2525" });
      expect(configs[0]).toMatchObject({ host: "127.0.0.1", port: 2525, secure: true, tls: { rejectUnauthorized: true } });
      expect(configs[0]).not.toHaveProperty("requireTLS");
      delivered(implicit, result);
    });
  });

  describe("ports 587 and 25: STARTTLS, required", () => {
    it("passes nodemailer the route's own options: plain text first, STARTTLS required, the certificate always verified", async () => {
      await send({ ...TRUSTED, SMTP_PORT: "587" });
      expect(configs).toHaveLength(1);
      expect(configs[0]).toMatchObject({
        host: "127.0.0.1",
        port: 587,
        secure: false,
        requireTLS: true,
        auth: { user: USER, pass: PASS },
        tls: { rejectUnauthorized: true, servername: TEST_SMTP_NAME, ca: certs.caPem.trim() },
      });
    });

    it("delivers with the right CA and name once STARTTLS succeeded, signed in over TLS", async () => {
      delivered(starttls, await send({ ...TRUSTED, SMTP_PORT: "587" }));
    });

    it("refuses the upgraded connection by default, with the CA alone, under a wrong name and under NODE_TLS_REJECT_UNAUTHORIZED=0", async () => {
      const port = { SMTP_PORT: "587" };
      const handshake = { code: "ESOCKET", handshakeFailed: true };
      await refused(starttls, port, { ...handshake, message: UNKNOWN_CA });
      await refused(starttls, { ...port, SMTP_TLS_CA: certs.caPem }, { ...handshake, message: WRONG_NAME });
      await refused(starttls, { ...port, SMTP_TLS_CA: certs.caPem, SMTP_TLS_SERVERNAME: "other.test" }, { ...handshake, message: WRONG_NAME });
      await refused(starttls, { ...port, NODE_TLS_REJECT_UNAUTHORIZED: "0" }, { ...handshake, message: UNKNOWN_CA });
    });

    it("never sends the password to a server that offers no STARTTLS", async () => {
      await refused(plain, { ...TRUSTED, SMTP_PORT: "25" }, { code: "ETLS", message: /STARTTLS/, handshakeFailed: false });
      expect(plain.sessions).toBeGreaterThan(0);
    });
  });
});
