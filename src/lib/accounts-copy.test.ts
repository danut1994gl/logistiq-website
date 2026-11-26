import { describe, it, expect } from "vitest";
import { translations } from "@/lib/i18n/translations";
import { locales, type Locale } from "@/lib/i18n/config";

// How accounts are really created (Logistiq origin/main 692b030b8): self-registration is
// closed (/signup redirects, POST /api/auth/signup answers 403), Logistiq creates the
// client's first account after the contract is signed and its holder sets a password from an
// e-mailed invitation, the client's administrators create their users (users:create), and a
// carrier registers from a warehouse's invitation token. Until 2026-11-26 the terms' article
// 4 was written for self-registration.
const CONTRACT: Record<Locale, RegExp> = {
  ro: /contract/,
  en: /contract/,
  de: /Vertrag/,
  pl: /umow/,
  hu: /szerződés/,
  bg: /договор/,
  fr: /contrat/,
  nl: /overeenkomst/,
};

describe("terms, article 4", () => {
  it.each(locales)("%s says how accounts are created, and names no logistiq.cloud", (locale) => {
    const { items } = translations[locale].terms.article4;
    expect(items).toHaveLength(8);
    expect(items[0]).toMatch(CONTRACT[locale]);
    expect(items.filter((i) => i.includes("logistiq.cloud"))).toEqual([]);
  });
});
