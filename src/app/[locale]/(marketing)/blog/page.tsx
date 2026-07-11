import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { translations } from "@/lib/i18n/translations";
import { locales, isValidLocale } from "@/lib/i18n/config";
import { buildAlternates, SITE_URL } from "@/lib/seo/metadata";
import { JsonLd, webPageSchema, breadcrumbSchema } from "@/lib/seo/jsonld";
import { getPublishedPosts, blogIndexRel, blogIndexPath, postPath } from "@/lib/blog";
import { CTASection } from "@/components/sections/CTASection";
import { PageHero } from "@/components/site/PageHero";

export const revalidate = 3600;

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = isValidLocale(localeParam) ? localeParam : "en";
  const t = translations[locale];
  return {
    title: t.blog.title,
    description: t.blog.subtitle,
    alternates: buildAlternates(locale, (l) => blogIndexPath(l)),
    openGraph: {
      title: `${t.blog.title} | Logistiq`,
      description: t.blog.subtitle,
      url: `${SITE_URL}${blogIndexPath(locale)}`,
      siteName: "Logistiq",
      type: "website",
    },
  };
}

export default async function BlogIndexPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  const locale = isValidLocale(localeParam) ? localeParam : "en";
  const t = translations[locale];
  const posts = await getPublishedPosts(locale);

  return (
    <>
      <JsonLd
        data={webPageSchema({ locale, path: blogIndexRel(locale), title: t.blog.title, description: t.blog.subtitle })}
      />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Logistiq", url: `${SITE_URL}/${locale}` },
          { name: t.blog.title, url: `${SITE_URL}${blogIndexPath(locale)}` },
        ])}
      />

      <PageHero
        breadcrumb={[{ label: "Logistiq", href: `/${locale}` }, { label: t.blog.title }]}
        title={t.blog.title}
        description={t.blog.subtitle}
      />

      <section className="pb-16 lg:pb-24 -mt-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {posts.length === 0 ? (
            <div className="text-center py-16">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{t.blog.emptyTitle}</h2>
              <p className="text-slate-600 dark:text-slate-300">{t.blog.emptyBody}</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={postPath(locale, post.slug)}
                  className="group bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 card-hover flex flex-col overflow-hidden"
                >
                  {post.coverImageUrl && (
                    <div className="relative aspect-[16/9] bg-slate-100 dark:bg-slate-900">
                      <Image
                        src={post.coverImageUrl}
                        alt={post.coverImageAlt ?? post.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                  )}
                  <div className="p-6 flex flex-col flex-1">
                    {post.category && (
                      <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-2">
                        {post.category.name}
                      </span>
                    )}
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">{post.title}</h2>
                    {post.excerpt && (
                      <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed flex-1 line-clamp-3">
                        {post.excerpt}
                      </p>
                    )}
                    <span className="mt-4 text-sm font-medium text-blue-600 dark:text-blue-400 group-hover:gap-2 inline-flex items-center gap-1 transition-all">
                      {t.blog.readMore} →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <CTASection t={t} />
    </>
  );
}
