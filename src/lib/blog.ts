import sanitizeHtml from "sanitize-html";
import { unstable_cache } from "next/cache";
import { locales, type Locale } from "@/lib/i18n/config";
import { createReadClient } from "@/lib/supabase";
export { slugify } from "@/lib/features";

// /blog is a SHARED segment across all 8 locales (like /resurse). Slugs are
// localized (stored per-locale in the DB). "Rel" variants return the path AFTER
// /{locale} (for JSON-LD path fields); the others return the full path.
const BLOG_SEGMENT = "blog";

export function blogIndexRel(_l: Locale): string {
  return `/${BLOG_SEGMENT}`;
}
export function blogIndexPath(l: Locale): string {
  return `/${l}/${BLOG_SEGMENT}`;
}
export function postRel(_l: Locale, slug: string): string {
  return `/${BLOG_SEGMENT}/${slug}`;
}
export function postPath(l: Locale, slug: string): string {
  return `/${l}/${BLOG_SEGMENT}/${slug}`;
}
export function categoryRel(_l: Locale, slug: string): string {
  return `/${BLOG_SEGMENT}/category/${slug}`;
}
export function categoryPath(l: Locale, slug: string): string {
  return `/${l}/${BLOG_SEGMENT}/category/${slug}`;
}

// Render-side sanitizer (defense in depth — the dashboard already sanitizes on
// write). Strict allowlist: no <script>, no on* handlers, no javascript:/data:
// URLs, no <iframe>, no arbitrary style. Links are forced to rel=noopener nofollow.
const BLOG_HTML_OPTS: sanitizeHtml.IOptions = {
  allowedTags: [
    "p", "br", "strong", "b", "em", "i", "u", "s", "a",
    "h2", "h3", "h4", "ul", "ol", "li", "blockquote", "code", "pre",
    "img", "figure", "figcaption", "hr",
    "table", "thead", "tbody", "tr", "th", "td",
  ],
  allowedAttributes: {
    a: ["href", "title", "target", "rel"],
    img: ["src", "alt", "title", "width", "height", "loading"],
  },
  allowedSchemes: ["http", "https", "mailto"],
  allowedSchemesByTag: { img: ["http", "https"], a: ["http", "https", "mailto"] },
  disallowedTagsMode: "discard",
  transformTags: {
    a: sanitizeHtml.simpleTransform("a", { rel: "noopener nofollow ugc", target: "_blank" }, true),
  },
};

export function sanitizeArticleHtml(html: string | null | undefined): string {
  if (!html) return "";
  return sanitizeHtml(html, BLOG_HTML_OPTS);
}

// Guard so the readers degrade to empty data when the Supabase env is absent
// (e.g. `next build` before the anon key/URL are set, or before the blog tables
// exist). generateStaticParams then returns [] and pages render at request time
// via dynamicParams instead of throwing during static generation.
function hasSupabaseEnv(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export type BlogCategoryRef = { id: string; slug: string; name: string };

export type BlogListItem = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  coverImageUrl: string | null;
  coverImageAlt: string | null;
  publishedAt: string;
  updatedAt: string;
  readingMinutes: number | null;
  authorName: string | null;
  authorAvatarUrl: string | null;
  category: BlogCategoryRef | null;
};

export type BlogPostTranslation = {
  locale: Locale;
  slug: string;
  title: string;
  excerpt: string | null;
  contentHtml: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  ogImage: string | null;
  noindex: boolean;
};

// Lightweight per-locale translation (no content_html) used by summaries.
type SummaryTranslation = { locale: Locale; slug: string; title: string; excerpt: string | null };

export type BlogPostSummary = {
  id: string;
  publishedAt: string;
  updatedAt: string;
  coverImageUrl: string | null;
  coverImageAlt: string | null;
  readingMinutes: number | null;
  isFeatured: boolean;
  authorName: string | null;
  authorAvatarUrl: string | null;
  categoryId: string | null;
  categoryTranslations: { locale: Locale; name: string; slug: string }[];
  translations: SummaryTranslation[];
};

export type BlogPostFull = {
  id: string;
  publishedAt: string;
  updatedAt: string;
  coverImageUrl: string | null;
  coverImageAlt: string | null;
  readingMinutes: number | null;
  isFeatured: boolean;
  authorName: string | null;
  authorAvatarUrl: string | null;
  category: BlogCategoryRef | null;
  translation: BlogPostTranslation;
  translations: BlogPostTranslation[];
};

