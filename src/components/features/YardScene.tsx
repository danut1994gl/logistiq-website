"use client";

import { useEffect, useRef, useState } from "react";
import type { Translations } from "@/lib/i18n/translations";

// Intuitive top-down yard map (YMS, feature 13), grounded in the real dashboard
// yard (drag-and-drop assignment, idle-time text on trucks, read-only live
// view). An operator cursor drags trucks between the gate, the loading docks and
// the P1 parking (parking->ramp, ramp->ramp, ramp->parking). Trucks show their
// idle time along the trailer + a colour-coded cab dot, exactly like the app.
// Client player: reduced-motion renders a populated static yard. aria-hidden.

type Op = "loading" | "unloading" | "both";
type SlotKind = "dock" | "park" | "gate";
type Slot = { id: string; x: number; y: number; kind: SlotKind; label?: string };
type Truck = { id: number; op: Op; idleMin: number; slot: string };

const C = {
  loading: "#c07070", unloading: "#6a9e7e", both: "#8e7ab8",
  wh: "#3f4a5a", whStroke: "#5b6b7f", ground: "#131b25", grid: "#22303f",
  border: "#334155", cab: "#334155", coupling: "#475569", amber: "#f59e0b",
  surface: "#1b2532", surfaceHi: "#243040",
  green: "#22c55e", warn: "#f59e0b", crit: "#ef4444",
};

// ---- layout (SVG userspace 1200 x 820) ----
const WH = { x: 90, y: 46, w: 1020, h: 132 };
const DOCK_Y = 256;
const DOCKS: Slot[] = Array.from({ length: 6 }, (_, i) => ({ id: `D${i + 1}`, x: 90 + (i + 0.5) * (1020 / 6), y: DOCK_Y, kind: "dock", label: `D${i + 1}` }));
const PARK = { x: 90, y: 536, w: 636, h: 236, header: 34 };
const PARK_Y = 668;
const SPOTS: Slot[] = Array.from({ length: 8 }, (_, i) => ({ id: `P${i + 1}`, x: PARK.x + 40 + i * 72, y: PARK_Y, kind: "park", label: `${String(i + 1).padStart(2, "0")}` }));
const GATE: Slot = { id: "G", x: 1040, y: 610, kind: "gate" };
const SLOTS: Slot[] = [...DOCKS, ...SPOTS, GATE];
const slotById = (id: string) => SLOTS.find((s) => s.id === id)!;

const fmtIdle = (m: number) => (m < 60 ? `${m}m` : `${Math.floor(m / 60)}h${m % 60 > 0 ? `${m % 60}m` : ""}`);
const dotColor = (m: number) => (m < 30 ? C.green : m < 90 ? C.warn : C.crit);

// a top-down truck drawn centred at (0,0). cabDown = trailer up / cab down
// (backed into a dock or parking spot); cabDown=false = cab up (at the gate).
function TruckBody({ op, cabDown, idleMin, lifted }: { op: Op; cabDown: boolean; idleMin: number; lifted: boolean }) {
  const w = 46, tH = 96, cH = 34;
  const trailerY = cabDown ? -78 : -18; // top of trailer
  const cabY = cabDown ? trailerY + tH + 6 : -18 - 6 - cH; // top of cab
  const coupY = cabDown ? trailerY + tH : cabY + cH;
  const trailerMid = trailerY + tH / 2;
  const cabMid = cabY + cH / 2;
  const lvl = idleMin >= 120 ? "crit" : idleMin >= 60 ? "warn" : "normal";
  const idleFill = lvl === "normal" ? "rgba(255,255,255,0.72)" : "#ffffff";
  return (
    <g style={{ filter: lifted ? "drop-shadow(0 6px 8px rgba(0,0,0,0.45))" : undefined }}>
      <rect x={-w / 2} y={trailerY} width={w} height={tH} rx={4} fill={C[op]} />
      {[0.2, 0.35, 0.5, 0.65, 0.8].map((o) => (
        <line key={o} x1={-w / 2 + 3} y1={trailerY + tH * o} x2={w / 2 - 3} y2={trailerY + tH * o} stroke="#fff" strokeOpacity="0.22" strokeWidth="1" />
      ))}
      <rect x={-w / 2 + 4} y={coupY - 3} width={w - 8} height={6} rx={2} fill={C.coupling} />
      <rect x={-w / 2 + 2} y={cabY} width={w - 4} height={cH} rx={4} fill={C.cab} stroke="#fff" strokeOpacity="0.12" />
      <rect x={-w / 2 + 7} y={cabDown ? cabY + cH - 6 : cabY} width={w - 14} height={5} rx={2} fill="#fff" fillOpacity="0.2" />
      {/* idle-time text along the trailer (rotated), hidden while dragging */}
      {!lifted && <text x={0} y={trailerMid} transform={`rotate(-90 0 ${trailerMid})`} textAnchor="middle" dominantBaseline="central" fill={idleFill} style={{ fontSize: 12, fontWeight: 700 }}>{fmtIdle(idleMin)}</text>}
      {/* cab status dot */}
      {!lifted && <circle cx={0} cy={cabMid} r={5.5} fill={dotColor(idleMin)} />}
    </g>
  );
}

