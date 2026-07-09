import { locales, localeToHreflang, defaultLocale, type Locale } from "@/lib/i18n/config";

// Env-driven so migrating to a global TLD later is a single env-var change
// (set NEXT_PUBLIC_SITE_URL in Vercel, e.g. https://logistiq.com). Falls back to
// the current domain. No trailing slash.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://logistiq.ro").replace(/\/$/, "");

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
