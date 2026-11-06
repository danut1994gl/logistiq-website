import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isValidLocale, type Locale } from "@/lib/i18n/config";
import { siteForHost, relocatePath } from "@/lib/i18n/sites";

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
    pathname.includes(".") // files with extensions
  ) {
    return NextResponse.next();
  }

  // The languages this domain serves: logistiq.be offers nl/fr/en (Dutch first),
  // every other host all locales (English first). See lib/i18n/sites.ts.
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
    // Valid locale in URL, set cookie and continue
    const response = NextResponse.next();
    response.cookies.set(site.cookie, pathnameLocale, {
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: "/",
    });
    // Add security headers
    addSecurityHeaders(response);
    return response;
  }

  // No locale in URL — the domain's default language (English on logistiq.ro,
  // Dutch on logistiq.be) for every visitor. Only an EXPLICIT prior choice stored
  // in the cookie (via the language switcher or by visiting a /xx URL) overrides
  // it. Geo/Accept-Language auto-routing is intentionally disabled.
  let detectedLocale: Locale = site.defaultLocale;

  const cookieLocale = request.cookies.get(site.cookie)?.value;
  if (cookieLocale && served(cookieLocale)) {
    detectedLocale = cookieLocale;
  }

  // Redirect to the detected locale
  const url = request.nextUrl.clone();
  url.pathname = `/${detectedLocale}${pathname === "/" ? "" : pathname}`;

  const response = NextResponse.redirect(url);
  response.cookies.set(site.cookie, detectedLocale, {
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: "/",
  });
  // Add security headers
  addSecurityHeaders(response);

  return response;
}

export const config = {
  matcher: [
    // Match all pathnames except for:
    // - API routes
    // - Static files
    // - Image optimization files
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
