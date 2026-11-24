import { describe, it, expect } from "vitest";
import { translations } from "@/lib/i18n/translations";

// Clients sign a contract with Logistiq (owner, 2026-11-22), and billing follows it
// (Logistiq lib/contracts/billing.ts, the daily contract-billing cron, and
// POST /api/admin/proformas/[id]/mark-paid). Each billing period is billed in advance, for
// the contract's cycle: monthly, quarterly, semiannual, annual or a custom number of days.
// Its pro forma is issued when the period starts and paid by bank transfer. The fiscal
// invoice is issued through SmartBill once the payment is recorded. Until 2026-11-24, in
// all 8 languages, the FAQ and the terms said billing was monthly and paid against "the
// invoice".

// "quarterly" and "pro forma" in each language: words the billing copy had none of while it
// said billing was monthly.
const QUARTERLY: Record<string, RegExp> = {
  ro: /trimestrial/,
  en: /quarterly/,
  de: /vierteljährlich/,
  pl: /kwartaln/,
  hu: /negyedév/,
  bg: /тримесечн/,
  fr: /trimestriel/,
  nl: /per kwartaal/,
};
const PRO_FORMA: Record<string, RegExp> = {
  ro: /proform/,
  en: /pro forma/,
  de: /Proforma/,
  pl: /pro forma/,
  hu: /proforma/,
  bg: /проформа/,
  fr: /pro forma/,
  nl: /pro-forma/,
};

// "Romania" in each language: the terms issued fiscal invoices "for Romania", while
// mark-paid issues one through SmartBill for every client.
const ROMANIA: Record<string, RegExp> = {
  ro: /Români/,
  en: /Romania/,
  de: /Rumänien/,
  pl: /Rumuni/,
  hu: /Románi/,
  bg: /Румъни/,
  fr: /Roumanie/,
  nl: /Roemeni/,
};

describe("contract model copy", () => {
  it("knows its words in every language", () => {
    for (const words of [QUARTERLY, PRO_FORMA, ROMANIA]) {
      expect(Object.keys(words).sort()).toEqual(Object.keys(translations).sort());
    }
  });

  it("the FAQ's billing answer names the contract's billing periods and the pro forma", () => {
    for (const [locale, copy] of Object.entries(translations)) {
      expect(copy.faq.a7, locale).toMatch(QUARTERLY[locale]);
      expect(copy.faq.a7, locale).toMatch(PRO_FORMA[locale]);
    }
  });

  it("the terms bill in advance for the billing period set in the contract", () => {
    for (const [locale, copy] of Object.entries(translations)) {
      expect(copy.terms.article6.items[1], locale).toMatch(QUARTERLY[locale]);
    }
  });

  it("the terms have each period's pro forma paid, and the fiscal invoice issued for every client", () => {
    for (const [locale, copy] of Object.entries(translations)) {
      const { items } = copy.terms.article6;
      expect(items[2], locale).toMatch(PRO_FORMA[locale]);
      expect(items[3], locale).toMatch(/SmartBill/);
      expect(items[3], locale).not.toMatch(ROMANIA[locale]);
    }
  });
});
