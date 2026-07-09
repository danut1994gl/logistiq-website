import type { Metadata } from "next";
import { translations } from "@/lib/i18n/translations";
import { locales, isValidLocale } from "@/lib/i18n/config";
import { buildAlternates, SITE_URL } from "@/lib/seo/metadata";
import { JsonLd, webPageSchema, breadcrumbSchema } from "@/lib/seo/jsonld";
import { ContactSection } from "@/components/sections/ContactSection";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";

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

      <div className="pt-[calc(var(--nav-h)+1.5rem)] md:pt-[calc(var(--nav-h)+2rem)]">
        <Breadcrumbs
          items={[{ label: "Logistiq", href: `/${locale}` }, { label: t.nav.contact }]}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        />
      </div>
      <ContactSection t={t} compact />
    </>
  );
}
