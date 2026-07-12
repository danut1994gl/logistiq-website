import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { translations } from "@/lib/i18n/translations";
import { locales, isValidLocale } from "@/lib/i18n/config";
import { buildAlternates, SITE_URL } from "@/lib/seo/metadata";
import { JsonLd, webPageSchema, breadcrumbSchema } from "@/lib/seo/jsonld";
import {
  features,
  getFeatureBySlug,
  featureSlug,
  featurePath,
  featureRel,
  featuresIndexPath,
  featureTitle,
  featureDesc,
  featureColorMap,
} from "@/lib/features";
import { CTASection } from "@/components/sections/CTASection";
import { PageHero } from "@/components/site/PageHero";
import { featureShowcases } from "@/components/features/showcases";

export async function generateStaticParams() {
  return locales.flatMap((locale) => features.map((f) => ({ locale, slug: featureSlug(f.id, locale) })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: localeParam, slug } = await params;
  const locale = isValidLocale(localeParam) ? localeParam : "en";
  const feature = getFeatureBySlug(locale, slug);
  if (!feature) return {};
  const t = translations[locale];
  const title = featureTitle(t, feature.id);
  const description = featureDesc(t, feature.id);
  return {
    title,
    description,
    alternates: buildAlternates(locale, (l) => featurePath(l, feature.id)),
    openGraph: {
      title: `${title} | Logistiq`,
      description,
      url: `${SITE_URL}${featurePath(locale, feature.id)}`,
      siteName: "Logistiq",
      type: "website",
    },
  };
}

export default async function FeaturePage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale: localeParam, slug } = await params;
  const locale = isValidLocale(localeParam) ? localeParam : "en";
  const feature = getFeatureBySlug(locale, slug);
  if (!feature) notFound();

  const t = translations[locale];
  const title = featureTitle(t, feature.id);
  const description = featureDesc(t, feature.id);
  const colors = featureColorMap[feature.color];
  const Icon = feature.icon;
  const related = features.filter((f) => f.id !== feature.id).slice(0, 3);
  const Showcase = featureShowcases[feature.id];

  return (
    <>
      <JsonLd
        data={webPageSchema({
          locale,
          path: featureRel(locale, feature.id),
          title,
          description,
        })}
      />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Logistiq", url: `${SITE_URL}/${locale}` },
          { name: t.nav.features, url: `${SITE_URL}${featuresIndexPath(locale)}` },
          { name: title, url: `${SITE_URL}${featurePath(locale, feature.id)}` },
        ])}
      />

      <PageHero
        breadcrumb={[
          { label: "Logistiq", href: `/${locale}` },
          { label: t.nav.features, href: featuresIndexPath(locale) },
          { label: title },
        ]}
        eyebrow={t.nav.features}
        title={title}
        description={description}
        actions={
          <>
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
          </>
        }
        visual={
          <div
            className={`w-44 h-44 sm:w-52 sm:h-52 lg:w-64 lg:h-64 rounded-[2rem] ${colors.bg} ${colors.darkBg} flex items-center justify-center shadow-xl [&_svg]:w-20 [&_svg]:h-20 lg:[&_svg]:w-24 lg:[&_svg]:h-24`}
          >
            <span className={`${colors.text} ${colors.darkText}`}>
              <Icon />
            </span>
          </div>
        }
      />

      {Showcase ? <Showcase t={t} locale={locale} /> : null}

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
                  href={featurePath(locale, rf.id)}
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
