import { describe, it, expect } from "vitest";
import { renderToString } from "react-dom/server";
import { PricingSection } from "@/components/sections/PricingSection";
import { translations } from "@/lib/i18n/translations";
import { locales } from "@/lib/i18n/config";

// Clients sign a contract and pay by bank transfer, and logistiq.cloud's signup is
// closed (owner, 2026-11-22; Logistiq ADR-057). So every link in the plans leads to a
// contact form: each plan's main button to the one on the same page, its "choose plan"
// link to the contact page. Until 2026-11-24 "choose plan" went to that signup.
describe("PricingSection links", () => {
  it.each(locales)("lead only to the contact form in %s", (locale) => {
    const html = renderToString(<PricingSection t={translations[locale]} locale={locale} />);
    const hrefs = [...html.matchAll(/href="([^"]*)"/g)].map((m) => m[1]).sort();
    expect(hrefs).toEqual(["#contact", "#contact", `/${locale}/contact`, `/${locale}/contact`].sort());
  });
});