export type BlogCategory = {
  id: string;
  translations: { locale: Locale; name: string; slug: string; description: string | null }[];
};

const isLocale = (l: string): l is Locale => (locales as readonly string[]).includes(l);

// -- raw shapes returned by supabase-js embedded selects -----------------------
type RawCatTr = { locale: string; name: string; slug: string; description?: string | null };
type RawCat = { id: string; blog_category_translations: RawCatTr[] } | null;
type RawSummaryRow = {
  id: string;
  published_at: string;
  updated_at: string;
  cover_image_url: string | null;
  cover_image_alt: string | null;
  reading_minutes: number | null;
  is_featured: boolean;
  author_name: string | null;
  author_avatar_url: string | null;
  blog_post_translations: { locale: string; slug: string; title: string; excerpt: string | null }[];
  blog_categories: RawCat;
};

function mapSummary(row: RawSummaryRow): BlogPostSummary {
  const cat = row.blog_categories;
  return {
    id: row.id,
    publishedAt: row.published_at,
    updatedAt: row.updated_at,
    coverImageUrl: row.cover_image_url,
    coverImageAlt: row.cover_image_alt,
    readingMinutes: row.reading_minutes,
    isFeatured: row.is_featured,
    authorName: row.author_name,
    authorAvatarUrl: row.author_avatar_url,
    categoryId: cat?.id ?? null,
    categoryTranslations: (cat?.blog_category_translations ?? [])
      .filter((t) => isLocale(t.locale))
      .map((t) => ({ locale: t.locale as Locale, name: t.name, slug: t.slug })),
    translations: row.blog_post_translations
      .filter((t) => isLocale(t.locale))
      .map((t) => ({ locale: t.locale as Locale, slug: t.slug, title: t.title, excerpt: t.excerpt })),
  };
}

function categoryRefFor(sum: BlogPostSummary, locale: Locale): BlogCategoryRef | null {
  if (!sum.categoryId) return null;
  const tr = sum.categoryTranslations.find((t) => t.locale === locale);
  if (!tr) return null;
  return { id: sum.categoryId, slug: tr.slug, name: tr.name };
}

function toListItem(sum: BlogPostSummary, locale: Locale): BlogListItem | null {
  const tr = sum.translations.find((t) => t.locale === locale);
  if (!tr) return null;
  return {
    id: sum.id,
    slug: tr.slug,
    title: tr.title,
    excerpt: tr.excerpt,
    coverImageUrl: sum.coverImageUrl,
    coverImageAlt: sum.coverImageAlt,
    publishedAt: sum.publishedAt,
    updatedAt: sum.updatedAt,
    readingMinutes: sum.readingMinutes,
    authorName: sum.authorName,
    authorAvatarUrl: sum.authorAvatarUrl,
    category: categoryRefFor(sum, locale),
  };
}

// All published posts (meta + minimal translations, NO content_html). One cached,
// 'blog'-tagged read that backs the listing, sitemap, RSS and generateStaticParams.
export const getAllPublishedPosts = unstable_cache(
  async (): Promise<BlogPostSummary[]> => {
    if (!hasSupabaseEnv()) return [];
    const supabase = createReadClient();
    const { data, error } = await supabase
      .from("blog_posts")
      .select(
        `id, published_at, updated_at, cover_image_url, cover_image_alt, reading_minutes, is_featured, author_name, author_avatar_url,
         blog_post_translations ( locale, slug, title, excerpt ),
         blog_categories ( id, blog_category_translations ( locale, name, slug ) )`
      )
      .eq("status", "published")
      .not("published_at", "is", null)
      .order("published_at", { ascending: false });
    if (error) throw error;
    return ((data ?? []) as unknown as RawSummaryRow[]).map(mapSummary);
  },
  ["blog:all-published"],
  { tags: ["blog"], revalidate: 3600 }
);

export async function getPublishedPosts(locale: Locale): Promise<BlogListItem[]> {
  const all = await getAllPublishedPosts();
  return all.map((s) => toListItem(s, locale)).filter((x): x is BlogListItem => x !== null);
}

export async function getPublishedPostsByCategory(
  locale: Locale,
  categoryId: string
): Promise<BlogListItem[]> {
  const all = await getAllPublishedPosts();
  return all
    .filter((s) => s.categoryId === categoryId)
    .map((s) => toListItem(s, locale))
    .filter((x): x is BlogListItem => x !== null);
}

