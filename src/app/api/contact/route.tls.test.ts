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

// The route's own SMTP options, run with the real nodemailer and Node's TLS against a local SMTP server that speaks
// TLS from the first byte, as the mail server does on port 465 (2026-11-19, nodemailer 6 to 10; design critic I2).
// It re-proves 2760f94's matrix: the server's certificate (for mail.test, from a throwaway CA) is refused by default,
// by the CA alone (127.0.0.1 is not its name), with a wrong name, and even under NODE_TLS_REJECT_UNAUTHORIZED=0; with
// the CA and the name the message is delivered, signed in with SMTP_USER.
//
// A test server can't listen on 465, so the route's port is pointed at the one the system gave it: that is the only
// option changed between the route and nodemailer. Skipped without openssl.

const { nodemailerOf, ports, configs } = vi.hoisted(() => ({
  nodemailerOf: (loaded: unknown) =>
    ((loaded as { default?: unknown }).default ?? loaded) as { createTransport(options: object): unknown },
  /** The route's port → the test server's. */
  ports: new Map<number, number>(),
  configs: [] as Array<Record<string, unknown>>,
}));

vi.mock("nodemailer", async (importOriginal) => {
  const real = nodemailerOf(await importOriginal());
  return {
    default: {
      createTransport(config: Record<string, unknown>) {
        configs.push(config);
        // Only ever the local test server.
        const port = ports.get(Number(config.port));
        if (config.host !== "127.0.0.1" || port === undefined) {
          throw new Error(`refusing ${String(config.host)}:${String(config.port)}: not a test server`);
        }
        return real.createTransport({ ...config, port });
      },
    },
  };
});
const insert = vi.fn();
vi.mock("@/lib/supabase", () => ({
  createReadClient: () => ({ from: () => ({ insert: (...a: unknown[]) => insert(...a) }) }),
}));
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
let server: TestSmtpServer;

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
  for (const [key, value] of Object.entries(env)) vi.stubEnv(key, value);
  vi.resetModules(); // the route reads its SMTP settings when it loads
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
 * Refused before a word of SMTP: the route answers its error, the server saw the handshake fail (its side of the
 * failure arrives after the client's, so it is awaited), no handshake completed, nothing signed in, nothing was sent
 * and no lead was stored.
 */
async function refusedAtTheHandshake(env: Record<string, string>, reason: RegExp) {
  const sessions = server.sessions;
  const failures = server.tlsFailures.length;
  vi.mocked(console.error).mockClear();
  const result = await send(env);
  expect(result.status).toBe(500);
  expect(result.body.code).toBe("server");
  expect(result.error?.code).toBe("ESOCKET");
  expect(result.error?.message).toMatch(reason);
  await vi.waitFor(() => expect(server.tlsFailures.length).toBeGreaterThan(failures));
  expect(server.sessions).toBe(sessions);
  expect(server.auths).toEqual([]);
  expect(server.deliveries).toEqual([]);
  expect(insert).not.toHaveBeenCalled();
}

const UNKNOWN_CA = /unable to verify the first certificate/;
const WRONG_NAME = /does not match certificate's altnames|is not in the cert's altnames|is not in the cert's list/;

describe.skipIf(!hasOpenssl())("the route's SMTP transport against a TLS mail server (port 465)", () => {
  beforeAll(async () => {
    certs = makeTestCertificates();
    server = await startTestSmtpServer({ mode: "implicit-tls", certs });
    ports.set(465, server.port);
  });

  afterAll(async () => {
    await server?.close();
    certs?.remove();
  });

  beforeEach(() => {
    configs.length = 0;
    server.tlsFailures.length = 0;
    server.auths.length = 0;
    server.deliveries.length = 0;
    insert.mockReset().mockResolvedValue({ error: null });
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("passes nodemailer the route's own options: TLS from the first byte, the certificate always verified", async () => {
    await send({ SMTP_TLS_CA: certs.caPem, SMTP_TLS_SERVERNAME: TEST_SMTP_NAME });
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
    await refusedAtTheHandshake({}, UNKNOWN_CA);
  });

  it("refuses it with the CA alone: 127.0.0.1 is not the name its certificate carries", async () => {
    await refusedAtTheHandshake({ SMTP_TLS_CA: certs.caPem }, WRONG_NAME);
  });

  it("refuses it under a wrong name", async () => {
    await refusedAtTheHandshake({ SMTP_TLS_CA: certs.caPem, SMTP_TLS_SERVERNAME: "other.test" }, WRONG_NAME);
  });

  it("still refuses it with NODE_TLS_REJECT_UNAUTHORIZED=0, by default and with the CA alone", async () => {
    await refusedAtTheHandshake({ NODE_TLS_REJECT_UNAUTHORIZED: "0" }, UNKNOWN_CA);
    await refusedAtTheHandshake({ NODE_TLS_REJECT_UNAUTHORIZED: "0", SMTP_TLS_CA: certs.caPem }, WRONG_NAME);
  });

  it("delivers with the right CA and name, signed in with SMTP_USER over TLS, to contact@logistiq.ro alone", async () => {
    const sessions = server.sessions;
    const result = await send({ SMTP_TLS_CA: certs.caPem, SMTP_TLS_SERVERNAME: TEST_SMTP_NAME });
    expect(result).toMatchObject({ status: 200, body: { success: true } });
    expect(server.sessions).toBe(sessions + 1);
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
    expect(insert).toHaveBeenCalledTimes(1);
  });
});
