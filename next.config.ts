import type { NextConfig } from "next";
import { withBotId } from "botid/next/config";

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
//   2026-11-08  bg 3/10/11 written in Cyrillic (were Latin transliteration);
//               hu 10/12 accents restored, "Sofőrutasítások" joined, 12 renamed to
//               "Helyfelismerés" (its page's own term; the old title was misspelled)
//   2026-11-08  translation review: ro 5/7, de 10/14, pl 3, hu 2/14, bg 16 and nl
//               2/4/10/14 retitled to read natively (e.g. "Multilingv", "Czat")
// The `slug` route resolves by matching the CURRENT title, so a stale slug would
// otherwise 404 rather than fall through.
const RENAMED_FEATURE_SLUGS: Record<string, [string, string][]> = {
  ro: [
    ["multi-limba-12-limbi", "multilingv"],
    ["white-label-api", "white-label"],
    ["rapoarte-analytics", "rapoarte-analize"],
    ["multi-limba", "multilingv"],
  ],
  en: [["multi-language-12-languages", "multi-language"], ["white-label-api", "white-label"]],
  de: [
    ["mehrsprachig-12-sprachen", "mehrsprachig"],
    ["white-label-api", "white-label"],
    ["fahrer-anweisungen-fuhrung", "fahreranweisungen-wegfuhrung"],
    ["fahrer-self-check", "self-check-in-fur-fahrer"],
  ],
  pl: [
    ["wielojezycznosc-12-jezykow", "wielojezycznosc"],
    ["white-label-api", "white-label"],
    ["chat-i-powiadomienia-w-czasie-rzeczywistym", "czat-i-powiadomienia-w-czasie-rzeczywistym"],
  ],
  hu: [
    ["tobbnyelvuseg-12-nyelv", "tobbnyelvuseg"],
    ["white-label-api", "white-label"],
    ["sofor-utasitasok-es-utmutatas", "soforutasitasok-es-utmutatas"],
    ["automatikus-helyzeterkenites", "automatikus-helyfelismeres"],
    ["dokkkezeles", "dokk-kezeles"],
    ["sofor-onkiszolgalo-check-in", "onkiszolgalo-check-in-soforoknek"],
  ],
  bg: [
    ["mnogoezinovost-12-ezika", "mnogoezichnost"],
    ["white-label-api", "white-label"],
    ["chat-i-uvedomlenija-v-realno-vreme", "chat-i-izvestiya-v-realno-vreme"],
    ["instrukcii-i-nasochvane-za-voditeli", "instruktsii-i-nasochvane-za-shofori"],
    ["ranna-registracija-i-planirane", "ranna-registratsiya-i-planirane"],
    ["sistemni-integratsii-api", "sistemni-integratsii-i-api"],
  ],
  fr: [["multi-langue-12-langues", "multi-langue"], ["white-label-api", "white-label"]],
  nl: [
    ["meertalig-12-talen", "meertalig"],
    ["white-label-api", "white-label"],
    ["dokbeheer", "dockbeheer"],
    ["afdeling-truck-categorieen", "afdelingen-vrachtwagentypes"],
    ["chauffeur-instructies-begeleiding", "chauffeursinstructies-begeleiding"],
    ["chauffeur-self-check-in", "zelf-inchecken-aan-de-balie"],
  ],
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
      // The index first, and `:slug+` (one or more), never `:slug*`: zero segments
      // would rewrite /de/funktionen to /de/features/ (trailing slash), and on Vercel
      // the router's RSC request for that path matches /[locale]/features/[slug]
      // with an empty slug and gets a 404 (seen until 2026-11-08 on every link to a
      // localized features index).
      rules.push({ source: `/${loc}/${s}`, destination: `/${loc}/${FOLDER}` });
      rules.push({ source: `/${loc}/${s}/:slug+`, destination: `/${loc}/${FOLDER}/:slug+` });
    }
    return rules;
  },

  async redirects() {
    const rules: { source: string; destination: string; permanent: boolean }[] = [];
    // The owner's e-mail signature page (built by scripts/email-signature/build.py). It is a
    // static file: its dotted path skips the language middleware, which would otherwise send
    // /email/signature to /ro/email/signature (404). Config redirects run before the
    // middleware, and Next's trailing-slash redirect brings /email/signature/ here too.
    rules.push({ source: "/email/signature", destination: "/email/signature/index.html", permanent: false });
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

// Vercel BotID (contact form, see src/instrumentation-client.ts). On Vercel the
// platform routes BotID's challenge paths itself; the wrapper's rewrites proxy them
// to Vercel so the challenge also works under `next dev` / `next start`, and give
// them frame headers. middleware.ts skips those paths.
export default withBotId(nextConfig);
