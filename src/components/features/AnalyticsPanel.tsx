"use client";

import { useEffect, useRef, useState } from "react";
import type { Translations } from "@/lib/i18n/translations";

// Faithful live analytics panel (feature 5). Mirrors the real dashboard: KPI
// tiles (check-ins, avg wait, avg completion, dock utilisation with the
// >85 red / >60 amber / else emerald threshold gauge), a throughput bar chart,
// a loading/unloading/both type-distribution donut, and a status funnel. Cycles
// Today / 7 days / 30 days (a real preset) so the numbers + charts re-animate.
// Client player: pauses off-screen, static on reduced-motion. aria-hidden.

// product's canonical chart palette (useChartTheme.ts)
const C = { loading: "#3b82f6", unloading: "#f97316", both: "#8b5cf6", ok: "#22c55e", warn: "#f59e0b", crit: "#ef4444", cyan: "#22d3ee" };

type Period = {
  key: string;
  checkins: number; wait: number; completion: number; util: number;
  bars: number[]; // throughput
  types: [number, number, number]; // loading, unloading, both
  funnel: number[]; // waiting, confirmed, assigned, in_progress, completed (%)
};

const utilColor = (u: number) => (u > 85 ? C.crit : u > 60 ? C.warn : C.ok);
const fmtMin = (m: number) => `${m}m`;

