import { RECAPTCHA_ACTION } from "@/lib/contact/protocol";

// Browser side of reCAPTCHA v3 for the contact form, off until
// NEXT_PUBLIC_RECAPTCHA_SITE_KEY is set (inlined at build time: a redeploy turns it
// on). Google's script never loads on a page view: only when a visitor starts
// using the contact form (ContactSection), and a fresh token is asked per message.
//
// The cookie banner (CookieConsent) gates no third-party script today, and this is
// a security check for a message the visitor chose to send, so it does not wait
// for the banner's optional categories. The privacy and cookie policies must name
// reCAPTCHA (Google) before the keys are set.

type Grecaptcha = {
  ready(callback: () => void): void;
  execute(siteKey: string, options: { action: string }): Promise<string>;
};

declare global {
  interface Window {
    grecaptcha?: Grecaptcha;
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? "";

const LOAD_TIMEOUT_MS = 10_000;

let loading: Promise<Grecaptcha> | null = null;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("reCAPTCHA timed out")), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error: unknown) => {
        clearTimeout(timer);
        reject(error);
      }
    );
  });
}

/** Start loading Google's script (once). Null when reCAPTCHA is off. */
export function loadRecaptcha(): Promise<Grecaptcha> | null {
  if (!SITE_KEY || typeof window === "undefined") return null;
  if (!loading) {
    loading = new Promise<Grecaptcha>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(SITE_KEY)}`;
      script.async = true;
      script.onload = () => {
        const grecaptcha = window.grecaptcha;
        if (grecaptcha) grecaptcha.ready(() => resolve(grecaptcha));
        else reject(new Error("reCAPTCHA did not initialise"));
      };
      script.onerror = () => reject(new Error("reCAPTCHA failed to load"));
      document.head.appendChild(script);
    }).catch((error: unknown) => {
      loading = null; // a later message may try again
      throw error;
    });
  }
  return loading;
}

/**
 * A fresh token for one message, or null when reCAPTCHA is off. Throws when it is
 * on but can't produce a token (blocked, offline): the form then tells the visitor
 * instead of sending a message the route would have to drop.
 */
export async function recaptchaToken(): Promise<string | null> {
  const loader = loadRecaptcha();
  if (!loader) return null;
  const grecaptcha = await withTimeout(loader, LOAD_TIMEOUT_MS);
  return withTimeout(grecaptcha.execute(SITE_KEY, { action: RECAPTCHA_ACTION }), LOAD_TIMEOUT_MS);
}
