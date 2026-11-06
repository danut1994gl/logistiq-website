import { locales, defaultLocale, isValidLocale, type Locale } from "@/lib/i18n/config";
import { featuresSegment } from "@/lib/i18n/segments";

// The languages a domain offers. Every host (logistiq.ro, previews, localhost)
// serves all locales with English first; a country domain serves only its
// market's languages. middleware.ts enforces the set (redirects + default) and
// SiteHeader's language switcher lists only it. Pages are prerendered once for
// every host, so nothing rendered on the server may depend on this.
export type Site = {
  locales: readonly Locale[];
  defaultLocale: Locale;
  // Cookie that remembers the visitor's language on this domain.
  cookie: string;
};

const DEFAULT_SITE: Site = { locales, defaultLocale, cookie: "NEXT_LOCALE" };

const COUNTRY_SITES: Record<string, Site> = {
  // Belgium: Dutch first, then French and English (2026-11-06). Its own cookie,
  // because until then logistiq.be set NEXT_LOCALE=en for every visitor, and
  // that would keep returning visitors on English instead of the new default.
  "logistiq.be": { locales: ["nl", "fr", "en"], defaultLocale: "nl", cookie: "NEXT_LOCALE_BE" },
};

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
