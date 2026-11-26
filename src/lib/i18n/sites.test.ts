import { describe, it, expect } from "vitest";
import { siteForHost, relocatePath, localeCookie } from "@/lib/i18n/sites";
import { locales, defaultLocale } from "@/lib/i18n/config";

describe("siteForHost", () => {
  it("logistiq.be serves Dutch first, then French and English — nothing else", () => {
    const be = siteForHost("logistiq.be");
    expect(be.locales).toEqual(["nl", "fr", "en"]);
    expect(be.defaultLocale).toBe("nl");
  });

  it("matches logistiq.be however the host is spelled", () => {
    for (const host of ["www.logistiq.be", "LOGISTIQ.BE", "logistiq.be:443", "www.logistiq.be."]) {
      expect(siteForHost(host).defaultLocale, host).toBe("nl");
    }
  });

  it("every other host serves all locales and opens in Romanian", () => {
    for (const host of ["logistiq.ro", "www.logistiq.ro", "localhost:3000", "logistiq-website.vercel.app", "", null, undefined]) {
      const site = siteForHost(host);
      expect(site.locales, String(host)).toEqual(locales);
      expect(site.defaultLocale, String(host)).toBe("ro");
    }
  });

  it("the first-visit language is not the international fallback, which stays English", () => {
    // hreflang x-default, the sitemap and RSS use config's defaultLocale: a visitor
    // whose language Logistiq doesn't offer reads English better than Romanian.
    expect(defaultLocale).toBe("en");
    expect(siteForHost("logistiq.ro").defaultLocale).not.toBe(defaultLocale);
  });

  it("logistiq.be remembers the language in its own cookie, not the one logistiq.be set before it had a language set", () => {
    expect(siteForHost("logistiq.be").cookie).not.toBe(siteForHost("logistiq.ro").cookie);
  });
});

describe("localeCookie (the language switcher saves the pick itself)", () => {
  it("writes the domain's cookie for a year, site-wide, over HTTPS only", () => {
    expect(localeCookie(siteForHost("logistiq.ro"), "pl")).toBe(
      "LOGISTIQ_LANG=pl; Path=/; Max-Age=31536000; SameSite=Lax; Secure"
    );
    expect(localeCookie(siteForHost("logistiq.be"), "fr")).toMatch(/^LOGISTIQ_LANG_BE=fr; .*; Secure$/);
  });

  // Until 2026-11-26 every page view wrote NEXT_LOCALE (NEXT_LOCALE_BE on logistiq.be)
  // with the language of the page opened. The chosen language has new names, so those
  // cookies, which nobody chose, no longer steer anything.
  it("uses neither of the names page views used to write", () => {
    for (const host of ["logistiq.ro", "logistiq.be", "localhost"]) {
      expect(["NEXT_LOCALE", "NEXT_LOCALE_BE"]).not.toContain(siteForHost(host).cookie);
    }
  });
});

describe("relocatePath", () => {
  it("moves a page to the same page in another language", () => {
    expect(relocatePath("nl", "/de")).toBe("/nl");
    expect(relocatePath("nl", "/de/")).toBe("/nl");
    expect(relocatePath("nl", "/ro/contact")).toBe("/nl/contact");
    expect(relocatePath("nl", "/pl/privacy")).toBe("/nl/privacy");
  });

  it("sends a feature page to the target's features index (slugs are per language)", () => {
    expect(relocatePath("nl", "/de/funktionen")).toBe("/nl/functies");
    expect(relocatePath("nl", "/de/funktionen/digitaler-check-in")).toBe("/nl/functies");
    expect(relocatePath("nl", "/ro/functionalitati/check-in-digital")).toBe("/nl/functies");
    expect(relocatePath("nl", "/hu/features/digital-check-in")).toBe("/nl/functies");
  });

  it("sends a blog article to the target's blog index (slugs are per language)", () => {
    expect(relocatePath("nl", "/ro/blog")).toBe("/nl/blog");
    expect(relocatePath("nl", "/ro/blog/un-articol")).toBe("/nl/blog");
    expect(relocatePath("nl", "/bg/blog/category/noutati")).toBe("/nl/blog");
  });
});
