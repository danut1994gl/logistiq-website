"use client";

import { useEffect } from "react";

// What older versions of logistiq.ro left in a visitor's browser, removed once it is seen
// (2026-11-26). The cookie policy says logistiq.ro keeps nothing in the browser unless the
// visitor picks a language, and that is true only once these are gone:
// - the cookie banner's record of the visitor's answer (localStorage), which nothing reads
//   since the banner went and which never expires by itself;
// - NEXT_LOCALE and NEXT_LOCALE_BE, the language cookies page views wrote until then for the
//   language of the last page opened. The chosen language is LOGISTIQ_LANG(_BE) now
//   (lib/i18n/sites.ts); the old ones are not HttpOnly, so the page can delete them;
// - on logistiq.ro, the dashboard's old sign-in marker, logistiq_authenticated, which the
//   dashboard wrote for Domain=.logistiq.ro while it ran on cloud.logistiq.ro (until
//   2026-07-16) and which still reaches logistiq.ro until it expires. Nothing reads it any
//   more (SiteHeader); a Domain cookie is deleted only with the same Domain, and only a page
//   under logistiq.ro may write one (final review S3, 2026-11-27).
// Runs after hydration (golden rule 6), on every page of the locale layout, since browser
// data belongs to the whole origin. Nothing is written unless an old item is there.
export const LEGACY_STORAGE_KEY = "logistiq_cookie_consent";
export const LEGACY_COOKIES = ["NEXT_LOCALE", "NEXT_LOCALE_BE"] as const;
export const LEGACY_DOMAIN_COOKIE = "logistiq_authenticated";

const onLogistiqRo = (hostname: string) => hostname === "logistiq.ro" || hostname.endsWith(".logistiq.ro");

type CookieJar = { cookie: string };
type KeyValueStore = Pick<Storage, "getItem" | "removeItem">;

export function clearLegacyBrowserData(jar: CookieJar, storage: KeyValueStore | null, hostname = ""): void {
  try {
    const present = new Set(jar.cookie.split(";").map((c) => c.trim().split("=")[0]));
    for (const name of LEGACY_COOKIES) {
      if (present.has(name)) jar.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax`;
    }
    if (onLogistiqRo(hostname) && present.has(LEGACY_DOMAIN_COOKIE)) {
      jar.cookie = `${LEGACY_DOMAIN_COOKIE}=; Domain=.logistiq.ro; Path=/; Max-Age=0; SameSite=Lax`;
    }
  } catch {
    // Cookies blocked: there is nothing to delete.
  }
  try {
    if (storage?.getItem(LEGACY_STORAGE_KEY) !== null) storage?.removeItem(LEGACY_STORAGE_KEY);
  } catch {
    // Storage blocked (a private window, site data off): nothing was kept either.
  }
}

export default function LegacyBrowserData() {
  useEffect(() => {
    let storage: KeyValueStore | null = null;
    try {
      storage = window.localStorage;
    } catch {
      storage = null;
    }
    clearLegacyBrowserData(document, storage, window.location.hostname);
  }, []);
  return null;
}
