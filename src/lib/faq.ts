import { type Translations } from "@/lib/i18n/translations";

// Single source for the FAQ Q&A pairs, so the visible accordion (FAQSection) and
// the FAQPage JSON-LD stay in sync. Empty entries are skipped.
export function faqEntries(t: Translations): { q: string; a: string }[] {
  const f = t.faq as unknown as Record<string, string>;
  const entries: { q: string; a: string }[] = [];
  for (let i = 1; i <= 15; i++) {
    const q = f[`q${i}`];
    const a = f[`a${i}`];
    if (q && a) entries.push({ q, a });
  }
  return entries;
}
