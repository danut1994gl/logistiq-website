import { MetadataRoute } from "next";
import { locales, localeToHreflang, defaultLocale } from "@/lib/i18n/config";
import { SITE_URL } from "@/lib/seo/metadata";
import { features, featurePath, featuresIndexPath } from "@/lib/features";
import {
  getAllPublishedPosts,
  getAllCategories,
  postAvailableLocales,
  blogIndexPath,
  postPath,
  categoryPath,
} from "@/lib/blog";

// Blog blocks read Supabase via cached, 'blog'-tagged readers, so
// revalidatePath('/sitemap.xml') after a publish refreshes them.
export const revalidate = 3600;

const STATIC_ROUTES: {
  path: string;
  priority: number;
  changeFrequency: "weekly" | "monthly" | "yearly";
}[] = [
  { path: "", priority: 1.0, changeFrequency: "weekly" },
  { path: "/contact", priority: 0.7, changeFrequency: "yearly" },
  { path: "/resurse", priority: 0.8, changeFrequency: "monthly" },
  { path: "/privacy", priority: 0.3, changeFrequency: "yearly" },
  { path: "/terms", priority: 0.3, changeFrequency: "yearly" },
  { path: "/cookies", priority: 0.3, changeFrequency: "yearly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  // Shared-path routes: every localized URL + x-default.
  for (const route of STATIC_ROUTES) {
    const languages: Record<string, string> = {};
    for (const loc of locales) languages[localeToHreflang[loc]] = `${SITE_URL}/${loc}${route.path}`;
    languages["x-default"] = `${SITE_URL}/${defaultLocale}${route.path}`;
    for (const loc of locales) {
      entries.push({
        url: `${SITE_URL}/${loc}${route.path}`,
        lastModified: now,
        changeFrequency: route.changeFrequency,
        priority: route.priority,
        alternates: { languages },
      });
    }
  }

  // Features index (localized segment per locale).
  {
    const languages: Record<string, string> = {};
    for (const loc of locales) languages[localeToHreflang[loc]] = `${SITE_URL}${featuresIndexPath(loc)}`;
    languages["x-default"] = `${SITE_URL}${featuresIndexPath(defaultLocale)}`;
    for (const loc of locales) {
      entries.push({
        url: `${SITE_URL}${featuresIndexPath(loc)}`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.9,
        alternates: { languages },
      });
    }
  }

  // Feature pages (localized slug per locale).
  for (const f of features) {
    const languages: Record<string, string> = {};
    for (const loc of locales) languages[localeToHreflang[loc]] = `${SITE_URL}${featurePath(loc, f.id)}`;
    languages["x-default"] = `${SITE_URL}${featurePath(defaultLocale, f.id)}`;
    for (const loc of locales) {
      entries.push({
        url: `${SITE_URL}${featurePath(loc, f.id)}`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.7,
        alternates: { languages },
      });
    }
  }

  // --- Blog (Supabase, published only) --------------------------------------
  let posts: Awaited<ReturnType<typeof getAllPublishedPosts>> = [];
  let categories: Awaited<ReturnType<typeof getAllCategories>> = [];
  try {
    [posts, categories] = await Promise.all([getAllPublishedPosts(), getAllCategories()]);
  } catch {
    // If Supabase is unreachable at generation time, still emit the static sitemap.
    posts = [];
    categories = [];
  }

  // Blog index — shared /blog segment, all-locale.
  {
    const languages: Record<string, string> = {};
    for (const loc of locales) languages[localeToHreflang[loc]] = `${SITE_URL}${blogIndexPath(loc)}`;
    languages["x-default"] = `${SITE_URL}${blogIndexPath(defaultLocale)}`;
    for (const loc of locales) {
      entries.push({
        url: `${SITE_URL}${blogIndexPath(loc)}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.8,
        alternates: { languages },
      });
    }
  }

  // Category pages — localized slug per available locale.
  for (const cat of categories) {
    if (cat.translations.length === 0) continue;
    const languages: Record<string, string> = {};
    for (const tr of cat.translations) languages[localeToHreflang[tr.locale]] = `${SITE_URL}${categoryPath(tr.locale, tr.slug)}`;
    const xdef = cat.translations.find((t) => t.locale === defaultLocale) ?? cat.translations[0];
    languages["x-default"] = `${SITE_URL}${categoryPath(xdef.locale, xdef.slug)}`;
    for (const tr of cat.translations) {
      entries.push({
        url: `${SITE_URL}${categoryPath(tr.locale, tr.slug)}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.6,
        alternates: { languages },
      });
    }
  }

  // Article pages — subset-locale (only locales the post exists in), lastModified from dateModified.
  for (const post of posts) {
    const available = postAvailableLocales(post);
    if (available.length === 0) continue;
    const slugByLocale = new Map(post.translations.map((t) => [t.locale, t.slug] as const));
    const languages: Record<string, string> = {};
    for (const loc of available) {
      const s = slugByLocale.get(loc);
      if (s) languages[localeToHreflang[loc]] = `${SITE_URL}${postPath(loc, s)}`;
    }
    const xdefLoc = available.includes(defaultLocale) ? defaultLocale : available[0];
    const xdefSlug = slugByLocale.get(xdefLoc)!;
    languages["x-default"] = `${SITE_URL}${postPath(xdefLoc, xdefSlug)}`;
    const lastModified = new Date(post.updatedAt);
    for (const loc of available) {
      const s = slugByLocale.get(loc);
      if (!s) continue;
      entries.push({
        url: `${SITE_URL}${postPath(loc, s)}`,
        lastModified,
        changeFrequency: "monthly",
        priority: 0.7,
        alternates: { languages },
      });
    }
  }

  return entries;
}
