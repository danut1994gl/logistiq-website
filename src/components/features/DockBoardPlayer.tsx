"use client";

import { useEffect, useRef, useState } from "react";
import type { Translations } from "@/lib/i18n/translations";

type Op = "loading" | "unloading" | "both";
type QStatus = "waiting" | "confirmed" | "cancelled";
type DStatus = "assigned" | "in_progress";
type QItem = { plate: string; op: Op; status: QStatus };
type Dock = { plate: string; op: Op; status: DStatus } | null;
type Frame = { queue: QItem[]; docks: Record<number, Dock>; toast?: { text: string; tone: "success" | "info" } | null; banner?: string | null; dwell: number };

const OP_TILE: Record<Op, string> = {
  loading: "from-orange-500/25 to-orange-500/5 border-orange-500/40",
  unloading: "from-blue-500/25 to-blue-500/5 border-blue-500/40",
  both: "from-purple-500/25 to-purple-500/5 border-purple-500/40",
};
const OP_DOT: Record<Op, string> = { loading: "bg-orange-400", unloading: "bg-blue-400", both: "bg-purple-400" };
const DSTATUS: Record<DStatus, string> = { assigned: "text-purple-300", in_progress: "text-indigo-300" };

export function DockBoardPlayer({ t }: { t: Translations }) {
  const d = t.dockPage;
  const D = (n: number) => `${d.uiDock} ${n}`;
  // 5 real situations as board frames
  const B218: [string, Op] = ["B 218 QRG", "loading"];
  const CJ07: [string, Op] = ["CJ 07 LGX", "unloading"];
  const TM44: [string, Op] = ["TM 44 DEL", "unloading"];
  const B451: [string, Op] = ["B 451 TRK", "unloading"];
  const CJ99: [string, Op] = ["CJ 99 XLR", "loading"];
  const q = (p: [string, Op], s: QStatus): QItem => ({ plate: p[0], op: p[1], status: s });
  const dk = (p: [string, Op], s: DStatus): Dock => ({ plate: p[0], op: p[1], status: s });

  const FRAMES: Frame[] = [
    // S1 — arrives, told to wait, then assigned
    { queue: [q(B218, "waiting")], docks: {}, dwell: 2600 },
    { queue: [q(B218, "confirmed")], docks: {}, banner: d.evWaitBanner, dwell: 2800 },
    { queue: [], docks: { 4: dk(B218, "assigned") }, toast: { text: `${D(4)} ${d.evAssigned}`, tone: "success" }, dwell: 2800 },
    // S2 — reassigned to another dock
    { queue: [], docks: { 4: dk(B218, "assigned") }, dwell: 1800 },
    { queue: [], docks: { 2: dk(B218, "assigned") }, toast: { text: `${d.evMovedTo} ${D(2)}`, tone: "success" }, dwell: 3000 },
    // S3 — called to the office (dock unchanged); unloading truck at an unloading dock
    { queue: [], docks: { 7: dk(CJ07, "in_progress") }, dwell: 2200 },
    { queue: [], docks: { 7: dk(CJ07, "in_progress") }, banner: `${CJ07[0]} — ${d.evOffice}`, dwell: 3000 },
    // S4 — complete frees the dock, next waiting truck takes it
    { queue: [q(B451, "waiting")], docks: { 6: dk(TM44, "in_progress") }, dwell: 2600 },
    { queue: [q(B451, "waiting")], docks: {}, toast: { text: d.evComplete, tone: "success" }, dwell: 2600 },
    { queue: [], docks: { 6: dk(B451, "assigned") }, toast: { text: `${D(6)} ${d.evAssigned}`, tone: "success" }, dwell: 3000 },
    // S5 — cancelled / sent away
    { queue: [q(CJ99, "waiting")], docks: {}, dwell: 2400 },
    { queue: [q(CJ99, "cancelled")], docks: {}, toast: { text: d.evCancelled, tone: "info" }, dwell: 3000 },
  ];

  const [i, setI] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let cancelled = false, visible = true;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0.15 });
    if (rootRef.current) io.observe(rootRef.current);
    let idx = 0;
    const step = () => {
      if (cancelled) return;
      if (!visible) { setTimeout(step, 250); return; }
      idx = (idx + 1) % FRAMES.length;
      setI(idx);
      setTimeout(step, FRAMES[idx].dwell);
    };
    const to = setTimeout(step, FRAMES[0].dwell);
    return () => { cancelled = true; clearTimeout(to); io.disconnect(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const f = FRAMES[i];
  const depts: { label: string; docks: number[] }[] = [
    { label: d.uiLoading, docks: [1, 2, 3, 4] },
    { label: d.uiUnloading, docks: [5, 6, 7, 8] },
  ];
  const opLabel = (op: Op) => (op === "loading" ? d.uiLoading : op === "unloading" ? d.uiUnloading : d.uiLoading);

  return (
    <div ref={rootRef} className="@container absolute inset-0 p-[2.2cqw] text-slate-200" aria-hidden="true">
      <div className="w-full h-full rounded-[1.5cqw] bg-slate-900/70 border border-slate-700/70 flex flex-col overflow-hidden">
        {/* header */}
        <div className="flex items-center gap-[1.4cqw] px-[2cqw] py-[1.3cqw] border-b border-slate-700/70 bg-slate-800/60 shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="" className="w-[3cqw] h-[3cqw] rounded-[0.7cqw]" />
          <span className="font-bold text-white text-[2.2cqw]">{d.uiBoard}</span>
          <span className="ml-auto inline-flex items-center gap-[0.7cqw] text-[1.5cqw] font-semibold text-emerald-400 bg-emerald-500/15 rounded-full px-[1.4cqw] py-[0.5cqw]">
            <span className="w-[1cqw] h-[1cqw] rounded-full bg-emerald-400" /> {d.uiLive}
          </span>
        </div>

        <div className="flex-1 flex gap-[2cqw] p-[2cqw] min-h-0">
          {/* queue */}
          <div className="w-[30%] flex flex-col min-h-0">
            <div className="text-[1.5cqw] font-semibold text-slate-400 uppercase tracking-wide mb-[1.2cqw]">{d.uiQueue}</div>
            <div className="flex flex-col gap-[1.2cqw]">
              {f.queue.length === 0 && <div className="text-slate-600 text-[1.5cqw] italic px-[0.5cqw]">—</div>}
              {f.queue.map((it, k) => {
                const cancelled = it.status === "cancelled";
                const badge = it.status === "waiting" ? "bg-yellow-500/15 text-yellow-400" : it.status === "confirmed" ? "bg-blue-500/15 text-blue-400" : "bg-slate-600/30 text-slate-400";
                const badgeText = it.status === "waiting" ? d.uiWaiting : it.status === "confirmed" ? d.stConfirmed : d.stCancelled;
                return (
                  <div key={k} className={`rounded-[1cqw] border px-[1.5cqw] py-[1.2cqw] flex items-center gap-[1.2cqw] ${cancelled ? "border-slate-800 bg-slate-800/30 opacity-50" : "border-slate-700 bg-slate-800/70"}`}>
                    {it.status === "waiting" && <span className="w-[1.1cqw] h-[1.1cqw] rounded-full bg-yellow-400 animate-pulse shrink-0" />}
                    <span className="flex flex-col leading-tight min-w-0">
                      <span className={`font-semibold text-[1.8cqw] ${cancelled ? "text-slate-500 line-through" : "text-white"}`}>{it.plate}</span>
                      <span className="text-slate-400 text-[1.4cqw] truncate">{opLabel(it.op)}</span>
                    </span>
                    <span className={`ml-auto shrink-0 rounded-full px-[1.1cqw] py-[0.4cqw] text-[1.3cqw] font-semibold ${badge}`}>{badgeText}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ramps overview */}
          <div className="flex-1 flex flex-col gap-[1.6cqw] min-w-0">
            {depts.map((dept) => (
              <div key={dept.label} className="flex-1 flex flex-col min-h-0">
                <div className="text-[1.5cqw] font-semibold text-slate-400 uppercase tracking-wide mb-[1cqw]">{dept.label}</div>
                <div className="grid grid-cols-4 gap-[1.2cqw] flex-1">
                  {dept.docks.map((n) => {
                    const occ = f.docks[n];
                    if (!occ) {
                      return (
                        <div key={n} className="rounded-[1cqw] border border-dashed border-slate-700 bg-slate-800/30 flex flex-col items-center justify-center gap-[0.4cqw]">
                          <span className="text-[2cqw] font-bold text-slate-600">{n}</span>
                          <span className="text-[1.2cqw] text-slate-600">{d.uiAvailable}</span>
                        </div>
                      );
                    }
                    return (
                      <div key={n} className={`relative rounded-[1cqw] border bg-gradient-to-b p-[1.1cqw] flex flex-col justify-between ${OP_TILE[occ.op]}`}>
                        <div className="flex items-center justify-between">
                          <span className="text-[1.6cqw] font-bold text-slate-300">{n}</span>
                          <span className={`w-[1.4cqw] h-[1.4cqw] rounded-full ${OP_DOT[occ.op]}`} />
                        </div>
                        <div className="flex flex-col leading-tight">
                          <span className="text-white font-semibold text-[1.5cqw] truncate">{occ.plate}</span>
                          <span className={`text-[1.25cqw] font-medium ${DSTATUS[occ.status]}`}>{occ.status === "assigned" ? d.stAssigned : d.stInProgress}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* banner (call to office / wait) */}
      {f.banner && (
        <div className="absolute left-1/2 -translate-x-1/2 top-[13.5cqw] rounded-[1cqw] bg-blue-600/95 text-white text-[1.7cqw] font-semibold px-[2cqw] py-[1.1cqw] shadow-2xl flex items-center gap-[1.2cqw]">
          <svg viewBox="0 0 24 24" className="w-[1.9cqw] h-[1.9cqw]" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" strokeLinecap="round" /></svg>
          {f.banner}
        </div>
      )}
      {/* toast */}
      {f.toast && (
        <div className={`absolute right-[3cqw] top-[10cqw] flex items-center gap-[1.2cqw] rounded-[1cqw] bg-slate-800 border shadow-2xl px-[1.8cqw] py-[1.2cqw] ${f.toast.tone === "success" ? "border-emerald-500/50" : "border-slate-600"}`}>
          <span className={`w-[2.4cqw] h-[2.4cqw] rounded-full flex items-center justify-center text-white [&_svg]:w-[1.5cqw] [&_svg]:h-[1.5cqw] ${f.toast.tone === "success" ? "bg-emerald-500" : "bg-slate-500"}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              {f.toast.tone === "success" ? <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" /> : <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />}
            </svg>
          </span>
          <span className="text-[1.7cqw] font-semibold text-white">{f.toast.text}</span>
        </div>
      )}
    </div>
  );
}
