import { describe, it, expect } from "vitest";
import { translations } from "@/lib/i18n/translations";
import { locales } from "@/lib/i18n/config";
import { renderPage } from "@/lib/testing/render-page";
import PrivacyPage from "@/app/[locale]/privacy/page";

// The terms, the privacy policy and the cookie policy print legal.updatedOn under their
// title. They changed on 26 November 2026 (round 8: the identity from company.ts, no cookie
// on a visit and no banner, the cookie policy site by site, the controller and processor
// roles, no availability figure, accounts, retention and termination as the product does
// them); before, on 24 November 2026, and until then they said "Last updated: 26 January
// 2026". The date is written as each language writes it.
const UPDATED_ON: Record<string, string> = {
  ro: "26 noiembrie 2026",
  en: "26 November 2026",
  de: "26. November 2026",
  pl: "26 listopada 2026",
  hu: "2026. november 26.",
  bg: "26 ноември 2026 г.",
  fr: "26 novembre 2026",
  nl: "26 november 2026",
};

describe("legal pages", () => {
  it("know the update date in every language", () => {
    expect(Object.keys(UPDATED_ON).sort()).toEqual(Object.keys(translations).sort());
  });

  it("say they were last updated on 26 November 2026", () => {
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
      expect(Object.keys(copy.cookies.cookiesWeUse).sort(), locale).toEqual(["intro", "kinds", "sites", "storage", "title"]);
      const text = JSON.stringify(copy.cookies);
      expect(text.match(/Google Analytics|"_ga"|"_gid"/)?.[0], locale).toBeUndefined();
      const vercel = copy.cookies.thirdParty.services.find((s) => s.name === "Vercel");
      expect(vercel?.purpose.match(/analy|anali[tz]|анализ|audience/i)?.[0], locale).toBeUndefined();
    }
  });
});

// The terms' article 14, termination by the Client. In French, "dans les conditions qu'il
// prévoit" (until 2026-11-24) could be read as the conditions the Client sets, and "prévues
// par celui-ci" (the same day) still left "celui-ci" to point back; the conditions are the
// contract's, as the other languages say ("as set out in it").
describe("terms, article 14", () => {
  it("in French, the Client terminates under the conditions the contract sets", () => {
    expect(translations.fr.terms.article14.byClient.content).toBe(
      "Le Client peut résilier le contrat dans les conditions prévues au contrat.",
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
  // Since 2026-11-26 (Logistiq origin/main 692b030b8): Cloudflare carries qrgo.ro and
  // logistiq.be (live: server: cloudflare), limits qrgo.ro's bursts of requests and runs
  // Turnstile on its booking search (documentation/devops/qrgo-rate-limit-and-turnstile.md,
  // apps/driver/components/TurnstileWidget.tsx); Google Maps draws the geofence editor
  // (apps/dashboard/components/settings/GeofenceConfigModal.tsx); jsDelivr serves the chat
  // emoji picker's pictures (emoji-picker-react's default picture set).
  "Cloudflare",
  "Google Maps",
  "jsDelivr",
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

// logistiq.cloud's session is one Supabase cookie, sb-<project-ref>-auth-token, split into
// .0, .1… when large and removed at sign-out (@supabase/ssr 0.1.0, used without cookie
// options in Logistiq's packages/shared lib/supabase/server.ts and apps/dashboard/middleware.ts;
// the project is bhpiugfpkqwxcqbolisb). Until 2026-11-24 the policy named sb-access-token
// (1 hour) and sb-refresh-token (7 days), which nothing sets. The whole list, site by site,
// is pinned in cookie-policy.test.tsx.
describe("cookie policy, the session cookie", () => {
  it("names the session cookie logistiq.cloud sets, and not the two it never set", () => {
    for (const [locale, copy] of Object.entries(translations)) {
      const cloud = copy.cookies.cookiesWeUse.sites.find((s) => s.site === "logistiq.cloud");
      expect(cloud?.cookies[0].name, locale).toBe("sb-bhpiugfpkqwxcqbolisb-auth-token");
      expect(JSON.stringify(copy).match(/sb-access-token|sb-refresh-token/)?.[0], locale).toBeUndefined();
    }
  });
});

// Privacy policy §10 says what the cookie policy says (2026-11-26, F3): cookies that are
// strictly necessary or store a choice, none on a visit to logistiq.ro, a few third parties'
// own; and it links to the cookie policy. Until then it spoke of "essential cookies" alone.
describe("privacy policy, section 10", () => {
  it.each(locales)("%s agrees with the cookie policy and links to it", async (locale) => {
    const copy = translations[locale];
    expect(copy.privacy.cookies.content).toContain("logistiq.ro");
    const html = await renderPage(PrivacyPage, locale);
    expect(html).toContain(`href="/${locale}/cookies"`);
  });
});

// Each new partner says where it works, and the cookie policy's §4 says the same of Maps and
// jsDelivr (2026-11-26). Vercel's purpose names the contact form's bot check (BotID).
describe("privacy policy, section 5, the partners added on 2026-11-26", () => {
  it.each(locales)("%s says where each one works", (locale) => {
    const copy = translations[locale];
    const purpose = (name: string) => copy.privacy.thirdParties.partners.find((p) => p.name === name)?.purpose ?? "";
    const service = (name: string) => copy.cookies.thirdParty.services.find((s) => s.name === name)?.purpose;
    expect(purpose("Vercel")).toContain("BotID");
    for (const want of ["Turnstile", "qrgo.ro", "logistiq.be"]) expect(purpose("Cloudflare")).toContain(want);
    expect(purpose("Google Maps")).toContain("logistiq.cloud");
    expect(service("Google Maps")).toBe(purpose("Google Maps"));
    expect(service("jsDelivr")).toBe(purpose("jsDelivr"));
  });
});
