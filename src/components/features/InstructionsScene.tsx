"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import type { Translations } from "@/lib/i18n/translations";
import type { Locale } from "@/lib/i18n/config";
import { DRIVER_POOLS } from "./driverPools";
import { PhoneFrame16 } from "./PhoneFrame16";

// Driver Instructions & Guidance (feature 10). LEFT: the dispatcher's check-in
// row and its real Actions dropdown — Wait (faHourglass, yellow-500), Call to
// Office (faUser, blue-500), Send to Parking (faSquareParking, teal-500), Other
// Action (faComment, orange-500) — a simulated cursor picks one and presses Send
// Instruction. RIGHT: the driver's dark status page on the shared iPhone frame,
// where the single "What to do" card is REPLACED by the matching one, in the
// real driver-web colours/icons (wait = amber faHourglass, office = blue faUser,
// parking = teal faSquareParking, custom = orange faListCheck). The link between
// them carries an "Instant" pill: delivery is a Supabase Realtime INSERT
// subscription on check_in_actions, not SMS and not polling.
// Deliberately NOT drawn (per the reality audit): no delivery/read receipt on an
// action, no reply affordance, no second card alongside the first — the priority
// chain renders exactly one. Client player; static frame on reduced-motion.

// ---- real FontAwesome glyphs, redrawn as stroke paths ----
const HOURGLASS = <><path d="M6 2h12M6 22h12" /><path d="M8 2v4c0 2.2 4 3.8 4 6s-4 3.8-4 6v4" /><path d="M16 2v4c0 2.2-4 3.8-4 6s4 3.8 4 6v4" /></>;
const USER = <><circle cx="12" cy="8" r="3.4" /><path d="M5 21a7 7 0 0 1 14 0" /></>;
const PARKING = <><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M10 17V7h3.2a3 3 0 0 1 0 6H10" /></>;
const COMMENT = <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />;
const LISTCHECK = <><path d="M3 6.5 4.6 8 7.5 5" /><path d="M3 15.5 4.6 17 7.5 14" /><path d="M11 6.5h10M11 15.5h10" /></>;
const TRUCK = <><rect x="1" y="6" width="13" height="10" rx="1" /><path d="M14 9h4l3 3v4h-7z" /><circle cx="5.5" cy="18" r="1.6" /><circle cx="18" cy="18" r="1.6" /></>;
const PLANE = <path d="M3 20l18-8L3 4l4 8-4 8z" />;

const HDR = "linear-gradient(to right, #2563eb, #1d4ed8)";

// The four real `check_in_actions.action_type` values, in the dropdown's order.
// menuCol = the dashboard menu icon colour; the card block = the driver-web
// card. `custom` is the one type whose menu icon (faComment) and card icon
// (faListCheck) genuinely differ, and whose headline is text-xl, not text-2xl.
type Act = {
  key: string;
  menuIc: ReactNode;
  menuCol: string;
  cardIc: ReactNode;
  pulse: boolean;
  small?: boolean;
  wrap: string;
  chip: string;
  ic: string;
  head: string;
  ttl: string;
};
const ACTIONS: Act[] = [
  { key: "wait", menuIc: HOURGLASS, menuCol: "#eab308", cardIc: HOURGLASS, pulse: true, wrap: "bg-amber-900/25 border-amber-500/30", chip: "bg-amber-500/20", ic: "text-amber-400", head: "text-amber-300", ttl: "text-amber-200" },
  { key: "call_to_office", menuIc: USER, menuCol: "#3b82f6", cardIc: USER, pulse: true, wrap: "bg-blue-900/25 border-blue-500/30", chip: "bg-blue-500/20", ic: "text-blue-400", head: "text-blue-300", ttl: "text-blue-200" },
  { key: "send_to_parking", menuIc: PARKING, menuCol: "#14b8a6", cardIc: PARKING, pulse: false, wrap: "bg-teal-900/25 border-teal-500/30", chip: "bg-teal-500/20", ic: "text-teal-400", head: "text-teal-300", ttl: "text-teal-200" },
  { key: "custom", menuIc: COMMENT, menuCol: "#f97316", cardIc: LISTCHECK, pulse: false, small: true, wrap: "bg-orange-900/25 border-orange-500/30", chip: "bg-orange-500/20", ic: "text-orange-400", head: "text-orange-300", ttl: "text-orange-200" },
];

