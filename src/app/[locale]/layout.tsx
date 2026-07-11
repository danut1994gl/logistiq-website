import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import { translations } from "@/lib/i18n/translations";
import { locales, localeToHreflang, isValidLocale, type Locale } from "@/lib/i18n/config";
import { buildAlternates, SITE_URL } from "@/lib/seo/metadata";
import { JsonLd, siteGraph } from "@/lib/seo/jsonld";

// Canonical Logistiq feature list — mirrored in the SoftwareApplication schema.
const SOFTWARE_FEATURES = [
  "Digital QR Check-in",
  "Real-time Dock Management",
  "Driver Communication",
  "Analytics & Reports",
  "Multi-language Support",
  "API Integrations",
  "Early Check-in & Scheduling",
  "Automatic Location Detection",
];

const inter = Inter({
  variable: "--font-inter",
  // "latin-ext" covers Romanian (ș ț), Polish (ł ą ę ż ź ń), Hungarian (ő ű),
  // Czech/Slovak glyphs — the default locale is RO and we target PL/HU too.
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

// Viewport configuration for mobile optimization
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#2563eb",
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = isValidLocale(localeParam) ? localeParam : "en";
  const t = translations[locale];
  const baseUrl = SITE_URL;

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: t.seo.title,
      template: "%s | Logistiq",
    },
    description: t.seo.description,
    keywords: t.seo.keywords,
    authors: [{ name: "Logistiq", url: baseUrl }],
    creator: "Logistiq",
    publisher: "Logistiq",
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    alternates: buildAlternates(locale, (l) => `/${l}`),
    openGraph: {
      type: "website",
      locale: localeToHreflang[locale],
      alternateLocale: locales
        .filter((l) => l !== locale)
        .map((l) => localeToHreflang[l]),
      url: `${baseUrl}/${locale}`,
      siteName: "Logistiq",
      title: t.seo.title,
      description: t.seo.description,
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: "Logistiq - Warehouse Management Platform",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: t.seo.title,
      description: t.seo.description,
      images: ["/og-image.png"],
    },
    // Set NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION to emit the Search Console meta tag.
    verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
      ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
      : undefined,
    category: "technology",
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: "Logistiq",
    },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale: localeParam } = await params;
  const locale = isValidLocale(localeParam) ? localeParam : "en";
  const t = translations[locale];
  return (
    <html lang={locale} className="scroll-smooth dark">
      <head>
        {/* Site-wide entities only. Page-specific entities (WebPage/FAQPage/Article)
            are emitted by the owning page so they don't leak onto every route. */}
        <JsonLd data={siteGraph(t.seo.description, SOFTWARE_FEATURES)} />
        <link
          rel="alternate"
          type="application/rss+xml"
          title="Logistiq Blog"
          href={`${SITE_URL}/rss.xml`}
        />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body
        className={`${inter.variable} antialiased bg-white dark:bg-slate-950 text-slate-900 dark:text-white`}
      >
        {children}
      </body>
    </html>
  );
}
