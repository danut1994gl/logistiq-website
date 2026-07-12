import { describe, expect, it } from "vitest";
import { translations } from "@/lib/i18n/translations";
import { locales } from "@/lib/i18n/config";

const CHECKIN_JOURNEY_KEYS = [
  "title",
  "subtitle",
  "stepLabel",
  "step1Title",
  "step1Desc",
  "step2Title",
  "step2Desc",
  "step3Title",
  "step3Desc",
  "dockBadge",
] as const;

describe("checkinJourney translations", () => {
  it("has every key, non-empty, in every locale", () => {
    for (const locale of locales) {
      const block = (translations[locale] as Record<string, unknown>)
        .checkinJourney as Record<string, string> | undefined;
      expect(block, `${locale}: checkinJourney block missing`).toBeTruthy();
      for (const key of CHECKIN_JOURNEY_KEYS) {
        expect(
          block?.[key]?.trim(),
          `${locale}: checkinJourney.${key} missing or empty`,
        ).toBeTruthy();
      }
    }
  });
});
