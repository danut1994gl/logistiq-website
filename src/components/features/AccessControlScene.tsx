"use client";

import { useEffect, useRef, useState } from "react";
import type { Translations } from "@/lib/i18n/translations";
import type { Locale } from "@/lib/i18n/config";
import { DRIVER_POOLS } from "./driverPools";

// Access Control (feature 17): the real dashboard mechanic — an admin ticks a
// dispatcher's departments and the capabilities that ACTUALLY depend on them
// light up. Grounded in the access audit, including the part that is easy to get
// wrong: department assignment does NOT narrow what a dispatcher SEES. The RLS
// policy is warehouse-scoped with no department condition, so the check-in list
// on the right deliberately never changes — only the three capabilities do.
// Client player; static frame on reduced-motion. aria-hidden decorative.

const DEPTS = ["Reception", "Warehouse", "Shipping"];

// Which capability each department unlocks — the three that are genuinely
// department-gated in the product (operator check-in, bookings, gate quick-access).
const CAPS: { key: string; need: number[] }[] = [
  { key: "checkin", need: [0] },      // operator check-in — the Reception desk
  { key: "bookings", need: [0, 2] },  // bookings — office-side departments
  { key: "gates", need: [1, 2] },     // gate quick-access — via department_gates
];

// The tick sequence the loop walks: none -> Reception -> +Warehouse -> +Shipping -> none
const SEQ: number[][] = [[], [0], [0, 1], [0, 1, 2], [1, 2], []];

const CheckIc = <path d="M4 12l5 5L20 6" />;
const UserIc = <><circle cx="12" cy="8" r="3.4" /><path d="M5 21a7 7 0 0 1 14 0" /></>;
const LockIc = <><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></>;
const BuildingIc = <><rect x="4" y="3" width="16" height="18" rx="1.5" /><path d="M8 7h.01M12 7h.01M16 7h.01M8 11h.01M12 11h.01M16 11h.01M10 21v-4h4v4" /></>;

function Row({ label, on, dim }: { label: string; on: boolean; dim?: boolean }) {
  return (
    <span className={`flex items-center gap-[1.6cqw] rounded-[1.2cqw] border px-[1.8cqw] py-[1.4cqw] transition-colors duration-500 ${
      on ? "border-emerald-500/40 bg-emerald-500/10" : "border-slate-700 bg-slate-800/40"
    }`}>
      <span className={`w-[3cqw] h-[3cqw] rounded-full flex items-center justify-center shrink-0 transition-colors duration-500 ${
        on ? "bg-emerald-500/25 text-emerald-300" : "bg-slate-700/60 text-slate-600"
      }`}>
        <svg viewBox="0 0 24 24" className="w-[1.8cqw] h-[1.8cqw]" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">{CheckIc}</svg>
      </span>
      <span className={`text-[1.75cqw] font-medium transition-colors duration-500 ${on ? "text-slate-100" : dim ? "text-slate-600" : "text-slate-500"}`}>{label}</span>
    </span>
  );
}

