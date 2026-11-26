import { describe, it, expect } from "vitest";
import { translations } from "@/lib/i18n/translations";
import { locales } from "@/lib/i18n/config";
import { CHOICE_COOKIES, cookieKind } from "@/lib/cookie-kinds";
import { renderPage } from "@/lib/testing/render-page";
import CookiesPage from "@/app/[locale]/cookies/page";

// The cookie policy, rebuilt on 2026-11-26 from the cookies the three sites really set (read
// in this repository and in Logistiq's apps/dashboard, apps/driver, packages/shared and
// resources/presentation at origin/main 692b030b8). Until then one table for all sites
// listed two cookies that exist nowhere ("theme", "sidebar_collapsed") and missed fourteen,
// and section 1 said that continuing to browse was consent. Re-check these tables against
// the product before a push that touches them (CLAUDE.md, "Legal pages").
const SITES: [string, string[]][] = [
  ["logistiq.ro", ["LOGISTIQ_LANG", "LOGISTIQ_LANG_BE"]],
  [
    "logistiq.cloud",
    [
      "sb-bhpiugfpkqwxcqbolisb-auth-token",
      "mfa_passed",
      "lq_device",
      "lq_personal",
      "lq_access_notice",
      "impersonation_context",
      "warehouse_ctx",
      "dispatcher_dept_filter",
      "users_view",
      "NEXT_LOCALE",
    ],
  ],
  ["qrgo.ro", ["qrgo_checkin_id", "qrgo_driver_secret", "NEXT_LOCALE", "LANGUAGE_SELECTED", "DARK_MODE"]],
];

const STORAGE: [string, string][] = [
  ["logistiq.cloud", "logistiq-theme-mode, logistiq-color-theme"],
  ["logistiq.cloud", "logistiq-sidebar-collapsed"],
  ["logistiq.cloud", "checkins_status_filter"],
  ["logistiq.cloud", "yard-settings, yard-kpi-parking-expanded, yard-kpi-warehouse-expanded"],
  ["logistiq.cloud", "logistiq.apiDocs.codeLang"],
  ["logistiq.cloud", "logistiq-qrgo:lang, logistiq-qrgo:theme"],
  ["logistiq.cloud", "epr_suggested"],
  ["logistiq.cloud", "sandbox_unlocked"],
  ["logistiq.cloud", "logistiq:yard-board:reloads:…"],
  ["qrgo.ro", "qrgo.bookingHandoff.v1"],
  ["qrgo.ro", "epr_suggested"],
];

// Each lifetime keeps its number in every language (the code's: lib/access, lib/mfa-marker,
// lib/impersonation, apps/driver/lib/active-checkin and driver-secret, @supabase/ssr).
const DURATIONS: Record<string, RegExp> = {
  "sb-bhpiugfpkqwxcqbolisb-auth-token": /\b400\b/,
  mfa_passed: /\b12\b/,
  lq_device: /\b400\b/,
  lq_personal: /\b30\b/,
  lq_access_notice: /\b(2|120)\b/,
  impersonation_context: /\b8\b/,
  qrgo_checkin_id: /\b48\b/,
  qrgo_driver_secret: /\b72\b/,
};

const SERVICES: [string, string][] = [
  ["Google reCAPTCHA", "policies.google.com/privacy"],
  ["Cloudflare", "www.cloudflare.com/privacypolicy"],
  ["Google Maps", "policies.google.com/privacy"],
  ["Vercel", "vercel.com/legal/privacy-notice"],
  ["jsDelivr", "www.jsdelivr.com/terms/privacy-policy"],
];

// The sentence that took browsing for consent, as each language said it until 2026-11-26.
const BROWSING_IS_CONSENT: Record<string, RegExp> = {
  ro: /continuarea navigării/i,
  en: /continuing to browse/i,
  de: /weiter auf unseren Websites navigieren/i,
  pl: /Kontynuując przeglądanie/i,
  hu: /további böngészésével/i,
  bg: /продължавате да разглеждате/i,
  fr: /poursuivant votre navigation/i,
  nl: /verder te surfen/i,
};

