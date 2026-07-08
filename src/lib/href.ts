import { type Locale } from "@/lib/i18n/config";

// Locale-aware href helpers — the single place that knows how to build URLs.

// A normal route, e.g. routeHref("de", "/contact") -> "/de/contact".
export const routeHref = (locale: Locale, path: string = "/"): string =>
  path === "/" ? `/${locale}` : `/${locale}${path}`;

// An in-page anchor that works from ANY route: /{locale}#id.
// On the home route this scrolls; on other routes it navigates home then scrolls.
export const anchorHref = (locale: Locale, id: string): string => `/${locale}#${id}`;

// Swap the leading locale segment of an existing path, preserving the rest.
// swapLocale("de", "/ro/privacy") -> "/de/privacy" ; swapLocale("de", "/ro") -> "/de".
export const swapLocale = (locale: Locale, pathname: string): string => {
  const rest = pathname.replace(/^\/[^/]+/, "");
  return `/${locale}${rest}`;
};
