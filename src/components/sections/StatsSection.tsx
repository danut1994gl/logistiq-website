"use client";

import { useEffect } from "react";
import { type Translations } from "@/lib/i18n/translations";
import { QrCodeIcon, TruckIcon, UsersIcon, ChartIcon } from "@/components/icons";
import { useCountUp } from "@/hooks/useCountUp";
import { useInView } from "@/hooks/useInView";

// The platform's real figures, for a stats band under the home hero. Logistiq has none to
// show yet, so no page renders StatsSection (since 2026-11-24). Until then it generated its
// figures from the date, with a seeded random number (about 1,800 drivers and 25,000
// check-ins a month, growing by the day since June 2024), and showed them as the platform's
// own. It now draws only the figures it is given; render it again only with real ones.
export type StatsFigures = {
  drivers: number;
  warehouses: number;
  checkinsPerMonth: number;
  waitReductionPercent: number;
};

export function StatsSection({ t, figures }: { t: Translations; figures: StatsFigures }) {
  const { ref, isInView } = useInView(0.3);

  // Every figure is counted up from 0 once the band scrolls into view, so the server HTML
  // and the first client render are the same on every day (StatsSection.test.tsx): a
  // mismatch makes React throw the server-rendered page away and paint it again (#418).
  const drivers = useCountUp(figures.drivers, 2000, false);
  const warehouses = useCountUp(figures.warehouses, 2000, false);
  const checkins = useCountUp(figures.checkinsPerMonth, 2500, false);
  const reduction = useCountUp(figures.waitReductionPercent, 2000, false);

  const { startCounting: startDrivers } = drivers;
  const { startCounting: startWarehouses } = warehouses;
  const { startCounting: startCheckins } = checkins;
  const { startCounting: startReduction } = reduction;

  useEffect(() => {
    if (isInView) {
      startDrivers();
      startWarehouses();
      startCheckins();
      startReduction();
    }
  }, [isInView, startDrivers, startWarehouses, startCheckins, startReduction]);

  const stats = [
    { value: `${drivers.count.toLocaleString()}+`, label: t.stats.drivers, icon: TruckIcon },
    { value: `${warehouses.count}+`, label: t.stats.warehouses, icon: UsersIcon },
    { value: `${(checkins.count / 1000).toFixed(0)}K+`, label: t.stats.checkins, icon: QrCodeIcon },
    { value: `${reduction.count}%`, label: t.stats.timeReduction, icon: ChartIcon },
  ];

  return (
    <section ref={ref} className="py-16 bg-gradient-to-r from-blue-600 to-blue-700 relative overflow-hidden">
      <div className="absolute inset-0 dots-pattern opacity-10" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <div key={i} className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/10 mb-4">
                <stat.icon />
              </div>
              <div className="text-3xl sm:text-4xl font-bold text-white mb-2 counter">
                {stat.value}
              </div>
              <p className="text-blue-100 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

