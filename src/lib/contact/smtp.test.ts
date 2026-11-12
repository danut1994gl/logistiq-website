import { describe, it, expect, vi, afterEach } from "vitest";
import { smtpTlsOptions } from "@/lib/contact/smtp";

// A PEM-shaped value: these tests check what reaches the TLS options, not the certificate.
const PEM = "-----BEGIN CERTIFICATE-----\nMIIBszCCAVmgAwIBAgIUQ1Q0\n-----END CERTIFICATE-----";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("smtpTlsOptions: the contact form's mail server is always verified", () => {
  it("by default: Node's public CAs, the certificate checked against SMTP_HOST's name", () => {
    expect(smtpTlsOptions({})).toEqual({ rejectUnauthorized: true });
  });

  it("SMTP_TLS_SERVERNAME: the name the certificate must carry, when SMTP_HOST is an IP or an alias", () => {
    expect(smtpTlsOptions({ SMTP_TLS_SERVERNAME: " mail.example.net " })).toEqual({
      rejectUnauthorized: true,
      servername: "mail.example.net",
    });
  });

  it("SMTP_TLS_CA: the CA to trust, with its line breaks real or written as \\n", () => {
    for (const value of [PEM, PEM.replace(/\n/g, "\\n"), `\n${PEM}\n`]) {
      expect(smtpTlsOptions({ SMTP_TLS_CA: value })).toEqual({ rejectUnauthorized: true, ca: PEM });
    }
  });

  it("both together", () => {
    expect(smtpTlsOptions({ SMTP_TLS_SERVERNAME: "mail.example.net", SMTP_TLS_CA: PEM })).toEqual({
      rejectUnauthorized: true,
      servername: "mail.example.net",
      ca: PEM,
    });
  });

  it("no setting turns verification off: rejectUnauthorized is explicit, so NODE_TLS_REJECT_UNAUTHORIZED=0 can't either", () => {
    for (const env of [
      { SMTP_REJECT_UNAUTHORIZED: "false" }, // the dashboard's switch; the website has none
      { NODE_TLS_REJECT_UNAUTHORIZED: "0" },
      { SMTP_TLS_SERVERNAME: "", SMTP_TLS_CA: "  " },
    ]) {
      expect(smtpTlsOptions(env)).toEqual({ rejectUnauthorized: true });
    }
  });

  it("reads process.env when called without an argument", () => {
    vi.stubEnv("SMTP_TLS_SERVERNAME", "mail.example.net");
    vi.stubEnv("SMTP_TLS_CA", "");
    expect(smtpTlsOptions()).toEqual({ rejectUnauthorized: true, servername: "mail.example.net" });
  });
});
