import { refusalMessage } from "@/lib/contact/refusal";
import type { Translations } from "@/lib/i18n/translations";

// How the contact form sends a message and what the visitor reads back (2026-11-19). Safe in the browser: the form
// (components/sections/ContactSection.tsx) calls it.
//
// Vercel BotID's client wraps window.fetch (src/instrumentation-client.ts). Before the protected POST leaves, it loads
// its challenge script and waits for the challenge, with no timeout of its own: when the script is blocked or fails,
// the fetch rejects without sending anything; when it loads but never answers, the fetch never settles and the form
// would spin for good. BotID still decides whether the POST goes out. The form only stops waiting after
// CONTACT_SUBMIT_TIMEOUT_MS and tells the visitor where to write instead (contact.unreachable). Its signal aborts at
// that moment, so a fetch the wrapper starts later starts already aborted: nothing leaves after the visitor was told
// it did not.

/** Longer than the route's own deadline on the send (SMTP_SEND_DEADLINE_MS, 25 s, lib/contact/smtp.ts). */
export const CONTACT_SUBMIT_TIMEOUT_MS = 30_000;

export type SubmitOutcome = { ok: true } | { ok: false; message: string };

/** Posts `body` to /api/contact and says how it went, in the visitor's language. Never throws. */
export async function submitContactForm(
  body: Record<string, unknown>,
  t: Translations,
  options: { fetch?: typeof fetch; timeoutMs?: number } = {},
): Promise<SubmitOutcome> {
  // The browser's fetch as it is now, BotID's wrapper included.
  const send = options.fetch ?? ((input: RequestInfo | URL, init?: RequestInit) => fetch(input, init));
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const gaveUp = new Promise<"gave up">((resolve) => {
    timer = setTimeout(() => {
      controller.abort();
      resolve("gave up");
    }, options.timeoutMs ?? CONTACT_SUBMIT_TIMEOUT_MS);
  });
  const attempt = (async () => {
    const response = await send("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    const data: unknown = await response.json().catch(() => ({}));
    return { ok: response.ok, data };
  })();
  // A failure that arrives after the form gave up has no one left to tell.
  attempt.catch(() => {});

  try {
    const result = await Promise.race([attempt, gaveUp]);
    if (result === "gave up") return { ok: false, message: t.contact.unreachable };
    return result.ok ? { ok: true } : { ok: false, message: refusalMessage(t, result.data) };
  } catch {
    // No answer at all: the network, or BotID's client not sending the request.
    return { ok: false, message: t.contact.unreachable };
  } finally {
    clearTimeout(timer);
  }
}
