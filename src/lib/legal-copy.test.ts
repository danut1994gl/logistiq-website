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
// microphone only); WhatsApp messages go through a WAHA instance to drivers and to the
// warehouse's staff contacts (apps/dashboard/lib/waha.ts, lib/staff-notifications.ts); SMS to
// drivers go through each warehouse's own Twilio or Vonage account (lib/sms/providers), and
// the platform's own Twilio account sends the verification codes of phone verification and
// SMS two-step sign-in (lib/twilio.ts, app/api/account/phone/send, lib/sms-2fa.ts); mail
// goes through an e-mail hosting provider (SMTP_HOST in lib/smtp.ts, the driver web's
// delete-data route and this site's contact form), named as a category until the owner gives
// the company's legal name; Google reCAPTCHA is described below. Upstash Redis is not
// listed: the code uses it only when its keys are set, and Logistiq's documentation records
// that production has none (documentation/changelog/integration-api.md, 2026-11-19).
const PROCESSORS = [
  "Supabase",
  "SmartBill",
  "Vercel",
  "Firebase Cloud Messaging (Google)",
  "LiveKit",
  "WhatsApp (WAHA)",
  "Twilio / Vonage",
  "<e-mail hosting provider>",
  "Google reCAPTCHA",
];

// The e-mail hosting provider, as each language names the category.
const MAIL_PROVIDER: Record<string, string> = {
  ro: "Furnizorul nostru de găzduire e-mail",
  en: "Our e-mail hosting provider",
  de: "Unser E-Mail-Hosting-Anbieter",
  pl: "Nasz dostawca hostingu poczty e-mail",
  hu: "E-mail-tárhelyszolgáltatónk",
  bg: "Нашият доставчик на имейл хостинг",
  fr: "Notre hébergeur de messagerie",
  nl: "Onze e-mailhostingprovider",
};

describe("privacy policy, section 5", () => {
  it("names every processor the platform uses, each with a purpose", () => {
    expect(Object.keys(MAIL_PROVIDER).sort()).toEqual(Object.keys(translations).sort());
    for (const [locale, copy] of Object.entries(translations)) {
      const partners = copy.privacy.thirdParties.partners;
      const want = PROCESSORS.map((name) => (name === "<e-mail hosting provider>" ? MAIL_PROVIDER[locale] : name));
      expect(partners.map((p) => p.name), locale).toEqual(want);
      for (const p of partners) expect(p.purpose.trim(), `${locale} ${p.name}`).not.toBe("");
    }
  });

  // Until 2026-11-24 (the same day's earlier version) the mail server was named by the host
  // the code defaults to; the policy names the category, and the owner will give the name.
  it("names the mail server by its category, not by a host name", () => {
    for (const [locale, copy] of Object.entries(translations)) {
      expect(JSON.stringify(copy.privacy).match(/cloud342|c-f\.ro/)?.[0], locale).toBeUndefined();
    }
  });

  it("says Twilio also sends logistiq.cloud's verification codes, and WhatsApp reaches staff contacts", () => {
    const en = translations.en.privacy.thirdParties.partners;
    expect(en.find((p) => p.name === "Twilio / Vonage")?.purpose).toMatch(/Twilio also sends logistiq\.cloud's verification codes/);
    expect(en.find((p) => p.name === "WhatsApp (WAHA)")?.purpose).toMatch(/to drivers and to the warehouse's staff contacts/);
    for (const [locale, copy] of Object.entries(translations)) {
      const twilio = copy.privacy.thirdParties.partners.find((p) => p.name === "Twilio / Vonage");
      expect(twilio?.purpose, locale).toMatch(/Twilio.*logistiq\.cloud/);
    }
  });
});

// Google reCAPTCHA guards logistiq.cloud's sign-in and password-reset forms and the carrier
// registration (Logistiq apps/dashboard/components/landing/LoginCard.tsx,
// app/carrier-register/page.tsx, components/ui/ReCaptcha.tsx, lib/recaptcha.ts); its script
// is Google's and may set cookies. The self-registration wizard has it too, but /signup
// redirects to logistiq.ro/contact while self-serve and card payments are off (ADR-057).
// Until 2026-11-24 neither legal list named it.
describe("Google reCAPTCHA", () => {
  it("is named by the privacy policy and by the cookie policy, with Google's privacy policy", () => {
    for (const [locale, copy] of Object.entries(translations)) {
      const partner = copy.privacy.thirdParties.partners.find((p) => p.name === "Google reCAPTCHA");
      const service = copy.cookies.thirdParty.services.find((s) => s.name === "Google reCAPTCHA");
      expect(partner?.purpose, locale).toMatch(/logistiq\.cloud/);
      expect(service?.purpose, locale).toBe(partner?.purpose);
      expect(service?.url, locale).toBe("policies.google.com/privacy");
    }
  });
});
