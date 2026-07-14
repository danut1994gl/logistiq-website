"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { Translations } from "@/lib/i18n/translations";
import type { Locale } from "@/lib/i18n/config";
import { DRIVER_POOLS } from "./driverPools";

// Top-down yard map (YMS, feature 13), grounded in the real dashboard: an
// operator cursor either DRAGS a truck to a new slot (parking<->ramp, ramp<->ramp)
// which opens the real move-confirmation dialog, or CLICKS a truck to open a
// scrollable detail sidebar with actions. Trucks show idle time along the trailer
// + a colour-coded cab dot. A "Live view" badge marks the read-only TV mode.
// Client player; reduced-motion renders a populated static yard. aria-hidden.

type Op = "loading" | "unloading" | "both";
type SlotKind = "dock" | "park" | "gate";
type Slot = { id: string; x: number; y: number; kind: SlotKind; label: string };
type Truck = { id: number; op: Op; idleMin: number; slot: string; name: string; plate: string; trailer: string; phone: string; company: string };

const C = {
  loading: "#c07070", unloading: "#6a9e7e", both: "#8e7ab8",
  wh: "#3f4a5a", whStroke: "#5b6b7f", ground: "#131b25", grid: "#22303f",
  border: "#334155", cab: "#334155", coupling: "#475569", amber: "#f59e0b",
  surface: "#1b2532", surfaceHi: "#243040", green: "#22c55e", warn: "#f59e0b", crit: "#ef4444",
};
const OP_TXT: Record<Op, string> = { loading: "text-orange-300 bg-orange-500/15", unloading: "text-emerald-300 bg-emerald-500/15", both: "text-purple-300 bg-purple-500/15" };

// ---- layout (SVG userspace 1200 x 820) ----
const WH = { x: 90, y: 46, w: 1020, h: 132 };
const WALL = WH.y + WH.h; // 178
const DOCK_Y = 243;
const DOCKS: Slot[] = Array.from({ length: 6 }, (_, i) => ({ id: `D${i + 1}`, x: 90 + (i + 0.5) * (1020 / 6), y: DOCK_Y, kind: "dock", label: `D${i + 1}` }));
const PARK = { x: 90, y: 536, w: 636, h: 236, header: 34 };
const PARK_Y = 668;
const SPOTS: Slot[] = Array.from({ length: 8 }, (_, i) => ({ id: `P${i + 1}`, x: PARK.x + 40 + i * 72, y: PARK_Y, kind: "park", label: `${String(i + 1).padStart(2, "0")}` }));
const GATE: Slot = { id: "G", x: 1040, y: 610, kind: "gate", label: "Gate" };
const SLOTS: Slot[] = [...DOCKS, ...SPOTS, GATE];
const slotById = (id: string) => SLOTS.find((s) => s.id === id)!;
const fullLabel = (s: Slot) => (s.kind === "park" ? `P1 - ${s.label}` : s.label);

const fmtIdle = (m: number) => (m < 60 ? `${m}m` : `${Math.floor(m / 60)}h${m % 60 > 0 ? `${m % 60}m` : ""}`);
const dotColor = (m: number) => (m < 30 ? C.green : m < 90 ? C.warn : C.crit);

