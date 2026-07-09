import type { Metadata } from "next";
import Link from "next/link";
import { translations } from "@/lib/i18n/translations";
import { locales, isValidLocale } from "@/lib/i18n/config";
import { buildAlternates, SITE_URL } from "@/lib/seo/metadata";
import { JsonLd, webPageSchema, breadcrumbSchema } from "@/lib/seo/jsonld";
import { features, featureTitle, featureDesc, featureColorMap } from "@/lib/features";
import { CTASection } from "@/components/sections/CTASection";

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
    title: t.features.title,
    description: t.features.subtitle,
    alternates: buildAlternates(locale, (l) => `/${l}/functionalitati`),
    openGraph: {
      title: `${t.features.title} | Logistiq`,
      description: t.features.subtitle,
      url: `${SITE_URL}/${locale}/functionalitati`,
      siteName: "Logistiq",
      type: "website",
    },
  };
}

export default async function FeaturesIndexPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  const locale = isValidLocale(localeParam) ? localeParam : "ro";
  const t = translations[locale];

  return (
    <>
      <JsonLd
        data={webPageSchema({ locale, path: "/functionalitati", title: t.features.title, description: t.features.subtitle })}
      />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Logistiq", url: `${SITE_URL}/${locale}` },
          { name: t.nav.features, url: `${SITE_URL}/${locale}/functionalitati` },
        ])}
      />

      <section className="hero-gradient pt-28 md:pt-36 pb-14 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <nav aria-label="breadcrumb" className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            <ol className="flex items-center gap-2">
              <li>
                <Link href={`/${locale}`} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Logistiq
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li aria-current="page" className="text-slate-700 dark:text-slate-200">
                {t.nav.features}
              </li>
            </ol>
          </nav>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-6 max-w-3xl">
            {t.features.title}
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl">{t.features.subtitle}</p>
        </div>
      </section>

      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => {
              const colors = featureColorMap[feature.color];
              const Icon = feature.icon;
              return (
                <Link
                  key={feature.id}
                  href={`/${locale}/functionalitati/${feature.slug}`}
                  className="group bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 card-hover flex flex-col"
                >
                  <div
                    className={`w-14 h-14 rounded-xl ${colors.bg} ${colors.darkBg} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}
                  >
                    <div className={`${colors.text} ${colors.darkText}`}>
                      <Icon />
                    </div>
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">
                    {featureTitle(t, feature.id)}
                  </h2>
                  <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed flex-1">
                    {featureDesc(t, feature.id)}
                  </p>
                  <span className="mt-4 text-sm font-medium text-blue-600 dark:text-blue-400 group-hover:gap-2 inline-flex items-center gap-1 transition-all">
                    {t.nav.features} →
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <CTASection t={t} />
    </>
  );
}
