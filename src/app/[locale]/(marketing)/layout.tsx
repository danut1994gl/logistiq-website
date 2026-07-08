import { translations } from "@/lib/i18n/translations";
import { isValidLocale } from "@/lib/i18n/config";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import CookieConsent from "@/components/CookieConsent";

// Layout for marketing pages (home + future feature/resources/blog/contact pages).
// Mounts the shared chrome ONCE so nav/footer live in a single place and every
// marketing page gets them. Legal pages stay outside this group for now.
export default async function MarketingLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const locale = isValidLocale(localeParam) ? localeParam : "ro";
  const t = translations[locale];

  return (
    <>
      <SiteHeader locale={locale} />
      <main id="main" className="min-h-screen">
        {children}
      </main>
      <SiteFooter locale={locale} />
      <CookieConsent locale={locale} t={t.cookieConsent} />
    </>
  );
}
