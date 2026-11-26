// What kind of cookie each listed cookie is, for the cookie policy's "Type" column. The
// label comes from cookies.cookiesWeUse.kinds; the kind itself is a fact about the code, not
// copy, so it lives here, once for all eight languages (2026-11-26).
// - "choice": it stores a choice the visitor made (a language, a warehouse, a filter, a
//   view, the theme);
// - "necessary": everything else listed (signing in, security, the driver's own check-in).
export const CHOICE_COOKIES = [
  "LOGISTIQ_LANG",
  "LOGISTIQ_LANG_BE",
  "NEXT_LOCALE",
  "warehouse_ctx",
  "dispatcher_dept_filter",
  "users_view",
  "LANGUAGE_SELECTED",
  "DARK_MODE",
] as const;

export type CookieKind = "necessary" | "choice";

export function cookieKind(name: string): CookieKind {
  return (CHOICE_COOKIES as readonly string[]).includes(name) ? "choice" : "necessary";
}