export function postAvailableLocales(post: { translations: { locale: Locale }[] }): Locale[] {
  const set = new Set(post.translations.map((t) => t.locale));
  return locales.filter((l) => set.has(l));
}

// Single article by (locale, slug), with content_html + all translations (hreflang).
// Two small reliable round-trips: resolve post_id from the translation, then fetch
// the post with every translation. RLS returns the translation row only when the
// post is public (blog_post_is_public), so a draft slug yields null.
export function getPostBySlug(locale: Locale, slug: string): Promise<BlogPostFull | null> {
  return unstable_cache(
    async (): Promise<BlogPostFull | null> => {
      if (!hasSupabaseEnv()) return null;
      const supabase = createReadClient();
      const { data: hit } = await supabase
        .from("blog_post_translations")
        .select("post_id")
        .eq("locale", locale)
        .eq("slug", slug)
        .maybeSingle();
      if (!hit) return null;

      const { data: row, error } = await supabase
        .from("blog_posts")
        .select(
          `id, published_at, updated_at, cover_image_url, cover_image_alt, reading_minutes, is_featured, author_name, author_avatar_url,
           blog_post_translations ( locale, slug, title, excerpt, content_html, seo_title, seo_description, og_image, noindex ),
           blog_categories ( id, blog_category_translations ( locale, name, slug ) )`
        )
        .eq("id", (hit as { post_id: string }).post_id)
        .eq("status", "published")
        .maybeSingle();
      if (error) throw error;
      if (!row) return null;

      type RawFullTr = {
        locale: string; slug: string; title: string; excerpt: string | null;
        content_html: string | null; seo_title: string | null; seo_description: string | null;
        og_image: string | null; noindex: boolean;
      };
      type RawFull = Omit<RawSummaryRow, "blog_post_translations"> & {
        blog_post_translations: RawFullTr[];
      };
      const r = row as unknown as RawFull;

      const translations: BlogPostTranslation[] = r.blog_post_translations
        .filter((t) => isLocale(t.locale))
        .map((t) => ({
          locale: t.locale as Locale,
          slug: t.slug,
          title: t.title,
          excerpt: t.excerpt,
          contentHtml: t.content_html,
          seoTitle: t.seo_title,
          seoDescription: t.seo_description,
          ogImage: t.og_image,
          noindex: t.noindex,
        }));
      const translation = translations.find((t) => t.locale === locale);
      if (!translation) return null;

      const cat = r.blog_categories;
      const catTr = cat?.blog_category_translations?.find((t) => t.locale === locale);
      return {
        id: r.id,
        publishedAt: r.published_at,
        updatedAt: r.updated_at,
        coverImageUrl: r.cover_image_url,
        coverImageAlt: r.cover_image_alt,
        readingMinutes: r.reading_minutes,
        isFeatured: r.is_featured,
        authorName: r.author_name,
        authorAvatarUrl: r.author_avatar_url,
        category: cat && catTr ? { id: cat.id, slug: catTr.slug, name: catTr.name } : null,
        translation,
        translations,
      };
    },
    ["blog:post", locale, slug],
    { tags: ["blog"], revalidate: 3600 }
  )();
}

export const getAllCategories = unstable_cache(
  async (): Promise<BlogCategory[]> => {
    if (!hasSupabaseEnv()) return [];
    const supabase = createReadClient();
    const { data, error } = await supabase
      .from("blog_categories")
      .select(`id, sort_order, blog_category_translations ( locale, name, slug, description )`)
      .eq("is_active", true)
      .order("sort_order", { ascending: true });
    if (error) throw error;
    type RawCatRow = { id: string; blog_category_translations: RawCatTr[] };
    return ((data ?? []) as unknown as RawCatRow[]).map((c) => ({
      id: c.id,
      translations: (c.blog_category_translations ?? [])
        .filter((t) => isLocale(t.locale))
        .map((t) => ({
          locale: t.locale as Locale,
          name: t.name,
          slug: t.slug,
          description: t.description ?? null,
        })),
    }));
  },
  ["blog:all-categories"],
  { tags: ["blog"], revalidate: 3600 }
);

export async function getCategoryBySlug(locale: Locale, slug: string): Promise<BlogCategoryRef | null> {
  const cats = await getAllCategories();
  for (const c of cats) {
    const tr = c.translations.find((t) => t.locale === locale && t.slug === slug);
    if (tr) return { id: c.id, slug: tr.slug, name: tr.name };
  }
  return null;
}
