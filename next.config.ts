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
    }
    return rules;
  },
};

export default nextConfig;
