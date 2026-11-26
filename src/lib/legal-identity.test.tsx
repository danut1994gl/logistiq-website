import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { translations } from "@/lib/i18n/translations";
import { locales } from "@/lib/i18n/config";
import { company } from "@/lib/company";
import { registeredOffice, withCompany } from "@/lib/legal-identity";
import { renderPage } from "@/lib/testing/render-page";
import PrivacyPage from "@/app/[locale]/privacy/page";
import TermsPage from "@/app/[locale]/terms/page";
import CookiesPage from "@/app/[locale]/cookies/page";

// The legal pages read the company's identity from lib/company.ts (2026-11-26). Until then
// each language typed the name, the address, the CUI and a register number into its copy,
// and the register number drifted from the footer's; English also called the CUI a "VAT
// ID", though the company is not a VAT payer.

const PLACEHOLDERS = ["{company}", "{office}", "{cui}"];

function strings(value: unknown, path = ""): [string, string][] {
  if (typeof value === "string") return [[path, value]];
  if (Array.isArray(value)) return value.flatMap((v, i) => strings(v, `${path}[${i}]`));
  if (value && typeof value === "object")
    return Object.entries(value).flatMap(([k, v]) => strings(v, path ? `${path}.${k}` : k));
  return [];
}

const SRC = fileURLToPath(new URL("..", import.meta.url));
function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? files(path) : [path];
  });
}

describe("legal identity", () => {
  it("writes the registered office from company.ts, with the country in the page's language", () => {
    expect(registeredOffice(translations.en)).toBe("Str. Vidin 37, 805300 Tecuci, Galați, Romania");
    expect(registeredOffice(translations.ro)).toBe("Str. Vidin 37, 805300 Tecuci, Galați, România");
    expect(withCompany("{company} {cui}", translations.en)).toBe(`${company.legalName} ${company.cui}`);
  });

  it.each(locales)("%s: only the two identity strings hold the placeholders, once each", (locale) => {
    const copy = translations[locale];
    for (const text of [copy.privacy.intro.p1, copy.terms.article1.definitions[0].def]) {
      for (const p of PLACEHOLDERS) expect(text.split(p).length - 1, `${locale} ${p}`).toBe(1);
    }
    const others = strings(copy).filter(
      ([path, text]) =>
        path !== "privacy.intro.p1" &&
        path !== "terms.article1.definitions[0].def" &&
        PLACEHOLDERS.some((p) => text.includes(p)),
    );
    expect(others.map(([path]) => path)).toEqual([]);
  });

  it.each(locales)("%s: the copy carries no copy of the identity, and the legal pages say no VAT", (locale) => {
    const copy = translations[locale];
    const all = JSON.stringify(copy);
    for (const literal of [company.cui, company.regCom, company.legalName, company.address.street, "Видин"]) {
      expect(all.includes(literal), `${locale} ${literal}`).toBe(false);
    }
    const legal = JSON.stringify([copy.privacy, copy.terms, copy.cookies, copy.legal]);
    expect(legal.includes(company.email), locale).toBe(false);
    expect(legal.match(/\bVAT\b/)?.[0], locale).toBeUndefined();
  });

  it.each(locales)("%s: the three pages show the name, the CUI, the office and the e-mail", async (locale) => {
    const office = registeredOffice(translations[locale]);
    for (const [name, Page] of [["privacy", PrivacyPage], ["terms", TermsPage], ["cookies", CookiesPage]] as const) {
      const html = await renderPage(Page, locale);
      for (const want of [company.legalName, company.cui, office, company.email]) {
        expect(html.includes(want), `${locale} ${name} ${want}`).toBe(true);
      }
      if (name !== "terms") expect(html.includes(company.regCom), `${locale} ${name} regCom`).toBe(true);
      for (const p of PLACEHOLDERS) expect(html.includes(p), `${locale} ${name} ${p}`).toBe(false);
    }
  });

  it("no source file but lib/company.ts holds the legal name, the CUI or the register number", () => {
    const hits = files(SRC)
      .filter((f) => !/\.test\.tsx?$/.test(f))
      .filter((f) => {
        const text = readFileSync(f, "utf8");
        return [company.legalName, company.cui, company.regCom].some((v) => text.includes(v));
      })
      .map((f) => f.slice(SRC.length));
    expect(hits).toEqual(["lib/company.ts"]);
  });
});
