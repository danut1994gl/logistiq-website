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

// How the connection is secured follows SMTP_PORT. Until 2026-11-19 `secure: true` was fixed, so any port but 465
// failed the handshake (587 starts in plain text):
// - 465: TLS from the first byte (implicit TLS), as before;
// - any other port (587, 25, 2525…): plain text upgraded with STARTTLS, and `requireTLS` makes a server that does not
//   offer it, or fails it, an error: nothing, the password least of all, is sent before the upgrade.
// Either way the certificate is verified with the options below.
export function smtpTlsMode(port: number): { secure: true } | { secure: false; requireTLS: true } {
  return port === 465 ? { secure: true } : { secure: false, requireTLS: true };
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
