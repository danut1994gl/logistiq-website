import type { Locale } from "@/lib/i18n/config";

// The Integration API's public pages (Logistiq apps/dashboard: the public docs served at
// api.logistiq.cloud/docs since 2026-11-27). The documentation is written in English
// (/docs) and Romanian (/docs/ro); every other language of this site links the English one,
// and the page says so (f16Page.devNote). Checked live on 2026-11-28: each path below
// answers 200 in both languages.

export const API_ORIGIN = "https://api.logistiq.cloud";
export const OPENAPI_URL = `${API_ORIGIN}/openapi.json`;
/** Where a warehouse account creates its API keys (sign-in required). */
export const API_KEYS_URL = "https://logistiq.cloud/dashboard/api";

/** A page of the API documentation, in Romanian for `ro`, otherwise in English. */
export function apiDocsUrl(locale: Locale, page = ""): string {
  const base = `${API_ORIGIN}/docs${locale === "ro" ? "/ro" : ""}`;
  return page ? `${base}/${page}` : base;
}
