import { describe, it, expect } from "vitest";
import { translations } from "@/lib/i18n/translations";

// The multi-language page (f7Page), checked against Logistiq on 2026-11-24:
// - the dashboard has the same 12 languages as the driver web (apps/dashboard/lib/locales.ts,
//   12 catalogs in apps/dashboard/messages); until then the page said, in all 8 languages,
//   that it was Romanian and English only;
// - every driver-web catalog (apps/driver/messages/*.json) holds the same strings, none
//   missing or extra; the page counted them, 476 (an older version's count) until the
//   morning of 2026-11-24 and 613 until its evening ("613 de texte" was not Romanian
//   grammar), and now gives no number, which would go stale with every new string;
// - the driver web is English until a language is chosen (apps/driver/lib/locales.ts,
//   defaultLocale, since 2026-11-06); the page said Romanian.

// "Romanian and English (only)" / "Romanian or English", as each language said it.
const TWO_LANGUAGES =
  /română și engleză|română sau engleză|Romanian and English|Romanian or English|Rumänisch und Englisch|Rumänisch oder Englisch|rumuńsku i angielsku|rumuński i angielski|rumuńsku lub angielsku|román és angol|Románul vagy angolul|румънски и английски|румънски или английски|roumain et (en )?anglais|roumain ou en anglais|Roemeens en Engels|Roemeens of Engels/i;

// "Romanian" in each language, for the driver web's default.
const ROMANIAN = /român|Romanian|Rumänisch|rumuński|román|румънски|roumain|Roemeens/i;

describe("multi-language page (f7)", () => {
  it("does not say the dashboard is Romanian and English only", () => {
    for (const [locale, copy] of Object.entries(translations)) {
      const f = copy.f7Page;
      for (const text of [f.a4, f.v5, f.b2a]) {
        expect(text.match(TWO_LANGUAGES)?.[0], locale).toBeUndefined();
      }
      expect(f.v5, locale).toMatch(/12/);
    }
  });

  it("gives no string count, which would go stale", () => {
    for (const [locale, copy] of Object.entries(translations)) {
      const f = copy.f7Page;
      for (const text of [f.probP2, f.new2, f.a2, f.v2]) {
        expect(text.match(/\d{3,}/)?.[0], locale).toBeUndefined();
      }
    }
  });

  it("says the driver web is English, not Romanian, until a language is chosen", () => {
    for (const [locale, copy] of Object.entries(translations)) {
      expect(copy.f7Page.v3.match(ROMANIAN)?.[0], locale).toBeUndefined();
    }
    expect(translations.en.f7Page.v3).toMatch(/it is English until a language is chosen/);
  });
});
