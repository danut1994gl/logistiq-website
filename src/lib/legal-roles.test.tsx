import { describe, it, expect } from "vitest";
import { translations } from "@/lib/i18n/translations";
import { locales, type Locale } from "@/lib/i18n/config";
import { renderPage } from "@/lib/testing/render-page";
import PrivacyPage from "@/app/[locale]/privacy/page";

// Who is controller and who is processor (owner, 2026-11-26, D4), as qrgo.ro's own policy
// already tells drivers: the warehouse, our client, is the controller of its drivers'
// check-in data and the company processes it on the warehouse's behalf; the company is the
// controller of the dashboard's accounts, billing and the website's contact form. Until then
// the privacy policy called the company "the Data Controller" of everything. The words are
// the GDPR's own in each language.
const CONTROLLER: Record<Locale, RegExp> = {
  ro: /operator(ul)? de date/i,
  en: /controller/i,
  de: /Verantwortliche/,
  pl: /administrator/i,
  hu: /adatkezelő/i,
  bg: /администратор/i,
  fr: /responsable du traitement/i,
  nl: /verwerkingsverantwoordelijke/i,
};
const PROCESSOR: Record<Locale, RegExp> = {
  ro: /persoană împuternicită/i,
  en: /processor/i,
  de: /Auftragsverarbeiter/,
  pl: /podmiot(em)? przetwarzając/i,
  hu: /adatfeldolgozó/i,
  bg: /обработващ лични данни/i,
  fr: /sous-traitant/i,
  nl: /verwerker\b/i,
};

describe("privacy policy and terms, the two roles", () => {
  it.each(locales)("%s states both roles where it must, and calls the company controller of nothing more", (locale) => {
    const { privacy, terms, cookies } = translations[locale];
    expect(privacy.intro.roles.controller.desc).toMatch(CONTROLLER[locale]);
    const processor = privacy.intro.roles.processor.desc;
    expect(processor).toMatch(CONTROLLER[locale]);
    expect(processor).toMatch(PROCESSOR[locale]);
    // Drivers' data also arrives from the warehouse's own systems, through the Integration API
    // (bookings; final review N5, 2026-11-27).
    for (const name of ["qrgo.ro", "QRGo Driver", "QRGo Self", "API"]) expect(processor).toContain(name);
    for (const text of [privacy.contact.operator, terms.article10.items[3]]) {
      expect(text).toMatch(CONTROLLER[locale]);
      expect(text).toMatch(PROCESSOR[locale]);
    }
    expect(privacy.intro.p1).not.toMatch(CONTROLLER[locale]);
    // The cookie policy's contact box names the company, not a role (the critic's S4).
    expect(cookies.contact.operator).not.toMatch(CONTROLLER[locale]);
    expect(cookies.contact.operator).not.toMatch(PROCESSOR[locale]);
  });

  it.each(locales)("%s lists the drivers' data apart, and the location stays on the phone", (locale) => {
    const { dataCollected, legalBasis } = translations[locale].privacy;
    expect(dataCollected.activity.items).toHaveLength(6);
    expect(dataCollected.technical.items).toHaveLength(3);
    expect(dataCollected.technical.items[2]).toMatch(/\b12\b/);
    expect(JSON.stringify(dataCollected.technical)).not.toMatch(/GPS/);
    expect(dataCollected.locationNote).toContain("QRGo Driver");
    // The consent card no longer names GPS coordinates (the critic's M3).
    expect(legalBasis.consent.desc).not.toMatch(/GPS/);
    expect(legalBasis.consent.desc).toContain("QRGo Driver");
  });

  it.each(locales)("the %s privacy page shows both role titles", async (locale) => {
    const html = await renderPage(PrivacyPage, locale);
    const { roles } = translations[locale].privacy.intro;
    expect(html).toContain(roles.controller.title);
    expect(html).toContain(roles.processor.title);
  });
});
