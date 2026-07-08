import type { Metadata } from "next";
import Link from "next/link";
import { translations } from "@/lib/i18n/translations";
import { locales, isValidLocale } from "@/lib/i18n/config";
import { buildAlternates, SITE_URL } from "@/lib/seo/metadata";
import { JsonLd, webPageSchema, faqPageSchema, breadcrumbSchema } from "@/lib/seo/jsonld";
import { faqEntries } from "@/lib/faq";
import { FAQSection } from "@/components/sections/FAQSection";

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
    title: t.faq.title,
    description: t.faq.subtitle,
    alternates: buildAlternates(locale, (l) => `/${l}/resurse`),
    openGraph: {
      title: `${t.faq.title} | Logistiq`,
      description: t.faq.subtitle,
      url: `${SITE_URL}/${locale}/resurse`,
      siteName: "Logistiq",
      type: "website",
    },
  };
}

export default async function ResourcesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  const locale = isValidLocale(localeParam) ? localeParam : "ro";
  const t = translations[locale];
  const entries = faqEntries(t);
  const faqSchema = faqPageSchema({ locale, path: "/resurse", entries });

  return (
    <>
      <JsonLd
        data={webPageSchema({ locale, path: "/resurse", title: t.faq.title, description: t.faq.subtitle })}
      />
      {faqSchema && <JsonLd data={faqSchema} />}
      <JsonLd
        data={breadcrumbSchema([
          { name: "Logistiq", url: `${SITE_URL}/${locale}` },
          { name: t.nav.resources, url: `${SITE_URL}/${locale}/resurse` },
        ])}
      />

      {/* Visible breadcrumb — pt clears the fixed header */}
      <nav
        aria-label="breadcrumb"
        className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 md:pt-28 text-sm text-slate-500 dark:text-slate-400"
      >
        <ol className="flex items-center gap-2">
          <li>
            <Link href={`/${locale}`} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Logistiq
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li aria-current="page" className="text-slate-700 dark:text-slate-200">
            {t.nav.resources}
          </li>
        </ol>
      </nav>

      <FAQSection t={t} />
    </>
  );
}
