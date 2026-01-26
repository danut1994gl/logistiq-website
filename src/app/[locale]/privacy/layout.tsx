import type { Metadata } from "next";
import { translations } from "@/lib/i18n/translations";
import { locales, isValidLocale, type Locale } from "@/lib/i18n/config";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = isValidLocale(localeParam) ? localeParam : "ro";
  const t = translations[locale];
  const baseUrl = "https://logistiq.ro";

  const title = t.privacy.title;
  const description =
    locale === "ro"
      ? "Politica de confidențialitate Logistiq - Cum colectăm, utilizăm și protejăm datele dvs. personale conform GDPR."
      : "Logistiq Privacy Policy - How we collect, use and protect your personal data in compliance with GDPR.";

  return {
    title,
    description,
    alternates: {
      canonical: `${baseUrl}/${locale}/privacy`,
      languages: Object.fromEntries(
        locales.map((loc) => [loc, `${baseUrl}/${loc}/privacy`])
      ),
    },
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
