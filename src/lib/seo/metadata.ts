import { locales, localeToHreflang, defaultLocale, type Locale } from "@/lib/i18n/config";

export const SITE_URL = "https://logistiq.ro";

// Build canonical + hreflang alternates (including x-default) for a route.
// `pathFor(locale)` returns the path after the origin, e.g. (l) => `/${l}` for the
// home page or (l) => `/${l}/privacy`. A function (not a fixed suffix) so routes
// with localized slugs can still map hreflang correctly.
export function buildAlternates(
  locale: Locale,
  pathFor: (l: Locale) => string
): { canonical: string; languages: Record<string, string> } {
  const languages: Record<string, string> = {};
  for (const loc of locales) {
    languages[localeToHreflang[loc]] = `${SITE_URL}${pathFor(loc)}`;
  }
  // x-default points at the default locale — required, and missing today.
  languages["x-default"] = `${SITE_URL}${pathFor(defaultLocale)}`;

  return {
    canonical: `${SITE_URL}${pathFor(locale)}`,
    languages,
  };
}
