import { describe, it, expect } from "vitest";
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
