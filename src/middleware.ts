import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  locales,
  defaultLocale,
  isValidLocale,
  getLocaleFromCountry,
  getLocaleFromAcceptLanguage,
  type Locale,
} from "@/lib/i18n/config";

const LOCALE_COOKIE = "NEXT_LOCALE";

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

  // Check if pathname already has a valid locale
  const pathnameLocale = locales.find(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameLocale) {
    // Valid locale in URL, set cookie and continue
    const response = NextResponse.next();
    response.cookies.set(LOCALE_COOKIE, pathnameLocale, {
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: "/",
    });
    // Add security headers
    addSecurityHeaders(response);
    return response;
  }

  // No locale in URL - determine the best locale
  let detectedLocale: Locale = defaultLocale;

  // 1. Check cookie first (user preference)
  const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value;
  if (cookieLocale && isValidLocale(cookieLocale)) {
    detectedLocale = cookieLocale;
  } else {
    // 2. Try geo-detection (Vercel/Cloudflare headers)
    const country = request.headers.get("x-vercel-ip-country") ||
      request.headers.get("cf-ipcountry");

    if (country) {
      detectedLocale = getLocaleFromCountry(country);
    } else {
      // 3. Fallback to Accept-Language header
      const acceptLanguage = request.headers.get("accept-language");
      if (acceptLanguage) {
        detectedLocale = getLocaleFromAcceptLanguage(acceptLanguage);
      }
    }
  }

  // Redirect to the detected locale
  const url = request.nextUrl.clone();
  url.pathname = `/${detectedLocale}${pathname}`;

  const response = NextResponse.redirect(url);
  response.cookies.set(LOCALE_COOKIE, detectedLocale, {
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
