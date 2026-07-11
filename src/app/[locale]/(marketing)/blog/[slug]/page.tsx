import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { translations } from "@/lib/i18n/translations";
import { isValidLocale, localeToHreflang, type Locale } from "@/lib/i18n/config";
import { buildAlternatesFor, SITE_URL } from "@/lib/seo/metadata";
import { JsonLd, webPageSchema, articleSchema, breadcrumbSchema } from "@/lib/seo/jsonld";
import {
  getAllPublishedPosts,
  getPostBySlug,
  postAvailableLocales,
  postPath,
  postRel,
  blogIndexPath,
  sanitizeArticleHtml,
} from "@/lib/blog";
import { CTASection } from "@/components/sections/CTASection";
import { PageHero } from "@/components/site/PageHero";

export const revalidate = 3600;

export async function generateStaticParams() {
  const posts = await getAllPublishedPosts();
  return posts.flatMap((p) => p.translations.map((tr) => ({ locale: tr.locale, slug: tr.slug })));
}

// Map each available locale to its own slug for hreflang + the switcher.
function pathForBuilder(post: { translations: { locale: Locale; slug: string }[] }) {
  const byLocale = new Map(post.translations.map((t) => [t.locale, t.slug] as const));
  return (l: Locale) => postPath(l, byLocale.get(l) ?? "");
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: localeParam, slug } = await params;
  const locale = isValidLocale(localeParam) ? localeParam : "en";
  const post = await getPostBySlug(locale, slug);
  if (!post) return {};
  const tr = post.translation;
  const available = postAvailableLocales(post);
  const cover = tr.ogImage ?? post.coverImageUrl ?? undefined;
  const title = tr.seoTitle ?? tr.title;
  const description = tr.seoDescription ?? tr.excerpt ?? "";
  return {
    title,
    description,
    robots: tr.noindex ? { index: false, follow: true } : undefined,
    alternates: buildAlternatesFor(locale, available, pathForBuilder(post)),
    openGraph: {
      type: "article",
      title: `${title} | Logistiq`,
      description,
      url: `${SITE_URL}${postPath(locale, tr.slug)}`,
      siteName: "Logistiq",
      locale: localeToHreflang[locale],
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: post.authorName ? [post.authorName] : undefined,
      section: post.category?.name,
      images: cover
        ? [{ url: cover, width: 1200, height: 630, alt: post.coverImageAlt ?? tr.title }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: cover ? [cover] : undefined,
    },
  };
}

export default async function BlogArticlePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: localeParam, slug } = await params;
  const locale = isValidLocale(localeParam) ? localeParam : "en";
  const post = await getPostBySlug(locale, slug);
  if (!post) notFound();

  const t = translations[locale];
  const tr = post.translation;
  const url = `${SITE_URL}${postPath(locale, tr.slug)}`;
  const cover = post.coverImageUrl;
  const bodyHtml = sanitizeArticleHtml(tr.contentHtml);
  const images = [tr.ogImage, post.coverImageUrl].filter((x): x is string => Boolean(x));

  return (
    <>
      <JsonLd
        data={webPageSchema({
          locale,
          path: postRel(locale, tr.slug),
          title: tr.seoTitle ?? tr.title,
          description: tr.seoDescription ?? tr.excerpt ?? "",
        })}
      />
      <JsonLd
        data={articleSchema({
          locale,
          url,
          headline: tr.title,
          description: tr.seoDescription ?? tr.excerpt ?? "",
          images,
          datePublished: post.publishedAt,
          dateModified: post.updatedAt,
          authorName: post.authorName,
          section: post.category?.name,
        })}
      />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Logistiq", url: `${SITE_URL}/${locale}` },
          { name: t.blog.title, url: `${SITE_URL}${blogIndexPath(locale)}` },
          ...(post.category
            ? [{ name: post.category.name, url: `${SITE_URL}/${locale}/blog/category/${post.category.slug}` }]
            : []),
          { name: tr.title, url },
        ])}
      />

      <PageHero
        breadcrumb={[
          { label: "Logistiq", href: `/${locale}` },
          { label: t.blog.title, href: blogIndexPath(locale) },
          { label: tr.title },
        ]}
        eyebrow={post.category?.name ?? t.blog.title}
        title={tr.title}
        description={tr.excerpt ?? undefined}
      />

      <article className="pb-16 lg:pb-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {(post.authorName || post.publishedAt) && (
            <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400 mb-8">
              {post.authorName && <span>{t.blog.byline} {post.authorName}</span>}
              {post.authorName && post.publishedAt && <span aria-hidden>·</span>}
              {post.publishedAt && (
                <time dateTime={post.publishedAt}>
                  {t.blog.publishedOn} {new Date(post.publishedAt).toLocaleDateString(locale)}
                </time>
              )}
              {post.readingMinutes ? (
                <>
                  <span aria-hidden>·</span>
                  <span>{post.readingMinutes} {t.blog.minRead}</span>
                </>
              ) : null}
            </div>
          )}

          {cover && (
            <div className="relative aspect-[16/9] rounded-2xl overflow-hidden mb-10 bg-slate-100 dark:bg-slate-900">
              <Image
                src={cover}
                alt={post.coverImageAlt ?? tr.title}
                fill
                sizes="(max-width: 768px) 100vw, 768px"
                className="object-cover"
                priority
              />
            </div>
          )}

          {/* Body HTML is sanitized on write (dashboard) AND here on render. */}
          <div
            className="prose-blog max-w-none text-slate-700 dark:text-slate-200 leading-relaxed [&_a]:text-blue-600 dark:[&_a]:text-blue-400 [&_a]:underline [&_h2]:text-slate-900 dark:[&_h2]:text-white [&_h2]:font-bold [&_h2]:text-2xl [&_h2]:mt-10 [&_h2]:mb-4 [&_h3]:text-slate-900 dark:[&_h3]:text-white [&_h3]:font-semibold [&_h3]:text-xl [&_h3]:mt-8 [&_h3]:mb-3 [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4 [&_blockquote]:border-l-4 [&_blockquote]:border-blue-500 [&_blockquote]:pl-4 [&_blockquote]:italic [&_img]:rounded-xl [&_img]:my-6"
            dangerouslySetInnerHTML={{ __html: bodyHtml }}
          />
        </div>
      </article>

      <CTASection t={t} />
    </>
  );
}
