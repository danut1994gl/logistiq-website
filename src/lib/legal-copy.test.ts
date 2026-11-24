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

// No page of logistiq.ro, logistiq.cloud or qrgo.ro loads Google Analytics or Vercel's
// analytics: none of the three apps depends on @vercel/analytics or
// @vercel/speed-insights, and none loads gtag or googletagmanager (checked in this
// repository and in Logistiq's apps/dashboard, apps/driver and packages on 2026-11-24).
// Until then the cookie policy listed analytics cookies (_ga, _gid) and Google Analytics
// among the third parties, and gave Vercel the purpose "Hosting and analytics", in every
// language.
describe("cookie policy", () => {
  it("lists no analytics cookie and no analytics service", () => {
    for (const [locale, copy] of Object.entries(translations)) {
      expect(Object.keys(copy.cookies.cookiesWeUse).sort(), locale).toEqual(["essential", "functional", "title"]);
      const text = JSON.stringify(copy.cookies);
      expect(text.match(/Google Analytics|"_ga"|"_gid"/)?.[0], locale).toBeUndefined();
      const vercel = copy.cookies.thirdParty.services.find((s) => s.name === "Vercel");
      expect(vercel?.purpose.match(/analy|anali[tz]|анализ|audience/i)?.[0], locale).toBeUndefined();
    }
  });
});
