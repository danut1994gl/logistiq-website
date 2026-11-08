import { describe, it, expect, afterEach } from "vitest";
import { translations } from "@/lib/i18n/translations";
import { company } from "@/lib/company";
import { siteGraph } from "@/lib/seo/jsonld";
import { GET as llmsTxt } from "@/app/llms.txt/route";
import { GET as llmsFullTxt } from "@/app/llms-full.txt/route";

// Logistiq publishes no prices (owner, 2026-11-08): the price is set by the offer
// or contract. Until then 139 / 500 / 800 / 1590 EUR were on the pricing section,
// the terms page (8 languages), the JSON-LD and company.ts. Every client component
// gets a whole locale's translations, so a price anywhere in them also ships in
// every page's RSC payload.
const AMOUNT = /\d[\d.,  ]*\s?(EUR|€|lei|RON)\b|€|\bEUR\b|\b(139|1[.,  ]?590)\b/;
// A rate after an amount ("139 EUR/lună", "500€ / month"); a usage stat such as
// "Check-in-uri / lună" is not a price.
const PER_MONTH = /(\d|EUR|€)\s*\/\s*(lună|month|Monat|miesiąc|hónap|hó|месец|mois|maand)/;

describe("no public prices", () => {
  const orig = process.env.NEXT_PUBLIC_SELF_SERVE_ENABLED;
  afterEach(() => {
    process.env.NEXT_PUBLIC_SELF_SERVE_ENABLED = orig;
  });

  it("no language's copy states an amount, a currency or a monthly rate", () => {
    for (const [locale, copy] of Object.entries(translations)) {
      const text = JSON.stringify(copy);
      expect(text.match(AMOUNT)?.[0], locale).toBeUndefined();
      expect(text.match(PER_MONTH)?.[0], locale).toBeUndefined();
    }
  });

  it("the terms list each plan without an amount and say the offer or contract sets the price", () => {
    for (const [locale, copy] of Object.entries(translations)) {
      const { plans, items } = copy.terms.article6;
      for (const plan of [plans.professional, plans.enterprise5, plans.enterprise10, plans.enterprise25]) {
        expect(plan, locale).toMatch(/^(Professional|Enterprise (5|10|25)) ?\s?: \S/);
      }
      expect(items[0], locale).not.toMatch(AMOUNT);
    }
  });

  it("company.ts carries no price fields", () => {
    expect(Object.keys(company).filter((k) => /price|offer/i.test(k))).toEqual([]);
  });

  it("the JSON-LD states no offer or price, with self-serve on or off", () => {
    for (const value of ["true", undefined]) {
      process.env.NEXT_PUBLIC_SELF_SERVE_ENABLED = value;
      expect(JSON.stringify(siteGraph("d", ["f"]))).not.toMatch(/Offer|price|EUR|1590/);
    }
  });

  it("llms.txt and llms-full.txt state no price", async () => {
    for (const GET of [llmsTxt, llmsFullTxt]) {
      const body = await GET().text();
      expect(body).not.toMatch(AMOUNT);
      expect(body).toContain("no public price list");
    }
  });
});
