import type { NextConfig } from "next";

// The features route folder is "features" (the English/default segment). Public
// URLs use a LOCALIZED segment per locale; rewrites map them to the folder, and
// redirects send the raw folder segment (and the old /functionalitati/ URLs) to
// the localized one. ⚠️ Keep SEG in sync with src/lib/i18n/segments.ts.
const FOLDER = "features";
const SEG: Record<string, string> = {
  en: "features",
  ro: "functionalitati",
  de: "funktionen",
  fr: "fonctionnalites",
  pl: "funkcje",
  hu: "funkciok",
  bg: "funktsii",
  nl: "functies",
};
const LOCALES = Object.keys(SEG);

// Feature slugs are DERIVED from the localized feature title, so renaming a
// feature silently changes its public URL. Old URLs are indexed and linked, so
// every rename must leave a 301 behind — recorded here, per locale, oldest first.
//   2026-07-15  feature 7  dropped "(12 languages)" — more languages are coming
//               feature 8  dropped "& API" — the API moved to its own page
// The `slug` route resolves by matching the CURRENT title, so a stale slug would
// otherwise 404 rather than fall through.
const RENAMED_FEATURE_SLUGS: Record<string, [string, string][]> = {
  ro: [["multi-limba-12-limbi", "multi-limba"], ["white-label-api", "white-label"]],
  en: [["multi-language-12-languages", "multi-language"], ["white-label-api", "white-label"]],
  de: [["mehrsprachig-12-sprachen", "mehrsprachig"], ["white-label-api", "white-label"]],
  pl: [["wielojezycznosc-12-jezykow", "wielojezycznosc"], ["white-label-api", "white-label"]],
  hu: [["tobbnyelvuseg-12-nyelv", "tobbnyelvuseg"], ["white-label-api", "white-label"]],
  bg: [["mnogoezinovost-12-ezika", "mnogoezichnost"], ["white-label-api", "white-label"]],
  fr: [["multi-langue-12-langues", "multi-langue"], ["white-label-api", "white-label"]],
  nl: [["meertalig-12-talen", "meertalig"], ["white-label-api", "white-label"]],
};

const nextConfig: NextConfig = {
  images: {
    // Blog featured/inline images are served from the public Supabase Storage bucket.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "bhpiugfpkqwxcqbolisb.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
    formats: ["image/avif", "image/webp"],
  },

  async rewrites() {
    const rules: { source: string; destination: string }[] = [];
    for (const loc of LOCALES) {
      const s = SEG[loc];
      if (s === FOLDER) continue; // segment already IS the folder (en) — no rewrite
      rules.push({ source: `/${loc}/${s}/:slug*`, destination: `/${loc}/${FOLDER}/:slug*` });
      rules.push({ source: `/${loc}/${s}`, destination: `/${loc}/${FOLDER}` });
    }
    return rules;
  },

  async redirects() {
    const rules: { source: string; destination: string; permanent: boolean }[] = [];
    for (const loc of LOCALES) {
      const s = SEG[loc];
      // NOTE: we intentionally do NOT redirect the raw folder segment (/de/features)
      // to the localized one — a rewrite + that redirect forms an infinite loop.
      // Instead the localized URL is the canonical (set per page), so the raw
      // /{loc}/features/* stays reachable but is deduplicated by Google via canonical.
      //
      // Old shared /functionalitati/* URLs -> localized features index, EXCEPT where
      // functionalitati is the current segment (ro), which is canonical.
      if (s !== "functionalitati") {
        rules.push({ source: `/${loc}/functionalitati/:path*`, destination: `/${loc}/${s}`, permanent: true });
        rules.push({ source: `/${loc}/functionalitati`, destination: `/${loc}/${s}`, permanent: true });
      }

      // Renamed features: 301 the retired slug straight to its new one, on both
      // the localized segment and the raw folder (which stays reachable and is
      // deduplicated by canonical — so it can be linked and must not 404 either).
      for (const [oldSlug, newSlug] of RENAMED_FEATURE_SLUGS[loc] ?? []) {
        if (oldSlug === newSlug) continue;
        rules.push({ source: `/${loc}/${s}/${oldSlug}`, destination: `/${loc}/${s}/${newSlug}`, permanent: true });
        if (s !== FOLDER) {
          rules.push({ source: `/${loc}/${FOLDER}/${oldSlug}`, destination: `/${loc}/${s}/${newSlug}`, permanent: true });
        }
      }
    }
    return rules;
  },
};

export default nextConfig;
