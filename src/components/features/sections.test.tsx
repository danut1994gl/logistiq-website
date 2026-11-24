import { describe, it, expect } from "vitest";
import { renderToString } from "react-dom/server";
import { FeatureCalloutSection } from "@/components/features/sections";
import { translations } from "@/lib/i18n/translations";
import { locales } from "@/lib/i18n/config";

// A feature page callout's label is its kind in the page's language (t.features.callout).
// Until 2026-11-24 it printed the raw English kind ("roadmap", "pilot", "note") in every
// language, uppercased by CSS.
const KINDS = ["roadmap", "pilot", "note"] as const;

function renderedLabel(html: string): string | undefined {
  return html.match(/<p class="flex[^"]*"><span[^>]*><\/span>([^<]*)<\/p>/)?.[1];
}

describe("FeatureCalloutSection label", () => {
  it.each(locales)("is the kind in the page's language in %s", (locale) => {
    const labels = translations[locale].features.callout;
    for (const kind of KINDS) {
      const html = renderToString(
        <FeatureCalloutSection idPrefix="t" title="Title" body="Body" kind={kind} labels={labels} />,
      );
      expect(labels[kind].trim(), `${locale}.${kind}`).not.toBe("");
      expect(renderedLabel(html), `${locale}.${kind}`).toBe(labels[kind]);
    }
  });
});
