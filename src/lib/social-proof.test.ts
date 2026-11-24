import { describe, it, expect } from "vitest";
import { translations } from "@/lib/i18n/translations";

// Logistiq has no customers to quote yet (owner, 2026-11-24: correct every claim the site
// cannot back). Until then, in all 8 languages, the closing call to action invited the
// visitor to "join hundreds of warehouses".

// "hundreds" in each language, as the call to action counted its warehouses.
const HUNDREDS: Record<string, RegExp> = {
  ro: /\bsute(lor)?\b/,
  en: /hundreds/i,
  de: /hunderte/i,
  pl: /\bsetek\b|\bsetki\b/i,
  hu: /százai/i,
  bg: /стотици/i,
  fr: /centaines/i,
  nl: /honderden/i,
};

describe("social proof", () => {
  it("knows the word for hundreds in every language", () => {
    expect(Object.keys(HUNDREDS).sort()).toEqual(Object.keys(translations).sort());
  });

  it("no language's copy counts warehouses in the hundreds", () => {
    for (const [locale, copy] of Object.entries(translations)) {
      expect(JSON.stringify(copy).match(HUNDREDS[locale])?.[0], locale).toBeUndefined();
    }
  });
});
