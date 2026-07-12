import type { Translations } from "@/lib/i18n/translations";
import { TruckIcon, QrCodeIcon, GateIcon } from "@/components/icons";
import { CheckinJourneyScene } from "./CheckinJourneyScene";

// "How digital check-in works" — animated scene + 3 step cards, active card
// glow synced to the scene via the shared 13s cj-* CSS loop. Server Component.
export function CheckinJourneySection({ t }: { t: Translations }) {
  const c = t.checkinJourney;
  const steps = [
    { icon: TruckIcon, title: c.step1Title, desc: c.step1Desc },
    { icon: QrCodeIcon, title: c.step2Title, desc: c.step2Desc },
    { icon: GateIcon, title: c.step3Title, desc: c.step3Desc },
  ];

  return (
    <section aria-labelledby="cj-title" className="py-16 lg:py-24 bg-slate-50 dark:bg-slate-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 id="cj-title" className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            {c.title}
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300">{c.subtitle}</p>
        </div>

        <div className="rounded-3xl overflow-hidden border border-slate-700/60 bg-gradient-to-br from-slate-800 to-slate-900 shadow-2xl">
          <CheckinJourneyScene dockLabel={c.dockBadge} />
        </div>

        <ol role="list" className="grid gap-6 sm:grid-cols-3 mt-10 list-none">
          {steps.map((step, i) => {
            const n = `0${i + 1}`;
            return (
              <li key={i} className="relative">
                <div className="relative h-full bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
                  <span
                    aria-hidden="true"
                    className={`cj-glow-${i + 1} pointer-events-none absolute inset-0 rounded-2xl ring-2 ring-blue-500/80 shadow-[0_0_28px_rgba(37,99,235,0.35)] opacity-0`}
                  />
                  <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold">{n}</span>
                  </div>
                  <div className="w-14 h-14 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-5 mt-4 text-blue-600 dark:text-blue-400">
                    <step.icon />
                  </div>
                  <div className="text-xs font-semibold tracking-widest uppercase text-blue-600 dark:text-blue-400 mb-2">
                    {c.stepLabel} {n}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{step.title}</h3>
                  <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
