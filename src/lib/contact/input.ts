// What the contact form's fields may hold (2026-11-19), closed as qrgo.ro's delete-data form is (the monorepo's
// apps/driver/lib/delete-data-request.ts, 58dee946). Server-only (the route imports it).
//
// The route e-mails contact@logistiq.ro with the visitor's address as Reply-To. Until 2026-11-19 the address only had
// to match /^[^\s@]+@[^\s@]+\.[^\s@]+$/, which lets quotes, angle brackets, commas, semicolons, colons and parentheses
// through: what nodemailer's address-parsing advisories need (a second recipient smuggled out of a display name, a
// group or a comment), and forms that nodemailer 6.10.1 and 10.5.0 read in different ways (commit a4df56d).

/**
 * A plain mailbox: ASCII letters, digits and _ ' + - . before the @ (no dot first, never two in a row),
 * dot-separated labels of ASCII letters, digits and hyphens after it, ending in a top-level domain of ASCII letters.
 * It is zod 3.25's e-mail pattern, the one qrgo.ro's delete-data form applies, copied rather than adding zod to the
 * site.
 */
const PLAIN_MAILBOX = /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9-]*\.)+[A-Z]{2,}$/i;

// C0 and C1 controls, DEL, the Unicode line and paragraph separators, and the bidi embeddings, overrides and isolates
// (U+202A-U+202E, U+2066-U+2069), which can reorder what the reader sees. A one-line field holds none of them.
const NOT_ONE_LINE = /[\u0000-\u001f\u007f-\u009f\u2028\u2029\u202a-\u202e\u2066-\u2069]/;
// The message is the form's textarea: it keeps tabs and line breaks, and refuses the rest.
const NOT_TEXT = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f-\u009f\u202a-\u202e\u2066-\u2069]/;

/**
 * The longest request body the route reads, in characters, as on qrgo.ro's delete-data form: above what the form's
 * fields can make at their limits (protocol.ts's FIELD_MAX, every character JSON-escaped, the longest reCAPTCHA token
 * recaptcha.ts accepts), far below the platform's 4.5 MB. A longer body is refused before it is parsed.
 */
export const CONTACT_MAX_BODY_CHARS = 16_384;

// A phone number copied from a chat app or a contact card arrives wrapped in invisible direction marks (WhatsApp uses
// U+202A to U+202C or U+2066 to U+2069). The visitor can't see them, so a refusal could not tell them why: the phone
// loses them at both ends, with the whitespace around them, before its check. One inside the number is still refused,
// and the value sent and stored holds none. A loop, not a regular expression, so a long value costs linear time.
const isDirectionMark = (code: number): boolean => (code >= 0x202a && code <= 0x202e) || (code >= 0x2066 && code <= 0x2069);

/** The phone as typed, without whitespace or direction marks at either end. */
export function trimPhone(value: string): string {
  const edge = (i: number) => isDirectionMark(value.charCodeAt(i)) || value[i].trim() === "";
  let start = 0;
  let end = value.length;
  while (start < end && edge(start)) start++;
  while (end > start && edge(end - 1)) end--;
  return value.slice(start, end);
}

/** The address may be the e-mail's Reply-To. */
export const isPlainMailbox = (value: string): boolean => PLAIN_MAILBOX.test(value);

/** A name, company or phone: one line, with nothing that adds a line or reorders the text. */
export const isOneLine = (value: string): boolean => !NOT_ONE_LINE.test(value);

/** The message: any text with its tabs and line breaks, but no other control and no bidi control. */
export const isText = (value: string): boolean => !NOT_TEXT.test(value);