// ---- dispatcher card geometry, in cqw of the stage ----
// Fixed on purpose: the simulated cursor is placed with right/top in cqw, so
// every target must be computable without measuring the DOM. The card is
// right-anchored, which makes all three targets independent of its width.
const CARD_H = 44;
const MENU_TOP = 9.2; // header (8) + the dropdown's 1.2 offset
const ITEM_H = 5.4;
const ITEM_STEP = 6; // ITEM_H + 0.6 gap
const itemY = (i: number) => MENU_TOP + 1 + i * ITEM_STEP + ITEM_H / 2;
// the cursor glyph is 3cqw wide with its tip ~0.6/0.4cqw in from its top-left,
// so a `right` anchor puts the tip at right + 2.4cqw.
const AT_IDLE = { r: 2, t: CARD_H - 2 };
const AT_BTN = { r: 6, t: 3.6 };
const AT_ITEM = (i: number) => ({ r: 17, t: itemY(i) - 0.4 });
const AT_SEND = { r: 8, t: CARD_H - 4.4 };

// the order the loop sends in. Starts on `call_to_office` so the very first
// swap is a colour change away from the amber card the phone opens on, and all
// four types get their turn before it repeats.
const SEQ = [1, 2, 3, 0];

// Every step of the loop is one frame object, so a render never has to stitch
// several useStates together.
type Frame = {
  menu: boolean;
  hover: number | null;
  sel: number | null;
  card: number; // the one "What to do" card the driver has
  pkt: number; // bumped per send -> remounts the packet so its flight replays
  cur: { r: number; t: number; down: boolean; on: boolean };
};
const LIVE_START: Frame = { menu: false, hover: null, sel: null, card: 0, pkt: 0, cur: { ...AT_IDLE, down: false, on: false } };
// reduced motion gets the frame that carries the most meaning: the menu open on
// Call to Office and its blue card already on the phone — the whole mechanic
// readable without a single frame of motion.
const STATIC_FRAME: Frame = { menu: true, hover: 1, sel: 1, card: 1, pkt: 0, cur: { ...AT_ITEM(1), down: false, on: true } };

// prefers-reduced-motion read as an external store rather than synced into state
// from an effect: setState in an effect body is a cascading render, and the
// server snapshot (false) matches LIVE_START, so hydration stays clean.
const RM_Q = "(prefers-reduced-motion: reduce)";
const rmSubscribe = (cb: () => void) => {
  const m = window.matchMedia(RM_Q);
  m.addEventListener("change", cb);
  return () => m.removeEventListener("change", cb);
};
const rmGet = () => window.matchMedia(RM_Q).matches;
const rmGetServer = () => false;

// a plausible, deterministic QR — the real status page renders a QRCodeSVG of
// the check-in id. Module scope so the pattern is stable across renders (no
// Math.random, which would break SSR hydration).
const F10_QR: [number, number][] = (() => {
  const N = 21, out: [number, number][] = [];
  const finder = (x: number, y: number) => (x < 8 && y < 8) || (x >= N - 8 && y < 8) || (x < 8 && y >= N - 8);
  let s = 20260710;
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    if (finder(x, y)) continue;
    if ((s >>> 16) % 100 < 46) out.push([x, y]);
  }
  return out;
})();
function QRBlock() {
  return (
    <svg viewBox="0 0 21 21" className="w-full h-full" shapeRendering="crispEdges">
      <rect width="21" height="21" fill="#fff" />
      {F10_QR.map(([x, y], i) => <rect key={i} x={x} y={y} width="1" height="1" fill="#1f2937" />)}
      {([[0, 0], [14, 0], [0, 14]] as const).map(([x, y], i) => (
        <g key={i} fill="#1f2937">
          <rect x={x} y={y} width="7" height="7" />
          <rect x={x + 1} y={y + 1} width="5" height="5" fill="#fff" />
          <rect x={x + 2} y={y + 2} width="3" height="3" />
        </g>
      ))}
    </svg>
  );
}

function Ic({ d, className, w = "2", col }: { d: ReactNode; className?: string; w?: string; col?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={col ? { color: col } : undefined} fill="none" stroke="currentColor" strokeWidth={w} strokeLinecap="round" strokeLinejoin="round">{d}</svg>
  );
}

