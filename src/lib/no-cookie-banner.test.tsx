import { describe, it, expect } from "vitest";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { renderToString } from "react-dom/server";
import SiteFooter from "@/components/site/SiteFooter";
import { translations } from "@/lib/i18n/translations";
import { locales } from "@/lib/i18n/config";

// No cookie banner (owner, 2026-11-26, D2): logistiq.ro sets no cookie on a visit, and the
// one it can set, the chosen language, is set only by the language menu. Until then a
// banner offered "Essential" and a pre-ticked "Functional" category that gated nothing, and
// the footer had a "Cookie preferences" button.
const SRC = fileURLToPath(new URL("..", import.meta.url));
function sources(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return sources(path);
    return /\.(ts|tsx)$/.test(name) && !/\.test\.tsx?$/.test(name) ? [path] : [];
  });
}

describe("no cookie banner", () => {
  it("no locale has the banner's copy", () => {
    for (const locale of locales) expect(Object.keys(translations[locale]), locale).not.toContain("cookieConsent");
  });

  it("the component is gone and nothing refers to it", () => {
    expect(existsSync(join(SRC, "components/CookieConsent.tsx"))).toBe(false);
    const hits = sources(SRC).filter((f) => /CookieConsent|CookiePreferencesButton|cookieConsentUpdate/.test(readFileSync(f, "utf8")));
    expect(hits).toEqual([]);
  });

  it.each(locales)("the footer has no button in %s", (locale) => {
    expect(renderToString(<SiteFooter locale={locale} />)).not.toContain("<button");
  });
});
