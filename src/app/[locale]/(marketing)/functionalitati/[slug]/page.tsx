import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { translations } from "@/lib/i18n/translations";
import { locales, isValidLocale } from "@/lib/i18n/config";
import { buildAlternates, SITE_URL } from "@/lib/seo/metadata";
import { JsonLd, webPageSchema, breadcrumbSchema } from "@/lib/seo/jsonld";
import { features, getFeature, featureTitle, featureDesc, featureColorMap } from "@/lib/features";
import { CTASection } from "@/components/sections/CTASection";

export async function generateStaticParams() {
  return locales.flatMap((locale) => features.map((f) => ({ locale, slug: f.slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: localeParam, slug } = await params;
  const locale = isValidLocale(localeParam) ? localeParam : "ro";
  const feature = getFeature(slug);
  if (!feature) return {};
  const t = translations[locale];
  const title = featureTitle(t, feature.id);
  const description = featureDesc(t, feature.id);
  return {
    title,
    description,
    alternates: buildAlternates(locale, (l) => `/${l}/functionalitati/${feature.slug}`),
    openGraph: {
      title: `${title} | Logistiq`,
      description,
      url: `${SITE_URL}/${locale}/functionalitati/${feature.slug}`,
      siteName: "Logistiq",
      type: "website",
    },
  };
}

export default async function FeaturePage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale: localeParam, slug } = await params;
  const locale = isValidLocale(localeParam) ? localeParam : "ro";
  const feature = getFeature(slug);
  if (!feature) notFound();

  const t = translations[locale];
  const title = featureTitle(t, feature.id);
  const description = featureDesc(t, feature.id);
  const colors = featureColorMap[feature.color];
  const Icon = feature.icon;
  const related = features.filter((f) => f.id !== feature.id).slice(0, 3);

  return (
    <>
      <JsonLd data={webPageSchema({ locale, path: `/functionalitati/${feature.slug}`, title, description })} />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Logistiq", url: `${SITE_URL}/${locale}` },
          { name: t.nav.features, url: `${SITE_URL}/${locale}/functionalitati` },
          { name: title, url: `${SITE_URL}/${locale}/functionalitati/${feature.slug}` },
        ])}
      />

      <section className="hero-gradient pt-28 md:pt-36 pb-16 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <nav aria-label="breadcrumb" className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            <ol className="flex items-center gap-2 flex-wrap">
              <li>
                <Link href={`/${locale}`} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Logistiq
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li>
                <Link
                  href={`/${locale}/functionalitati`}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  {t.nav.features}
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li aria-current="page" className="text-slate-700 dark:text-slate-200">
                {title}
              </li>
            </ol>
          </nav>

          <div className={`w-16 h-16 rounded-2xl ${colors.bg} ${colors.darkBg} flex items-center justify-center mb-6`}>
            <div className={`${colors.text} ${colors.darkText}`}>
              <Icon />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-6">{title}</h1>
          <p className="text-lg lg:text-xl text-slate-600 dark:text-slate-300 leading-relaxed">{description}</p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href={`/${locale}/contact`}
              className="btn-primary text-white px-6 py-3 rounded-xl font-medium inline-flex items-center gap-2"
            >
              {t.nav.requestDemo}
            </Link>
            <Link
              href={`/${locale}#pricing`}
              className="btn-secondary px-6 py-3 rounded-xl font-medium inline-flex items-center gap-2"
            >
              {t.nav.pricing}
            </Link>
          </div>
        </div>
      </section>

      {/* Related features */}
      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">{t.features.title}</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {related.map((rf) => {
              const rc = featureColorMap[rf.color];
              const RIcon = rf.icon;
              return (
                <Link
                  key={rf.id}
                  href={`/${locale}/functionalitati/${rf.slug}`}
                  className="group bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 card-hover"
                >
                  <div
                    className={`w-12 h-12 rounded-xl ${rc.bg} ${rc.darkBg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                  >
                    <div className={`${rc.text} ${rc.darkText}`}>
                      <RIcon />
                    </div>
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white mb-2">{featureTitle(t, rf.id)}</h3>
                  <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed line-clamp-3">
                    {featureDesc(t, rf.id)}
                  </p>
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
