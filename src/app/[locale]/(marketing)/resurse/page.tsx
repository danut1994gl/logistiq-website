import type { Metadata } from "next";
import { translations } from "@/lib/i18n/translations";
import { locales, isValidLocale } from "@/lib/i18n/config";
import { buildAlternates, SITE_URL } from "@/lib/seo/metadata";
import { JsonLd, webPageSchema, faqPageSchema, breadcrumbSchema } from "@/lib/seo/jsonld";
import { faqEntries } from "@/lib/faq";
import { FAQSection } from "@/components/sections/FAQSection";
import { PageHero } from "@/components/site/PageHero";

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

      <PageHero
        breadcrumb={[{ label: "Logistiq", href: `/${locale}` }, { label: t.nav.resources }]}
        title={t.faq.title}
        description={t.faq.subtitle}
      />
      <FAQSection t={t} showHeader={false} compact />
    </>
  );
}
