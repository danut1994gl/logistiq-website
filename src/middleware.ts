import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  locales,
  defaultLocale,
  isValidLocale,
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

  // No locale in URL — English-first: default to `en` for every visitor. Only an
  // EXPLICIT prior choice stored in the cookie (via the language switcher or by
  // visiting a /xx URL) overrides it. Geo/Accept-Language auto-routing is intentionally
  // disabled so the default landing language is always English.
  let detectedLocale: Locale = defaultLocale;

  const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value;
  if (cookieLocale && isValidLocale(cookieLocale)) {
    detectedLocale = cookieLocale;
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