// symmetric top-down truck centred at (0,0): trailer 94 + cab 32, extent ±65.
function TruckBody({ op, cabDown, idleMin, lifted }: { op: Op; cabDown: boolean; idleMin: number; lifted: boolean }) {
  const w = 46, tH = 94, cH = 32;
  const trailerY = cabDown ? -65 : 65 - 94; // cabDown top -65 ; cabUp trailer -29..65
  const cabY = cabDown ? -65 + tH + 4 : -65;
  const coupY = cabDown ? trailerY + tH : cabY + cH;
  const trailerMid = trailerY + tH / 2;
  const cabMid = cabY + cH / 2;
  const lvl = idleMin >= 120 ? "crit" : idleMin >= 60 ? "warn" : "normal";
  const idleFill = lvl === "normal" ? "rgba(255,255,255,0.72)" : "#ffffff";
  return (
    <g style={{ filter: lifted ? "drop-shadow(0 6px 9px rgba(0,0,0,0.5))" : undefined }}>
      <rect x={-w / 2} y={trailerY} width={w} height={tH} rx={4} fill={C[op]} />
      {[0.2, 0.35, 0.5, 0.65, 0.8].map((o) => (<line key={o} x1={-w / 2 + 3} y1={trailerY + tH * o} x2={w / 2 - 3} y2={trailerY + tH * o} stroke="#fff" strokeOpacity="0.22" strokeWidth="1" />))}
      <rect x={-w / 2 + 4} y={coupY - 3} width={w - 8} height={6} rx={2} fill={C.coupling} />
      <rect x={-w / 2 + 2} y={cabY} width={w - 4} height={cH} rx={4} fill={C.cab} stroke="#fff" strokeOpacity="0.12" />
      <rect x={-w / 2 + 7} y={cabDown ? cabY + cH - 6 : cabY + 1} width={w - 14} height={5} rx={2} fill="#fff" fillOpacity="0.2" />
      {!lifted && <text x={0} y={trailerMid} transform={`rotate(-90 0 ${trailerMid})`} textAnchor="middle" dominantBaseline="central" fill={idleFill} style={{ fontSize: 12, fontWeight: 700 }}>{fmtIdle(idleMin)}</text>}
      {!lifted && <circle cx={0} cy={cabMid} r={5.5} fill={dotColor(idleMin)} />}
    </g>
  );
}

// sidebar helpers
function Row({ icon, label, value, valueClass }: { icon: ReactNode; label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex items-center gap-[1.4cqw] py-[0.7cqw]">
      <svg viewBox="0 0 24 24" className="w-[2cqw] h-[2cqw] text-slate-500 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{icon}</svg>
      <span className="text-slate-400 text-[1.55cqw]">{label}</span>
      <span className={`ml-auto text-[1.6cqw] font-semibold text-white text-right ${valueClass ?? ""}`}>{value}</span>
    </div>
  );
}
const SB_ICONS = {
  driver: <><circle cx="12" cy="8" r="3.4" /><path d="M5 21a7 7 0 0 1 14 0" /></>,
  phone: <path d="M5 4h4l2 5-3 2a12 12 0 0 0 5 5l2-3 5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />,
  truck: <><rect x="1" y="6" width="13" height="10" rx="1" /><path d="M14 9h4l3 3v4h-7z" /><circle cx="6" cy="18" r="1.6" /><circle cx="18" cy="18" r="1.6" /></>,
  trailer: <><rect x="2" y="7" width="18" height="9" rx="1" /><path d="M6 16v2M14 16v2" /></>,
  company: <><rect x="4" y="4" width="16" height="16" rx="1" /><path d="M8 8h.01M12 8h.01M16 8h.01M8 12h.01M12 12h.01M16 12h.01M8 16h3" /></>,
  dept: <path d="M4 20V9l6 3V9l6 3V4l4 2v14z" />,
  ramp: <path d="M4 20V9l8-5 8 5v11M9 20v-6h6v6" />,
  cargo: <path d="M12 3l9 4.5v9L12 21l-9-4.5v-9zM3 7.5l9 4.5 9-4.5M12 12v9" />,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
};

