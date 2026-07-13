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
  "scanSignLine1",
  "scanSignLine2",
  "fieldTruck",
  "submitLabel",
] as const;

const CHECKIN_CONTENT_KEYS = [
  "problemEyebrow",
  "problemTitle",
  "problemP1",
  "problemP2",
  "compareOldTitle",
  "compareOld1",
  "compareOld2",
  "compareOld3",
  "compareOld4",
  "compareNewTitle",
  "compareNew1",
  "compareNew2",
  "compareNew3",
  "compareNew4",
  "benefitsTitle",
  "benefitsSubtitle",
  "benefitOperatorTitle",
  "benefitOperator1",
  "benefitOperator2",
  "benefitOperator3",
  "benefitDriverTitle",
  "benefitDriver1",
  "benefitDriver2",
  "benefitDriver3",
  "benefitManagerTitle",
  "benefitManager1",
  "benefitManager2",
  "benefitManager3",
  "benefitNewTitle",
  "benefitNew1",
  "benefitNew2",
  "benefitNew3",
  "faqTitle",
  "faq1Q",
  "faq1A",
  "faq2Q",
  "faq2A",
  "faq3Q",
  "faq3A",
  "faq4Q",
  "faq4A",
] as const;

function expectBlockComplete(name: string, keys: readonly string[]) {
  for (const locale of locales) {
    const block = (translations[locale] as Record<string, unknown>)[name] as
      | Record<string, string>
      | undefined;
    expect(block, `${locale}: ${name} block missing`).toBeTruthy();
    for (const key of keys) {
      expect(block?.[key]?.trim(), `${locale}: ${name}.${key} missing or empty`).toBeTruthy();
    }
  }
}

describe("checkinJourney translations", () => {
  it("has every key, non-empty, in every locale", () => {
    expectBlockComplete("checkinJourney", CHECKIN_JOURNEY_KEYS);
  });
});

describe("checkinContent translations", () => {
  it("has every key, non-empty, in every locale", () => {
    expectBlockComplete("checkinContent", CHECKIN_CONTENT_KEYS);
  });
});

// The feature-showcase page blocks (dock/chat/yms) — derive the key set from
// the `ro` block (the structural source of truth) so the test stays in step
// with the copy without a hand-maintained list, and assert every key is
// present and non-empty in all 8 locales.
describe.each(["dockPage", "chatPage", "ymsPage"])("%s translations", (block) => {
  it("has every key, non-empty, in every locale", () => {
    const keys = Object.keys((translations.ro as Record<string, Record<string, string>>)[block]);
    expect(keys.length).toBeGreaterThan(0);
    expectBlockComplete(block, keys);
  });
});
