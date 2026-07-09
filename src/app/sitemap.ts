import { MetadataRoute } from "next";
import { locales, localeToHreflang, defaultLocale } from "@/lib/i18n/config";
import { SITE_URL } from "@/lib/seo/metadata";
import { features } from "@/lib/features";

// Static routes (path after /{locale}). Blog routes are appended when the blog ships.
const ROUTES: {
  path: string;
  priority: number;
  changeFrequency: "weekly" | "monthly" | "yearly";
}[] = [
  { path: "", priority: 1.0, changeFrequency: "weekly" },
  { path: "/functionalitati", priority: 0.9, changeFrequency: "monthly" },
  ...features.map((f) => ({
    path: `/functionalitati/${f.slug}`,
    priority: 0.7,
    changeFrequency: "monthly" as const,
  })),
  { path: "/contact", priority: 0.7, changeFrequency: "yearly" },
  { path: "/resurse", priority: 0.8, changeFrequency: "monthly" },
  { path: "/privacy", priority: 0.3, changeFrequency: "yearly" },
  { path: "/terms", priority: 0.3, changeFrequency: "yearly" },
  { path: "/cookies", priority: 0.3, changeFrequency: "yearly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  for (const route of ROUTES) {
    // Every localized URL of this route + x-default, for correct hreflang.
    const languages: Record<string, string> = {};
    for (const loc of locales) {
      languages[localeToHreflang[loc]] = `${SITE_URL}/${loc}${route.path}`;
    }
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

  return entries;
}
