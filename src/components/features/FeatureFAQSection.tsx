import type { Locale } from "@/lib/i18n/config";
import { JsonLd, faqPageSchema } from "@/lib/seo/jsonld";
import { FeatureFaqAccordion } from "./FeatureFaqAccordion";

// Generic feature-page FAQ: accordion + FAQPage JSON-LD (emitted only on
// pages that render this section — it never leaks site-wide). Server
// Component; the accordion is the client leaf.
export function FeatureFAQSection({
  idPrefix = "feature",
  title,
  items,
  locale,
  path,
  tinted = false,
}: {
  idPrefix?: string;
  title: string;
  items: { q: string; a: string }[];
  locale: Locale;
  path: string;
  tinted?: boolean;
}) {
  const hid = `${idPrefix}-faq-title`;
  const schema = faqPageSchema({ locale, path, entries: items });
  return (
    <section aria-labelledby={hid} className={`py-16 lg:py-24 ${tinted ? "bg-slate-50 dark:bg-slate-900/50" : ""}`}>
      {schema ? <JsonLd data={schema} /> : null}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 id={hid} className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white text-center mb-12">
          {title}
        </h2>
        <FeatureFaqAccordion items={items} idPrefix={idPrefix} />
      </div>
    </section>
  );
}
