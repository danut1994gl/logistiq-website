import type { FC, ReactNode } from "react";
import { ShowcaseSteps } from "./ShowcaseSteps";

// Shared shell for every feature showcase: localized heading, a 3:1 animated
// stage panel (the page's scene is passed as children), and 3 step cards
// whose active glow (class `${glowPrefix}glow-{n}`) is synced to the scene
// and which seek the timeline on click. Keeps all showcases visually
// identical; only the stage content and timeline differ per feature.
export function ShowcaseStage({
  title,
  subtitle,
  stepLabel,
  steps,
  glowPrefix,
  sceneStartsMs,
  children,
}: {
  title: string;
  subtitle: string;
  stepLabel: string;
  steps: { icon: FC; title: string; desc: string }[];
  glowPrefix: string;
  sceneStartsMs: number[];
  children: ReactNode;
}) {
  const cards = steps.map((step, i) => {
    const n = `0${i + 1}`;
    return (
      <div
        key={i}
        className="relative h-full bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700"
      >
        <span
          aria-hidden="true"
          className={`${glowPrefix}glow-${i + 1} pointer-events-none absolute inset-0 rounded-2xl ring-2 ring-blue-500/80 shadow-[0_0_28px_rgba(37,99,235,0.35)] opacity-0`}
        />
        <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
          <span className="text-white font-bold">{n}</span>
        </div>
        <div className="w-14 h-14 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-5 mt-4 text-blue-600 dark:text-blue-400">
          <step.icon />
        </div>
        <div className="text-xs font-semibold tracking-widest uppercase text-blue-600 dark:text-blue-400 mb-2">
          {stepLabel} {n}
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{step.title}</h3>
        <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{step.desc}</p>
      </div>
    );
  });

  return (
    <section aria-labelledby="showcase-title" className="py-16 lg:py-24 bg-slate-50 dark:bg-slate-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 id="showcase-title" className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            {title}
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300">{subtitle}</p>
        </div>
        <div className="relative w-full aspect-[3/1] min-h-[260px] rounded-3xl overflow-hidden border border-slate-700/60 bg-gradient-to-br from-slate-800 to-slate-900 shadow-2xl">
          {children}
        </div>
        <ShowcaseSteps
          cards={cards}
          labels={steps.map((s) => s.title)}
          sceneStartsMs={sceneStartsMs}
          prefix={glowPrefix}
        />
      </div>
    </section>
  );
}
