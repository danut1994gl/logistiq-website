import { RECAPTCHA_ACTION, RECAPTCHA_MIN_SCORE } from "@/lib/contact/protocol";

// Server side of reCAPTCHA v3 for the contact form: ready, but off until both
// keys exist. Server-only (it reads RECAPTCHA_SECRET_KEY).

const VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify";

// Google's answers that mean OUR request is wrong (key, format), not the visitor.
const OWN_ERRORS = new Set(["missing-input-secret", "invalid-input-secret", "bad-request"]);

/**
 * - "off": no RECAPTCHA_SECRET_KEY, or the site was built without
 *   NEXT_PUBLIC_RECAPTCHA_SITE_KEY (the form sends no token then, so enforcing
 *   would silently drop every message). The check is skipped.
 * - "pass": a valid token for the "contact" action, score >= 0.5.
 * - "fail": a missing, invalid, expired, reused, low-score or wrong-action token.
 *   The route drops it like any trapped bot (fail closed).
 * - "unavailable": Google unreachable or our key rejected. Fails closed too, but
 *   the visitor is told to retry: the fault is not theirs.
 */
export type RecaptchaVerdict = "off" | "pass" | "fail" | "unavailable";

type SiteVerify = {
  success?: boolean;
  score?: number;
  action?: string;
  "error-codes"?: string[];
};

export async function verifyRecaptcha(token: unknown): Promise<RecaptchaVerdict> {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) return "off";
  // The form only sends a token when it was built with the site key. Set at build
  // time, NEXT_PUBLIC_* is inlined here as in the form; unset, it is read at run
  // time, which on Vercel is the same deployment's env (a change needs a redeploy).
  // Either way this matches what the deployed form was built with.
  if (!process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY) {
    console.error(
      "contact: RECAPTCHA_SECRET_KEY is set but this build has no NEXT_PUBLIC_RECAPTCHA_SITE_KEY, so the form sends no token; reCAPTCHA stays off until a redeploy with both keys"
    );
    return "off";
  }
  if (typeof token !== "string" || token === "" || token.length > 4096) return "fail";

  let data: SiteVerify;
  try {
    const res = await fetch(VERIFY_URL, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token }),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) {
      console.error(`contact: reCAPTCHA verification answered HTTP ${res.status}`);
      return "unavailable";
    }
    data = (await res.json()) as SiteVerify;
  } catch (error) {
    console.error("contact: reCAPTCHA verification unreachable", error);
    return "unavailable";
  }

  const codes = data["error-codes"] ?? [];
  if (codes.some((code) => OWN_ERRORS.has(code))) {
    console.error(`contact: reCAPTCHA rejected our request: ${codes.join(", ")}`);
    return "unavailable";
  }
  if (
    data.success !== true ||
    data.action !== RECAPTCHA_ACTION ||
    typeof data.score !== "number" ||
    data.score < RECAPTCHA_MIN_SCORE
  ) {
    return "fail";
  }
  return "pass";
}
