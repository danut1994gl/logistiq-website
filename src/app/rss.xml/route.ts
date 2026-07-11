import { translations } from "@/lib/i18n/translations";
import { defaultLocale } from "@/lib/i18n/config";
import { SITE_URL } from "@/lib/seo/metadata";
import { getAllPublishedPosts, postPath } from "@/lib/blog";
import { buildRssXml, type RssItem } from "@/lib/rss";

// Self-healing fallback; on-demand busted by revalidatePath('/rss.xml').
export const revalidate = 3600;

export async function GET() {
  const t = translations[defaultLocale];
  let posts: Awaited<ReturnType<typeof getAllPublishedPosts>> = [];
  try {
    posts = await getAllPublishedPosts();
  } catch {
    posts = [];
  }

  const items: RssItem[] = posts.map((post) => {
    // Representative translation: default locale if present, else first available.
    const tr =
      post.translations.find((x) => x.locale === defaultLocale) ?? post.translations[0];
    const link = `${SITE_URL}${postPath(tr.locale, tr.slug)}`;
    return {
      title: tr.title,
      link,
      description: tr.excerpt ?? "",
      pubDate: post.publishedAt,
      guid: link,
    };
  });

  const xml = buildRssXml({
    title: `Logistiq ${t.blog.title}`,
    description: t.blog.subtitle,
    feedUrl: `${SITE_URL}/rss.xml`,
    siteUrl: SITE_URL,
    items,
  });

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
