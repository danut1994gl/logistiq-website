import { MetadataRoute } from "next";
import { locales, localeToHreflang, defaultLocale } from "@/lib/i18n/config";
import { SITE_URL } from "@/lib/seo/metadata";
import { features, featurePath } from "@/lib/features";

// Static routes with a SHARED path across locales (path after /{locale}).
// Blog routes are appended when the blog ships.
const STATIC_ROUTES: {
  path: string;
  priority: number;
  changeFrequency: "weekly" | "monthly" | "yearly";
}[] = [
  { path: "", priority: 1.0, changeFrequency: "weekly" },
  { path: "/features", priority: 0.9, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.7, changeFrequency: "yearly" },
  { path: "/resurse", priority: 0.8, changeFrequency: "monthly" },
  { path: "/privacy", priority: 0.3, changeFrequency: "yearly" },
  { path: "/terms", priority: 0.3, changeFrequency: "yearly" },
  { path: "/cookies", priority: 0.3, changeFrequency: "yearly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
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

  // Feature pages have a LOCALIZED slug per locale, so each feature's hreflang
  // alternates map every locale to its own URL.
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

  return entries;
}
