// The contact form's production bundle, driven end to end without a real e-mail (2026-11-19, nodemailer 6 to 10).
//
// After a production build, both outside any agent environment and without a .env file (Node 22.6 or later, which
// runs the two TypeScript test helpers below as they are):
//   env -i PATH="$PATH" HOME="$HOME" NEXT_TELEMETRY_DISABLED=1 npm run build
//   env -i PATH="$PATH" HOME="$HOME" NEXT_TELEMETRY_DISABLED=1 node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON scripts/contact-smoke.mjs
//
// It starts the test SMTP server of src/lib/contact/testing/smtp-server.ts on 127.0.0.1 (a throwaway CA, a certificate
// for mail.test), then `next start` on 127.0.0.1 with SMTP_HOST=127.0.0.1, test credentials and SMTP_TLS_CA /
// SMTP_TLS_SERVERNAME to trust it, and nothing else. The route secures the connection by its port (587 and 25:
// STARTTLS; any other port: TLS from the first byte), and the test server speaks what that port must speak:
// - by default it speaks TLS from the first byte on a free port, and SMTP_PORT names it;
// - SMOKE_SMTP_PORT=<port> puts it on that port instead: 465 leaves SMTP_PORT unset (the production default),
//   587 or 25 speak STARTTLS, any other port (2525) TLS from the first byte. Ports below 1024 need the right to
//   listen on them.
// It checks that:
// - every language's home and contact page answers 200 in its language, and / redirects to /ro;
// - none of those answers, nor / nor the three legal pages, sets a cookie (no page view does, owner 2026-11-26);
// - one person's message to /api/contact answers 200 and reaches the test server, signed in with SMTP_USER over TLS,
//   for contact@logistiq.ro alone, composed exactly as route.mail.golden.json's "human" case (nodemailer 6.10.1);
// - an address the parser could read a second recipient out of gets the form's own 400, and nothing more is sent;
// - the lead step then fails, as it must without Supabase, and says so in the log: it names the missing Supabase URL,
//   not the missing CONTACT_LEAD_KEY, because lib/contact/lead.ts builds the client before it reads the key;
// - the contact route's server bundle carries the nodemailer release that package.json names.
// Nothing leaves 127.0.0.1: BotID's check throws without Vercel's OIDC token and the rate-limit check throws without
// the client-IP header (the route lets both through), reCAPTCHA is off without its keys, and the lead's call to
// submit_website_lead stops at the missing Supabase URL. No CONTACT_LEAD_KEY is set, and none may be in the
// environment that runs this. Exit code 0 when every check passed.

import { spawn } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import net from "node:net";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { isDeepStrictEqual } from "node:util";
import { readMail } from "../src/lib/contact/testing/mail-view.ts";
import { TEST_SMTP_NAME, hasOpenssl, makeTestCertificates, startTestSmtpServer } from "../src/lib/contact/testing/smtp-server.ts";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const LOCALES = ["ro", "en", "de", "pl", "hu", "bg", "fr", "nl"];
const SMTP_USER = "noreply@logistiq.test";
const SMTP_PASS = "smoke-test-secret";
const HUMAN = {
  name: "Ion Popescu",
  email: "ion@firma.ro",
  company: "Transport SRL",
  phone: "+40 771 570 577",
  message: "Avem 3 depozite și vrem o ofertă.",
  reference: "",
  elapsedMs: 42_000,
};

const results = [];
function check(name, ok, detail = "") {
  results.push({ name, ok });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  (${detail})` : ""}`);
}

const freePort = () =>
  new Promise((resolve, reject) => {
    const probe = net.createServer();
    probe.once("error", reject);
    probe.listen(0, "127.0.0.1", () => {
      const { port } = probe.address();
      probe.close(() => resolve(port));
    });
  });

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitFor(what, test, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  for (;;) {
    if (await test()) return;
    if (Date.now() > deadline) throw new Error(`timed out waiting for ${what}`);
    await sleep(250);
  }
}

