import { describe, it, expect } from "vitest";
import { features, featureSlug } from "@/lib/features";
import { locales, type Locale } from "@/lib/i18n/config";
import { featuresSegment } from "@/lib/i18n/segments";
import nextConfig from "../../next.config";

// Feature page URLs are derived from the localized feature titles, so editing a title
// (even fixing its spelling) can move an indexed, linked URL. This list pins every
// public feature URL: when a title change moves one, update the list here AND add the
// old slug to RENAMED_FEATURE_SLUGS in next.config.ts so the old URL keeps working.
// Index = feature id - 1.
const LIVE: Record<Locale, string[]> = {
  ro: ["check-in-digital", "management-rampe", "chat-notificari-in-timp-real", "categorisire", "rapoarte-analize", "aplicatie-android-ios", "multilingv", "white-label", "cloud-fara-echipament", "instructiuni-ghidare-soferi", "early-check-in-programare", "detectare-automata-locatie", "management-curte-yms", "self-check-in-la-ghiseu", "control-acces-curte-qrgobox", "integrari-de-sisteme-api", "control-acces-personal"],
  en: ["digital-check-in", "dock-management", "real-time-chat-notifications", "department-truck-categories", "reports-analytics", "android-ios-app", "multi-language", "white-label", "cloud-no-equipment", "driver-instructions-guidance", "early-check-in-scheduling", "automatic-location-detection", "yard-management-system", "driver-self-check", "yard-access-control-qrgobox", "systems-integrations-api", "access-control"],
  de: ["digitaler-check-in", "rampenverwaltung", "echtzeit-chat-benachrichtigungen", "abteilungs-lkw-kategorien", "berichte-analysen", "android-ios-app", "mehrsprachig", "white-label", "cloud-keine-hardware", "fahreranweisungen-wegfuhrung", "fruher-check-in-terminplanung", "automatische-standorterkennung", "yard-management-system-yms", "self-check-in-fur-fahrer", "hofzufahrtskontrolle-qrgobox", "systemintegrationen-api", "zugriffsverwaltung"],
  pl: ["cyfrowa-rejestracja", "zarzadzanie-dokami", "czat-i-powiadomienia-w-czasie-rzeczywistym", "kategorie-dzialow-i-ciezarowek", "raporty-i-analizy", "aplikacja-android-i-ios", "wielojezycznosc", "white-label", "chmura-bez-sprzetu", "instrukcje-i-wskazowki-dla-kierowcow", "wczesna-rejestracja-i-planowanie", "automatyczne-wykrywanie-lokalizacji", "system-zarzadzania-placem-yms", "samodzielny-check-in-kierowcy", "kontrola-wjazdu-na-plac-qrgobox", "integracje-systemow-api", "kontrola-dostepu"],
  hu: ["digitalis-bejelentkezes", "dokk-kezeles", "valos-ideju-chat-es-ertesitesek", "reszleg-es-kamionkategoriak", "jelentesek-es-elemzesek", "android-es-ios-alkalmazas", "tobbnyelvuseg", "white-label", "felho-nincs-hardver", "soforutasitasok-es-utmutatas", "korai-bejelentkezes-es-idopontfoglalas", "automatikus-helyfelismeres", "udvarmenedzsment-rendszer-yms", "onkiszolgalo-check-in-soforoknek", "telephelyi-beleptetes-qrgobox", "rendszerintegraciok-api", "hozzaferes-kezeles"],
  bg: ["digitalna-registratsiya", "upravlenie-na-dokove", "chat-i-izvestiya-v-realno-vreme", "kategorii-otdeli-i-kamioni", "otcheti-i-analizi", "android-i-ios-prilozhenie", "mnogoezichnost", "white-label", "oblak-bez-oborudvane", "instruktsii-i-nasochvane-za-shofori", "ranna-registratsiya-i-planirane", "avtomatichno-zasichane-na-mestopolozhenie", "sistema-za-upravlenie-na-dvora-yms", "samostoyatelen-check-in", "kontrol-na-dostapa-do-dvora-qrgobox", "sistemni-integratsii-i-api", "kontrol-na-dostapa"],
  fr: ["check-in-numerique", "gestion-des-quais", "chat-notifications-en-temps-reel", "categories-departements-camions", "rapports-analyses", "application-android-ios", "multi-langue", "white-label", "cloud-sans-equipement", "instructions-guidage-chauffeurs", "check-in-anticipe-planification", "detection-automatique-de-localisation", "systeme-de-gestion-de-cour-yms", "check-in-autonome-chauffeur", "controle-d-acces-a-la-cour-qrgobox", "integrations-de-systemes-api", "controle-d-acces"],
  nl: ["digitale-check-in", "dockbeheer", "realtime-chat-notificaties", "afdelingen-vrachtwagentypes", "rapporten-analyses", "android-ios-app", "meertalig", "white-label", "cloud-geen-apparatuur", "chauffeursinstructies-begeleiding", "vroege-check-in-planning", "automatische-locatiedetectie", "yardmanagementsysteem-yms", "zelf-inchecken-aan-de-balie", "toegangscontrole-terrein-qrgobox", "systeemintegraties-api", "toegangsbeheer"],
};

describe("feature page URLs", () => {
  it.each(locales)("%s: every feature keeps its pinned slug", (locale) => {
    expect(features.map((f) => featureSlug(f.id, locale))).toEqual(features.map((f) => LIVE[locale][f.id - 1]));
  });

  it("every retired slug redirects to a live one, and no live slug is retired", async () => {
    const rules = await nextConfig.redirects!();
    for (const locale of locales) {
      const prefix = `/${locale}/${featuresSegment[locale]}/`;
      const renames = rules.filter((r) => r.source.startsWith(prefix) && !r.source.includes(":"));
      for (const r of renames) {
        const from = r.source.slice(prefix.length);
        const to = r.destination.slice(prefix.length);
        expect(LIVE[locale], `${r.source} must not be live`).not.toContain(from);
        expect(LIVE[locale], `${r.source} -> ${r.destination}`).toContain(to);
      }
    }
  });

  it("a localized features index rewrites to the folder itself, never to a trailing slash", async () => {
    const rewrites = await nextConfig.rewrites!();
    const list = Array.isArray(rewrites)
      ? rewrites
      : [...(rewrites.beforeFiles ?? []), ...(rewrites.afterFiles ?? []), ...(rewrites.fallback ?? [])];
    for (const locale of locales) {
      const seg = featuresSegment[locale];
      if (seg === "features") continue;
      // The first rule that can see /{locale}/{seg} must be the exact one: a `:slug*`
      // rule before it would send the index to /{locale}/features/ (RSC 404 on Vercel).
      const first = list.find((r) => new RegExp(`^/${locale}/${seg}(/|$)`).test(r.source));
      expect(first).toEqual({ source: `/${locale}/${seg}`, destination: `/${locale}/features` });
    }
    expect(list.filter((r) => r.source.includes(":slug*"))).toEqual([]);
  });

  it("the 2026-11-08 spelling fixes left redirects behind", async () => {
    const rules = await nextConfig.redirects!();
    const has = (source: string, destination: string) =>
      rules.some((r) => r.source === source && r.destination === destination && r.permanent);
    expect(has("/bg/funktsii/chat-i-uvedomlenija-v-realno-vreme", "/bg/funktsii/chat-i-izvestiya-v-realno-vreme")).toBe(true);
    expect(has("/hu/funkciok/automatikus-helyzeterkenites", "/hu/funkciok/automatikus-helyfelismeres")).toBe(true);
  });
});
