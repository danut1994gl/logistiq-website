export const locales = ["ro", "en", "de", "pl", "hu", "bg", "fr", "nl"] as const;
export type Locale = (typeof locales)[number];

// English is the international fallback: hreflang x-default, the sitemap's
// x-default, the RSS feed and the fallback for an unknown locale param. It is NOT
// the language a first visit opens in: that is per domain, in lib/i18n/sites.ts
// (Romanian on logistiq.ro and every host but logistiq.be, Dutch on logistiq.be).
// Geo/Accept-Language detection is disabled (middleware.ts).
export const defaultLocale: Locale = "en";

export const localeNames: Record<Locale, string> = {
  ro: "Romana",
  en: "English",
  de: "Deutsch",
  pl: "Polski",
  hu: "Magyar",
  bg: "Български",
  fr: "Francais",
  nl: "Nederlands",
};

export const localeFlags: Record<Locale, string> = {
  ro: "🇷🇴",
  en: "🇬🇧",
  de: "🇩🇪",
  pl: "🇵🇱",
  hu: "🇭🇺",
  bg: "🇧🇬",
  fr: "🇫🇷",
  nl: "🇳🇱",
};

// Map country codes to locales for geo-redirect
export const countryToLocale: Record<string, Locale> = {
  RO: "ro",
  MD: "ro", // Moldova -> Romanian
  GB: "en",
  US: "en",
  IE: "en",
  AU: "en",
  NZ: "en",
  CA: "en",
  DE: "de",
  AT: "de", // Austria -> German
  CH: "de", // Switzerland -> German (default)
  PL: "pl",
  HU: "hu",
  BG: "bg",
  FR: "fr",
  BE: "fr", // Belgium -> French (default for Belgium)
  LU: "fr", // Luxembourg -> French
  NL: "nl", // Netherlands
};

// SEO: hreflang codes. Language-level targeting (not country) — a single German
// page serves DE/AT/CH, etc. Switch to language-region (de-DE, de-AT) only once
// content is differentiated per country (local pricing, VAT, legal, case studies).
export const localeToHreflang: Record<Locale, string> = {
  ro: "ro",
  en: "en",
  de: "de",
  pl: "pl",
  hu: "hu",
  bg: "bg",
  fr: "fr",
  nl: "nl",
};

export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}

export function getLocaleFromCountry(countryCode: string): Locale {
  return countryToLocale[countryCode] || defaultLocale;
}

export function getLocaleFromAcceptLanguage(acceptLanguage: string): Locale {
  // Parse Accept-Language header
  const languages = acceptLanguage
    .split(",")
    .map((lang) => {
      const [code, qValue] = lang.trim().split(";q=");
      return {
        code: code.split("-")[0].toLowerCase(), // Get base language code
        q: qValue ? parseFloat(qValue) : 1,
      };
    })
    .sort((a, b) => b.q - a.q);

  // Find first matching locale
  for (const lang of languages) {
    if (isValidLocale(lang.code)) {
      return lang.code;
    }
  }

  return defaultLocale;
}