export function YardScene({ t }: { t: Translations }) {
  const y = t.ymsPage;
  const [trucks, setTrucks] = useState<Truck[]>([
    { id: 1, op: "unloading", idleMin: 45, slot: "D2" },
    { id: 2, op: "loading", idleMin: 84, slot: "D5" },
    { id: 3, op: "both", idleMin: 12, slot: "P1" },
    { id: 4, op: "unloading", idleMin: 125, slot: "P4" },
    { id: 5, op: "loading", idleMin: 8, slot: "P6" },
    { id: 6, op: "unloading", idleMin: 3, slot: "G" },
  ]);
  const [cursor, setCursor] = useState<{ x: number; y: number; down: boolean; on: boolean }>({ x: 1040, y: 610, down: false, on: false });
  const [dragId, setDragId] = useState<number | null>(null);
  const trucksRef = useRef(trucks);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let cancelled = false, visible = true;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0.15 });
    if (rootRef.current) io.observe(rootRef.current);
    const sleep = (ms: number) => new Promise<void>((res) => {
      const started = Date.now();
      const tick = () => { if (cancelled) return res(); if (visible && Date.now() - started >= ms) return res(); setTimeout(tick, visible ? 90 : 150); };
      setTimeout(tick, 90);
    });
    const setT = (fn: (t: Truck[]) => Truck[]) => { trucksRef.current = fn(trucksRef.current); setTrucks(trucksRef.current); };

    const run = async () => {
      await sleep(900);
      while (!cancelled) {
        const cur = trucksRef.current;
        const occupied = new Set(cur.map((t) => t.slot));
        const targets = [...DOCKS, ...SPOTS].filter((s) => !occupied.has(s.id));
        if (!targets.length) { await sleep(600); continue; }
        // prefer moving a truck onto a ramp (the headline action)
        const truck = cur[Math.floor(Math.random() * cur.length)];
        const freeDocks = DOCKS.filter((s) => !occupied.has(s.id));
        const pool = freeDocks.length && Math.random() < 0.7 ? freeDocks : targets;
        const dest = pool[Math.floor(Math.random() * pool.length)];
        if (!dest || dest.id === truck.slot) { await sleep(400); continue; }
        const from = slotById(truck.slot);
        // move cursor to the truck
        setCursor({ x: from.x, y: from.y, down: false, on: true });
        await sleep(650);
        // grab
        setCursor((c) => ({ ...c, down: true }));
        setDragId(truck.id);
        await sleep(260);
        // drag truck + cursor together to the destination
        setT((ts) => ts.map((tk) => (tk.id === truck.id ? { ...tk, slot: dest.id, idleMin: dest.kind === "dock" ? 1 : tk.idleMin } : tk)));
        setCursor((c) => ({ ...c, x: dest.x, y: dest.y }));
        await sleep(920);
        // drop
        setCursor((c) => ({ ...c, down: false }));
        await sleep(280);
        setCursor((c) => ({ ...c, on: false }));
        await sleep(1500);
      }
    };
    run();
    return () => { cancelled = true; io.disconnect(); };
  }, []);

  const legend: { c: string; l: string }[] = [
    { c: "#eab308", l: y.legWaiting }, { c: C.loading, l: y.legLoading },
    { c: C.unloading, l: y.legUnloading }, { c: C.both, l: y.legBoth },
  ];
  const parkOcc = trucks.filter((t) => t.slot.startsWith("P")).length;

  return (
    <div ref={rootRef} className="@container absolute inset-0" aria-hidden="true">
      <svg viewBox="0 0 1200 820" className="w-full h-full block" preserveAspectRatio="xMidYMid meet">
        <defs>
          <pattern id="ymGrid" width="34" height="34" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill={C.grid} /></pattern>
        </defs>
        <rect x="0" y="0" width="1200" height="820" fill={C.ground} />
        <rect x="0" y="0" width="1200" height="820" fill="url(#ymGrid)" />

        {/* live-view badge (read-only overview mode) */}
        <g transform="translate(24 22)">
          <rect x="0" y="0" width="150" height="34" rx="8" fill={C.surface} stroke={C.border} />
          <circle cx="18" cy="17" r="4.5" fill={C.green} />
          <text x="32" y="22" fill="#cbd5e1" style={{ fontSize: 14, fontWeight: 700 }}>{y.uiLiveView}</text>
        </g>

        {/* ===== warehouse + dock doors ===== */}
        <rect x={WH.x} y={WH.y} width={WH.w} height={WH.h} rx="8" fill={C.wh} stroke={C.whStroke} strokeWidth="2" />
        {Array.from({ length: 22 }).map((_, i) => (<line key={i} x1={WH.x + 22 + i * 46} y1={WH.y + 14} x2={WH.x + 22 + i * 46} y2={WH.y + WH.h - 12} stroke={C.whStroke} strokeOpacity="0.26" strokeWidth="1" />))}
        <text x={WH.x + WH.w / 2} y={WH.y + 82} textAnchor="middle" fill="#cbd5e1" style={{ fontSize: 28, fontWeight: 800, letterSpacing: 7 }}>WAREHOUSE</text>

        {/* dock slots */}
        {DOCKS.map((s) => {
          const occ = trucks.some((t) => t.slot === s.id);
          return (
            <g key={s.id}>
              <rect x={s.x - 38} y={WH.y + WH.h - 6} width={76} height={12} rx={2} fill="#0f1720" stroke={C.border} strokeWidth="1.5" />
              <rect x={s.x - 56} y={s.y - 84} width={112} height={168} rx={6} fill="none" stroke={occ ? "transparent" : "#3b4a5e"} strokeWidth="1.5" strokeDasharray="5 5" />
              {!occ && <text x={s.x} y={s.y + 8} textAnchor="middle" fill="#64748b" style={{ fontSize: 22, fontWeight: 800 }}>{s.label}</text>}
            </g>
          );
        })}

        {/* ===== parking card (P1) ===== */}
        <g>
          <rect x={PARK.x} y={PARK.y} width={PARK.w} height={PARK.h} rx="10" fill={C.surface} stroke={C.border} strokeWidth="1.5" />
          <rect x={PARK.x} y={PARK.y} width={PARK.w} height={PARK.header} rx="10" fill={C.surfaceHi} />
          <text x={PARK.x + 16} y={PARK.y + 24} fill="#e2e8f0" style={{ fontSize: 16, fontWeight: 700 }}>{y.uiParking}</text>
          <text x={PARK.x + PARK.w - 14} y={PARK.y + 24} textAnchor="end" fill="#94a3b8" style={{ fontSize: 13 }}>{parkOcc}/8</text>
          {SPOTS.map((s) => {
            const occ = trucks.some((t) => t.slot === s.id);
            return (
              <g key={s.id}>
                <rect x={s.x - 30} y={s.y - 78} width={60} height={166} rx={4} fill="none" stroke="#3b4a5e" strokeWidth="1.2" strokeDasharray="4 3" />
                {!occ && <text x={s.x} y={s.y + 5} textAnchor="middle" fill="#5b6b7f" style={{ fontSize: 13, fontFamily: "monospace" }}>{s.label}</text>}
              </g>
            );
          })}
        </g>

        {/* ===== gate + barrier (bottom-right) ===== */}
        <g>
          <rect x={GATE.x - 66} y="700" width="10" height="34" rx="2" fill={C.border} />
          <g transform={`translate(${GATE.x - 56} 707)`}>
            <rect x="0" y="-4" width="104" height="8" rx="4" fill="#e2e8f0" />
            {[6, 34, 62, 90].map((bx) => (<rect key={bx} x={bx} y="-4" width="16" height="8" fill={C.amber} />))}
          </g>
          <text x={GATE.x - 4} y="750" textAnchor="middle" fill="#94a3b8" style={{ fontSize: 13, fontWeight: 600 }}>{y.uiGate}</text>
        </g>

        {/* ===== trucks (positioned by slot, transition on move) ===== */}
        {trucks.map((tk) => {
          const s = slotById(tk.slot);
          const lifted = dragId === tk.id;
          return (
            <g key={tk.id} style={{ transform: `translate(${s.x}px, ${s.y}px) scale(${lifted ? 1.06 : 1})`, transition: "transform 0.9s cubic-bezier(0.4,0,0.2,1)" }}>
              <TruckBody op={tk.op} cabDown={s.kind !== "gate"} idleMin={tk.idleMin} lifted={lifted} />
            </g>
          );
        })}

        {/* ===== legend ===== */}
        <g transform="translate(760 24)">
          <rect x="-10" y="-4" width="426" height="34" rx="8" fill={C.surface} fillOpacity="0.92" stroke={C.border} />
          {legend.map((item, i, arr) => {
            const off = arr.slice(0, i).reduce((a, it) => a + 26 + it.l.length * 7.2, 0);
            return (<g key={i} transform={`translate(${off + 4} 13)`}><rect x="0" y="-7" width="13" height="13" rx="3" fill={item.c} /><text x="18" y="3" fill="#cbd5e1" style={{ fontSize: 12, fontWeight: 500 }}>{item.l}</text></g>);
          })}
        </g>

        {/* ===== operator cursor (drag) ===== */}
        <g style={{ transform: `translate(${cursor.x}px, ${cursor.y}px) scale(${cursor.down ? 0.86 : 1})`, transition: "transform 0.6s ease-out", opacity: cursor.on ? 1 : 0 }}>
          <path d="M0 -6 L20 8 L8 10 L4 22 Z" fill="#ffffff" stroke="#0f172a" strokeWidth="1.6" strokeLinejoin="round" transform="translate(2 2)" />
        </g>
      </svg>
    </div>
  );
}
