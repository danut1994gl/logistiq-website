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

// The terms' article 14, termination by the Client. In French, "dans les conditions qu'il
// prévoit" (until 2026-11-24) could be read as the conditions the Client sets; the
// conditions are the contract's, as the other languages say ("as set out in it").
describe("terms, article 14", () => {
  it("in French, the Client terminates under the contract's conditions", () => {
    expect(translations.fr.terms.article14.byClient.content).toBe(
      "Le Client peut résilier le contrat dans les conditions prévues par celui-ci.",
    );
  });
});

// Privacy policy §5, the partners that process data for the platform. Until 2026-11-24 it
// named only Supabase, SmartBill and Vercel. Each one added since is in Logistiq's code
// (origin/main, read on 2026-11-24): Firebase Cloud Messaging sends the driver app's push
// (supabase/functions/send-driver-notification/fcm.ts, ADR-031); LiveKit carries the voice
// calls from a QRGo Self tablet to the operators (apps/dashboard/lib/calls/livekit-token.ts,
// microphone only); WhatsApp messages to drivers go through a WAHA instance
// (apps/dashboard/lib/waha.ts); SMS to drivers go through each warehouse's own Twilio or
// Vonage account (apps/dashboard/lib/sms/providers); and mail goes through the SMTP server
// cloud342.c-f.ro (SMTP_HOST's default in apps/dashboard/lib/smtp.ts, the driver web's
// delete-data route and this site's contact form).
const PROCESSORS = [
  "Supabase",
  "SmartBill",
  "Vercel",
  "Firebase Cloud Messaging (Google)",
  "LiveKit",
  "WhatsApp (WAHA)",
  "Twilio / Vonage",
  "cloud342.c-f.ro",
];

describe("privacy policy, section 5", () => {
  it("names every processor the platform uses, each with a purpose", () => {
    for (const [locale, copy] of Object.entries(translations)) {
      const partners = copy.privacy.thirdParties.partners;
      expect(partners.map((p) => p.name), locale).toEqual(PROCESSORS);
      for (const p of partners) expect(p.purpose.trim(), `${locale} ${p.name}`).not.toBe("");
    }
  });
});
