import { describe, it, expect } from "vitest";
import { renderToString } from "react-dom/server";
import { HowItWorksSection } from "@/components/sections/HowItWorksSection";
import { translations } from "@/lib/i18n/translations";
import { locales } from "@/lib/i18n/config";

// Step 1 of "How it works" marks "QRGo Driver" with <b>…</b> in every language. Until
// 2026-11-24 the home page printed the tags as text ("<b>QRGo Driver</b>").
describe("HowItWorksSection", () => {
  it.each(locales)("draws QRGo Driver in bold and prints no tag in %s", (locale) => {
    expect(translations[locale].howItWorks.step1Desc).toContain("<b>QRGo Driver</b>");
    const html = renderToString(<HowItWorksSection t={translations[locale]} />);
    expect(html).not.toMatch(/&lt;\/?b&gt;/);
    expect(html).toMatch(/<strong[^>]*>QRGo Driver<\/strong>/);
  });
});
