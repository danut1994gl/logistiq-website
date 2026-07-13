"use client";

import { useState } from "react";
import { ChevronDownIcon } from "@/components/icons";

// Generic accordion for feature-page FAQs (same interaction/ARIA pattern as
// the homepage FAQSection, data-driven via props). First item starts open so
// the section reads as content, not an empty list of bars.
export function FeatureFaqAccordion({ items }: { items: { q: string; a: string }[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="space-y-4">
      {items.map((item, i) => {
        const open = openIndex === i;
        return (
          <div
            key={i}
            className={`rounded-2xl border overflow-hidden transition-all duration-200 ${
              open
                ? "border-blue-500/60 bg-white dark:bg-slate-800 shadow-lg shadow-blue-500/10"
                : "border-slate-200 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-800/50 hover:border-slate-300 dark:hover:border-slate-600"
            }`}
          >
            <button
              id={`feature-faq-btn-${i}`}
              onClick={() => setOpenIndex(open ? null : i)}
              aria-expanded={open}
              aria-controls={`feature-faq-panel-${i}`}
              className="w-full px-5 sm:px-6 py-5 flex items-center gap-4 text-left"
            >
              <span
                className={`w-9 h-9 shrink-0 rounded-xl flex items-center justify-center text-sm font-bold transition-colors ${
                  open
                    ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-md"
                    : "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400"
                }`}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className={`flex-1 font-semibold ${open ? "text-blue-700 dark:text-blue-300" : "text-slate-900 dark:text-white"}`}>
                {item.q}
              </span>
              <span
                className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                  open
                    ? "rotate-180 bg-blue-600 text-white"
                    : "bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400"
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
                <div className="mx-5 sm:mx-6 border-t border-slate-200 dark:border-slate-700/70" />
                <p className="px-5 sm:px-6 sm:pl-[76px] py-5 text-slate-600 dark:text-slate-300 leading-relaxed">{item.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
