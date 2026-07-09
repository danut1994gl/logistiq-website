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

  const title = t.terms.title;
  const description =
    locale === "ro"
      ? "Termenii și condițiile de utilizare a platformei Logistiq - management depozite și check-in șoferi."
      : "Logistiq Terms and Conditions - warehouse management platform and driver check-in service.";

  return {
    title,
    description,
    alternates: buildAlternates(locale, (l) => `/${l}/terms`),
    openGraph: {
      title: `${title} | Logistiq`,
      description,
      url: `${baseUrl}/${locale}/terms`,
      siteName: "Logistiq",
      type: "website",
    },
  };
}

export default function TermsLayout({ children }: Props) {
  return children;
}
