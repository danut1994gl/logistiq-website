import { locales, isValidLocale, type Locale } from "@/lib/i18n/config";
import { featuresSegment } from "@/lib/i18n/segments";

// The languages a domain offers, and the one a first visit opens in. Every host
// (logistiq.ro, previews, localhost) serves all locales and opens in Romanian; a
// country domain serves only its market's languages. middleware.ts enforces the
// set (redirects + default) and SiteHeader's language switcher lists only it.
// Pages are prerendered once for every host, so nothing rendered on the server
// may depend on this.
//
// `defaultLocale` here is only where a visitor with no saved language lands. The
// international fallback (hreflang x-default, the sitemap, RSS) is config.ts's
// `defaultLocale`, English, and stays English: see CLAUDE.md "i18n & URLs".
export type Site = {
  locales: readonly Locale[];
  defaultLocale: Locale;
  // Cookie that remembers the visitor's language on this domain.
  cookie: string;
};

// Romanian since 2026-11-08 (owner's request: logistiq.ro opens in Romanian; a
// language the visitor saved before still wins). Before, every host opened in English.
const DEFAULT_SITE: Site = { locales, defaultLocale: "ro", cookie: "NEXT_LOCALE" };

const COUNTRY_SITES: Record<string, Site> = {
  // Belgium: Dutch first, then French and English (2026-11-06). Its own cookie,
  // because until then logistiq.be set NEXT_LOCALE=en for every visitor, and
  // that would keep returning visitors on English instead of the new default.
  "logistiq.be": { locales: ["nl", "fr", "en"], defaultLocale: "nl", cookie: "NEXT_LOCALE_BE" },
};

// The saved language lasts a year and is renewed on every visit.
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

// The language switcher saves the visitor's pick in the browser, with the same
// attributes middleware.ts uses: a switch to a prefetched page is served from the
// router's cache and never reaches the middleware, so the click itself must save it.
export function localeCookie(site: Site, locale: Locale): string {
  return `${site.cookie}=${locale}; Path=/; Max-Age=${LOCALE_COOKIE_MAX_AGE}; SameSite=Lax`;
}

export function siteForHost(host: string | null | undefined): Site {
  const domain = (host ?? "")
    .trim()
    .toLowerCase()
    .replace(/:\d+$/, "")
    .replace(/\.$/, "")
    .replace(/^www\./, "");
  return COUNTRY_SITES[domain] ?? DEFAULT_SITE;
}

// The same page in another language, for a URL in a language the domain doesn't
// serve. Shared paths keep their tail (/de/contact -> /nl/contact). Feature and
// blog article slugs differ per language, so those land on the target's features
// or blog index.
export function relocatePath(target: Locale, pathname: string): string {
  const [from, segment, ...rest] = pathname.split("/").filter(Boolean);
  if (!segment) return `/${target}`;
  // "features" is the route folder, reachable under every locale.
  const isFeatures = segment === "features" || (isValidLocale(from) && segment === featuresSegment[from]);
  if (isFeatures) return `/${target}/${featuresSegment[target]}`;
  if (segment === "blog") return `/${target}/blog`;
  return ["", target, segment, ...rest].join("/");
}
