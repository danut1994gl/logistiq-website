import { describe, it, expect } from "vitest";
import { translations } from "@/lib/i18n/translations";
import { locales, type Locale } from "@/lib/i18n/config";

// Privacy §7 said "After retention periods expire, data is automatically deleted or
// anonymized." Nothing deletes check-ins after 2 years, attachments after 1 year or the
// technical data after 6 months. Since 2026-11-26 the note says the periods are the longest
// we intend to keep each kind of data, and names what the platform deletes by itself today,
// each read at Logistiq origin/main 692b030b8: the trash, 30 days after deletion (migrations
// 058 and 306, pg_cron daily); device logs, trace after 7 days and errors after 30 (migration
// 179, purge_device_logs); API request logs after 30 days (lib/api-logger.ts), both from the
// daily app/api/cron/purge-device-logs job.
const AUTOMATICALLY: Record<Locale, RegExp> = {
  ro: /automat/i,
  en: /automatically/i,
  de: /automatisch/i,
  pl: /automatyczn/i,
  hu: /automatikus/i,
  bg: /автоматичн/i,
  fr: /automatiquement/i,
  nl: /automatisch/i,
};

describe("privacy policy, section 7", () => {
  it.each(locales)("%s claims no automatic deletion beyond what the platform does", (locale) => {
    const note = translations[locale].privacy.retention.note;
    const [firstSentence] = note.split(/\.\s/);
    expect(firstSentence).not.toMatch(AUTOMATICALLY[locale]);
    expect(note).toMatch(/\b30\b/);
    expect(note).toMatch(/\b7\b/);
    expect(note.match(AUTOMATICALLY[locale])?.[0]).toBeUndefined();
  });
});
