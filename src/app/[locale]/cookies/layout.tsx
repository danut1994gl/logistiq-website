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

  const title = t.cookies.title;
  const description =
    locale === "ro"
      ? "Politica de utilizare cookie-uri Logistiq - Cum utilizăm cookie-urile pentru a vă oferi o experiență optimă."
      : "Logistiq Cookie Policy - How we use cookies to provide you with an optimal experience.";

  return {
    title,
    description,
    alternates: {
      canonical: `${baseUrl}/${locale}/cookies`,
      languages: Object.fromEntries(
        locales.map((loc) => [loc, `${baseUrl}/${loc}/cookies`])
      ),
    },
    openGraph: {
      title: `${title} | Logistiq`,
      description,
      url: `${baseUrl}/${locale}/cookies`,
      siteName: "Logistiq",
      type: "website",
    },
  };
}

export default function CookiesLayout({ children }: Props) {
  return children;
}
