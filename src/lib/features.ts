import type { FC } from "react";
import { translations, type Translations } from "@/lib/i18n/translations";
import { type Locale } from "@/lib/i18n/config";
import { featuresSegment } from "@/lib/i18n/segments";
import {
  QrCodeIcon, GateIcon, ChatIcon, UsersIcon, ChartIcon, MobileIcon,
  GlobeIcon, ApiIcon, CloudIcon, CompassIcon, ClockIcon, MapPinIcon, TruckIcon,
} from "@/components/icons";

// Canonical feature registry — drives the /features index, per-feature pages, the
// mega-menu, and the sitemap. Slugs are LOCALIZED per language (derived from the
// already-native feature titles) for correct international SEO, e.g.
//   /en/features/digital-check-in · /de/features/qr-check-in · /fr/features/...
// The path segment ("features") is kept neutral English on all locales; fully
// localizing the segment (/de/funktionen/) is a follow-up that needs next.config
// rewrites and native-slug review.
export type Feature = {
  id: number; // 1..13 -> features.feature{id}Title / feature{id}Desc
  icon: FC;
  color: string;
};

export const features: Feature[] = [
  { id: 1, icon: QrCodeIcon, color: "blue" },
  { id: 2, icon: GateIcon, color: "green" },
  { id: 3, icon: ChatIcon, color: "purple" },
  { id: 4, icon: UsersIcon, color: "orange" },
  { id: 5, icon: ChartIcon, color: "cyan" },
  { id: 6, icon: MobileIcon, color: "pink" },
  { id: 7, icon: GlobeIcon, color: "indigo" },
  { id: 8, icon: ApiIcon, color: "teal" },
  { id: 9, icon: CloudIcon, color: "sky" },
  { id: 10, icon: CompassIcon, color: "amber" },
  { id: 11, icon: ClockIcon, color: "lime" },
  { id: 12, icon: MapPinIcon, color: "rose" },
  { id: 13, icon: TruckIcon, color: "emerald" },
];

// Path helpers. The public segment is localized per locale (see lib/i18n/segments
// + next.config rewrites); "Rel" variants return the path AFTER /{locale} (for
// JSON-LD path fields), the others return the full path.
export function featuresIndexRel(locale: Locale): string {
  return `/${featuresSegment[locale]}`;
}

export function featuresIndexPath(locale: Locale): string {
  return `/${locale}${featuresIndexRel(locale)}`;
}

export function featureRel(locale: Locale, id: number): string {
  return `${featuresIndexRel(locale)}/${featureSlug(id, locale)}`;
}

export function featureTitle(t: Translations, id: number): string {
  return (t.features as unknown as Record<string, string>)[`feature${id}Title`];
}

export function featureDesc(t: Translations, id: number): string {
  return (t.features as unknown as Record<string, string>)[`feature${id}Desc`];
}

// Minimal Cyrillic -> Latin map so Bulgarian titles produce readable ASCII slugs.
const CYRILLIC: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ж: "zh", з: "z", и: "i",
  й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r", с: "s",
  т: "t", у: "u", ф: "f", х: "h", ц: "ts", ч: "ch", ш: "sh", щ: "sht",
  ъ: "a", ь: "", ю: "yu", я: "ya",
};

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[а-я]/g, (c) => CYRILLIC[c] ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // strip Latin diacritics (ș ț ł ő é …)
    .replace(/&/g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Localized slug for a feature in a given locale, derived from its native title.
export function featureSlug(id: number, locale: Locale): string {
  return slugify(featureTitle(translations[locale], id));
}

export function featurePath(locale: Locale, id: number): string {
  return `${featuresIndexPath(locale)}/${featureSlug(id, locale)}`;
}

// Resolve a feature from a localized slug within a locale (for the [slug] route).
export function getFeatureBySlug(locale: Locale, slug: string): Feature | undefined {
  return features.find((f) => featureSlug(f.id, locale) === slug);
}

export const featureColorMap: Record<string, { bg: string; text: string; darkBg: string; darkText: string }> = {
  blue: { bg: "bg-blue-100", text: "text-blue-600", darkBg: "dark:bg-blue-900/30", darkText: "dark:text-blue-400" },
  green: { bg: "bg-green-100", text: "text-green-600", darkBg: "dark:bg-green-900/30", darkText: "dark:text-green-400" },
  purple: { bg: "bg-purple-100", text: "text-purple-600", darkBg: "dark:bg-purple-900/30", darkText: "dark:text-purple-400" },
  orange: { bg: "bg-orange-100", text: "text-orange-600", darkBg: "dark:bg-orange-900/30", darkText: "dark:text-orange-400" },
  cyan: { bg: "bg-cyan-100", text: "text-cyan-600", darkBg: "dark:bg-cyan-900/30", darkText: "dark:text-cyan-400" },
  pink: { bg: "bg-pink-100", text: "text-pink-600", darkBg: "dark:bg-pink-900/30", darkText: "dark:text-pink-400" },
  indigo: { bg: "bg-indigo-100", text: "text-indigo-600", darkBg: "dark:bg-indigo-900/30", darkText: "dark:text-indigo-400" },
  teal: { bg: "bg-teal-100", text: "text-teal-600", darkBg: "dark:bg-teal-900/30", darkText: "dark:text-teal-400" },
  sky: { bg: "bg-sky-100", text: "text-sky-600", darkBg: "dark:bg-sky-900/30", darkText: "dark:text-sky-400" },
  amber: { bg: "bg-amber-100", text: "text-amber-600", darkBg: "dark:bg-amber-900/30", darkText: "dark:text-amber-400" },
  lime: { bg: "bg-lime-100", text: "text-lime-600", darkBg: "dark:bg-lime-900/30", darkText: "dark:text-lime-400" },
  rose: { bg: "bg-rose-100", text: "text-rose-600", darkBg: "dark:bg-rose-900/30", darkText: "dark:text-rose-400" },
  emerald: { bg: "bg-emerald-100", text: "text-emerald-600", darkBg: "dark:bg-emerald-900/30", darkText: "dark:text-emerald-400" },
};
