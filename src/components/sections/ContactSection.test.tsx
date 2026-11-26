import { describe, it, expect } from "vitest";
import { renderToString } from "react-dom/server";
import { ContactSection } from "@/components/sections/ContactSection";
import { translations } from "@/lib/i18n/translations";
import { locales } from "@/lib/i18n/config";
import { decodeHtml } from "@/lib/testing/render-page";

// The contact form says, under its button, what a message is used for, and links to the
// privacy policy, which describes the form's data and its bot check (2026-11-26, F11).
// Until then the form showed no notice and the policy did not mention it.
describe("contact form, privacy notice", () => {
  it.each(locales)("%s shows the notice and links to the privacy policy", (locale) => {
    const t = translations[locale];
    const html = decodeHtml(renderToString(<ContactSection t={t} locale={locale} />));
    expect(html).toContain(t.contact.privacyNotice);
    expect(html).toContain(`href="/${locale}/privacy"`);
    if (locale !== "en") expect(t.contact.privacyNotice).not.toBe(translations.en.contact.privacyNotice);
  });

  it.each(locales)("%s privacy policy describes the form's messages and the bot check", (locale) => {
    const { items } = translations[locale].privacy.dataCollected.enquiries;
    expect(items).toHaveLength(3);
    expect(items[2]).toContain("Vercel BotID");
  });
});
