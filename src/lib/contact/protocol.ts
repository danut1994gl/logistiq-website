// The contact form's anti-spam protocol, shared by the form
// (components/sections/ContactSection.tsx) and the route (app/api/contact), so the
// two can't drift apart. Plain constants: safe to import in the browser.

/** A hidden field people never see or fill; a request that fills it is a bot. */
export const HONEYPOT_FIELD = "reference";

/** How long the form had been open when it was sent, in ms (monotonic clock). */
export const ELAPSED_FIELD = "elapsedMs";

/** The reCAPTCHA v3 token, sent only when reCAPTCHA is configured. */
export const RECAPTCHA_FIELD = "recaptchaToken";

/** Sent sooner than this after the form opened: no person fills it that fast. */
export const MIN_FILL_MS = 3_000;

/** Sent more than a day after the form opened: not a fresh visit, dropped. */
export const MAX_FILL_MS = 24 * 60 * 60 * 1000;

/**
 * A form left open and untouched this long restarts its clock when the visitor
 * first uses it, so a tab kept open overnight is not mistaken for a stale replay.
 */
export const IDLE_RESTART_MS = 30 * 60 * 1000;

export const RECAPTCHA_ACTION = "contact";
export const RECAPTCHA_MIN_SCORE = 0.5;

/** The longest value accepted per field; the inputs carry the same maxLength. */
export const FIELD_MAX = {
  name: 120,
  email: 254,
  company: 160,
  phone: 40,
  message: 5000,
} as const;

/** Error codes the route answers with; the form shows each one translated. */
export type ContactErrorCode = "invalid" | "rate_limited" | "verify_failed" | "server";
