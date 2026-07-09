import type { Metadata } from "next";
import { translations } from "@/lib/i18n/translations";
import { locales, isValidLocale } from "@/lib/i18n/config";
import { buildAlternates, SITE_URL } from "@/lib/seo/metadata";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = isValidLocale(localeParam) ? localeParam : "en";
  const t = translations[locale];
  const baseUrl = SITE_URL;

  const title = t.privacy.title;
  const description =
    locale === "ro"
      ? "Politica de confidențialitate Logistiq - Cum colectăm, utilizăm și protejăm datele dvs. personale conform GDPR."
      : "Logistiq Privacy Policy - How we collect, use and protect your personal data in compliance with GDPR.";

  return {
    title,
    description,
    alternates: buildAlternates(locale, (l) => `/${l}/privacy`),
    openGraph: {
      title: `${title} | Logistiq`,
      description,
      url: `${baseUrl}/${locale}/privacy`,
      siteName: "Logistiq",
      type: "website",
    },
  };
}

export default function PrivacyLayout({ children }: Props) {
  return children;
}