export function AnalyticsPanel({ t }: { t: Translations }) {
  const a = t.f5Page;
  const PERIODS: Period[] = [
    { key: a.pToday, checkins: 47, wait: 11, completion: 36, util: 72, bars: [3, 5, 4, 7, 9, 8, 11, 9, 6, 5, 4, 3], types: [22, 18, 7], funnel: [100, 92, 74, 40, 32] },
    { key: a.p7d, checkins: 312, wait: 14, completion: 41, util: 68, bars: [38, 52, 47, 61, 55, 33, 26], types: [140, 122, 50], funnel: [100, 94, 80, 22, 71] },
    { key: a.p30d, checkins: 1284, wait: 13, completion: 39, util: 76, bars: [42, 55, 61, 48, 66, 72, 58, 63, 70, 51, 44, 68, 74, 59, 62], types: [560, 498, 226], funnel: [100, 95, 83, 12, 79] },
  ];
  const [pi, setPi] = useState(0);
  const [anim, setAnim] = useState(0); // 0..1 progress for count-up + chart grow
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setAnim(1); return; }
    let cancelled = false, visible = true;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0.2 });
    if (rootRef.current) io.observe(rootRef.current);
    const sleep = (ms: number) => new Promise<void>((res) => { const s = Date.now(); const tick = () => { if (cancelled) return res(); if (visible && Date.now() - s >= ms) return res(); setTimeout(tick, visible ? 60 : 140); }; setTimeout(tick, 60); });
    const tween = async (dur: number) => { const start = Date.now(); while (!cancelled) { const p = Math.min(1, (Date.now() - start) / dur); setAnim(visible ? p : 0.0001); if (p >= 1) break; await sleep(40); } };
    (async () => {
      let idx = 0;
      while (!cancelled) {
        setPi(idx); setAnim(0); await sleep(60);
        await tween(900);
        await sleep(3200);
        idx = (idx + 1) % PERIODS.length;
      }
    })();
    return () => { cancelled = true; io.disconnect(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const p = PERIODS[pi];
  const val = (n: number) => Math.round(n * anim);
  const kpis = [
    { label: a.kCheckins, value: val(p.checkins).toLocaleString(), col: "text-cyan-300 bg-cyan-500/15", icon: <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2M9 12h6M9 16h6" /> },
    { label: a.kWait, value: fmtMin(val(p.wait)), col: "text-amber-300 bg-amber-500/15", icon: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></> },
    { label: a.kCompletion, value: fmtMin(val(p.completion)), col: "text-emerald-300 bg-emerald-500/15", icon: <path d="M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /> },
    { label: a.kUtil, value: `${val(p.util)}%`, col: "text-indigo-300 bg-indigo-500/15", gauge: p.util, icon: <path d="M3 12a9 9 0 1 0 18 0M12 12l4-4" /> },
  ];

  const maxBar = Math.max(...p.bars);
  const typeTotal = p.types[0] + p.types[1] + p.types[2] || 1;
  const donut = [{ v: p.types[0], c: C.loading, l: a.tLoading }, { v: p.types[1], c: C.unloading, l: a.tUnloading }, { v: p.types[2], c: C.both, l: a.tBoth }];
  const R = 15.9155, CIRC = 2 * Math.PI * R;
  let acc = 0;
  const funnelRows = [a.sWaiting, a.sConfirmed, a.sAssigned, a.sProgress, a.sCompleted];

  return (
    <div ref={rootRef} className="@container absolute inset-0 p-[2cqw] text-slate-200 select-none" aria-hidden="true">
      <div className="w-full h-full rounded-[1.4cqw] bg-slate-900/70 border border-slate-700/70 flex flex-col overflow-hidden">
        {/* header */}
        <div className="flex items-center gap-[1.2cqw] px-[1.8cqw] py-[1.1cqw] border-b border-slate-700/70 bg-slate-800/60 shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="" className="w-[2.6cqw] h-[2.6cqw] rounded-[0.6cqw]" />
          <span className="font-bold text-white text-[2cqw]">{a.uiAnalytics}</span>
          <span className="ml-auto inline-flex rounded-full bg-slate-800 border border-slate-700 p-[0.3cqw] gap-[0.3cqw]">
            {PERIODS.map((pp, i) => (
              <span key={i} className={`rounded-full px-[1.3cqw] py-[0.4cqw] text-[1.25cqw] font-semibold transition-colors ${i === pi ? "bg-cyan-500/25 text-cyan-200" : "text-slate-400"}`}>{pp.key}</span>
            ))}
          </span>
        </div>

        <div className="flex-1 flex flex-col gap-[1.4cqw] p-[1.6cqw] min-h-0">
          {/* KPI tiles */}
          <div className="grid grid-cols-4 gap-[1.4cqw] shrink-0">
            {kpis.map((k, i) => (
              <div key={i} className="rounded-[1cqw] border border-slate-700 bg-slate-800/60 p-[1.3cqw] flex flex-col gap-[0.7cqw]">
                <div className="flex items-center gap-[0.9cqw]">
                  <span className={`w-[3cqw] h-[3cqw] rounded-[0.8cqw] flex items-center justify-center [&_svg]:w-[1.8cqw] [&_svg]:h-[1.8cqw] ${k.col}`}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{k.icon}</svg>
                  </span>
                  <span className="text-[1.15cqw] text-slate-400 uppercase tracking-wide leading-tight">{k.label}</span>
                </div>
                <span className="text-white font-bold text-[3cqw] leading-none tabular-nums">{k.value}</span>
                {k.gauge !== undefined && (
                  <span className="block h-[0.7cqw] rounded-full bg-slate-700 overflow-hidden">
                    <span className="block h-full rounded-full transition-[width] duration-300" style={{ width: `${val(k.gauge)}%`, background: utilColor(k.gauge) }} />
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* charts row */}
          <div className="flex-1 grid grid-cols-3 gap-[1.4cqw] min-h-0">
            {/* throughput bar chart */}
            <div className="col-span-2 rounded-[1cqw] border border-slate-700 bg-slate-800/60 p-[1.4cqw] flex flex-col min-h-0">
              <span className="text-[1.3cqw] font-semibold text-slate-300 mb-[1cqw]">{a.cThroughput}</span>
              <div className="flex-1 flex items-end gap-[0.7cqw] min-h-0">
                {p.bars.map((b, i) => (
                  <span key={i} className="flex-1 rounded-t-[0.4cqw] transition-[height] duration-500" style={{ height: `${(b / maxBar) * 100 * anim}%`, background: `linear-gradient(to top, ${C.cyan}, ${C.cyan}99)`, minHeight: "2%" }} />
                ))}
              </div>
            </div>

            {/* type donut + funnel */}
            <div className="rounded-[1cqw] border border-slate-700 bg-slate-800/60 p-[1.4cqw] flex flex-col gap-[1cqw] min-h-0">
              <span className="text-[1.3cqw] font-semibold text-slate-300">{a.cTypes}</span>
              <div className="flex items-center gap-[1.4cqw]">
                <svg viewBox="0 0 36 36" className="w-[9cqw] h-[9cqw] -rotate-90 shrink-0">
                  <circle cx="18" cy="18" r={R} fill="none" stroke="#334155" strokeWidth="4" />
                  {donut.map((d, i) => {
                    const frac = (d.v / typeTotal) * anim;
                    const seg = <circle key={i} cx="18" cy="18" r={R} fill="none" stroke={d.c} strokeWidth="4" strokeDasharray={`${frac * CIRC} ${CIRC}`} strokeDashoffset={-acc * CIRC} strokeLinecap="butt" />;
                    acc += frac; return seg;
                  })}
                </svg>
                <div className="flex flex-col gap-[0.5cqw]">
                  {donut.map((d, i) => (
                    <span key={i} className="flex items-center gap-[0.7cqw] text-[1.15cqw] text-slate-300">
                      <span className="w-[1.1cqw] h-[1.1cqw] rounded-[0.3cqw]" style={{ background: d.c }} /> {d.l}
                      <span className="ml-auto tabular-nums text-slate-400">{Math.round((d.v / typeTotal) * 100)}%</span>
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex-1 flex flex-col justify-center gap-[0.6cqw] min-h-0">
                {funnelRows.map((r, i) => (
                  <span key={i} className="flex items-center gap-[0.8cqw]">
                    <span className="text-[1.05cqw] text-slate-400 w-[6cqw] shrink-0 truncate">{r}</span>
                    <span className="flex-1 h-[1.1cqw] rounded-full bg-slate-700 overflow-hidden">
                      <span className="block h-full rounded-full transition-[width] duration-500" style={{ width: `${p.funnel[i] * anim}%`, background: C.cyan, opacity: 1 - i * 0.13 }} />
                    </span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
