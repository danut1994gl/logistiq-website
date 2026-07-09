import { type Locale } from "@/lib/i18n/config";

// Localized path segment for the features section, per locale. The internal route
// folder is "features" (the English/default segment); next.config rewrites map the
// localized public segments to it and redirect the raw folder segment to the
// localized one. ⚠️ Keep this map in sync with the SEG map in next.config.ts.
export const featuresSegment: Record<Locale, string> = {
  en: "features",
  ro: "functionalitati",
  de: "funktionen",
  fr: "fonctionnalites",
  pl: "funkcje",
  hu: "funkciok",
  bg: "funktsii",
  nl: "functies",
};
