import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { renderToString } from "react-dom/server";
import { IntegrationsShowcase } from "@/components/features/IntegrationsShowcase";
import { IntegrationsScene } from "@/components/features/IntegrationsScene";
import { translations } from "@/lib/i18n/translations";
import { locales } from "@/lib/i18n/config";
import { apiDocsUrl } from "@/lib/api-docs";

// The integrations page's developer side (owner, 2026-11-28): an info note on every card of
// the map, six use cases opening their calls in the public documentation, and a panel with
// the Logistiq API lockup and the documentation's pages. The documentation exists in English
// (/docs) and Romanian (/docs/ro) only.

const escape = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;");

const html = (locale: (typeof locales)[number]) =>
  renderToString(<IntegrationsShowcase t={translations[locale]} locale={locale} />);

describe("integrations page, developer side", () => {
  it("links the documentation in Romanian for ro and in English for every other language", () => {
    expect(apiDocsUrl("ro", "reference")).toBe("https://api.logistiq.cloud/docs/ro/reference");
    for (const l of locales.filter((l) => l !== "ro")) {
      expect(apiDocsUrl(l)).toBe("https://api.logistiq.cloud/docs");
      expect(apiDocsUrl(l, "changelog")).toBe("https://api.logistiq.cloud/docs/changelog");
    }
  });

  it.each(locales)("renders the use cases, the API lockup and the documentation's links in %s", (locale) => {
    const f = translations[locale].f16Page;
    const html = renderToString(<IntegrationsShowcase t={translations[locale]} locale={locale} />);
    for (const k of ["uc1t", "uc2t", "uc3t", "uc4t", "uc5t", "uc6t", "devTitle", "devDocs", "devKey", "devNote"] as const) {
      expect(html, `${locale}.${k}`).toContain(escape(f[k]));
    }
    expect(html).toContain('src="/logistiq-api.svg"');
    expect(html).toContain(`href="${apiDocsUrl(locale)}"`);
    expect(html).toContain(`href="${apiDocsUrl(locale, "reference#group-checkins")}"`);
    expect(html).toContain(`href="${apiDocsUrl(locale, "guides/receive-webhooks")}"`);
    expect(html).toContain('href="https://api.logistiq.cloud/openapi.json"');
    expect(html).toContain('href="https://logistiq.cloud/dashboard/api"');
    // every link out opens a new tab without handing it this page
    const blank = html.match(/target="_blank"/g)?.length ?? 0;
    expect(blank).toBe(html.match(/rel="noopener noreferrer"/g)?.length);
    expect(blank).toBe(12);
  });

  it.each(locales)("gives each of the map's eight cards an info note in %s", (locale) => {
    const f = translations[locale].f16Page;
    const html = renderToString(<IntegrationsScene t={translations[locale]} />);
    const tips = [f.tipSelf, f.tipAccess, f.tipPortal, f.tipDriver, f.tipCarrier, f.tipTms, f.tipWms, f.tipErp];
    for (const tip of tips) expect(html, locale).toContain(escape(tip));
    expect(html.match(/role="tooltip"/g)).toHaveLength(16); // 8 per geometry, one shown
    expect(html.match(/<button type="button" aria-label="[^"]+"/g)).toHaveLength(16);
    expect(html).toContain(`aria-label="${escape(`${f.uiSelf}: ${f.tipAria}`)}"`);
    // closed until opened, so the server's HTML and the first paint agree
    expect(html.match(/role="tooltip" hidden=""/g)).toHaveLength(16);
  });

  // Opening the barrier on a valid scan is in progress (qrgobox-copy.test.ts): the gate's use
  // case and QRGo Access's note speak of scans and their outcome, never of trucks let through.
  it("says nothing of a gate letting a truck through", () => {
    for (const locale of locales) {
      const f = translations[locale].f16Page;
      expect(f.uc4d, locale).toContain("QRGo Access");
      expect(html(locale), locale).toContain(escape(f.uc4Badge));
      expect(`${f.uc4t} ${f.uc4d}`, locale).not.toMatch(/let through|lăsat să treacă|durchgelassen|przepuszcz|átenged|пропусн|laissé passer|doorgelaten/i);
    }
  });

  // Until 2026-11-28 the spec's subtitle said the documentation and the changelog were in the
  // dashboard's API section; they are public at api.logistiq.cloud/docs since 2026-11-27.
  it("says the documentation is public", () => {
    for (const [locale, copy] of Object.entries(translations)) {
      expect(copy.f16Page.specSub, locale).toContain("api.logistiq.cloud/docs");
    }
  });

  it("ships the Logistiq API lockup as one SVG, coloured for the dark site", () => {
    const svg = readFileSync(fileURLToPath(new URL("../../../public/logistiq-api.svg", import.meta.url)), "utf8");
    expect(svg).toMatch(/^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" viewBox="18\.73 9\.49 1056\.69 169\.75"/);
    expect(svg).toContain("<title>Logistiq API</title>");
    expect(svg).not.toContain("currentColor");
    expect(svg).not.toMatch(/<script|href="http|on[a-z]+=/i);
  });
});
