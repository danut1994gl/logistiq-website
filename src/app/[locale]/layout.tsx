import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import { translations } from "@/lib/i18n/translations";
import { locales, localeToHreflang, isValidLocale, type Locale } from "@/lib/i18n/config";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
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
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#2563eb" },
    { media: "(prefers-color-scheme: dark)", color: "#1e40af" },
  ],
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = isValidLocale(localeParam) ? localeParam : "ro";
  const t = translations[locale];
  const baseUrl = "https://logistiq.ro";

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
    alternates: {
      canonical: `${baseUrl}/${locale}`,
      languages: Object.fromEntries(
        locales.map((loc) => [localeToHreflang[loc], `${baseUrl}/${loc}`])
      ),
    },
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
      creator: "@logistiq",
    },
    verification: {
      google: "your-google-verification-code",
    },
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
  const locale = isValidLocale(localeParam) ? localeParam : "ro";
  const t = translations[locale];
  const baseUrl = "https://logistiq.ro";

  // JSON-LD Structured Data
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${baseUrl}/#organization`,
        name: "Logistiq",
        url: baseUrl,
        logo: {
          "@type": "ImageObject",
          url: `${baseUrl}/logo.png`,
          width: 512,
          height: 512,
        },
        sameAs: [
          "https://www.linkedin.com/company/logistiq",
          "https://twitter.com/logistiq",
        ],
        contactPoint: {
          "@type": "ContactPoint",
          telephone: "+40-xxx-xxx-xxx",
          contactType: "sales",
          availableLanguage: ["Romanian", "English", "German", "Polish", "Hungarian", "Bulgarian"],
        },
      },
      {
        "@type": "WebSite",
        "@id": `${baseUrl}/#website`,
        url: baseUrl,
        name: "Logistiq",
        publisher: {
          "@id": `${baseUrl}/#organization`,
        },
        potentialAction: {
          "@type": "SearchAction",
          target: `${baseUrl}/search?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "SoftwareApplication",
        "@id": `${baseUrl}/#software`,
        name: "Logistiq",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web, iOS, Android",
        offers: {
          "@type": "AggregateOffer",
          priceCurrency: "EUR",
          availability: "https://schema.org/InStock",
          offerCount: 2,
        },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "4.8",
          ratingCount: "150",
          bestRating: "5",
          worstRating: "1",
        },
        description: t.seo.description,
        featureList: [
          "Digital QR Check-in",
          "Real-time Dock Management",
          "Driver Communication",
          "Analytics & Reports",
          "Multi-language Support",
          "API Integrations",
          "Early Check-in & Scheduling",
          "Automatic Location Detection",
        ],
      },
      {
        "@type": "WebPage",
        "@id": `${baseUrl}/${locale}/#webpage`,
        url: `${baseUrl}/${locale}`,
        name: t.seo.title,
        description: t.seo.description,
        isPartOf: {
          "@id": `${baseUrl}/#website`,
        },
        about: {
          "@id": `${baseUrl}/#software`,
        },
        inLanguage: localeToHreflang[locale],
      },
    ],
  };

  return (
    <html lang={locale} className="scroll-smooth dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
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
