import { describe, it, expect } from "vitest";
import { renderToString } from "react-dom/server";
import SiteFooter from "@/components/site/SiteFooter";
import { translations } from "@/lib/i18n/translations";
import { locales } from "@/lib/i18n/config";
import { company } from "@/lib/company";

// The site states no company location unless the owner gives one (owner's rule). Until
// 2026-11-24 the footer ended "Made with ❤ in Romania" in every language.
const ROMANIA = /România|Romania|Rumänien|Rumunii|Romániában|Румъния|Roumanie|Roemenië/;

describe("site footer", () => {
  it.each(locales)("says made with ❤ and names no country in %s", (locale) => {
    const footer = translations[locale].footer;
    expect(Object.keys(footer)).not.toContain("inRomania");
    expect(JSON.stringify(footer).match(ROMANIA)?.[0]).toBeUndefined();
    const html = renderToString(<SiteFooter locale={locale} />);
    expect(html).toContain(footer.madeWith);
    expect(html).toContain("❤");
    expect(html.match(ROMANIA)?.[0]).toBeUndefined();
  });
});

// The company's tax ID and trade register number, labelled in the page's language. Until
// 2026-11-26 the labels were Romanian ("CUI:", "Nr. Reg. Com.:") in all eight languages, and
// English called the CUI a VAT ID elsewhere: the company is not a VAT payer.
const decode = (html: string) =>
  html.replace(/<!-- -->/g, "").replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&");

describe("site footer, company identity", () => {
  it.each(locales)("prints the CUI and the register number with %s labels", (locale) => {
    const { taxId, regNo } = translations[locale].legal.identity;
    const html = decode(renderToString(<SiteFooter locale={locale} />));
    expect(html).toContain(`${taxId} ${company.cui}`);
    expect(html).toContain(`${regNo} ${company.regCom}`);
    expect(`${taxId} ${regNo}`).not.toMatch(/VAT|ROMANIA/i);
    if (locale !== "ro") {
      expect(taxId).not.toBe(translations.ro.legal.identity.taxId);
      expect(regNo).not.toBe(translations.ro.legal.identity.regNo);
    }
  });
});
