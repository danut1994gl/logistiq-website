"use client";

import { useState } from "react";
import { type Translations } from "@/lib/i18n/translations";
import { ChevronDownIcon } from "@/components/icons";
import { faqEntries } from "@/lib/faq";

export function FAQSection({ t }: { t: Translations }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const faqs = faqEntries(t);

  return (
    <section id="faq" className="py-20 lg:py-32 bg-white dark:bg-slate-800 relative overflow-hidden">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-6">
            {t.faq.title}
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300">{t.faq.subtitle}</p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const open = openIndex === index;
            return (
              <div
                key={index}
                className="bg-slate-50 dark:bg-slate-700/50 rounded-2xl overflow-hidden transition-all duration-200"
              >
                <button
                  id={`faq-btn-${index}`}
                  onClick={() => setOpenIndex(open ? null : index)}
                  aria-expanded={open}
                  aria-controls={`faq-panel-${index}`}
                  className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <span className="font-medium text-slate-900 dark:text-white pr-4">{faq.q}</span>
                  <span
                    className={`flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 transition-transform duration-200 ${
                      open ? "rotate-180" : ""
                    }`}
                  >
                    <ChevronDownIcon />
                  </span>
                </button>
                {/* grid-rows 0fr -> 1fr animates to ANY content height (no max-h clip) */}
                <div
                  id={`faq-panel-${index}`}
                  role="region"
                  aria-labelledby={`faq-btn-${index}`}
                  className={`grid transition-all duration-200 ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
                >
                  <div className="overflow-hidden">
                    <div className="px-6 pb-5 text-slate-600 dark:text-slate-300 leading-relaxed">{faq.a}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
