import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { translations } from "@/lib/i18n/translations";

// Clients sign a contract and pay by bank transfer (owner, 2026-11-22). Card payment
// (Stripe) and self-registration are closed on logistiq.cloud (Logistiq ADR-057), whose
// /signup sends visitors to logistiq.ro/contact. Until 2026-11-24, in all 8 languages,
// the FAQ said card payments were accepted, the terms said payment could be made by card
// (Stripe), the integrations page said Stripe ran the subscription, and the cloud page
// said the visitor signs up on logistiq.cloud. If card payment or self-registration
// comes back, the copy and these tests change together. Until 2026-11-24 the privacy
// policy also listed Stripe among the partners that process data, and the cookie policy
// among the services that may set cookies, although no data goes to it and it sets none:
// its checkout and portal routes refuse first, and no page loads Stripe.js.

// "card" and "Stripe" in each language. A status card on the driver's phone (f10Page)
// is not a payment, so only the billing strings are checked.
const CARD = /stripe|\bcard\b|karte|kart[aąyę]|kártyá|карт|\bcarte\b|kaart/i;

// "bank transfer" in each language.
const BANK_TRANSFER: Record<string, RegExp> = {
  ro: /transfer bancar/,
  en: /bank transfer/,
  de: /Banküberweisung/,
  pl: /przelewem bankowym/,
  hu: /banki átutalással/,
  bg: /банков превод/,
  fr: /virement bancaire/,
  nl: /bankoverschrijving/,
};

// "you sign up" and its kin in each language, followed closely by logistiq.cloud: Logistiq
// opens a client's account, nobody signs up there. Carriers registering in their own
// portal, by invitation, is true and names no logistiq.cloud.
const SIGN_UP: Record<string, RegExp> = {
  ro: /te înregistrezi|înregistrează-te|te înscrii|înscrie-te|îți (creezi|faci) (un )?cont/,
  en: /sign(s|ing)? up|signup|register|create (an |your )?account/,
  de: /registrier|anmeld|Konto (erstellen|anlegen)/,
  pl: /rejestrujesz się|zarejestruj się|załóż konto|zakładasz konto/,
  hu: /regisztrál|fiókot (hoz létre|nyit)/,
  bg: /регистрирате се|регистрирайте се|създайте акаунт|създавате акаунт/,
  fr: /créez votre compte|créer (votre|un) compte|inscri/,
  nl: /meldt zich aan|meld u aan|aanmelden|registreer|account aanmaken/,
};

function strings(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (value && typeof value === "object") return Object.values(value).flatMap(strings);
  return [];
}

// Until 2026-11-24 the plans' "choose plan" links went to logistiq.cloud's signup.
const SIGNUP_LINK = /logistiq\.cloud\/signup/;

const SRC = fileURLToPath(new URL("..", import.meta.url));

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    return /\.tsx?$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name) ? [path] : [];
  });
}

describe("payment copy: a contract and a bank transfer, no card", () => {
  it("knows the words for bank transfer and for signing up in every language", () => {
    expect(Object.keys(BANK_TRANSFER).sort()).toEqual(Object.keys(translations).sort());
    expect(Object.keys(SIGN_UP).sort()).toEqual(Object.keys(translations).sort());
  });

  it("no source file under src/ links to logistiq.cloud's signup", () => {
    const offenders = sourceFiles(SRC).filter((file) => SIGNUP_LINK.test(readFileSync(file, "utf8")));
    expect(offenders).toEqual([]);
  });

  it("no language tells the visitor to sign up on logistiq.cloud", () => {
    for (const [locale, copy] of Object.entries(translations)) {
      const signUpThere = new RegExp(`(${SIGN_UP[locale].source})[^.]{0,40}logistiq\\.cloud`, "i");
      expect(strings(copy).filter((s) => signUpThere.test(s)), locale).toEqual([]);
    }
  });

  it("the FAQ's billing answer says bank transfer and names no card", () => {
    for (const [locale, copy] of Object.entries(translations)) {
      expect(copy.faq.a7, locale).toMatch(BANK_TRANSFER[locale]);
      expect(copy.faq.a7.match(CARD)?.[0], locale).toBeUndefined();
    }
  });

  it("the terms' payment clause says bank transfer and names no card or Stripe", () => {
    for (const [locale, copy] of Object.entries(translations)) {
      const { items } = copy.terms.article6;
      expect(items.filter((item) => CARD.test(item)), locale).toEqual([]);
      expect(items.some((item) => BANK_TRANSFER[locale].test(item)), locale).toBe(true);
    }
  });

  it("the privacy policy names no Stripe among the partners that process data", () => {
    for (const [locale, copy] of Object.entries(translations)) {
      const partners = copy.privacy.thirdParties.partners.map((p) => p.name);
      expect(partners, locale).not.toContain("Stripe");
      expect(partners.slice(0, 3), locale).toEqual(["Supabase", "SmartBill", "Vercel"]);
    }
  });

  it("the cookie policy names no Stripe among the services that may set cookies", () => {
    for (const [locale, copy] of Object.entries(translations)) {
      const services = copy.cookies.thirdParty.services.map((s) => s.name);
      // Google Analytics left the list on 2026-11-24 too: no page of logistiq.ro,
      // logistiq.cloud or qrgo.ro loads it (legal-copy.test.ts).
      // Google reCAPTCHA joined it on 2026-11-24 (legal-copy.test.ts). Since 2026-11-26 the
      // list names the companies whose code or files the sites load (cookie-policy.test.tsx);
      // Supabase's session cookie is the dashboard's own, listed under logistiq.cloud.
      expect(services, locale).toEqual(["Google reCAPTCHA", "Cloudflare", "Google Maps", "Vercel", "jsDelivr"]);
    }
  });

  it("no language's copy names Stripe anywhere", () => {
    for (const [locale, copy] of Object.entries(translations)) {
      expect(JSON.stringify(copy).match(/stripe/i)?.[0], locale).toBeUndefined();
    }
  });

  // The integrations page's billing Q&A (f16Page.q4 and a4) was rendered nowhere and was
  // deleted on 2026-11-24 with the rest of the page's unrendered copy (api-copy.test.ts).
});