export function InstructionsScene({ t, locale }: { t: Translations; locale: Locale }) {
  const f = t.f10Page;
  const driver = DRIVER_POOLS[locale][0];
  // labels are index-aligned with ACTIONS — the same string the dispatcher picks
  // is the one the driver's card is headed with
  const LABELS = [f.actWait, f.actOffice, f.actParking, f.actCustom];

  const reduced = useSyncExternalStore(rmSubscribe, rmGet, rmGetServer);
  const [s, set] = useState<Frame>(LIVE_START);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reduced) return;
    let cancelled = false, visible = true;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0.15 });
    if (rootRef.current) io.observe(rootRef.current);
    const sleep = (ms: number) => new Promise<void>((res) => { const st = Date.now(); const tick = () => { if (cancelled) return res(); if (visible && Date.now() - st >= ms) return res(); setTimeout(tick, visible ? 90 : 150); }; setTimeout(tick, 90); });
    const down = async (d: boolean) => set((v) => ({ ...v, cur: { ...v.cur, down: d } }));
    const click = async () => { await down(true); await sleep(160); await down(false); };
    const moveTo = (p: { r: number; t: number }) => set((v) => ({ ...v, cur: { ...v.cur, ...p, on: true } }));
    (async () => {
      await sleep(800);
      for (let k = 0; !cancelled; k++) {
        const i = SEQ[k % SEQ.length];
        // 1) open the Actions dropdown
        moveTo(AT_BTN); await sleep(650);
        await click();
        set((v) => ({ ...v, menu: true, sel: null })); await sleep(400);
        // 2) pick one of the four action types
        moveTo(AT_ITEM(i)); await sleep(620);
        set((v) => ({ ...v, hover: i })); await sleep(500);
        await click();
        set((v) => ({ ...v, menu: false, hover: null, sel: i })); await sleep(400);
        // 3) press Send Instruction
        moveTo(AT_SEND); await sleep(600);
        await click();
        // 4) it crosses the realtime link and REPLACES the driver's card
        set((v) => ({ ...v, pkt: v.pkt + 1 })); await sleep(560);
        if (cancelled) break;
        set((v) => ({ ...v, card: i })); await sleep(1200);
        set((v) => ({ ...v, sel: null })); await sleep(400);
      }
    })();
    return () => { cancelled = true; io.disconnect(); };
  }, [reduced]);

  const { menu, hover, sel, card, pkt, cur } = reduced ? STATIC_FRAME : s;
  const a = ACTIONS[card];

  return (
    <div ref={rootRef} className="@container absolute inset-0 p-[3cqw] flex items-center justify-center gap-[1cqw] text-slate-200 select-none" aria-hidden="true">
      {/* ===== dispatcher: the check-in row + its Actions dropdown ===== */}
      <div className="flex-1 min-w-0 max-w-[46cqw] flex justify-end">
        <div className="relative isolate w-full rounded-[1.4cqw] border border-slate-700/70 bg-slate-900/70 flex flex-col shadow-2xl" style={{ height: `${CARD_H}cqw` }}>
          {/* check-in row */}
          <div className="flex items-center gap-[1.4cqw] px-[1.8cqw] border-b border-slate-700/70 bg-slate-800/60 rounded-t-[1.4cqw] shrink-0" style={{ height: "8cqw" }}>
            <span className="w-[4cqw] h-[4cqw] rounded-[1cqw] bg-slate-700 text-slate-300 flex items-center justify-center shrink-0">
              <Ic d={TRUCK} className="w-[2.4cqw] h-[2.4cqw]" w="1.6" />
            </span>
            <span className="flex flex-col leading-tight min-w-0">
              <span className="text-white font-bold text-[1.9cqw] truncate">{driver.plate}</span>
              <span className="text-slate-400 text-[1.4cqw] truncate">{driver.name}</span>
            </span>
            {/* Actions button — the cursor's first target */}
            <span className={`ml-auto inline-flex items-center gap-[0.8cqw] rounded-[0.9cqw] border px-[1.4cqw] py-[1cqw] text-[1.5cqw] font-semibold shrink-0 transition-colors duration-200 ${menu ? "border-blue-500/70 bg-blue-500/15 text-blue-200" : "border-slate-600 bg-slate-800 text-slate-200"}`}>
              {f.uiActions}
              <svg viewBox="0 0 24 24" className={`w-[1.8cqw] h-[1.8cqw] transition-transform duration-200 ${menu ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M6 9l6 6 6-6" /></svg>
            </span>
          </div>

          {/* body — the check-in's own detail fields, which the dropdown overlays */}
          <div className="relative flex-1 min-h-0">
            <div className="absolute inset-0 p-[1.8cqw] grid grid-cols-2 gap-x-[2.4cqw] gap-y-[1.8cqw] content-start opacity-70">
              {[62, 48, 40, 56, 34, 52, 44, 38].map((w, i) => (
                <span key={i} className="flex items-center gap-[1.2cqw]">
                  <span className="w-[2.8cqw] h-[2.8cqw] rounded-[0.7cqw] bg-slate-800 shrink-0" />
                  <span className="flex flex-col gap-[0.6cqw] flex-1 min-w-0">
                    <span className="h-[0.8cqw] w-[38%] rounded-full bg-slate-700/60" />
                    <span className="h-[1.2cqw] rounded-full bg-slate-700" style={{ width: `${w}%` }} />
                  </span>
                </span>
              ))}
            </div>
            {/* w-26 so the longest localized label (DE "Zum Parkplatz schicken") stays unclipped */}
            {menu && (
              <div className="f10-menu absolute right-[1.8cqw] z-20 w-[26cqw] rounded-[1.1cqw] border border-slate-600 bg-slate-800 shadow-2xl flex flex-col" style={{ top: "1.2cqw", padding: "1cqw", gap: "0.6cqw" }}>
                {ACTIONS.map((act, i) => (
                  <span key={act.key} className={`flex items-center gap-[1.2cqw] rounded-[0.8cqw] px-[1.2cqw] text-[1.5cqw] font-medium transition-colors duration-150 ${hover === i ? "bg-slate-700 text-white" : "text-slate-300"}`} style={{ height: `${ITEM_H}cqw` }}>
                    {/* each type keeps its real menu colour: yellow / blue / teal / orange */}
                    <Ic d={act.menuIc} className="w-[2.2cqw] h-[2.2cqw] shrink-0" w="1.9" col={act.menuCol} />
                    <span className="truncate">{LABELS[i]}</span>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* compose bar — the action the dispatcher is about to send */}
          <div className="flex items-center gap-[1.4cqw] px-[1.8cqw] border-t border-slate-700/70 bg-slate-800/40 rounded-b-[1.4cqw] shrink-0" style={{ height: "8cqw" }}>
            {/* flex-1 + min-w-0: the chip yields to the button and truncates
                rather than pushing the card wide (FR has the longest pair) */}
            <span className="flex-1 min-w-0 flex">
              {sel !== null ? (
                <span className="inline-flex min-w-0 max-w-full items-center gap-[1cqw] rounded-full border border-slate-600 bg-slate-800 px-[1.4cqw] py-[0.7cqw] text-[1.5cqw] font-semibold text-white">
                  <Ic d={ACTIONS[sel].menuIc} className="w-[2cqw] h-[2cqw] shrink-0" w="1.9" col={ACTIONS[sel].menuCol} />
                  <span className="truncate">{LABELS[sel]}</span>
                </span>
              ) : (
                <span className="h-[1.4cqw] w-[16cqw] self-center rounded-full bg-slate-700/50" />
              )}
            </span>
            <span
              className={`inline-flex items-center gap-[1cqw] rounded-[0.9cqw] px-[1.6cqw] py-[1.1cqw] text-[1.5cqw] font-semibold whitespace-nowrap shrink-0 transition-all duration-200 ${sel !== null ? "text-white shadow-lg shadow-blue-900/40" : "bg-slate-700/50 text-slate-500"}`}
              style={sel !== null ? { background: HDR } : undefined}
            >
              <svg viewBox="0 0 24 24" className="w-[1.9cqw] h-[1.9cqw]" fill="currentColor">{PLANE}</svg>
              {f.uiSent}
            </span>
          </div>

          {/* simulated dispatcher cursor */}
          <div
            className="absolute z-30 pointer-events-none transition-all duration-[600ms] ease-out"
            style={{ right: `${cur.r}cqw`, top: `${cur.t}cqw`, opacity: cur.on ? 1 : 0, transform: `scale(${cur.down ? 0.84 : 1})`, transformOrigin: "top left" }}
          >
            <svg viewBox="0 0 24 24" className="w-[3cqw] h-[3cqw] drop-shadow-lg" fill="#ffffff" stroke="#0f172a" strokeWidth="1.4" strokeLinejoin="round"><path d="M5 3l14 7-6 2-2 6-6-15z" /></svg>
          </div>
        </div>
      </div>

      {/* ===== the realtime link ===== */}
      <div className="relative w-[12cqw] h-[46cqw] shrink-0 flex items-center justify-center">
        <span className="absolute inset-x-0 top-1/2 border-t border-dashed border-slate-600" />
        <svg viewBox="0 0 24 24" className="absolute right-0 top-1/2 -translate-y-1/2 w-[2cqw] h-[2cqw] text-slate-600" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6" /></svg>
        {/* the instruction itself, crossing the postgres_changes subscription */}
        {pkt > 0 && (
          <span key={pkt} className="f10-pkt absolute left-0 top-1/2 -mt-[0.7cqw] w-[1.4cqw] h-[1.4cqw] rounded-full bg-sky-400 shadow-[0_0_1.4cqw_rgba(56,189,248,0.9)]" style={{ ["--f10-dx" as string]: "10cqw" }} />
        )}
        <span className="relative inline-flex items-center gap-[0.7cqw] rounded-full border border-sky-500/40 bg-slate-900 px-[1cqw] py-[0.5cqw] text-[1.2cqw] font-semibold text-sky-300 whitespace-nowrap">
          <span className="relative flex w-[0.9cqw] h-[0.9cqw] shrink-0">
            <span className="absolute inline-flex w-full h-full rounded-full bg-sky-400 opacity-75 animate-ping" />
            <span className="relative rounded-full w-[0.9cqw] h-[0.9cqw] bg-sky-400" />
          </span>
          {f.uiInstant}
        </span>
      </div>

      {/* ===== driver: the dark status page at qrgo.ro/[slug]/status/[id] ===== */}
      <div className="h-[94%] shrink-0">
        <PhoneFrame16 time="14:32" screenClassName="bg-gradient-to-b from-slate-900 to-slate-800">
          <div className="flex-1 min-h-0 flex flex-col pt-[1.5cqw]">
            {/* the driver's own check-in, blue-gradient header like the real page */}
            <div className="flex items-center gap-[2.4cqw] px-[3.5cqw] py-[2.8cqw] shrink-0" style={{ background: HDR }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/qrgo-icon.svg" alt="" className="w-[8.4cqw] h-[8.4cqw] rounded-[2.2cqw] bg-white p-[0.8cqw] shrink-0" />
              <span className="flex flex-col leading-tight min-w-0">
                <span className="text-white font-bold text-[3.4cqw] truncate">{driver.name}</span>
                <span className="text-blue-100 text-[2.6cqw] font-mono truncate">{driver.plate}</span>
              </span>
              {/* the page holds an open realtime channel for as long as it is up */}
              <span className="ml-auto relative flex w-[2cqw] h-[2cqw] shrink-0">
                <span className="absolute inline-flex w-full h-full rounded-full bg-green-400 opacity-75 animate-ping" />
                <span className="relative rounded-full w-[2cqw] h-[2cqw] bg-green-400" />
              </span>
            </div>

            {/* THE card. There is only ever one: a newer action outranks the old
                one, so this slot is replaced, never appended to. */}
            <div className="p-[3cqw] shrink-0">
              <div key={card} className={`f10-cardin rounded-[2.4cqw] border p-[3cqw] flex flex-col gap-[2cqw] ${a.wrap}`}>
                <span className="flex items-center gap-[2cqw]">
                  <span className={`w-[9cqw] h-[9cqw] rounded-full flex items-center justify-center shrink-0 ${a.chip} ${a.pulse ? "animate-pulse" : ""}`}>
                    <Ic d={a.cardIc} className={`w-[4.6cqw] h-[4.6cqw] ${a.ic}`} w="1.9" />
                  </span>
                  <span className={`font-semibold text-[3.2cqw] ${a.head}`}>{f.uiWhatToDo}</span>
                </span>
                <span className={`font-bold leading-tight ${a.ttl} ${a.small ? "text-[4.4cqw]" : "text-[5.2cqw]"}`}>{LABELS[card]}</span>
              </div>
            </div>

            {/* the rest of the real status page: the check-in's QR + short id */}
            <div className="mx-[3cqw] mb-[3cqw] rounded-[2.4cqw] bg-slate-900/50 p-[3cqw] flex flex-col items-center justify-center gap-[2cqw] flex-1 min-h-0">
              <span className="w-[30cqw] h-[30cqw] rounded-[1.6cqw] bg-white p-[1.6cqw] block shrink-0"><QRBlock /></span>
              <span className="text-[2.2cqw] text-slate-500 font-mono">a3f8c1d2…</span>
            </div>
          </div>
        </PhoneFrame16>
      </div>
    </div>
  );
}