export function YardScene({ t, locale }: { t: Translations; locale: Locale }) {
  const y = t.ymsPage;
  const pool = DRIVER_POOLS[locale];
  const PHONES = ["+40 771 234 118", "+40 745 902 010", "+40 722 118 447", "+40 733 660 291", "+40 766 900 052", "+40 741 335 806"];
  const COMPANIES = ["Tranself", "Delamode", "Waberer's", "Girteka", "DSV", "Raben"];

  const [trucks, setTrucks] = useState<Truck[]>(() =>
    ([["unloading", 45, "D2"], ["loading", 84, "D5"], ["both", 12, "P1"], ["unloading", 125, "P4"], ["loading", 8, "P6"], ["unloading", 3, "G"]] as [Op, number, string][]).map(([op, idleMin, slot], i) => ({
      id: i, op, idleMin, slot, name: pool[i].name, plate: pool[i].plate, trailer: pool[(i + 6) % pool.length].plate, phone: PHONES[i], company: COMPANIES[i],
    }))
  );
  const [cursor, setCursor] = useState<{ x: number; y: number; down: boolean; on: boolean }>({ x: 88, y: 74, down: false, on: false });
  const [dragId, setDragId] = useState<number | null>(null);
  const [sidebar, setSidebar] = useState<number | null>(null);
  const [dialog, setDialog] = useState<{ tid: number; from: string; to: Slot } | null>(null);
  const trucksRef = useRef(trucks);
  const rootRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let cancelled = false, visible = true;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0.15 });
    if (rootRef.current) io.observe(rootRef.current);
    const sleep = (ms: number) => new Promise<void>((res) => { const s = Date.now(); const tick = () => { if (cancelled) return res(); if (visible && Date.now() - s >= ms) return res(); setTimeout(tick, visible ? 90 : 150); }; setTimeout(tick, 90); });
    const setT = (fn: (t: Truck[]) => Truck[]) => { trucksRef.current = fn(trucksRef.current); setTrucks(trucksRef.current); };

    const toPct = (sx: number, sy: number) => {
      const svg = svgRef.current, root = rootRef.current;
      if (!svg || !root) return null;
      const sr = svg.getBoundingClientRect(), rr = root.getBoundingClientRect();
      const scale = Math.min(sr.width / 1200, sr.height / 820);
      const ox = sr.left - rr.left + (sr.width - 1200 * scale) / 2;
      const oy = sr.top - rr.top + (sr.height - 820 * scale) / 2;
      return { x: ((ox + sx * scale) / rr.width) * 100, y: ((oy + sy * scale) / rr.height) * 100 };
    };
    const rectPct = (el: HTMLElement | null) => {
      const root = rootRef.current; if (!el || !root) return null;
      const b = el.getBoundingClientRect(), rr = root.getBoundingClientRect();
      return { x: ((b.left + b.width / 2 - rr.left) / rr.width) * 100, y: ((b.top + b.height / 2 - rr.top) / rr.height) * 100 };
    };
    const moveTo = async (p: { x: number; y: number } | null, ms = 640) => { if (p) setCursor((c) => ({ ...c, x: p.x, y: p.y, on: true })); await sleep(ms); };
    const click = async () => { setCursor((c) => ({ ...c, down: true })); await sleep(150); setCursor((c) => ({ ...c, down: false })); await sleep(160); };
    const hide = () => setCursor((c) => ({ ...c, on: false }));

    const run = async () => {
      await sleep(900);
      while (!cancelled) {
        const cur = trucksRef.current;
        const occupied = new Set(cur.map((t) => t.slot));
        const truck = cur[Math.floor(Math.random() * cur.length)];
        const doSidebar = Math.random() < 0.42;

        if (doSidebar) {
          const s = slotById(truck.slot);
          await moveTo(toPct(s.x, s.y));
          await click();
          setSidebar(truck.id);
          await sleep(2600);
          await moveTo(rectPct(closeRef.current), 520);
          await click();
          setSidebar(null);
          hide();
          await sleep(1300);
        } else {
          const freeDocks = DOCKS.filter((d) => !occupied.has(d.id));
          const freeAll = [...DOCKS, ...SPOTS].filter((d) => !occupied.has(d.id));
          const poolT = freeDocks.length && Math.random() < 0.7 ? freeDocks : freeAll;
          const dest = poolT[Math.floor(Math.random() * poolT.length)];
          if (!dest || dest.id === truck.slot) { await sleep(400); continue; }
          const from = slotById(truck.slot);
          await moveTo(toPct(from.x, from.y));
          setCursor((c) => ({ ...c, down: true }));
          setDragId(truck.id);
          await sleep(260);
          setT((ts) => ts.map((tk) => (tk.id === truck.id ? { ...tk, slot: dest.id } : tk)));
          await moveTo(toPct(dest.x, dest.y), 900);
          setCursor((c) => ({ ...c, down: false }));
          setDragId(null);
          await sleep(220);
          // move-confirmation dialog
          setDialog({ tid: truck.id, from: fullLabel(from), to: dest });
          await sleep(700);
          await moveTo(rectPct(confirmRef.current), 560);
          await click();
          setDialog(null);
          hide();
          if (dest.kind === "dock") setT((ts) => ts.map((tk) => (tk.id === truck.id ? { ...tk, idleMin: 1 } : tk)));
          await sleep(1400);
        }
      }
    };
    run();
    return () => { cancelled = true; io.disconnect(); };
  }, []);

  const legend = [
    { c: "#eab308", l: y.legWaiting }, { c: C.loading, l: y.legLoading }, { c: C.unloading, l: y.legUnloading }, { c: C.both, l: y.legBoth },
  ];
  const parkOcc = trucks.filter((t) => t.slot.startsWith("P")).length;
  const sbTruck = sidebar != null ? trucks.find((t) => t.id === sidebar) : null;
  const opLabel = (op: Op) => (op === "loading" ? y.legLoading : op === "unloading" ? y.legUnloading : y.legBoth);
  const ACTIONS = [
    { l: y.actChangeRamp, col: "text-purple-300 bg-purple-500/15", ic: SB_ICONS.ramp },
    { l: y.actSendParking, col: "text-teal-300 bg-teal-500/15", ic: <><rect x="4" y="4" width="16" height="16" rx="3" /><path d="M9.5 17V8h3.2a2.6 2.6 0 0 1 0 5.2H9.5" /></> },
    { l: y.actChangeDept, col: "text-purple-300 bg-purple-500/15", ic: SB_ICONS.dept },
    { l: y.actUnassign, col: "text-slate-300 bg-slate-500/15", ic: <path d="M7 8l-4 4 4 4M17 8l4 4-4 4M3 12h18" /> },
    { l: y.actWaitYms, col: "text-yellow-300 bg-yellow-500/15", ic: <path d="M7 3h10M7 21h10M8 3c0 4 8 5 8 9s-8 5-8 9M16 3c0 4-8 5-8 9" /> },
    { l: y.actCallOffice, col: "text-blue-300 bg-blue-500/15", ic: SB_ICONS.driver },
    { l: y.actOther, col: "text-orange-300 bg-orange-500/15", ic: <path d="M21 15a2 2 0 0 1-2 2H8l-4 4V5a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2z" /> },
    { l: y.actCompleteYms, col: "text-emerald-300 bg-emerald-500/15", ic: <path d="M5 21V4l7 3 7-3v11l-7 3-7-3" /> },
  ];

  return (
    <div ref={rootRef} className="@container absolute inset-0 select-none" aria-hidden="true">
      <svg ref={svgRef} viewBox="0 0 1200 820" className="w-full h-full block" preserveAspectRatio="xMidYMid meet">
        <defs><pattern id="ymGrid" width="34" height="34" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill={C.grid} /></pattern></defs>
        <rect x="0" y="0" width="1200" height="820" fill={C.ground} />
        <rect x="0" y="0" width="1200" height="820" fill="url(#ymGrid)" />

        <g transform="translate(24 22)">
          <rect x="0" y="0" width="150" height="34" rx="8" fill={C.surface} stroke={C.border} />
          <circle cx="18" cy="17" r="4.5" fill={C.green} />
          <text x="32" y="22" fill="#cbd5e1" style={{ fontSize: 14, fontWeight: 700 }}>{y.uiLiveView}</text>
        </g>

        {/* warehouse + dock doors */}
        <rect x={WH.x} y={WH.y} width={WH.w} height={WH.h} rx="8" fill={C.wh} stroke={C.whStroke} strokeWidth="2" />
        {Array.from({ length: 22 }).map((_, i) => (<line key={i} x1={WH.x + 22 + i * 46} y1={WH.y + 14} x2={WH.x + 22 + i * 46} y2={WALL - 12} stroke={C.whStroke} strokeOpacity="0.26" strokeWidth="1" />))}
        <text x={WH.x + WH.w / 2} y={WH.y + 82} textAnchor="middle" fill="#cbd5e1" style={{ fontSize: 28, fontWeight: 800, letterSpacing: 7 }}>WAREHOUSE</text>
        {DOCKS.map((s) => {
          const occ = trucks.some((t) => t.slot === s.id);
          return (
            <g key={s.id}>
              <rect x={s.x - 38} y={WALL - 6} width={76} height={12} rx={2} fill="#0f1720" stroke={C.border} strokeWidth="1.5" />
              <rect x={s.x - 56} y={WALL + 2} width={112} height={150} rx={6} fill="none" stroke={occ ? "transparent" : "#3b4a5e"} strokeWidth="1.5" strokeDasharray="5 5" />
              {!occ && <text x={s.x} y={s.y + 8} textAnchor="middle" fill="#64748b" style={{ fontSize: 22, fontWeight: 800 }}>{s.label}</text>}
            </g>
          );
        })}

        {/* parking */}
        <rect x={PARK.x} y={PARK.y} width={PARK.w} height={PARK.h} rx="10" fill={C.surface} stroke={C.border} strokeWidth="1.5" />
        <rect x={PARK.x} y={PARK.y} width={PARK.w} height={PARK.header} rx="10" fill={C.surfaceHi} />
        <text x={PARK.x + 16} y={PARK.y + 24} fill="#e2e8f0" style={{ fontSize: 16, fontWeight: 700 }}>{y.uiParking}</text>
        <text x={PARK.x + PARK.w - 14} y={PARK.y + 24} textAnchor="end" fill="#94a3b8" style={{ fontSize: 13 }}>{parkOcc}/8</text>
        {SPOTS.map((s) => {
          const occ = trucks.some((t) => t.slot === s.id);
          return (
            <g key={s.id}>
              <rect x={s.x - 30} y={s.y - 75} width={60} height={150} rx={4} fill="none" stroke="#3b4a5e" strokeWidth="1.2" strokeDasharray="4 3" />
              {!occ && <text x={s.x} y={s.y + 5} textAnchor="middle" fill="#5b6b7f" style={{ fontSize: 13, fontFamily: "monospace" }}>{s.label}</text>}
            </g>
          );
        })}

        {/* gate + barrier */}
        <rect x={GATE.x - 66} y="700" width="10" height="34" rx="2" fill={C.border} />
        <g transform={`translate(${GATE.x - 56} 707)`}><rect x="0" y="-4" width="104" height="8" rx="4" fill="#e2e8f0" />{[6, 34, 62, 90].map((bx) => (<rect key={bx} x={bx} y="-4" width="16" height="8" fill={C.amber} />))}</g>
        <text x={GATE.x - 4} y="750" textAnchor="middle" fill="#94a3b8" style={{ fontSize: 13, fontWeight: 600 }}>{y.uiGate}</text>

        {/* trucks */}
        {trucks.map((tk) => {
          const s = slotById(tk.slot);
          const lifted = dragId === tk.id;
          const hi = sidebar === tk.id;
          return (
            <g key={tk.id} style={{ transform: `translate(${s.x}px, ${s.y}px) scale(${lifted ? 1.06 : 1})`, transition: "transform 0.9s cubic-bezier(0.4,0,0.2,1)" }}>
              {hi && <circle r="52" fill="none" stroke="#818cf8" strokeWidth="2.5" opacity="0.8" />}
              <TruckBody op={tk.op} cabDown={s.kind !== "gate"} idleMin={tk.idleMin} lifted={lifted} />
            </g>
          );
        })}

        {/* legend */}
        <g transform="translate(760 24)">
          <rect x="-10" y="-4" width="426" height="34" rx="8" fill={C.surface} fillOpacity="0.92" stroke={C.border} />
          {legend.map((item, i, arr) => { const off = arr.slice(0, i).reduce((a, it) => a + 26 + it.l.length * 7.2, 0); return (<g key={i} transform={`translate(${off + 4} 13)`}><rect x="0" y="-7" width="13" height="13" rx="3" fill={item.c} /><text x="18" y="3" fill="#cbd5e1" style={{ fontSize: 12, fontWeight: 500 }}>{item.l}</text></g>); })}
        </g>
      </svg>

      {/* ===== truck detail sidebar (right, scrollable) ===== */}
      <div className="@container absolute top-0 right-0 h-full w-[40%] max-w-[54cqw] transition-transform duration-500 ease-out" style={{ transform: sbTruck ? "translateX(0)" : "translateX(105%)" }}>
        {sbTruck && (() => {
          const s = slotById(sbTruck.slot);
          return (
            <div className="h-full bg-slate-900/97 border-l border-slate-700 shadow-2xl flex flex-col overflow-hidden">
              <div className="shrink-0 px-[3cqw] pt-[3cqw] pb-[2cqw] border-b border-slate-800">
                <div className="flex items-center">
                  <span className="text-white font-bold text-[2.6cqw]">{sbTruck.plate}</span>
                  <button ref={closeRef} className="ml-auto w-[3.4cqw] h-[3.4cqw] text-slate-400 [&_svg]:w-[2.2cqw] [&_svg]:h-[2.2cqw] flex items-center justify-center"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" /></svg></button>
                </div>
                <div className="flex items-center gap-[1.4cqw] mt-[1.4cqw]">
                  <span className={`inline-flex items-center gap-[0.6cqw] rounded-full px-[1.2cqw] py-[0.5cqw] text-[1.5cqw] font-semibold ${OP_TXT[sbTruck.op]}`}><svg viewBox="0 0 24 24" className="w-[1.5cqw] h-[1.5cqw]" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M8 20V7M4.5 10.5 8 7l3.5 3.5M16 4v13M12.5 13.5 16 17l3.5-3.5" strokeLinecap="round" strokeLinejoin="round" /></svg>{opLabel(sbTruck.op)}</span>
                  <span className="inline-flex items-center gap-[0.6cqw] rounded-full px-[1.2cqw] py-[0.5cqw] text-[1.5cqw] font-semibold text-indigo-300 bg-indigo-500/15"><span className="w-[1cqw] h-[1cqw] rounded-full bg-indigo-400" />{y.sbAssignedAt}</span>
                  <span className="ml-auto inline-flex items-center gap-[0.5cqw] text-slate-400 text-[1.5cqw]"><svg viewBox="0 0 24 24" className="w-[1.6cqw] h-[1.6cqw]" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" strokeLinecap="round" /></svg>{fmtIdle(sbTruck.idleMin)}</span>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto px-[3cqw] py-[1.4cqw]">
                <Row icon={SB_ICONS.driver} label={y.sbDriver} value={sbTruck.name} />
                <Row icon={SB_ICONS.phone} label={y.sbPhone} value={sbTruck.phone} />
                <Row icon={SB_ICONS.truck} label={y.sbTruck} value={sbTruck.plate} />
                <Row icon={SB_ICONS.trailer} label={y.sbTrailer} value={sbTruck.trailer} />
                <Row icon={SB_ICONS.company} label={y.sbCompany} value={sbTruck.company} />
                <Row icon={SB_ICONS.truck} label={y.sbTruckType} value={y.valTruckTrailer} />
                <div className="border-t border-slate-800 my-[1cqw]" />
                <Row icon={SB_ICONS.dept} label={y.sbDept} value={y.valDeptOffice} />
                <Row icon={SB_ICONS.ramp} label={y.sbRamp} value={fullLabel(s)} valueClass="text-blue-400" />
                <Row icon={SB_ICONS.cargo} label={y.sbCargo} value={y.valCargo} />
                <div className="border-t border-slate-800 my-[1cqw]" />
                <Row icon={SB_ICONS.clock} label={y.sbCheckedIn} value="16.04 08:55" />
                <Row icon={SB_ICONS.clock} label={y.sbConfirmed} value="16.04 08:55" />
                <Row icon={SB_ICONS.clock} label={y.sbAssignedAt} value="11:27" />
                <div className="grid grid-cols-2 gap-[1.4cqw] mt-[1.6cqw]">
                  {ACTIONS.map((a, i) => (
                    <div key={i} className="rounded-[1.2cqw] border border-slate-700 bg-slate-800/50 py-[1.6cqw] flex flex-col items-center gap-[0.9cqw]">
                      <span className={`w-[4cqw] h-[4cqw] rounded-[1cqw] flex items-center justify-center [&_svg]:w-[2.4cqw] [&_svg]:h-[2.4cqw] ${a.col}`}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{a.ic}</svg></span>
                      <span className="text-white text-[1.5cqw] font-medium text-center leading-tight px-[0.5cqw]">{a.l}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-[1.4cqw] rounded-[1.2cqw] border border-red-500/40 py-[1.4cqw] flex items-center justify-center gap-[1cqw] text-red-400 text-[1.6cqw] font-semibold">
                  <svg viewBox="0 0 24 24" className="w-[2cqw] h-[2cqw]" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M6 6l12 12" /></svg>{y.actCancelYms}
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* ===== move-confirmation dialog ===== */}
      {dialog && (() => {
        const dt = trucks.find((t) => t.id === dialog.tid);
        if (!dt) return null;
        const toPark = dialog.to.kind === "park";
        return (
          <div className="@container absolute inset-0 z-40 flex items-center justify-center">
            <div className="absolute inset-0 bg-slate-950/60" />
            <div className="relative rounded-[1.6cqw] border border-slate-600 bg-slate-800 shadow-2xl px-[2.6cqw] py-[2.2cqw] w-[46cqw]">
              <div className="flex items-center gap-[1.4cqw]">
                <span className={`w-[3.4cqw] h-[3.4cqw] rounded-[1cqw] flex items-center justify-center [&_svg]:w-[2cqw] [&_svg]:h-[2cqw] ${toPark ? "text-teal-300 bg-teal-500/20" : "text-indigo-300 bg-indigo-500/20"}`}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{toPark ? <><rect x="4" y="4" width="16" height="16" rx="3" /><path d="M9.5 17V8h3.2a2.6 2.6 0 0 1 0 5.2H9.5" /></> : <path d="M4 20V9l8-5 8 5v11M9 20v-6h6v6" />}</svg>
                </span>
                <span className="flex flex-col leading-tight">
                  <span className="text-white font-bold text-[2.1cqw]">{toPark ? y.dlgParkTitle : y.dlgAssignTitle}</span>
                  <span className="text-slate-400 text-[1.5cqw]">{toPark ? y.dlgParkSub : y.dlgAssignSub}</span>
                </span>
              </div>
              <div className="mt-[1.6cqw] rounded-[1.2cqw] bg-slate-700/40 px-[1.8cqw] py-[1.4cqw] flex items-center gap-[1.4cqw]">
                <svg viewBox="0 0 24 24" className="w-[2.4cqw] h-[2.4cqw] text-slate-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8">{SB_ICONS.truck}</svg>
                <span className="flex flex-col leading-tight"><span className="text-slate-500 text-[1.3cqw]">{dt.plate}</span><span className="text-white font-bold text-[1.9cqw]">{dialog.from}</span></span>
                <svg viewBox="0 0 24 24" className="w-[2.4cqw] h-[2.4cqw] text-slate-400 mx-[0.6cqw]" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                {toPark ? (
                  <span className="inline-flex items-center gap-[0.8cqw] text-teal-300 font-bold text-[1.9cqw]"><svg viewBox="0 0 24 24" className="w-[2.2cqw] h-[2.2cqw]" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="4" width="16" height="16" rx="3" /><path d="M9.5 17V8h3.2a2.6 2.6 0 0 1 0 5.2H9.5" /></svg>{y.dlgParkTitle}</span>
                ) : (
                  <span className="inline-flex items-center gap-[0.8cqw] text-indigo-300 font-bold text-[1.9cqw]"><svg viewBox="0 0 24 24" className="w-[2.2cqw] h-[2.2cqw]" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 20V9l8-5 8 5v11M9 20v-6h6v6" /></svg>{dialog.to.label}</span>
                )}
              </div>
              {toPark ? (
                <>
                  <div className="text-slate-300 text-[1.55cqw] mt-[1.6cqw] mb-[0.7cqw]">{y.dlgParkSpot} <span className="text-red-400">*</span></div>
                  <div className="rounded-[1cqw] border border-slate-600 bg-slate-900 px-[1.6cqw] py-[1.1cqw] text-white text-[1.7cqw] flex items-center">[P1] {dialog.to.label}G<svg viewBox="0 0 24 24" className="ml-auto w-[1.8cqw] h-[1.8cqw] text-slate-400" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" /></svg></div>
                  <div className="text-slate-300 text-[1.55cqw] mt-[1.4cqw] mb-[0.7cqw]">{y.dlgParkMsg}</div>
                  <div className="rounded-[1cqw] border border-slate-600 bg-slate-900 px-[1.6cqw] py-[1.4cqw] text-slate-500 text-[1.5cqw] h-[7cqw]">{y.dlgParkMsgPh}</div>
                </>
              ) : (
                <>
                  <div className="text-slate-300 text-[1.55cqw] mt-[1.6cqw] mb-[0.7cqw]">{y.dlgNotes}</div>
                  <div className="rounded-[1cqw] border border-slate-600 bg-slate-900 px-[1.6cqw] py-[1.4cqw] text-slate-500 text-[1.5cqw] h-[8cqw]">{y.dlgNotesPh}</div>
                </>
              )}
              <div className="flex items-center justify-end gap-[1.2cqw] mt-[1.8cqw]">
                <span className="rounded-[1cqw] border border-slate-600 px-[1.8cqw] py-[1cqw] text-slate-300 text-[1.6cqw] font-medium">{y.dlgCancel}</span>
                <button ref={confirmRef} className={`inline-flex items-center gap-[0.8cqw] rounded-[1cqw] px-[1.8cqw] py-[1cqw] text-white text-[1.6cqw] font-semibold ${toPark ? "bg-teal-600" : "bg-indigo-600"}`}>
                  <svg viewBox="0 0 24 24" className="w-[1.9cqw] h-[1.9cqw]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{toPark ? <><rect x="4" y="4" width="16" height="16" rx="3" /><path d="M9.5 17V8h3.2a2.6 2.6 0 0 1 0 5.2H9.5" /></> : <path d="M4 20V9l8-5 8 5v11M9 20v-6h6v6" />}</svg>
                  {toPark ? y.dlgParkTitle : y.dlgAssignTitle}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ===== operator cursor ===== */}
      <div className="absolute z-50 pointer-events-none transition-all duration-[600ms] ease-out" style={{ left: `${cursor.x}%`, top: `${cursor.y}%`, opacity: cursor.on ? 1 : 0, transform: `translate(-12%, -8%) scale(${cursor.down ? 0.84 : 1})` }}>
        <svg viewBox="0 0 24 24" className="w-[3cqw] h-[3cqw] drop-shadow-lg" fill="#ffffff" stroke="#0f172a" strokeWidth="1.4" strokeLinejoin="round"><path d="M5 3l14 7-6 2-2 6-6-15z" /></svg>
      </div>
    </div>
  );
}
