"use client";

import { useEffect } from "react";
import { type Translations } from "@/lib/i18n/translations";
import { QrCodeIcon, TruckIcon, UsersIcon, ChartIcon } from "@/components/icons";
import { useCountUp } from "@/hooks/useCountUp";
import { useInView } from "@/hooks/useInView";

export function StatsSection({ t }: { t: Translations }) {
  const { ref, isInView } = useInView(0.3);

  // Deterministic seeded random (mulberry32-based, single iteration)
  function seededRandom(seed: number): number {
    let t = (seed + 0x6d2b79f5) | 0;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= (t + Math.imul(t ^ (t >>> 7), t | 61)) | 0;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  // Shared algorithm — must be identical in website and dashboard
  function getPlatformStats() {
    const today = new Date();
    const baseDate = new Date(2024, 5, 1); // June 1, 2024 — platform reference
    const daysSinceBase = Math.floor(
      (today.getTime() - baseDate.getTime()) / 86400000
    );
    const dayOfWeek = today.getDay(); // 0=Sun, 6=Sat
    const month = today.getMonth(); // 0-11

    // Knuth multiplicative hash for better distribution across days
    const hash = Math.imul(daysSinceBase, 2654435761);
    const r1 = seededRandom(hash);
    const r2 = seededRandom(hash + 7919);
    const r3 = seededRandom(hash + 104729);
    const r4 = seededRandom(hash + 224737);
    const r5 = seededRandom(hash + 350377);

    // Seasonality: logistics busier in Q1/Q4, slower in summer
    const seasonFactor = [1.06, 1.03, 1.0, 0.97, 0.94, 0.89, 0.87, 0.91, 0.96, 1.02, 1.07, 1.1][month];

    // Weekday factor (Mon-Fri more active, weekends quieter)
    const weekdayFactor = [0.91, 1.04, 1.06, 1.05, 1.03, 1.0, 0.88][dayOfWeek];

    // ~7% of days get a notable spike (busy day, new client onboarding, etc.)
    const spikeFactor = r5 > 0.93 ? 1.12 + r1 * 0.18 : 1.0;

    // === ACTIVE DRIVERS ===
    const driversBase = 1800 + daysSinceBase * 1.0;
    const driversNoise = (r1 - 0.5) * 160;
    const drivers = Math.max(
      1500,
      Math.round((driversBase + driversNoise) * weekdayFactor * spikeFactor)
    );

    // === CONNECTED WAREHOUSES ===
    const whGrowth = Math.floor(daysSinceBase / 50);
    const whNoise = Math.floor(r2 * 3);
    const warehouses = Math.max(30, 35 + whGrowth + whNoise);

    // === CHECK-INS PER MONTH ===
    const checkinsBase = 25000 + daysSinceBase * 18;
    const checkinsNoise = (r3 - 0.5) * 5000;
    const checkins = Math.max(
      20000,
      Math.round((checkinsBase + checkinsNoise) * seasonFactor * spikeFactor)
    );

    // === WAIT TIME REDUCTION ===
    const reductionBase = 8 + daysSinceBase * 0.005;
    const reductionNoise = (r4 - 0.5) * 2.5;
    const reduction = Math.round(
      Math.min(20, Math.max(5, reductionBase + reductionNoise))
    );

    return { drivers, warehouses, checkins, reduction };
  }

  const dailyStats = getPlatformStats();
  const drivers = useCountUp(dailyStats.drivers, 2000, false);
  const warehouses = useCountUp(dailyStats.warehouses, 2000, false);
  const checkins = useCountUp(dailyStats.checkins, 2500, false);

  const { startCounting: startDrivers } = drivers;
  const { startCounting: startWarehouses } = warehouses;
  const { startCounting: startCheckins } = checkins;

  useEffect(() => {
    if (isInView) {
      startDrivers();
      startWarehouses();
      startCheckins();
    }
  }, [isInView, startDrivers, startWarehouses, startCheckins]);

  const stats = [
    { value: `${drivers.count.toLocaleString()}+`, label: t.stats.drivers, icon: TruckIcon },
    { value: `${warehouses.count}+`, label: t.stats.warehouses, icon: UsersIcon },
    { value: `${(checkins.count / 1000).toFixed(0)}K+`, label: t.stats.checkins, icon: QrCodeIcon },
    { value: `${dailyStats.reduction}%`, label: t.stats.timeReduction, icon: ChartIcon },
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

