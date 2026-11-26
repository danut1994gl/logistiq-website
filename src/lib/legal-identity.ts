import { company } from "@/lib/company";
import type { Translations } from "@/lib/i18n/translations";

// The company's identity on the legal pages comes from lib/company.ts, never from a
// translation (2026-11-26). Until then each language typed the name, the address, the CUI
// and the trade register number into its copy, and they drifted from the footer's.

// The registered office in the page's language: company.ts's address, then the country's
// name as that language writes it (legal.identity.country). The address itself is never
// translated: a translated copy is a second copy.
export function registeredOffice(t: Translations): string {
  const { street, postalCode, city, region } = company.address;
  return `${street}, ${postalCode} ${city}, ${region}, ${t.legal.identity.country}`;
}

// Fills a legal text's {company}, {office} and {cui}.
export function withCompany(text: string, t: Translations): string {
  return text
    .replaceAll("{company}", company.legalName)
    .replaceAll("{office}", registeredOffice(t))
    .replaceAll("{cui}", company.cui);
}
