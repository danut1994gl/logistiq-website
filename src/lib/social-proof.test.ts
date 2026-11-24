import { describe, it, expect } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { translations } from "@/lib/i18n/translations";

// Logistiq has no customers to quote yet (owner, 2026-11-24: correct every claim the site
// cannot back). Until then, in all 8 languages, the closing call to action invited the
// visitor to "join hundreds of warehouses", and the home page showed six anonymous
// "What our customers say" testimonials.

const HOME_PAGE = fileURLToPath(new URL("../app/[locale]/(marketing)/page.tsx", import.meta.url));
const ROOT_LAYOUT = fileURLToPath(new URL("../app/layout.tsx", import.meta.url));

// "Number one" in each language's way of writing it: #1, Nr. 1, nr 1, №1, n° 1. Until
// 2026-11-24 every language's SEO title (page title, Open Graph, Twitter and the home
// page's JSON-LD) and the root layout's title called Logistiq the number one platform.
const NUMBER_ONE = /#1\b|\bnr\.? ?1\b|№ ?1|n° ?1/i;
const TESTIMONIALS_SECTION = fileURLToPath(new URL("../components/sections/TestimonialsSection.tsx", import.meta.url));

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

  it("no language's copy and no page title calls Logistiq the number one", () => {
    for (const [locale, copy] of Object.entries(translations)) {
      expect(JSON.stringify(copy).match(NUMBER_ONE)?.[0], locale).toBeUndefined();
    }
    expect(readFileSync(ROOT_LAYOUT, "utf8").match(NUMBER_ONE)?.[0]).toBeUndefined();
  });

  it("no language's copy counts warehouses in the hundreds", () => {
    for (const [locale, copy] of Object.entries(translations)) {
      expect(JSON.stringify(copy).match(HUNDREDS[locale])?.[0], locale).toBeUndefined();
    }
  });

  // Every client component receives a whole locale's translations, so testimonials kept in
  // translations.ts would still ship in every page's RSC payload, rendered or not.
  it("no language carries testimonials, and the home page renders none", () => {
    for (const [locale, copy] of Object.entries(translations)) {
      expect(Object.keys(copy), locale).not.toContain("testimonials");
    }
    expect(existsSync(TESTIMONIALS_SECTION)).toBe(false);
    expect(readFileSync(HOME_PAGE, "utf8")).not.toMatch(/Testimonial/);
  });

  // StatsSection draws its figures from a seeded random number of the date (1,800 drivers
  // and 25,000 check-ins a month, growing by the day), shown as the platform's own.
  it("the home page renders no generated usage figures", () => {
    expect(readFileSync(HOME_PAGE, "utf8")).not.toMatch(/<StatsSection|import \{ StatsSection \}/);
  });
});
