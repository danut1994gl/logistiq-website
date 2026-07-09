import type { ReactNode } from "react";
import { Breadcrumbs, type Crumb } from "@/components/site/Breadcrumbs";

// Consistent interior-page hero: full page width, one controlled top offset that
// clears the fixed nav (no double spacing), a smooth staggered entrance, and an
// optional right-hand visual (e.g. a large feature icon) for a two-column layout.
export function PageHero({
  breadcrumb,
  eyebrow,
  title,
  description,
  actions,
  visual,
}: {
  breadcrumb: Crumb[];
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  visual?: ReactNode;
}) {
  const twoCol = Boolean(visual);
  return (
    <section className="hero-gradient relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-[calc(var(--nav-h)+2.5rem)] md:pt-[calc(var(--nav-h)+3.5rem)] pb-14 lg:pb-20 relative z-10">
        <Breadcrumbs items={breadcrumb} className="animate-fade-in-up mb-8" />

        <div className={twoCol ? "grid lg:grid-cols-12 gap-10 lg:gap-8 items-center" : ""}>
          <div className={twoCol ? "lg:col-span-7" : "max-w-3xl"}>
            {eyebrow && (
              <p className="animate-fade-in-up stagger-1 text-sm font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-4">
                {eyebrow}
              </p>
            )}
            <h1 className="animate-fade-in-up stagger-1 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 dark:text-white text-balance">
              {title}
            </h1>
            {description && (
              <p className="animate-fade-in-up stagger-2 mt-6 text-lg lg:text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
                {description}
              </p>
            )}
            {actions && <div className="animate-fade-in-up stagger-3 mt-8 flex flex-wrap gap-4">{actions}</div>}
          </div>

          {visual && (
            <div className="animate-fade-in-up stagger-2 lg:col-span-5 flex justify-center lg:justify-end">
              {visual}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
