import { isValidLocale } from "@/lib/i18n/config";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";

// Layout for marketing pages (home + future feature/resources/blog/contact pages).
// Mounts the shared chrome ONCE so nav/footer live in a single place and every
// marketing page gets them. Legal pages stay outside this group for now. No cookie
// banner: logistiq.ro sets no cookie on a visit (owner, 2026-11-26).
export default async function MarketingLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const locale = isValidLocale(localeParam) ? localeParam : "en";

  return (
    <>
      <SiteHeader locale={locale} />
      <main id="main" className="min-h-screen">
        {children}
      </main>
      <SiteFooter locale={locale} />
    </>
  );
}