export function AccessControlScene({ t, locale }: { t: Translations; locale: Locale }) {
  const f = t.f17Page;
  const person = DRIVER_POOLS[locale][3];
  const [step, setStep] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let cancelled = false, visible = true;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0.2 });
    if (rootRef.current) io.observe(rootRef.current);
    let i = 0;
    const tick = () => {
      if (cancelled) return;
      if (!visible) { setTimeout(tick, 300); return; }
      i = (i + 1) % SEQ.length;
      setStep(i);
      setTimeout(tick, 2200);
    };
    const to = setTimeout(tick, 2200);
    return () => { cancelled = true; clearTimeout(to); io.disconnect(); };
  }, []);

  const ticked = SEQ[step];
  const has = (d: number) => ticked.includes(d);
  const capOn = (need: number[]) => need.some((d) => has(d));
  const none = ticked.length === 0;

  return (
    <div ref={rootRef} className="@container absolute inset-0 p-[2.5cqw] flex items-center justify-center gap-[3cqw] select-none" aria-hidden="true">
      {/* the user modal — where an admin actually does this */}
      <div className="w-[46%] rounded-[1.8cqw] border border-slate-700 bg-slate-900/70 overflow-hidden flex flex-col">
        <div className="flex items-center gap-[1.8cqw] px-[2.2cqw] py-[1.8cqw] border-b border-slate-700 bg-slate-800/60">
          <span className="w-[4.4cqw] h-[4.4cqw] rounded-full bg-blue-500/20 text-blue-300 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 24 24" className="w-[2.6cqw] h-[2.6cqw]" fill="none" stroke="currentColor" strokeWidth="1.9">{UserIc}</svg>
          </span>
          <span className="flex flex-col leading-tight min-w-0">
            <span className="text-white font-bold text-[2.1cqw] truncate">{person.name}</span>
            <span className="text-slate-400 text-[1.5cqw]">{f.uiDispatcher}</span>
          </span>
          <span className="ml-auto inline-flex items-center gap-[0.8cqw] rounded-full bg-slate-700/60 px-[1.6cqw] py-[0.7cqw] text-[1.4cqw] text-slate-300 shrink-0">
            <svg viewBox="0 0 24 24" className="w-[1.6cqw] h-[1.6cqw]" fill="none" stroke="currentColor" strokeWidth="2">{BuildingIc}</svg>{f.uiScope}
          </span>
        </div>

        <div className="p-[2.2cqw] flex flex-col gap-[1.6cqw]">
          <span className="text-[1.5cqw] uppercase tracking-wide text-slate-500 font-semibold">{f.uiDepartments}</span>
          {DEPTS.map((d, i) => (
            <span key={d} className={`flex items-center gap-[1.6cqw] rounded-[1.2cqw] border px-[1.8cqw] py-[1.4cqw] transition-colors duration-500 ${
              has(i) ? "border-blue-500/50 bg-blue-500/10" : "border-slate-700 bg-slate-800/40"
            }`}>
              <span className={`w-[2.8cqw] h-[2.8cqw] rounded-[0.7cqw] border-[0.3cqw] flex items-center justify-center shrink-0 transition-colors duration-500 ${
                has(i) ? "border-blue-500 bg-blue-500 text-white" : "border-slate-600 bg-transparent text-transparent"
              }`}>
                <svg viewBox="0 0 24 24" className="w-[1.7cqw] h-[1.7cqw]" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">{CheckIc}</svg>
              </span>
              <span className={`text-[1.8cqw] font-medium transition-colors duration-500 ${has(i) ? "text-white" : "text-slate-400"}`}>{d}</span>
              {i === 0 && (
                <span className="ml-auto rounded-full bg-amber-500/15 text-amber-300 text-[1.25cqw] font-semibold px-[1.4cqw] py-[0.5cqw] shrink-0">{f.uiOffice}</span>
              )}
            </span>
          ))}
          <span className="flex items-center gap-[1.4cqw] mt-[0.6cqw] text-[1.45cqw] text-slate-500">
            <svg viewBox="0 0 24 24" className="w-[1.8cqw] h-[1.8cqw]" fill="none" stroke="currentColor" strokeWidth="1.9">{LockIc}</svg>{f.ui2fa}
          </span>
        </div>
      </div>

      {/* what those departments actually change */}
      <div className="w-[46%] flex flex-col gap-[1.6cqw]">
        <span className="text-[1.5cqw] uppercase tracking-wide text-slate-500 font-semibold">{f.uiRoles}</span>
        <Row label={f.uiInvite} on={false} dim />
        {CAPS.map((c) => (
          <Row key={c.key} label={c.key === "checkin" ? f.uiManager : c.key === "bookings" ? f.uiOffice : f.uiScope} on={capOn(c.need)} />
        ))}
        {/* the honest part: reads never narrow — only the capabilities above do */}
        <span className={`mt-[0.6cqw] rounded-[1.2cqw] border px-[1.8cqw] py-[1.4cqw] text-[1.5cqw] leading-snug transition-colors duration-500 ${
          none ? "border-red-500/40 bg-red-500/10 text-red-300" : "border-slate-700 bg-slate-800/40 text-slate-400"
        }`}>
          {none ? f.uiRestricted : f.uiDepartments}
        </span>
      </div>
    </div>
  );
}