function strings(value: unknown, skip: (key: string) => boolean, key = ""): string[] {
  if (typeof value === "string") return skip(key) ? [] : [value];
  if (Array.isArray(value)) return value.flatMap((v) => strings(v, skip, key));
  if (value && typeof value === "object")
    return Object.entries(value).flatMap(([k, v]) => strings(v, skip, k));
  return [];
}
// Names, sites and URLs are the same in every language by design.
const NOT_COPY = (key: string) => ["name", "site", "url"].includes(key);

describe("cookie policy, the cookies site by site", () => {
  it.each(locales)("%s lists exactly the real cookies, in order, each with its facts", (locale) => {
    const w = translations[locale].cookies.cookiesWeUse;
    expect(Object.keys(w).sort()).toEqual(["intro", "kinds", "sites", "storage", "title"]);
    expect(w.sites.map((s) => [s.site, s.cookies.map((c) => c.name)])).toEqual(SITES);
    for (const site of w.sites) {
      expect(site.desc.trim(), `${locale} ${site.site}`).not.toBe("");
      for (const c of site.cookies) {
        for (const field of [c.purpose, c.duration, c.setWhen]) expect(field.trim(), `${locale} ${c.name}`).not.toBe("");
        if (DURATIONS[c.name]) expect(c.duration, `${locale} ${c.name}`).toMatch(DURATIONS[c.name]);
      }
    }
    expect(w.storage.items.map((i) => [i.site, i.name])).toEqual(STORAGE);
    for (const i of w.storage.items) expect(i.purpose.trim() && i.kept.trim(), `${locale} ${i.name}`).toBeTruthy();
  });

  it.each(locales)("%s names no cookie that does not exist and no longer takes browsing for consent", (locale) => {
    const text = JSON.stringify(translations[locale].cookies);
    for (const gone of ['"theme"', "sidebar_collapsed", "sb-access-token", "sb-refresh-token", "logistiq_authenticated", "logistiq_cookie_consent", "_ga"]) {
      expect(text.includes(gone), `${locale} ${gone}`).toBe(false);
    }
    expect(text.match(BROWSING_IS_CONSENT[locale])?.[0]).toBeUndefined();
  });

  it.each(locales)("%s names the five services, with their policies", (locale) => {
    const services = translations[locale].cookies.thirdParty.services;
    expect(services.map((s) => [s.name, s.url])).toEqual(SERVICES);
    for (const s of services) expect(s.purpose.trim(), `${locale} ${s.name}`).not.toBe("");
  });

  it("the choice cookies are eight listed cookies, and every other listed one is necessary", () => {
    expect([...CHOICE_COOKIES].sort()).toEqual(
      ["LOGISTIQ_LANG", "LOGISTIQ_LANG_BE", "NEXT_LOCALE", "warehouse_ctx", "dispatcher_dept_filter", "users_view", "LANGUAGE_SELECTED", "DARK_MODE"].sort(),
    );
    const listed = SITES.flatMap(([, names]) => names);
    for (const name of CHOICE_COOKIES) expect(listed).toContain(name);
    expect(cookieKind("lq_device")).toBe("necessary");
    expect(cookieKind("users_view")).toBe("choice");
  });

  it("is translated: outside English and Romanian no long string is theirs", () => {
    const en = new Set(strings(translations.en.cookies, NOT_COPY).filter((s) => s.length > 25));
    const ro = new Set(strings(translations.ro.cookies, NOT_COPY).filter((s) => s.length > 25));
    for (const locale of locales) {
      const own = strings(translations[locale].cookies, NOT_COPY).filter((s) => s.length > 25);
      if (locale !== "en") expect(own.filter((s) => en.has(s)), locale).toEqual([]);
      if (locale !== "ro") expect(own.filter((s) => ro.has(s)), locale).toEqual([]);
    }
  });

  it.each(locales)("the %s page shows every cookie and storage name, and no button", async (locale) => {
    const html = await renderPage(CookiesPage, locale);
    for (const [, names] of SITES) for (const name of names) expect(html, name).toContain(name);
    for (const [, name] of STORAGE) expect(html, name).toContain(name);
    expect(html).not.toContain("<button");
  });
});
