import { describe, it, expect } from "vitest";
import { translations } from "@/lib/i18n/translations";
import { locales } from "@/lib/i18n/config";

// A plan differs from another by the number of warehouses it covers, and by nothing else in
// the code (Logistiq apps/dashboard/lib/clientCapability.ts); API keys go by role
// (lib/api/access-roles.ts), white-label has no plan check. The owner decided (2026-11-26):
// other options, white-label and priority or dedicated support among them, are as the offer
// or the contract states. Until then the terms' article 8 tied white-label, API access and
// priority support to Enterprise 5+, dedicated support to Enterprise 10+, and article 2 and
// article 11 tied features and support to the "subscription level".
const PLAN = /Enterprise|Professional/;

describe("plan copy", () => {
  it.each(locales)("%s ties no feature to a plan", (locale) => {
    const t = translations[locale];
    const { items } = t.terms.article8.enterprise;
    expect(items).toHaveLength(4);
    expect(items.filter((i) => PLAN.test(i))).toEqual([]);
    expect(items[1]).toContain("API");
    for (const [key, value] of Object.entries(t.terms)) {
      if (key !== "article6") expect(JSON.stringify(value).match(PLAN)?.[0], `${locale} terms.${key}`).toBeUndefined();
    }
    expect(t.faq.a14).not.toMatch(PLAN);
    expect(t.f8Page.flowSub).not.toMatch(PLAN);
    // Article 2's features and support, and article 11's access, point at article 8 or at
    // the number of warehouses, never at a "subscription level".
    expect(t.terms.article2.items[3]).toMatch(/\b8\b/);
    expect(t.terms.article2.items[4]).toMatch(/\b8\b/);
  });
});
