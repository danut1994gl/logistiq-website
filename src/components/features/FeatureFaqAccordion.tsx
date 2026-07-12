"use client";

import { useState } from "react";
import { ChevronDownIcon } from "@/components/icons";

// Generic accordion for feature-page FAQs (same interaction/ARIA pattern as
// the homepage FAQSection, but data-driven via props).
export function FeatureFaqAccordion({ items }: { items: { q: string; a: string }[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-4">
      {items.map((item, i) => {
        const open = openIndex === i;
        return (
          <div key={i} className="bg-slate-50 dark:bg-slate-700/50 rounded-2xl overflow-hidden transition-all duration-200">
            <button
              id={`feature-faq-btn-${i}`}
              onClick={() => setOpenIndex(open ? null : i)}
              aria-expanded={open}
              aria-controls={`feature-faq-panel-${i}`}
              className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <span className="font-medium text-slate-900 dark:text-white pr-4">{item.q}</span>
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
              id={`feature-faq-panel-${i}`}
              role="region"
              aria-labelledby={`feature-faq-btn-${i}`}
              className={`grid transition-[grid-template-rows] duration-200 ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
            >
              <div className="overflow-hidden">
                <p className="px-6 pb-5 text-slate-600 dark:text-slate-300 leading-relaxed">{item.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
