import { describe, it, expect } from "vitest";
import { translations } from "@/lib/i18n/translations";

// The terms, the privacy policy and the cookie policy print legal.updatedOn under their
// title. They changed on 24 November 2026 (payment by contract and bank transfer, no Stripe,
// the contract model in the terms, the processors and cookies actually in use); until then
// they said "Last updated: 26 January 2026". The date is written as each language writes it.
const UPDATED_ON: Record<string, string> = {
  ro: "24 noiembrie 2026",
  en: "24 November 2026",
  de: "24. November 2026",
  pl: "24 listopada 2026",
  hu: "2026. november 24.",
  bg: "24 ноември 2026 г.",
  fr: "24 novembre 2026",
  nl: "24 november 2026",
};

describe("legal pages", () => {
  it("know the update date in every language", () => {
    expect(Object.keys(UPDATED_ON).sort()).toEqual(Object.keys(translations).sort());
  });

  it("say they were last updated on 24 November 2026", () => {
    for (const [locale, copy] of Object.entries(translations)) {
      expect(copy.legal.updatedOn, locale).toBe(UPDATED_ON[locale]);
    }
  });
});
