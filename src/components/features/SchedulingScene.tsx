"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { Translations } from "@/lib/i18n/translations";
import type { Locale } from "@/lib/i18n/config";
import { DRIVER_POOLS } from "./driverPools";

// Early Check-in & Scheduling (feature 11) — the slot grid filling up.
//
// Rebuilt from the real Day slot table (apps/dashboard/components/bookings/
// BookingsSlotTable.tsx + components/ui/CapacityBar.tsx): TIME · segmented
// capacity bar with an `available/total` counter · status chips carrying the
// generated booking_reference. The grid is GENERATED, not stored — 60-min slots
// across the warehouse's working hours (real default 06:00–22:00); these are the
// first six rows of it. Capacity is a single DEPARTMENT number (count of active
// ramps, or a per-department override), which is why every row shares the same
// total and why no named dock appears anywhere: a booking takes a department and
// a slot, never a specific ramp.
//
// The loop: three carrier bookings land in the 09:00—10:00 row, the counter ticks
// 3/3 → 0/3 and the row goes Full; then the first chip walks the real status enum
// scheduled → confirmed → checked_in (carrier books → operator confirms → the
// driver's reference matches at the gate).
//
// Deliberately NOT drawn, because the product does not do it: early-arrival
// detection, real-time lateness, waitlists, auto-suggested alternative slots, or
// a driver booking his own slot. Client player; static frame on reduced-motion.

type Status = "scheduled" | "confirmed" | "checked_in";
type Chip = { id: number; ref: string; status: Status };
type Row = { start: string; end: string; chips: Chip[] };

/** Department capacity for this grid — one number for the whole department. */
const TOTAL = 3;
/** Index of the row the animation plays in. */
const ROW_TARGET = 3;

// References use the real default template `{PREFIX}-{TYPE}-{SEQ:4}`, where the
// type code is D (unloading) / L (loading) / B (both) and SEQ is zero-padded.
const BASE: Row[] = [
  { start: "06:00", end: "07:00", chips: [{ id: 1, ref: "BK-D-0031", status: "checked_in" }, { id: 2, ref: "BK-L-0032", status: "confirmed" }] },
  { start: "07:00", end: "08:00", chips: [{ id: 3, ref: "BK-D-0035", status: "confirmed" }] },
  { start: "08:00", end: "09:00", chips: [{ id: 4, ref: "BK-B-0036", status: "confirmed" }, { id: 5, ref: "BK-D-0037", status: "scheduled" }] },
  { start: "09:00", end: "10:00", chips: [] }, // ← the target row
  { start: "10:00", end: "11:00", chips: [{ id: 6, ref: "BK-L-0039", status: "scheduled" }] },
  { start: "11:00", end: "12:00", chips: [] },
];

// Every carrier booking inserts as `scheduled` and waits for an operator.
const LANDING: Chip[] = [
  { id: 11, ref: "BK-D-0042", status: "scheduled" },
  { id: 12, ref: "BK-L-0043", status: "scheduled" },
  { id: 13, ref: "BK-D-0044", status: "scheduled" },
];
const FOCUS = LANDING[0];

// Real dark-mode badge classes from BookingsCalendar.getStatusBadgeColor, and the
// FontAwesome icons from its getStatusIcon (calendar-check / circle-check / check).
const CAL_CHECK = <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M8 3v4M16 3v4M3 10h18M9.4 15l1.9 1.9L15 13.2" /></>;
const CIRCLE_CHECK = <><circle cx="12" cy="12" r="9" /><path d="M8.4 12.2l2.5 2.5 4.7-4.9" /></>;
const CHECK = <path d="M4 12.5l5 5L20 6.5" />;
const CALENDAR = <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M8 3v4M16 3v4M3 10h18" /></>;
const CLOCK = <><circle cx="12" cy="12" r="9" /><path d="M12 7v5.2l3.2 1.9" /></>;
const LAYERS = <><path d="M12 3 3 7.5l9 4.5 9-4.5L12 3z" /><path d="M3 12l9 4.5 9-4.5" /><path d="M3 16.5 12 21l9-4.5" /></>;

const STATUS_META: Record<Status, { chip: string; icon: ReactNode }> = {
  scheduled: { chip: "bg-blue-900/30 text-blue-400", icon: CAL_CHECK },
  confirmed: { chip: "bg-green-900/30 text-green-400", icon: CIRCLE_CHECK },
  checked_in: { chip: "bg-teal-900/30 text-teal-400", icon: CHECK },
};

function Icon({ d, className }: { d: ReactNode; className: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {d}
    </svg>
  );
}

