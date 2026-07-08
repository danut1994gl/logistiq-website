import type { Metadata } from "next";
import Link from "next/link";
import { translations } from "@/lib/i18n/translations";
import { locales, isValidLocale } from "@/lib/i18n/config";
import { buildAlternates, SITE_URL } from "@/lib/seo/metadata";
import { JsonLd, webPageSchema, breadcrumbSchema } from "@/lib/seo/jsonld";
import { ContactSection } from "@/components/sections/ContactSection";

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = isValidLocale(localeParam) ? localeParam : "ro";
  const t = translations[locale];
  return {
    title: t.contact.title,
    description: t.contact.subtitle,
    alternates: buildAlternates(locale, (l) => `/${l}/contact`),
    openGraph: {
      title: `${t.contact.title} | Logistiq`,
      description: t.contact.subtitle,
      url: `${SITE_URL}/${locale}/contact`,
      siteName: "Logistiq",
      type: "website",
    },
  };
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  const locale = isValidLocale(localeParam) ? localeParam : "ro";
  const t = translations[locale];

  return (
    <>
      <JsonLd
        data={webPageSchema({ locale, path: "/contact", title: t.contact.title, description: t.contact.subtitle })}
      />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Logistiq", url: `${SITE_URL}/${locale}` },
          { name: t.nav.contact, url: `${SITE_URL}/${locale}/contact` },
        ])}
      />

      <nav
        aria-label="breadcrumb"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 md:pt-28 text-sm text-slate-500 dark:text-slate-400"
      >
        <ol className="flex items-center gap-2">
          <li>
            <Link href={`/${locale}`} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Logistiq
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li aria-current="page" className="text-slate-700 dark:text-slate-200">
            {t.nav.contact}
          </li>
        </ol>
      </nav>

      <ContactSection t={t} />
    </>
  );
}
