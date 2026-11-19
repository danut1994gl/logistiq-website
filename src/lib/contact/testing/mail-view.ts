// Test-only: never import this from app code. It reads a raw e-mail (RFC 5322 + MIME) into the parts the contact
// form's mail tests compare, so that two nodemailer releases can be compared on what a reader sees, not on how the
// bytes are laid out (2026-11-19, nodemailer 6 to 10):
// - every header by name, in order, its value unfolded and its RFC 2047 encoded words decoded (each word on its own,
//   so a character split across two words shows up instead of being mended);
// - each MIME part's headers and its body decoded from quoted-printable or base64 in its charset;
// - only what changes on every run is normalised: the random half of Message-ID, the Date, and the multipart
//   boundary (its parameter; its delimiter lines are consumed).
// Lines are read with either line break, so a message taken from SMTP (CRLF) reads like one from a stream transport
// set to `newline: 'unix'` (LF).

export interface MailNode {
  /** Header names as written, in order (a repeated header appears twice). */
  headerNames: string[];
  /** Decoded values by header name; a repeated header's values are joined with a line break. */
  headers: Record<string, string>;
  /** A leaf part's decoded body. */
  body?: string;
  /** A multipart's text before its first delimiter, when there is any. */
  preamble?: string;
  /** A multipart's parts. */
  parts?: MailNode[];
}

const ENCODED_WORD = /=\?([^?\s]+)\?([QqBb])\?([^?\s]*)\?=/g;
const ADJACENT_WORDS = /(=\?[^?\s]+\?[QqBb]\?[^?\s]*\?=)[ \t]+(?==\?[^?\s]+\?[QqBb]\?[^?\s]*\?=)/g;

function decodeBytes(bytes: Buffer, charset: string): string {
  return new TextDecoder(charset.trim().toLowerCase() || "utf-8").decode(bytes);
}

function qpBytes(text: string): Buffer {
  const binary = text.replace(/=\r?\n/g, "").replace(/=([0-9A-Fa-f]{2})/g, (_, hex: string) => String.fromCharCode(parseInt(hex, 16)));
  return Buffer.from(binary, "latin1");
}

/** A header value as a reader sees it: unfolded, encoded words decoded (RFC 2047 §6.2: no space between two). */
export function decodeHeaderValue(raw: string): string {
  return raw
    .replace(/\r?\n(?=[ \t])/g, "")
    .trim()
    .replace(ADJACENT_WORDS, "$1")
    .replace(ENCODED_WORD, (_, charset: string, encoding: string, text: string) =>
      decodeBytes(
        encoding.toUpperCase() === "B" ? Buffer.from(text, "base64") : qpBytes(text.replace(/_/g, " ")),
        charset,
      ),
    );
}

function parameter(value: string, name: string): string | undefined {
  const match = new RegExp(`(?:^|;)\\s*${name}\\s*=\\s*(?:"([^"]*)"|([^;\\s]*))`, "i").exec(value);
  return match ? (match[1] ?? match[2]) : undefined;
}

function normalised(name: string, value: string): string {
  const key = name.toLowerCase();
  if (key === "message-id") return value.replace(/^<[^@>]*@/, "<{random}@");
  if (key === "date") return Number.isNaN(Date.parse(value)) ? value : "{date}";
  if (key === "content-type") return value.replace(/(boundary\s*=\s*)(?:"[^"]*"|[^;\s]+)/i, '$1"{boundary}"');
  return value;
}

function decodeBody(body: string, transferEncoding: string, charset: string): string {
  switch (transferEncoding.toLowerCase()) {
    case "quoted-printable":
      return decodeBytes(qpBytes(body), charset);
    case "base64":
      return decodeBytes(Buffer.from(body.replace(/\s+/g, ""), "base64"), charset);
    default:
      return body;
  }
}

function readNode(lines: string[]): MailNode {
  const node: MailNode = { headerNames: [], headers: {} };
  const raw: Array<[string, string]> = [];
  let i = 0;
  for (; i < lines.length && lines[i] !== ""; i++) {
    const line = lines[i];
    if (/^[ \t]/.test(line) && raw.length) raw[raw.length - 1][1] += `\n${line}`;
    else {
      const colon = line.indexOf(":");
      raw.push(colon === -1 ? [line, ""] : [line.slice(0, colon), line.slice(colon + 1)]);
    }
  }
  const bodyLines = lines.slice(i + 1);

  let contentType = "";
  let transferEncoding = "";
  for (const [name, value] of raw) {
    const decoded = decodeHeaderValue(value);
    if (name.toLowerCase() === "content-type") contentType = decoded;
    if (name.toLowerCase() === "content-transfer-encoding") transferEncoding = decoded;
    node.headerNames.push(name);
    const shown = normalised(name, decoded);
    node.headers[name] = name in node.headers ? `${node.headers[name]}\n${shown}` : shown;
  }

  const boundary = /^multipart\//i.test(contentType) ? parameter(contentType, "boundary") : undefined;
  if (!boundary) {
    node.body = decodeBody(bodyLines.join("\n"), transferEncoding, parameter(contentType, "charset") ?? "utf-8");
    return node;
  }

  const delimiter = `--${boundary}`;
  const parts: string[][] = [];
  const preamble: string[] = [];
  let current: string[] | null = null;
  for (const line of bodyLines) {
    const bare = line.replace(/[ \t]+$/, "");
    if (bare === `${delimiter}--`) {
      if (current) parts.push(current);
      current = null;
      break;
    }
    if (bare === delimiter) {
      if (current) parts.push(current);
      current = [];
    } else if (current) current.push(line);
    else preamble.push(line);
  }
  if (current) parts.push(current);
  if (preamble.join("").trim()) node.preamble = preamble.join("\n");
  node.parts = parts.map(readNode);
  return node;
}

/** The message as a reader sees it; see the header of this file for what is compared and what is normalised. */
export function readMail(raw: string): MailNode {
  return readNode(raw.split(/\r?\n/));
}
