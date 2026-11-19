import type { ContactErrorCode } from "@/lib/contact/protocol";
import type { Translations } from "@/lib/i18n/translations";

// What the contact form says when the route refuses a message, in the visitor's language (2026-11-19). Safe in the
// browser: the form (components/sections/ContactSection.tsx) calls it.
//
// The route answers { error, code }. Its `error` is a Romanian sentence, kept for the logs and for older open tabs;
// until 2026-11-19 the form showed it as it came for every code but rate_limited and verify_failed, so a German or a
// Bulgarian visitor read Romanian. Now the form says its own sentence for each code the route gives
// (lib/contact/protocol.ts), and anything else gets the generic error.

/** The visitor's sentence for the route's answer `data`. */
export function refusalMessage(t: Translations, data: unknown): string {
  const byCode: Record<ContactErrorCode, string> = {
    invalid: t.contact.invalid,
    rate_limited: t.contact.rateLimited,
    verify_failed: t.contact.verifyFailed,
    server: t.contact.error,
  };
  const code = typeof data === "object" && data !== null ? (data as { code?: unknown }).code : undefined;
  return typeof code === "string" && Object.prototype.hasOwnProperty.call(byCode, code)
    ? byCode[code as ContactErrorCode]
    : t.contact.error;
}
