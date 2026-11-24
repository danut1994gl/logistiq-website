import { describe, it, expect } from "vitest";
import { translations } from "@/lib/i18n/translations";

// Clients sign a contract and pay by bank transfer (owner, 2026-11-22). Card payment
// (Stripe) and self-registration are closed on logistiq.cloud (Logistiq ADR-057), whose
// /signup sends visitors to logistiq.ro/contact. Until 2026-11-24, in all 8 languages,
// the FAQ said card payments were accepted and the integrations page said Stripe ran
// the subscription. If card payment comes back, the copy and these tests change together.

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

describe("payment copy: a contract and a bank transfer, no card", () => {
  it("knows the words for bank transfer in every language", () => {
    expect(Object.keys(BANK_TRANSFER).sort()).toEqual(Object.keys(translations).sort());
  });

  it("the FAQ's billing answer says bank transfer and names no card", () => {
    for (const [locale, copy] of Object.entries(translations)) {
      expect(copy.faq.a7, locale).toMatch(BANK_TRANSFER[locale]);
      expect(copy.faq.a7.match(CARD)?.[0], locale).toBeUndefined();
    }
  });

  it("the integrations page bills through SmartBill alone, paid by bank transfer", () => {
    for (const [locale, copy] of Object.entries(translations)) {
      const { q4, a4 } = copy.f16Page;
      expect(`${q4} ${a4}`.match(CARD)?.[0], locale).toBeUndefined();
      expect(a4, locale).toMatch(BANK_TRANSFER[locale]);
    }
  });
});
