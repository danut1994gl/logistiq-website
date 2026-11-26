import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { renderToString } from "react-dom/server";
import SiteHeader from "@/components/site/SiteHeader";
import { translations } from "@/lib/i18n/translations";
import { locales } from "@/lib/i18n/config";

// Until 2026-11-26 the header read a logistiq_authenticated cookie, set by the dashboard for
// .logistiq.ro, to show "Dashboard" instead of "Login". The dashboard runs on logistiq.cloud,
// where a browser refuses a cookie for another domain, so nothing can set it any more: the
// link is always Login, to logistiq.cloud.
describe("site header", () => {
  it.each(locales)("links to logistiq.cloud with Login in %s", (locale) => {
    const html = renderToString(<SiteHeader locale={locale} />);
    expect(html).toContain('href="https://logistiq.cloud"');
    expect(html).not.toContain("logistiq.cloud/dashboard");
    expect(html).toContain(translations[locale].nav.login);
    expect(Object.keys(translations[locale].nav)).not.toContain("dashboard");
  });
});

// The language menu says, under its languages, that a pick is saved in a cookie for a year,
// and links to the cookie policy (2026-11-26). The menu is closed in a server render, so the
// line's link is checked in the component's source.
describe("site header, the language menu's cookie note", () => {
  it.each(locales)("names the cookie and the year in %s, translated", (locale) => {
    const note = translations[locale].nav.languageCookieNote;
    expect(note).toMatch(/cookie|бисквитк/i);
    expect(note).not.toMatch(/\d/);
    if (locale !== "en") expect(note).not.toBe(translations.en.nav.languageCookieNote);
  });

  it("links the note to the cookie policy in the page's language", () => {
    const source = readFileSync(fileURLToPath(new URL("./SiteHeader.tsx", import.meta.url)), "utf8");
    expect(source).toMatch(/href=\{routeHref\(locale, "\/cookies"\)\}[\s\S]{0,400}\{t\.nav\.languageCookieNote\}/);
  });
});
