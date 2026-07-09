import type { FC } from "react";
import { type Translations } from "@/lib/i18n/translations";
import {
  QrCodeIcon, GateIcon, ChatIcon, UsersIcon, ChartIcon, MobileIcon,
  GlobeIcon, ApiIcon, CloudIcon, CompassIcon, ClockIcon, MapPinIcon,
} from "@/components/icons";

// Canonical feature registry — the single source that drives the /functionalitati
// index, the per-feature pages, the mega-menu, and the sitemap. Titles/descriptions
// live in translations (features.featureNTitle / featureNDesc, all 8 locales); the
// URL slug is shared across locales (the /functionalitati/ segment stays constant).
export type Feature = {
  id: number; // 1..12 -> features.feature{id}Title / feature{id}Desc
  slug: string;
  icon: FC;
  color: string;
};

export const features: Feature[] = [
  { id: 1, slug: "check-in-digital", icon: QrCodeIcon, color: "blue" },
  { id: 2, slug: "management-rampe", icon: GateIcon, color: "green" },
  { id: 3, slug: "chat-notificari", icon: ChatIcon, color: "purple" },
  { id: 4, slug: "categorisire", icon: UsersIcon, color: "orange" },
  { id: 5, slug: "rapoarte-analytics", icon: ChartIcon, color: "cyan" },
  { id: 6, slug: "aplicatie-mobila", icon: MobileIcon, color: "pink" },
  { id: 7, slug: "multi-limba", icon: GlobeIcon, color: "indigo" },
  { id: 8, slug: "white-label-api", icon: ApiIcon, color: "teal" },
  { id: 9, slug: "cloud", icon: CloudIcon, color: "sky" },
  { id: 10, slug: "ghidare-soferi", icon: CompassIcon, color: "amber" },
  { id: 11, slug: "programare", icon: ClockIcon, color: "lime" },
  { id: 12, slug: "detectare-locatie", icon: MapPinIcon, color: "rose" },
];

export function getFeature(slug: string): Feature | undefined {
  return features.find((f) => f.slug === slug);
}

export function featureTitle(t: Translations, id: number): string {
  return (t.features as unknown as Record<string, string>)[`feature${id}Title`];
}

export function featureDesc(t: Translations, id: number): string {
  return (t.features as unknown as Record<string, string>)[`feature${id}Desc`];
}

// Tailwind classes per accent color (icon tile), matching the home Features grid.
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
};
