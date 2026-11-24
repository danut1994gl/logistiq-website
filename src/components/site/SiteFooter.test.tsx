import { describe, it, expect } from "vitest";
import { renderToString } from "react-dom/server";
import SiteFooter from "@/components/site/SiteFooter";
import { translations } from "@/lib/i18n/translations";
import { locales } from "@/lib/i18n/config";

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
