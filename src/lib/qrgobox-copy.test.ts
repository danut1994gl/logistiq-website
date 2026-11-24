import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { translations } from "@/lib/i18n/translations";

// QRGoBox, the box that opens the barrier, is in progress (owner, 2026-11-24; the client deck
// says „În lucru” / "In progress"). The command to the barrier will go out only over a secure
// (TLS) connection, which is being prepared, and until then every valid scan answers 503
// (Logistiq apps/dashboard/app/api/gate/validate/route.ts). Built today: the gate scanner device
// validates the check-in, and the gate log keeps every scan with its outcome. Until 2026-11-24,
// in all 8 languages, the site described QRGoBox as working: a relay pulsing the barrier open,
// an HTTPS heartbeat every 30 s, a LAN admin page as the fallback, and in the digital check-in
// page's journey "a scan opens the barrier". The box's design is being redone, so no detail of
// the old one may return.

// "in progress" in each language, as the copy says it.
const IN_PROGRESS: Record<string, RegExp> = {
  ro: /în lucru/i,
  en: /in progress/i,
  de: /in Arbeit/i,
  pl: /w przygotowaniu/i,
  hu: /fejlesztés alatt/i,
  bg: /в процес на разработка/i,
  fr: /en cours de développement/i,
  nl: /in ontwikkeling/i,
};

// The box's own admin page, the fallback each language's copy named until 2026-11-24.
const ADMIN_PAGE: Record<string, RegExp> = {
  ro: /pagina de administrare/i,
  en: /admin page/i,
  de: /Admin-Seite/i,
  pl: /stronie administracyjnej/i,
  hu: /admin oldal/i,
  bg: /административна страница/i,
  fr: /page d'administration/i,
  nl: /beheerpagina/i,
};

// "barrier" in each language.
const BARRIER: Record<string, RegExp> = {
  ro: /barier/i,
  en: /barrier/i,
  de: /Schranke/i,
  pl: /szlaban/i,
  hu: /sorompó/i,
  bg: /бариер/i,
  fr: /barrière/i,
  nl: /slagboom/i,
};

// Details of the old box design: the heartbeat (hu "életjel"), the MQTT session, the ESP32 and
// the device API's endpoints.
const OLD_DESIGN = /heartbeat|életjel|MQTT|ESP32|\/api\/device/i;

const GATE_PAGE = fileURLToPath(new URL("../components/features/GateAccessShowcase.tsx", import.meta.url));

describe("QRGoBox copy: in progress", () => {
  it("knows its words in every language", () => {
    for (const words of [IN_PROGRESS, ADMIN_PAGE, BARRIER]) {
      expect(Object.keys(words).sort()).toEqual(Object.keys(translations).sort());
    }
  });

  it("the QRGoBox page and its feature card say it is in progress", () => {
    for (const [locale, copy] of Object.entries(translations)) {
      const f = copy.f15Page;
      for (const text of [f.title, f.subtitle, f.coTitle, copy.features.feature15Desc]) {
        expect(text, locale).toMatch(IN_PROGRESS[locale]);
      }
    }
  });

  it("every other line about opening the barrier says it is in progress", () => {
    for (const [locale, copy] of Object.entries(translations)) {
      for (const text of [
        copy.checkinJourney.step3Desc,
        copy.f9Page.b3c,
        copy.f9Page.a1,
        copy.f16Page.new3,
        copy.f16Page.probP2,
        copy.f17Page.s4d,
      ]) {
        expect(text, locale).toMatch(IN_PROGRESS[locale]);
      }
    }
  });

  it("the digital check-in journey no longer ends in a barrier lift", () => {
    for (const [locale, copy] of Object.entries(translations)) {
      expect(copy.checkinJourney.subtitle, locale).not.toMatch(BARRIER[locale]);
    }
  });

  it("no language promises a detail of the old box design or a LAN admin page", () => {
    for (const [locale, copy] of Object.entries(translations)) {
      const text = JSON.stringify(copy);
      expect(text.match(OLD_DESIGN)?.[0], locale).toBeUndefined();
      expect(text.match(ADMIN_PAGE[locale])?.[0], locale).toBeUndefined();
    }
  });

  it("the QRGoBox page draws no network diagram of the old design", () => {
    expect(readFileSync(GATE_PAGE, "utf8")).not.toMatch(/FeatureSplitSection|GateNetworkArt/);
  });
});