/** The nodemailer version a server chunk of the contact route defines, by nodemailer's own version string. */
function bundledNodemailer() {
  const route = readFileSync(join(ROOT, ".next/server/app/api/contact/route.js"), "utf8");
  const chunks = [...route.matchAll(/chunks\/[^"']+?\.js/g)].map((m) => join(ROOT, ".next/server", m[0]));
  for (const file of chunks.filter((f) => existsSync(f))) {
    const code = readFileSync(file, "utf8");
    if (!code.includes('"https://nodemailer.com/"')) continue;
    // getVersionString() formats "nodemailer (<version>; +https://nodemailer.com/; …)" from package-info's constant.
    const name = /\.format\("%s \(%s; \+%s; %s\/%s\)","nodemailer",([\w$]+),/.exec(code)?.[1];
    const escaped = name?.replace(/\$/g, "\\$");
    const version = escaped ? new RegExp(`(?:^|[,;{\\s])${escaped}="(\\d+\\.\\d+\\.\\d+)"`).exec(code)?.[1] : undefined;
    return { file: file.slice(ROOT.length), version };
  }
  return { file: null, version: undefined };
}

async function main() {
  if (!existsSync(join(ROOT, ".next/BUILD_ID"))) throw new Error("no production build: run `npm run build` first (see this file's header)");
  if (!hasOpenssl()) throw new Error("openssl is needed for the test certificates");
  for (const name of readdirSync(ROOT)) if (name.startsWith(".env")) throw new Error(`${name} exists: the smoke runs without .env files`);
  const leaked = Object.keys(process.env).filter((k) => /^(NEXT_PUBLIC_SUPABASE_|SUPABASE_|RECAPTCHA_|NEXT_PUBLIC_RECAPTCHA_|SMTP_|VERCEL|CONTACT_LEAD_KEY)/.test(k));
  if (leaked.length) throw new Error(`run it under env -i: ${leaked.join(", ")} set`);

  // The route's rule (88e63d2), restated here rather than imported, so the smoke checks the route against it.
  const STARTTLS_PORTS = new Set([587, 25]);
  const requested = process.env.SMOKE_SMTP_PORT ? Number(process.env.SMOKE_SMTP_PORT) : 0;
  if (!Number.isInteger(requested) || requested < 0 || requested > 65535) throw new Error("SMOKE_SMTP_PORT takes a port number");
  const on465 = requested === 465;
  const mode = STARTTLS_PORTS.has(requested) ? "starttls" : "implicit-tls";
  const certs = makeTestCertificates();
  const smtp = await startTestSmtpServer({ mode, certs, port: requested });
  const port = await freePort();
  const base = `http://127.0.0.1:${port}`;
  let log = "";
  const next = spawn(process.execPath, [join(ROOT, "node_modules/next/dist/bin/next"), "start", "-H", "127.0.0.1", "-p", String(port)], {
    cwd: ROOT,
    env: {
      PATH: process.env.PATH ?? "",
      HOME: process.env.HOME ?? "",
      NEXT_TELEMETRY_DISABLED: "1",
      SMTP_HOST: "127.0.0.1",
      ...(on465 ? {} : { SMTP_PORT: String(smtp.port) }),
      SMTP_USER,
      SMTP_PASS,
      SMTP_TLS_CA: certs.caPem,
      SMTP_TLS_SERVERNAME: TEST_SMTP_NAME,
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  next.stdout.on("data", (d) => (log += d));
  next.stderr.on("data", (d) => (log += d));
  let exited = false;
  next.on("exit", () => (exited = true));

  try {
    const kind = `${mode === "starttls" ? "STARTTLS" : "TLS from the first byte"}, ${on465 ? "SMTP_PORT unset" : `SMTP_PORT=${smtp.port}`}`;
    console.log(`build ${readFileSync(join(ROOT, ".next/BUILD_ID"), "utf8").trim()}; next start on ${base}; test SMTP server on 127.0.0.1:${smtp.port} (${kind})`);
    await waitFor("next start", async () => {
      if (exited) throw new Error(`next start exited:\n${log}`);
      return fetch(`${base}/en`, { redirect: "manual" }).then((r) => r.status === 200, () => false);
    }, 60_000);

    const root = await fetch(`${base}/`, { redirect: "manual" });
    check("/ redirects to the domain's language, /ro", root.status >= 300 && root.status < 400 && /\/ro$/.test(root.headers.get("location") ?? ""), `${root.status} ${root.headers.get("location")}`);
    check("/ sets no cookie", root.headers.getSetCookie().length === 0, root.headers.getSetCookie().join("; "));
    for (const locale of LOCALES) {
      for (const path of [`/${locale}`, `/${locale}/contact`]) {
        const res = await fetch(`${base}${path}`, { redirect: "manual" });
        const html = res.status === 200 ? await res.text() : "";
        check(`${path} answers 200 in its language`, res.status === 200 && html.includes(`<html lang="${locale}"`), String(res.status));
        check(`${path} sets no cookie`, res.headers.getSetCookie().length === 0, res.headers.getSetCookie().join("; "));
      }
    }
    for (const path of ["/en/privacy", "/en/terms", "/en/cookies"]) {
      const res = await fetch(`${base}${path}`, { redirect: "manual" });
      check(`${path} answers 200 and sets no cookie`, res.status === 200 && res.headers.getSetCookie().length === 0, `${res.status} ${res.headers.getSetCookie().join("; ")}`);
    }

    const answer = await fetch(`${base}/api/contact`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(HUMAN),
    });
    const body = await answer.json().catch(() => null);
    check("POST /api/contact answers 200 {success: true}", answer.status === 200 && isDeepStrictEqual(body, { success: true }), `${answer.status} ${JSON.stringify(body)}`);

    check("the test server took one message", smtp.deliveries.length === 1, `${smtp.deliveries.length}`);
    check(
      "signed in once with SMTP_USER, over TLS",
      isDeepStrictEqual(smtp.auths, [{ mechanism: "PLAIN", credentials: `\0${SMTP_USER}\0${SMTP_PASS}`, overTls: true }]),
      JSON.stringify(smtp.auths.map((a) => ({ ...a, credentials: a.credentials.split("\0")[1] }))),
    );
    const delivery = smtp.deliveries[0];
    check(
      "from noreply@logistiq.ro to contact@logistiq.ro alone, over TLS",
      delivery?.from === "noreply@logistiq.ro" && isDeepStrictEqual(delivery?.to, ["contact@logistiq.ro"]) && delivery?.overTls === true,
      JSON.stringify({ from: delivery?.from, to: delivery?.to }),
    );
    const golden = JSON.parse(readFileSync(join(ROOT, "src/app/api/contact/route.mail.golden.json"), "utf8"));
    const received = delivery ? readMail(delivery.data) : null;
    check(
      `the message is what nodemailer ${golden.nodemailer} composed for the same person (route.mail.golden.json)`,
      isDeepStrictEqual(received, golden.cases.human.mail),
      received ? `Subject: ${received.headers.Subject}; parts: ${received.parts?.map((p) => p.headers["Content-Type"]).join(", ")}` : "nothing received",
    );

    // An address the parser could read a second recipient out of is the form's own 400, and nothing more is sent.
    const smuggled = await fetch(`${base}/api/contact`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...HUMAN, email: "a,b@c.ro" }),
    });
    const refusal = await smuggled.json().catch(() => null);
    check(
      "a smuggled address is refused with the form's 400, nothing sent",
      smuggled.status === 400 && isDeepStrictEqual(refusal, { error: "Adresa de email nu este validă", code: "invalid" }) && smtp.deliveries.length === 1,
      `${smuggled.status} ${JSON.stringify(refusal)}`,
    );

    await waitFor("the lead step's log line", async () => log.includes("lead persist failed (email already sent)"), 5_000).catch(() => {});
    check(
      "the lead step failed after the e-mail, as it must without Supabase, at the client before the key",
      log.includes("lead persist failed (email already sent)") && log.includes("Missing NEXT_PUBLIC_SUPABASE_URL") && !log.includes("Missing CONTACT_LEAD_KEY"),
    );
    check("no 'Contact form error' in the log", !log.includes("Contact form error"));

    const expected = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")).dependencies.nodemailer;
    const bundled = bundledNodemailer();
    check(`the contact route's bundle carries nodemailer ${expected}`, bundled.version === expected, `${bundled.file}: ${bundled.version}`);
  } finally {
    next.kill("SIGTERM");
    await Promise.race([new Promise((resolve) => next.once("exit", resolve)), sleep(5_000)]);
    if (!exited) next.kill("SIGKILL");
    await smtp.close();
    certs.remove();
  }

  console.log("\n--- next start log (the route's lines) ---");
  for (const line of log.split("\n")) if (/contact:|lead persist|Contact form error|BotID|rate-limit|Error:/.test(line)) console.log(line.slice(0, 300));
  const failed = results.filter((r) => !r.ok).length;
  console.log(`\n${results.length - failed}/${results.length} checks passed`);
  process.exitCode = failed ? 1 : 0;
}

main().catch((error) => {
  console.error(`FAIL  ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