// Faithful to components/ui/CapacityBar.tsx: one segment per unit of capacity,
// filling from green through amber to red as the slot fills; free segments stay
// grey. The `available/total` caption takes its colour from the same ratio.
function CapacityBar({ available, total }: { available: number; total: number }) {
  const used = total - available;
  const ratio = used / total;
  const seg = ratio >= 1 ? "bg-red-500" : ratio >= 0.8 ? "bg-red-400" : ratio >= 0.4 ? "bg-amber-400" : "bg-green-400";
  const num = ratio >= 1 ? "text-red-400" : ratio >= 0.5 ? "text-amber-400" : "text-green-400";
  return (
    <div className="w-[11cqw] shrink-0">
      <div className="flex gap-[0.2cqw] h-[0.9cqw]">
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} className={`flex-1 rounded-[0.2cqw] transition-colors duration-500 ${i < used ? seg : "bg-slate-600/60"}`} />
        ))}
      </div>
      <div className="text-center mt-[0.4cqw]">
        {/* keyed on the value so the tick replays on every change */}
        <span key={available} className={`sc11-tick inline-block text-[1.15cqw] font-semibold tabular-nums ${num}`}>
          {available}/{total}
        </span>
      </div>
    </div>
  );
}

export function SchedulingScene({ t, locale }: { t: Translations; locale: Locale }) {
  const f = t.f11Page;
  const driver = DRIVER_POOLS[locale][0];
  const statusLabel: Record<Status, string> = { scheduled: f.stScheduled, confirmed: f.stConfirmed, checked_in: f.stCheckedIn };

  // How many of LANDING have arrived, and where the focused booking is in the
  // status enum. Kept apart on purpose: on reset `landed` drops to 0 while the
  // status stays put, so the drawer fades out still reading `checked_in` instead
  // of visibly snapping back to `scheduled` on its way out.
  const [landed, setLanded] = useState(0);
  const [focusStatus, setFocusStatus] = useState<Status>("scheduled");
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let cancelled = false, visible = true;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0.15 });
    if (rootRef.current) io.observe(rootRef.current);
    const sleep = (ms: number) => new Promise<void>((res) => { const s = Date.now(); const tick = () => { if (cancelled) return res(); if (visible && Date.now() - s >= ms) return res(); setTimeout(tick, visible ? 90 : 150); }; setTimeout(tick, 90); });
    (async () => {
      // reduced motion: paint the end of the loop as a static frame — the slot is
      // full and the focused booking has walked all the way to checked_in.
      if (reduced) {
        setLanded(LANDING.length);
        setFocusStatus("checked_in");
        return;
      }
      while (!cancelled) {
        setLanded(0);
        await sleep(1000);
        if (cancelled) return;
        // rearm while the drawer is still hidden, so it fades back in as `scheduled`
        setFocusStatus("scheduled");
        // 1) carriers book the 09:00—10:00 slot; each lands as `scheduled` and
        //    eats one place, until the slot has none left and reads Full.
        for (let i = 0; i < LANDING.length; i++) {
          if (cancelled) return;
          setLanded(i + 1);
          await sleep(i === LANDING.length - 1 ? 1700 : 1250);
        }
        if (cancelled) return;
        // 2) an operator confirms the first request…
        setFocusStatus("confirmed");
        await sleep(1700);
        if (cancelled) return;
        // 3) …and at the gate the driver's reference matches, so it checks in.
        setFocusStatus("checked_in");
        await sleep(2400);
      }
    })();
    return () => { cancelled = true; io.disconnect(); };
  }, []);

  // only the focused booking moves through the enum; the other two stay scheduled
  const chips: Chip[] = LANDING.slice(0, landed).map((c) => (c.id === FOCUS.id ? { ...c, status: focusStatus } : c));
  const rows = BASE.map((r, i) => (i === ROW_TARGET ? { ...r, chips } : r));

  return (
    <div ref={rootRef} className="@container absolute inset-0 p-[2cqw] text-slate-200 select-none" aria-hidden="true">
      <div className="w-full h-full flex gap-[1.4cqw]">
        {/* the generated slot grid, scoped to one department */}
        <div className="flex-1 min-w-0 rounded-[1.4cqw] bg-slate-900/70 border border-slate-700/70 flex flex-col overflow-hidden">
          <div className="flex items-center gap-[1.2cqw] px-[1.6cqw] py-[1.1cqw] border-b border-slate-700/70 bg-slate-800/60 shrink-0">
            <span className="w-[2.8cqw] h-[2.8cqw] rounded-[0.7cqw] bg-blue-500/15 text-blue-400 flex items-center justify-center shrink-0">
              <Icon d={CALENDAR} className="w-[1.7cqw] h-[1.7cqw]" />
            </span>
            <span className="font-bold text-white text-[1.8cqw]">{f.uiSlots}</span>
            {/* bookings are made against a DEPARTMENT + a slot — never a named dock */}
            <span className="ml-auto inline-flex items-center gap-[0.6cqw] rounded-[0.7cqw] border border-slate-600 bg-slate-800 px-[1cqw] py-[0.5cqw] text-[1.25cqw] font-semibold text-slate-200">
              <Icon d={LAYERS} className="w-[1.4cqw] h-[1.4cqw] text-blue-500" />
              {f.uiDepartment}
            </span>
          </div>

          {/* column headers — the clock stands in for the time column */}
          <div className="flex items-center gap-[1.4cqw] px-[1.4cqw] py-[0.7cqw] border-b-2 border-slate-600/60 bg-gradient-to-r from-slate-700/80 to-slate-700/60 shrink-0 text-[1.05cqw] font-medium uppercase tracking-[0.12em] text-slate-400">
            <span className="w-[13cqw] shrink-0">
              <Icon d={CLOCK} className="w-[1.3cqw] h-[1.3cqw]" />
            </span>
            <span className="w-[11cqw] shrink-0 text-center">{f.uiAvailable}</span>
            <span className="flex-1 min-w-0">{f.uiBooked}</span>
          </div>

          <div className="flex-1 flex flex-col min-h-0">
            {rows.map((row) => {
              const available = Math.max(TOTAL - row.chips.length, 0);
              const full = available === 0;
              return (
                <div
                  key={row.start}
                  className={`flex-1 min-h-0 flex items-center gap-[1.4cqw] px-[1.4cqw] border-b border-slate-800 transition-colors duration-500 ${full ? "bg-slate-950/50" : ""}`}
                >
                  <span className={`w-[13cqw] shrink-0 font-mono text-[1.35cqw] font-medium tabular-nums transition-colors duration-500 ${full ? "text-slate-500" : "text-slate-200"}`}>
                    {row.start} — {row.end}
                  </span>
                  <CapacityBar available={available} total={TOTAL} />
                  <div className="flex-1 min-w-0 flex items-center gap-[0.7cqw]">
                    {row.chips.map((c) => {
                      const m = STATUS_META[c.status];
                      return (
                        <span
                          key={c.id}
                          className={`sc11-land inline-flex items-center gap-[0.5cqw] rounded-full px-[0.9cqw] py-[0.35cqw] text-[1.15cqw] font-semibold transition-colors duration-500 ${m.chip} ${c.id === FOCUS.id ? "ring-2 ring-blue-500" : ""}`}
                        >
                          <Icon d={m.icon} className="w-[1.2cqw] h-[1.2cqw] shrink-0" />
                          <span className="font-mono">{c.ref}</span>
                        </span>
                      );
                    })}
                    {row.chips.length === 0 && <span className="text-[1.2cqw] text-slate-600">—</span>}
                    {full && (
                      <span className="sc11-full ml-auto inline-flex items-center gap-[0.5cqw] rounded-full bg-red-900/30 px-[0.9cqw] py-[0.35cqw] text-[1.1cqw] font-semibold text-red-400">
                        {f.uiFull}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* the booking behind the highlighted chip, as the detail drawer shows it:
            the generated reference and the status badge it is currently on */}
        <aside className="w-[23cqw] shrink-0 rounded-[1.4cqw] bg-slate-900/70 border border-slate-700/70 flex flex-col overflow-hidden">
          <div className="px-[1.4cqw] py-[1cqw] border-b border-slate-700/70 bg-slate-800/60 shrink-0">
            <span className="text-[1.05cqw] font-medium uppercase tracking-[0.12em] text-slate-400">{f.uiReference}</span>
          </div>
          <div className={`flex-1 flex flex-col gap-[1.1cqw] p-[1.4cqw] transition-opacity duration-500 ${landed > 0 ? "opacity-100" : "opacity-0"}`}>
            <span className="font-mono text-[2.1cqw] font-bold text-white">{FOCUS.ref}</span>
            <span className={`self-start inline-flex items-center gap-[0.6cqw] rounded-full px-[1cqw] py-[0.45cqw] text-[1.2cqw] font-semibold transition-colors duration-500 ${STATUS_META[focusStatus].chip}`}>
              <Icon d={STATUS_META[focusStatus].icon} className="w-[1.3cqw] h-[1.3cqw] shrink-0" />
              {statusLabel[focusStatus]}
            </span>
            {/* the slot it holds + who is driving it — the booking carries no ETA */}
            <span className="mt-[0.4cqw] flex flex-col gap-[0.5cqw] border-t border-slate-700/70 pt-[1.1cqw]">
              <span className="flex items-center gap-[0.6cqw] font-mono text-[1.25cqw] text-slate-300">
                <Icon d={CLOCK} className="w-[1.3cqw] h-[1.3cqw] text-slate-500 shrink-0" />
                {BASE[ROW_TARGET].start} — {BASE[ROW_TARGET].end}
              </span>
              <span className="text-[1.25cqw] text-slate-400 truncate">{driver.name}</span>
            </span>
          </div>
        </aside>
      </div>
    </div>
  );
}
