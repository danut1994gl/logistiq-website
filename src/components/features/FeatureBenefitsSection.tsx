import type { FC } from "react";
import { CheckIcon } from "@/components/icons";

// Generic benefits-by-role grid (3 persona cards). Reusable across feature
// pages (props = localized strings + icons only). Server Component.
export function FeatureBenefitsSection({
  title,
  subtitle,
  groups,
}: {
  title: string;
  subtitle: string;
  groups: { icon: FC; title: string; items: string[] }[];
}) {
  return (
    <section aria-labelledby="feature-benefits-title" className="py-16 lg:py-24 bg-slate-50 dark:bg-slate-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 id="feature-benefits-title" className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            {title}
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300">{subtitle}</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {groups.map((group, i) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-lg"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
                <group.icon />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-4">{group.title}</h3>
              <ul className="space-y-3">
                {group.items.map((item, j) => (
                  <li key={j} className="flex gap-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    <span className="mt-0.5 w-5 h-5 shrink-0 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500 flex items-center justify-center [&_svg]:w-3 [&_svg]:h-3">
                      <CheckIcon />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
