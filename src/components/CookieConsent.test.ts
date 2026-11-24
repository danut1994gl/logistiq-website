import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { translations } from "@/lib/i18n/translations";

// The cookie banner offered an "Analytics" category until 2026-11-24, and its text said some
// cookies "help us understand how you use the platform". Nothing read that choice: no
// script listens to cookieConsentUpdate or reads logistiq_cookie_consent, and no page of
// logistiq.ro, logistiq.cloud or qrgo.ro loads an analytics script (legal-copy.test.ts).
const SOURCE = readFileSync(fileURLToPath(new URL("./CookieConsent.tsx", import.meta.url)), "utf8");

// "help us understand how you use" in each language, as the banner said it.
const UNDERSTAND =
  /ne ajută să înțelegem|help us understand|helfen uns zu verstehen|pomagają nam zrozumieć|segítenek megérteni|помагат да разберем|nous aident à comprendre|helpen ons te begrijpen/i;

describe("cookie banner", () => {
  it("offers only the essential and functional categories", () => {
    for (const [locale, copy] of Object.entries(translations)) {
      expect(Object.keys(copy.cookieConsent.categories).sort(), locale).toEqual(["essential", "functional"]);
    }
    expect(SOURCE).not.toMatch(/preferences\.analytics|categories\.analytics|analytics:/);
  });

  it("no longer says cookies help us understand how the visitor uses the platform", () => {
    for (const [locale, copy] of Object.entries(translations)) {
      expect(copy.cookieConsent.description.match(UNDERSTAND)?.[0], locale).toBeUndefined();
    }
  });
});
