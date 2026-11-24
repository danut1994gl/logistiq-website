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

// "contract" in each language, as the terms name the contract the client signs.
const CONTRACT: Record<string, RegExp> = {
  ro: /contract/,
  en: /contract/,
  de: /Vertrag/,
  pl: /umow/,
  hu: /szerződés/,
  bg: /договор/,
  fr: /contrat/,
  nl: /overeenkomst/,
};

// "monthly" in each language, as the self-service subscription was.
const MONTHLY: Record<string, RegExp> = {
  ro: /lunar/,
  en: /monthly/,
  de: /monatlich/,
  pl: /miesięczn/,
  hu: /havi/,
  bg: /месечен/,
  fr: /mensuel/,
  nl: /per maand|maandelijks/,
};

// "anytime" in each language, as the self-service subscription could be cancelled.
const ANYTIME: Record<string, RegExp> = {
  ro: /oricând/,
  en: /any ?time/,
  de: /jederzeit/,
  pl: /w dowolnym momencie|w każdej chwili/,
  hu: /bármikor/,
  bg: /по всяко време/,
  fr: /à tout moment/,
  nl: /op elk moment/,
};

// "prorated" and "refund" in each language, as self-service plan changes were charged.
const PRORATED: Record<string, RegExp> = {
  ro: /proporțional|rambursa/,
  en: /prorat|proportional|refund/,
  de: /anteilig|Erstattung/,
  pl: /proporcjonal|zwrot/,
  hu: /időarányos|visszatérít/,
  bg: /пропорционал|възстановява/,
  fr: /prorata|rembours|proportionnel/,
  nl: /naar rato|terugbetal/,
};

// "discount" in each language: the FAQ offered annual payment "with a discount".
const DISCOUNT: Record<string, RegExp> = {
  ro: /discount|reducere/,
  en: /discount/,
  de: /Rabatt/,
  pl: /zniżk|rabat/,
  hu: /kedvezmény/i,
  bg: /отстъпк/,
  fr: /remise|réduction/,
  nl: /korting/,
};

describe("contract model copy", () => {
  it("knows its words in every language", () => {
    for (const words of [QUARTERLY, PRO_FORMA, ROMANIA, CONTRACT, MONTHLY, ANYTIME, PRORATED, DISCOUNT]) {
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

  // Until 2026-11-24 the client accepted the terms by "creating an account" or "paying a
  // subscription": self-registration and card payment, both closed.
  it("the terms are accepted by signing the contract, or by using the Platform", () => {
    for (const [locale, copy] of Object.entries(translations)) {
      const { items } = copy.terms.article3;
      expect(items.length, locale).toBe(2);
      expect(items[0], locale).toMatch(CONTRACT[locale]);
    }
  });

  // Every plan has trialDays: 0 ("Trial disabled - using demo accounts instead", Logistiq
  // apps/dashboard/lib/stripe.ts), while the terms promised a free 10-day trial.
  it("the terms promise no trial: any trial period is set in the offer or the contract", () => {
    for (const [locale, copy] of Object.entries(translations)) {
      const { content } = copy.terms.article5.trial;
      expect(content, locale).not.toMatch(/\d/);
      expect(content, locale).toMatch(CONTRACT[locale]);
    }
  });

  it("the terms leave the subscription's duration and renewal to the contract", () => {
    for (const [locale, copy] of Object.entries(translations)) {
      const { content } = copy.terms.article5.subscription;
      expect(content, locale).toMatch(CONTRACT[locale]);
      expect(content, locale).not.toMatch(MONTHLY[locale]);
    }
  });

  it("the terms leave termination by the client to the contract", () => {
    for (const [locale, copy] of Object.entries(translations)) {
      for (const content of [copy.terms.article5.cancellation.content, copy.terms.article14.byClient.content]) {
        expect(content, locale).toMatch(CONTRACT[locale]);
        expect(content, locale).not.toMatch(ANYTIME[locale]);
      }
    }
  });

  it("the terms make plan changes on request, as set out in the contract, with no proration or refund", () => {
    for (const [locale, copy] of Object.entries(translations)) {
      for (const content of [copy.terms.article7.upgrade.content, copy.terms.article7.downgrade.content]) {
        expect(content, locale).toMatch(CONTRACT[locale]);
        expect(content, locale).not.toMatch(ANYTIME[locale]);
        expect(content, locale).not.toMatch(PRORATED[locale]);
      }
    }
  });

  it("the FAQ changes plans on request and leaves duration, renewal and ending to the contract", () => {
    for (const [locale, copy] of Object.entries(translations)) {
      for (const answer of [copy.faq.a6, copy.faq.a8]) {
        expect(answer, locale).toMatch(CONTRACT[locale]);
        expect(answer, locale).not.toMatch(ANYTIME[locale]);
        expect(answer, locale).not.toMatch(PRORATED[locale]);
        expect(answer, locale).not.toMatch(DISCOUNT[locale]);
      }
    }
  });
});
