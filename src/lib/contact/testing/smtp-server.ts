// Test-only: never import this from app code. A local SMTP server for the contact form's mail tests and for the
// production-bundle smoke (scripts/contact-smoke.mjs), 2026-11-19 (nodemailer 6 to 10).
//
// It listens on 127.0.0.1 only and relays nothing: it records what a client signed in with, the envelope and the
// message, and answers like a mail server would. Its certificate is for mail.test, signed by a throwaway CA that
// openssl makes per run in a temporary folder (removed again), so nothing here trusts or is trusted by anything real.
// Modes: TLS from the first byte (port 465 in production), plain text upgraded with STARTTLS (587), plain text with no
// STARTTLS on offer (a server that would take the password in clear), and a server that never greets.
//
// Node runs this file as is (type stripping), so it uses only erasable TypeScript.

import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import net from "node:net";
import tls from "node:tls";

/** The name the test server's certificate carries. */
export const TEST_SMTP_NAME = "mail.test";

export function hasOpenssl(): boolean {
  try {
    execFileSync("openssl", ["version"], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

export interface TestCertificates {
  /** The throwaway CA's certificate (PEM): what SMTP_TLS_CA must hold to trust the test server. */
  caPem: string;
  certPem: string;
  keyPem: string;
  remove(): void;
}

/** A throwaway CA and a certificate for `name` that it signs, valid for a day. */
export function makeTestCertificates(name: string = TEST_SMTP_NAME): TestCertificates {
  const dir = mkdtempSync(join(tmpdir(), "contact-smtp-"));
  const openssl = (args: string[]) => execFileSync("openssl", args, { cwd: dir, stdio: "ignore" });
  const ec = ["-newkey", "ec", "-pkeyopt", "ec_paramgen_curve:prime256v1", "-nodes"];
  try {
    openssl(["req", "-x509", ...ec, "-days", "1", "-subj", "/CN=Logistiq contact test CA", "-keyout", "ca.key", "-out", "ca.pem",
      "-addext", "basicConstraints=critical,CA:TRUE", "-addext", "keyUsage=critical,keyCertSign,cRLSign"]);
    openssl(["req", ...ec, "-subj", `/CN=${name}`, "-keyout", "server.key", "-out", "server.csr"]);
    writeFileSync(
      join(dir, "server.ext"),
      `subjectAltName=DNS:${name}\nbasicConstraints=CA:FALSE\nkeyUsage=critical,digitalSignature\nextendedKeyUsage=serverAuth\n`,
    );
    openssl(["x509", "-req", "-in", "server.csr", "-CA", "ca.pem", "-CAkey", "ca.key", "-CAcreateserial", "-days", "1",
      "-extfile", "server.ext", "-out", "server.pem"]);
    return {
      caPem: readFileSync(join(dir, "ca.pem"), "utf8"),
      certPem: readFileSync(join(dir, "server.pem"), "utf8"),
      keyPem: readFileSync(join(dir, "server.key"), "utf8"),
      remove: () => rmSync(dir, { recursive: true, force: true }),
    };
  } catch (error) {
    rmSync(dir, { recursive: true, force: true });
    throw error;
  }
}

export type TestSmtpMode = "implicit-tls" | "starttls" | "plain";

export interface TestSmtpOptions {
  mode: TestSmtpMode;
  /** Needed for "implicit-tls" and "starttls". */
  certs?: TestCertificates;
  /** false: the server takes the connection (and the TLS handshake) but never sends its 220 greeting. */
  greet?: boolean;
}

export interface TestSmtpAuth {
  mechanism: string;
  /** What the client sent, decoded: for PLAIN "\0user\0password". */
  credentials: string;
  /** Whether the connection was encrypted when the client sent it. */
  overTls: boolean;
}

export interface TestSmtpDelivery {
  from: string | null;
  to: string[];
  /** The message as received, dot-stuffing undone, with its CRLF line breaks. */
  data: string;
  overTls: boolean;
}

export interface TestSmtpServer {
  port: number;
  /** Connections accepted (TCP; for implicit TLS, handshakes completed). */
  sessions: number;
  /** TLS handshakes that failed, by the error Node gave the server. */
  tlsFailures: string[];
  auths: TestSmtpAuth[];
  deliveries: TestSmtpDelivery[];
  close(): Promise<void>;
}

/** Starts a test SMTP server on 127.0.0.1 at a port the system picks. */
export async function startTestSmtpServer(options: TestSmtpOptions): Promise<TestSmtpServer> {
  const { mode, certs, greet = true } = options;
  if (mode !== "plain" && !certs) throw new Error(`a ${mode} test server needs certificates`);
  const secureContext = certs ? tls.createSecureContext({ key: certs.keyPem, cert: certs.certPem }) : undefined;
  const sockets = new Set<net.Socket>();
  const state: Omit<TestSmtpServer, "port" | "close"> = { sessions: 0, tlsFailures: [], auths: [], deliveries: [] };

  const track = (socket: net.Socket) => {
    sockets.add(socket);
    socket.on("close", () => sockets.delete(socket));
    socket.on("error", () => {});
  };

  const session = (socket: net.Socket, overTls: boolean, greeting: boolean) => {
    let buffer = "";
    let inData = false;
    let pendingAuth: "PLAIN" | null = null;
    let current: TestSmtpDelivery = { from: null, to: [], data: "", overTls };
    const reply = (text: string) => socket.write(`${text}\r\n`);
    if (greeting) reply(`220 ${TEST_SMTP_NAME} ESMTP test server`);

    const onData = (chunk: Buffer) => {
      buffer += chunk.toString("utf8");
      for (;;) {
        if (inData) {
          const end = buffer.indexOf("\r\n.\r\n");
          if (end === -1) return;
          current.data = buffer
            .slice(0, end)
            .split("\r\n")
            .map((line) => (line.startsWith("..") ? line.slice(1) : line))
            .join("\r\n");
          buffer = buffer.slice(end + 5);
          inData = false;
          state.deliveries.push(current);
          current = { from: null, to: [], data: "", overTls };
          reply("250 2.0.0 Ok: queued");
          continue;
        }
        const eol = buffer.indexOf("\r\n");
        if (eol === -1) return;
        const line = buffer.slice(0, eol);
        buffer = buffer.slice(eol + 2);
        if (pendingAuth) {
          state.auths.push({ mechanism: pendingAuth, credentials: Buffer.from(line, "base64").toString("utf8"), overTls });
          pendingAuth = null;
          reply("235 2.7.0 Authentication successful");
          continue;
        }
        const [verb = "", ...rest] = line.split(" ");
        switch (verb.toUpperCase()) {
          case "EHLO":
            reply(
              [`250-${TEST_SMTP_NAME}`, ...(mode === "starttls" && !overTls ? ["250-STARTTLS"] : []), "250-AUTH PLAIN", "250 8BITMIME"].join("\r\n"),
            );
            break;
          case "STARTTLS":
            if (mode !== "starttls" || overTls) {
              reply("502 5.5.1 STARTTLS not offered");
              break;
            }
            reply("220 2.0.0 Ready to start TLS");
            socket.removeListener("data", onData);
            upgrade(socket);
            return;
          case "AUTH":
            if ((rest[0] ?? "").toUpperCase() !== "PLAIN") {
              reply("504 5.5.4 Unrecognized authentication type");
            } else if (rest[1]) {
              state.auths.push({ mechanism: "PLAIN", credentials: Buffer.from(rest[1], "base64").toString("utf8"), overTls });
              reply("235 2.7.0 Authentication successful");
            } else {
              pendingAuth = "PLAIN";
              reply("334 ");
            }
            break;
          case "MAIL":
            current.from = /<([^>]*)>/.exec(line)?.[1] ?? null;
            reply("250 2.1.0 Ok");
            break;
          case "RCPT":
            current.to.push(/<([^>]*)>/.exec(line)?.[1] ?? "");
            reply("250 2.1.5 Ok");
            break;
          case "DATA":
            inData = true;
            reply("354 End data with <CR><LF>.<CR><LF>");
            break;
          case "RSET":
            current = { from: null, to: [], data: "", overTls };
            reply("250 2.0.0 Ok");
            break;
          case "NOOP":
            reply("250 2.0.0 Ok");
            break;
          case "QUIT":
            reply("221 2.0.0 Bye");
            socket.end();
            return;
          default:
            reply("502 5.5.2 Error: command not recognized");
        }
      }
    };
    socket.on("data", onData);
  };

  const upgrade = (plain: net.Socket) => {
    const secure = new tls.TLSSocket(plain, { isServer: true, secureContext });
    track(secure);
    secure.on("error", (error: NodeJS.ErrnoException) => state.tlsFailures.push(error.code ?? error.message));
    secure.once("secure", () => session(secure, true, false));
  };

  const server =
    mode === "implicit-tls"
      ? tls.createServer({ key: certs?.keyPem, cert: certs?.certPem }, (socket) => {
          track(socket);
          state.sessions++;
          if (greet) session(socket, true, true);
        })
      : net.createServer((socket) => {
          track(socket);
          state.sessions++;
          if (greet) session(socket, false, true);
        });
  server.on("tlsClientError", (error: NodeJS.ErrnoException) => state.tlsFailures.push(error.code ?? error.message));

  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => resolve());
  });

  const result = state as TestSmtpServer;
  result.port = (server.address() as net.AddressInfo).port;
  result.close = () =>
    new Promise<void>((resolve) => {
      for (const socket of sockets) socket.destroy();
      server.close(() => resolve());
    });
  return result;
}
