import { describe, it, expect } from "vitest";
import { translations } from "@/lib/i18n/translations";
import { locales, type Locale } from "@/lib/i18n/config";

// Availability is guaranteed only by a signed contract (owner, 2026-11-26, D3). Until then
// the terms promised 99.9% a year to every client (art. 9) and to Enterprise 25 (art. 8),
// the FAQ to every Enterprise plan, and the hidden pricing list to Professional, with no
// measurement, report or remedy behind any of them.
const CONTRACT: Record<Locale, RegExp> = {
  ro: /contract/,
  en: /contract/,
  de: /Vertrag/,
  pl: /umow/,
  hu: /szerződés/,
  bg: /договор/,
  fr: /contrat/,
  nl: /overeenkomst/,
};

describe("availability copy", () => {
  it.each(locales)("%s promises no figure, and a guaranteed level only by contract", (locale) => {
    const t = translations[locale];
    expect(JSON.stringify(t).match(/99[.,]\s?9/)?.[0]).toBeUndefined();
    for (const text of [t.terms.article9.content, t.faq.a14, t.pricing.feature9]) expect(text).not.toMatch(/\d/);
    expect(t.terms.article9.content).toMatch(CONTRACT[locale]);
    expect(t.terms.article8.enterprise.items.at(-1)).toMatch(CONTRACT[locale]);
  });
});
