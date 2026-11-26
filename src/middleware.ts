import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isValidLocale, type Locale } from "@/lib/i18n/config";
import { siteForHost, relocatePath } from "@/lib/i18n/sites";

// Vercel BotID's challenge and proxy paths (see botid/next/config). Vercel routes
// them itself; under `next start` the withBotId() rewrites in next.config.ts do.
// They must never be redirected under a language. Mirrored in `config.matcher`.
const BOTID_PREFIX = "/149e9513-01fa-4fb0-aad4-566afd725d1b/";

// Security headers for best practices
function addSecurityHeaders(response: NextResponse) {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(self)"
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/static") ||
    pathname.startsWith(BOTID_PREFIX) ||
    pathname.includes(".") // files with extensions
  ) {
    return NextResponse.next();
  }

  // The languages this domain serves: logistiq.be offers nl/fr/en (Dutch first),
  // every other host all locales (Romanian first). See lib/i18n/sites.ts.
  const site = siteForHost(request.headers.get("host") ?? request.nextUrl.host);
  const served = (locale: string): locale is Locale =>
    isValidLocale(locale) && site.locales.includes(locale);

  // Check if pathname already has a valid locale
  const pathnameLocale = pathname.split("/")[1];

  if (isValidLocale(pathnameLocale) && !served(pathnameLocale)) {
    // A language this domain doesn't serve: the same page in its default language.
    const url = request.nextUrl.clone();
    url.pathname = relocatePath(site.defaultLocale, pathname);
    const response = NextResponse.redirect(url);
    addSecurityHeaders(response);
    return response;
  }

  if (served(pathnameLocale)) {
    // Opening a page is not choosing a language: nothing is saved here. No page view
    // sets a cookie (owner, 2026-11-26): the language menu's click is the only writer
    // (SiteHeader, localeCookie). Until then every page in a language wrote it.
    const response = NextResponse.next();
    addSecurityHeaders(response);
    return response;
  }

  // No locale in the URL: the language the visitor chose in the language menu, else
  // the domain's first-visit language (Romanian on logistiq.ro and every host but
  // logistiq.be, Dutch on logistiq.be). Geo/Accept-Language auto-routing is
  // intentionally disabled. The cookie is read, never written or renewed.
  const saved = request.cookies.get(site.cookie)?.value;
  const locale: Locale = saved && served(saved) ? saved : site.defaultLocale;

  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;

  const response = NextResponse.redirect(url);
  addSecurityHeaders(response);

  return response;
}

export const config = {
  matcher: [
    {
      // Match all pathnames except for:
      // - API routes
      // - Static files
      // - Image optimization files
      // - Vercel BotID's paths (BOTID_PREFIX above)
      source: "/((?!api|_next/static|_next/image|favicon.ico|149e9513-01fa-4fb0-aad4-566afd725d1b/|.*\\..*).*)",
      // ...and never for a prefetch (router or browser): a prefetch is not a visit.
      // Kept since the middleware stopped writing cookies (2026-11-26): it changes
      // nothing a prefetch can see. The real visit runs the middleware as usual.
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
        { type: "header", key: "sec-purpose", value: "prefetch.*" },
      ],
    },
  ],
};
