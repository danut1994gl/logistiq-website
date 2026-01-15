export const locales = ["ro", "en", "de", "pl", "hu", "bg", "fr", "nl"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "ro";

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

// SEO: Language codes for hreflang
export const localeToHreflang: Record<Locale, string> = {
  ro: "ro-RO",
  en: "en",
  de: "de-DE",
  pl: "pl-PL",
  hu: "hu-HU",
  bg: "bg-BG",
  fr: "fr-FR",
  nl: "nl-NL",
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
