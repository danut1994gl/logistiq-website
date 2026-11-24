import { describe, it, expect } from "vitest";
import { translations } from "@/lib/i18n/translations";

// "Does it work offline?" (faq.q4). The QRGo Driver app has no offline queue: a check-in is
// sent when the driver submits it, and one that did not get through is sent again by the
// driver, as the same attempt, which qrgo.ro's route replays rather than stores twice
// (Logistiq apps/driver-mobile/lib/features/checkin/widgets/checkin_form.dart). It keeps
// the details the driver saved for the next form. Until 2026-11-24 the answer said, in all
// 8 languages, that the app saves data locally and syncs it automatically once the
// connection is back.
const SYNC = /sincroniz|sync|synchronis|zsynchroniz|szinkroniz|синхрониз/i;

describe("FAQ: offline", () => {
  it("promises no automatic sync after a lost connection", () => {
    for (const [locale, copy] of Object.entries(translations)) {
      expect(copy.faq.a4.match(SYNC)?.[0], locale).toBeUndefined();
    }
    expect(translations.en.faq.a4).toMatch(/sent again safely: it is never recorded twice/);
  });
});
