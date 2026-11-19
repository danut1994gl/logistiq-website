import type { ConnectionOptions } from "node:tls";

// TLS for the contact form's mail server (SMTP_HOST). Server-only.
//
// The server's certificate is always verified. Until 2026-11-12 the transport set
// `rejectUnauthorized: false`, which accepts any certificate: whoever sat on the network
// path could pose as the mail server and read every message and the mailbox password.
// A server whose certificate doesn't verify as it is gets the setting it needs, never
// verification turned off:
// - SMTP_TLS_SERVERNAME: the name its certificate carries, when SMTP_HOST is an IP
//   address or an alias the certificate doesn't list;
// - SMTP_TLS_CA: the PEM certificate(s) of the private CA that signs it (or its own
//   self-signed certificate). Once set, only these are trusted for this connection, in
//   place of the public CAs. A value pasted on one line may write its line breaks as \n.

// How the connection is secured follows SMTP_PORT. Until 2026-11-19 `secure: true` was fixed, so 587 and 25, which
// start in plain text, failed the handshake:
// - 587 and 25: plain text upgraded with STARTTLS, and `requireTLS` makes a server that does not offer it, or fails it,
//   an error: nothing, the password least of all, is sent before the upgrade;
// - every other port, 465 (the default) included: TLS from the first byte (implicit TLS), exactly as before. Since
//   88e63d2: production's SMTP_PORT is set and is not read here, so only the ports that could not work change, and
//   no setting that works today can break (a provider's implicit-TLS port such as 2465 keeps working).
// Either way the certificate is verified with the options below.
const STARTTLS_PORTS: ReadonlySet<number> = new Set([587, 25]);

// The whole send's bound (2026-11-19). The transport's timeouts bound connecting, TLS and the greeting (10 s) and
// each silence (20 s), but a server that sends a byte now and then trips none of them; the route aborts the send
// through nodemailer's per-send AbortSignal (10.5.0) once this much time has passed, and answers its error. Past
// the 10 s the setup may take, so a slow but working server still delivers. An abort does not prove the server had
// not already accepted the message.
export const SMTP_SEND_DEADLINE_MS = 25_000;

export function smtpTlsMode(port: number): { secure: true } | { secure: false; requireTLS: true } {
  return STARTTLS_PORTS.has(port) ? { secure: false, requireTLS: true } : { secure: true };
}

export function smtpTlsOptions(env: Record<string, string | undefined> = process.env): ConnectionOptions {
  const servername = env.SMTP_TLS_SERVERNAME?.trim();
  const ca = env.SMTP_TLS_CA?.replace(/\\n/g, "\n").trim();
  return {
    // Explicit, so that not even NODE_TLS_REJECT_UNAUTHORIZED=0 can turn it off.
    rejectUnauthorized: true,
    ...(servername ? { servername } : {}),
    ...(ca ? { ca } : {}),
  };
}
