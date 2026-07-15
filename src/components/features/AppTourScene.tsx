"use client";

import { useEffect, useRef, useState, type ReactNode, type FC } from "react";
import type { Translations } from "@/lib/i18n/translations";
import { PhoneFrame16 } from "./PhoneFrame16";
import { AndroidFrame } from "./AndroidFrame";
import { FlagRO, FlagGB, FlagDE, FlagFR, FlagPL, FlagIT, FlagES, FlagNL, FlagHU, FlagBG, FlagCZ, FlagSK } from "@/components/icons/flags";

const APPLE_D = "M17.05 12.7c-.03-2.5 2.04-3.7 2.13-3.76-1.16-1.7-2.97-1.93-3.61-1.96-1.54-.16-3 .9-3.78.9-.78 0-1.98-.88-3.25-.86-1.67.03-3.21.97-4.07 2.47-1.73 3-.44 7.45 1.25 9.88.82 1.19 1.8 2.53 3.08 2.48 1.24-.05 1.71-.8 3.21-.8 1.49 0 1.92.8 3.23.77 1.33-.02 2.18-1.21 3-2.41.94-1.38 1.33-2.72 1.35-2.79-.03-.01-2.59-1-2.62-3.94M14.6 4.98c.68-.83 1.14-1.98 1.02-3.13-.98.04-2.18.65-2.89 1.48-.63.73-1.19 1.9-1.04 3.02 1.1.08 2.22-.55 2.91-1.37";
const ANDROID_D = "M6 18c0 .55.45 1 1 1h1v3.5a1.5 1.5 0 0 0 3 0V19h2v3.5a1.5 1.5 0 0 0 3 0V19h1c.55 0 1-.45 1-1V8H6v10zM3.5 8A1.5 1.5 0 0 0 2 9.5v7a1.5 1.5 0 0 0 3 0v-7A1.5 1.5 0 0 0 3.5 8zm17 0a1.5 1.5 0 0 0-1.5 1.5v7a1.5 1.5 0 0 0 3 0v-7A1.5 1.5 0 0 0 20.5 8zM15.53 2.16l1.3-1.3a.25.25 0 0 0-.35-.35l-1.32 1.32A5.9 5.9 0 0 0 12 1.25c-.98 0-1.9.24-2.71.66L7.96.51a.25.25 0 1 0-.35.35l1.3 1.3A5.75 5.75 0 0 0 6 7h12a5.75 5.75 0 0 0-2.47-4.84zM10 5H9V4h1v1zm5 0h-1V4h1v1z";

// Android & iOS App (feature 6): the shared iPhone 16 Pro Max frame running a
// product tour through faithful re-creations of the real QRGO Driver screens —
// dark, blue-gradient (theme-600→700) card headers, exactly like the live driver
// web: language picker (all 12) → check-in form → live status → chat.
// Status colours/icons mirror the real app: waiting = yellow hourglass (spins),
// assigned = purple map-pin, in_progress = indigo truck. We show "assigned".
// Client player; static first screen on reduced-motion. aria-hidden decorative.

const HDR = "linear-gradient(to right, #2563eb, #1d4ed8)";
// per-screen dwell: language, check-in form, status (long — it scrolls through
// the whole real screen), chat. Must stay in step with `app-stscroll`'s duration.
const DWELL = [3800, 4400, 12000, 5000];
// the driver app's 12 languages, in the app's own order, with real SVG flags
const LANGS: [FC<{ className?: string }>, string][] = [
  [FlagRO, "Română"], [FlagGB, "English"], [FlagDE, "Deutsch"], [FlagFR, "Français"],
  [FlagPL, "Polski"], [FlagIT, "Italiano"], [FlagES, "Español"], [FlagNL, "Nederlands"],
  [FlagHU, "Magyar"], [FlagBG, "Български"], [FlagCZ, "Čeština"], [FlagSK, "Slovenčina"],
];
const TruckIc = <><path d="M1 6h13v8H1zM14 9h4l3 3v2h-7z" /><circle cx="5" cy="17" r="1.6" /><circle cx="18" cy="17" r="1.6" /></>;
const GlobeIc = <><circle cx="12" cy="12" r="9.5" /><path d="M2.5 12h19M12 2.5a15 15 0 0 1 4 9.5 15 15 0 0 1-4 9.5 15 15 0 0 1-4-9.5 15 15 0 0 1 4-9.5z" /></>;
const PinIc = <><path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11z" /><circle cx="12" cy="10" r="2.5" /></>;
const UserIc = <><circle cx="12" cy="8" r="3.4" /><path d="M5 21a7 7 0 0 1 14 0" /></>;
const WarehouseIc = <><path d="M3 21V9l9-5 9 5v12" /><path d="M8 21v-6h8v6" /><path d="M8 12h8" /></>;
const InfoIc = <><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></>;
const RouteIc = <><circle cx="6" cy="19" r="2.5" /><circle cx="18" cy="5" r="2.5" /><path d="M8.5 19H15a3.5 3.5 0 0 0 0-7H9a3.5 3.5 0 0 1 0-7h6.5" /></>;
const CameraIc = <><rect x="3" y="6" width="18" height="14" rx="2" /><circle cx="12" cy="13" r="3.2" /><path d="M8 6l1.5-2.5h5L16 6" /></>;
const ClockIc = <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>;
const ListIc = <><path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01" /></>;
const CheckCircleIc = <><circle cx="12" cy="12" r="9" /><path d="M8.5 12.5l2.5 2.5 4.5-5" /></>;
const PlusIc = <><circle cx="12" cy="12" r="9" /><path d="M12 8v8M8 12h8" /></>;
const BuildingIc = <><rect x="4" y="3" width="16" height="18" rx="1.5" /><path d="M8 7h.01M12 7h.01M16 7h.01M8 11h.01M12 11h.01M16 11h.01M8 15h.01M16 15h.01M10 21v-4h4v4" /></>;
const TrailerIc = <><rect x="2" y="7" width="18" height="9" rx="1" /><path d="M6 16v2M14 16v2M20 11h2" /></>;
const BoxesIc = <><rect x="3" y="13" width="8" height="8" rx="1" /><rect x="13" y="13" width="8" height="8" rx="1" /><rect x="8" y="3" width="8" height="8" rx="1" /></>;
const BarcodeIc = <path d="M4 5v14M7 5v14M10 5v10M13 5v14M16 5v10M20 5v14" />;
const ImageIc = <><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="8.5" cy="9.5" r="1.6" /><path d="M21 16l-5-5-6 6-3-3-4 4" /></>;

// a plausible, deterministic QR — the real screen renders a QRCodeSVG of the
// check-in id. Module scope so the pattern is stable across renders (and no
// Math.random, which would break SSR hydration).
const QR_CELLS: [number, number][] = (() => {
  const N = 21, out: [number, number][] = [];
  const finder = (x: number, y: number) => (x < 8 && y < 8) || (x >= N - 8 && y < 8) || (x < 8 && y >= N - 8);
  let s = 20260715;
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
      {QR_CELLS.map(([x, y], i) => <rect key={i} x={x} y={y} width="1" height="1" fill="#1f2937" />)}
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

// the real app renders European plates itself: blue EU band + stars + country code
function Plate({ text }: { text: string }) {
  return (
    <span className="inline-flex items-stretch h-[5.6cqw] rounded-[0.8cqw] overflow-hidden bg-white border-[0.4cqw] border-slate-900 shrink-0">
      <span className="w-[3.8cqw] bg-blue-800 flex flex-col items-center justify-center gap-[0.2cqw] shrink-0">
        <svg viewBox="0 0 10 10" className="w-[1.5cqw] h-[1.5cqw] text-yellow-400" fill="currentColor"><path d="M5 0l1.2 3.6H10L7 5.8 8.2 9.4 5 7.2 1.8 9.4 3 5.8 0 3.6h3.8z" /></svg>
        <span className="text-white text-[1.3cqw] font-bold leading-none">RO</span>
      </span>
      <span className="px-[1.4cqw] flex items-center font-mono font-bold text-slate-900 text-[2.8cqw] tracking-wider whitespace-nowrap">{text}</span>
    </span>
  );
}

// section header used by every card on the real status screen:
// a w-10 h-10 rounded-full bg-theme-100 icon circle + a text-lg title
function Sec({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-[2cqw]">
      <span className="flex items-center gap-[2cqw]">
        <span className="w-[7cqw] h-[7cqw] rounded-full bg-blue-500/20 text-blue-300 flex items-center justify-center [&_svg]:w-[3.6cqw] [&_svg]:h-[3.6cqw] shrink-0">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">{icon}</svg>
        </span>
        <span className="text-white font-semibold text-[3.1cqw]">{title}</span>
      </span>
      {children}
    </div>
  );
}
function KV({ label, children }: { label: string; children: ReactNode }) {
  return (
    <span className="flex flex-col gap-[0.9cqw] min-w-0 items-start">
      <span className="text-[2.1cqw] uppercase tracking-wide text-slate-500 font-semibold">{label}</span>
      <span className="text-[2.9cqw] text-slate-100 font-medium truncate max-w-full">{children}</span>
    </span>
  );
}

// the official QRGO mark on a white tile — same treatment as the other scenes
function QLogo({ s }: { s: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/qrgo-icon.svg" alt="" className="rounded-[2.2cqw] bg-white shrink-0" style={{ width: s, height: s, padding: `calc(${s} * 0.09)` }} />
  );
}

// The real app opens with a Facebook-style ProfileHeader, not a strip: a cover
// band, an overlapping circular avatar (fallback = a *building* glyph, not a
// truck), the org name as an h1, then the address behind a pin icon.
function OrgStrip() {
  return (
    <div className="shrink-0">
      <div className="relative h-[17cqw]" style={{ background: HDR }}>
        <span className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
      </div>
      <div className="relative px-[3.5cqw] pb-[2cqw]">
        <span className="absolute -top-[7cqw] left-[3.5cqw] w-[14cqw] h-[14cqw] rounded-full bg-blue-500/20 border-[0.8cqw] border-slate-800 flex items-center justify-center text-blue-300 [&_svg]:w-[6.6cqw] [&_svg]:h-[6.6cqw]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{BuildingIc}</svg>
        </span>
        <div className="pt-[8cqw] flex flex-col gap-[0.6cqw] min-w-0">
          <span className="text-white font-bold text-[4cqw] truncate">London Warehouse</span>
          <span className="flex items-center gap-[1.2cqw] text-slate-400 text-[2.6cqw] min-w-0">
            <svg viewBox="0 0 24 24" className="w-[2.8cqw] h-[2.8cqw] shrink-0" fill="none" stroke="currentColor" strokeWidth="1.9">{PinIc}</svg>
            <span className="truncate">Industriilor 19 · Chiajna</span>
          </span>
        </div>
      </div>
    </div>
  );
}
// every section on the real form uses a flat bg-theme-100 circle + theme-600
// icon — never a gradient fill — and marks required fields with a red asterisk
function FormSec({ icon, title }: { icon: ReactNode; title: string }) {
  return (
    <span className="flex items-center gap-[2cqw] text-[3.2cqw] font-bold text-white">
      <span className="w-[6cqw] h-[6cqw] rounded-full bg-blue-500/20 text-blue-300 flex items-center justify-center [&_svg]:w-[3.2cqw] [&_svg]:h-[3.2cqw] shrink-0">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{icon}</svg>
      </span>
      {title}
    </span>
  );
}
const Req = () => <span className="text-red-500">*</span>;
function GradHeader({ icon, title, sub, live, liveLabel }: { icon: ReactNode; title: string; sub?: string; live?: boolean; liveLabel?: string }) {
  return (
    <div className="flex items-center gap-[2.6cqw] px-[3.5cqw] py-[2.8cqw] shrink-0" style={{ background: HDR }}>
      <span className="w-[8.4cqw] h-[8.4cqw] rounded-[2.2cqw] bg-white/20 flex items-center justify-center text-white [&_svg]:w-[4.6cqw] [&_svg]:h-[4.6cqw] shrink-0"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{icon}</svg></span>
      <span className="flex flex-col leading-tight min-w-0">
        <span className="text-white font-bold text-[3.7cqw] truncate">{title}</span>
        {sub && <span className="text-blue-100 text-[2.7cqw] truncate">{sub}</span>}
      </span>
      {live && <span className="ml-auto inline-flex items-center gap-[1cqw] bg-white/20 rounded-full px-[2.2cqw] py-[1cqw] text-white text-[2.5cqw] font-medium shrink-0"><span className="relative flex w-[1.7cqw] h-[1.7cqw]"><span className="absolute inline-flex w-full h-full rounded-full bg-green-400 opacity-75 animate-ping" /><span className="relative rounded-full w-[1.7cqw] h-[1.7cqw] bg-green-400" /></span>{liveLabel}</span>}
    </div>
  );
}
function Field({ label, col, icon, w = "60%", req, optional }: { label: string; col: string; icon: ReactNode; w?: string; req?: boolean; optional?: string }) {
  return (
    <div className="flex flex-col gap-[1.2cqw]">
      <span className="flex items-center gap-[1.4cqw] text-[2.8cqw] font-medium text-slate-300">
        <svg viewBox="0 0 24 24" className="w-[3cqw] h-[3cqw]" fill="none" stroke={col} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">{icon}</svg>
        {label}{req && <Req />}{optional && <span className="text-slate-500 text-[2.4cqw]">{optional}</span>}
      </span>
      <span className="rounded-[2cqw] bg-slate-900/60 border border-slate-700 px-[3cqw] py-[2.4cqw] flex items-center"><span className="h-[1.6cqw] rounded-full bg-slate-700" style={{ width: w }} /></span>
    </div>
  );
}

export function AppTourScene({ t }: { t: Translations }) {
  const f = t.f6Page;
  const c = t.chatPage;
  const [scr, setScr] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let cancelled = false, visible = true;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0.2 });
    if (rootRef.current) io.observe(rootRef.current);
    let i = 0;
    const step = () => { if (cancelled) return; if (!visible) { setTimeout(step, 300); return; } i = (i + 1) % 4; setScr(i); setTimeout(step, DWELL[i]); };
    const to = setTimeout(step, DWELL[0]);
    return () => { cancelled = true; clearTimeout(to); io.disconnect(); };
  }, []);

  const feats = [
    { l: f.feat12Lang, ic: GlobeIc },
    { l: f.featScan, ic: <path d="M4 7V5a1 1 0 0 1 1-1h2M17 4h2a1 1 0 0 1 1 1v2M20 17v2a1 1 0 0 1-1 1h-2M7 20H5a1 1 0 0 1-1-1v-2M4 12h16" /> },
    { l: f.featStatus, ic: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></> },
    { l: f.featChat, ic: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /> },
    { l: f.featDirections, ic: PinIc },
    { l: f.featAuto, ic: <><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" /></> },
  ];
  // driver's view: own (driver) messages blue-right, dispatcher grey-left
  const chat: [string, boolean][] = [[c.s1m1, true], [c.s1m2, false], [c.s1m3, false], [c.s1m4, true], [c.s1m5, false]];

  const screens = [
    // 1) language picker — all 12, real SVG flags
    <div key="l" className="flex-1 min-h-0 flex flex-col">
      <OrgStrip />
      {/* the real picker leads with a Welcome! heading + a row of native greetings */}
      <div className="px-[3cqw] pt-[1cqw] pb-[2cqw] flex flex-col items-center gap-[1cqw] shrink-0">
        <span className="text-white font-bold text-[4.4cqw]">{f.scWelcomeH}</span>
        <span className="text-slate-400 text-[2.3cqw] text-center leading-snug">Welcome • Bienvenue • Bienvenido • Benvenuto • Willkommen</span>
      </div>
      <div className="mx-[3cqw] mb-[2cqw] rounded-[3cqw] overflow-hidden border border-slate-700 bg-slate-800/70 flex flex-col flex-1 min-h-0">
        <GradHeader icon={GlobeIc} title={f.scLang} sub={f.scChooseLang} />
        {/* the list fills the screen, as it does in the real app. No permanent
            selected row exists there — blue is hover only, which is what the
            sweep reads as. */}
        <div className="relative p-[2.4cqw] flex flex-col gap-[1.3cqw] flex-1 min-h-0 overflow-hidden">
          {/* highlight sweeping down the languages */}
          <span className="app-langsweep pointer-events-none absolute inset-x-[2cqw] h-[13%] rounded-[2cqw] z-10" />
          {LANGS.map(([Flag, n], k) => (
            <span key={k} className="flex flex-1 items-center gap-[2.4cqw] rounded-[2cqw] border border-slate-700 bg-slate-900/40 text-slate-200 px-[2.6cqw] py-[1.6cqw] text-[3.1cqw] font-semibold">
              <Flag className="w-[5.4cqw] h-[4.05cqw] rounded-[0.5cqw] shrink-0" />{n}
            </span>
          ))}
        </div>
      </div>
      <span className="px-[5cqw] pb-[2cqw] text-center text-slate-500 text-[2.2cqw] leading-snug shrink-0">{f.scChangeLater}</span>
    </div>,
    // 2) check-in form
    <div key="c" className="flex-1 min-h-0 flex flex-col">
      <OrgStrip />
      <div className="mx-[3cqw] rounded-[3cqw] overflow-hidden border border-slate-700 bg-slate-800/70">
        <GradHeader icon={<path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2M9 12l1.5 1.5L14 10" />} title={f.scCheckinForm} sub="London Warehouse" />
        <div className="p-[3.2cqw] flex flex-col gap-[2.4cqw]">
          <FormSec icon={UserIc} title={f.scPersonal} />
          <Field label={f.scDriverName} col="#60a5fa" icon={UserIc} w="52%" req />
          <div className="flex flex-col gap-[1.2cqw]">
            <span className="flex items-center gap-[1.4cqw] text-[2.8cqw] font-medium text-slate-300"><svg viewBox="0 0 24 24" className="w-[3cqw] h-[3cqw]" fill="none" stroke="#60a5fa" strokeWidth="1.9"><path d="M5 4h4l2 5-3 2a12 12 0 0 0 5 5l2-3 5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" strokeLinecap="round" /></svg>{f.scPhone}<Req /></span>
            <div className="flex gap-[1.8cqw]">
              {/* real country chip: flag + dial code + chevron */}
              <span className="rounded-[2cqw] bg-slate-900/60 border border-slate-700 px-[2.2cqw] py-[2.4cqw] text-[2.8cqw] text-slate-300 flex items-center gap-[1.2cqw] shrink-0">
                <FlagRO className="w-[4.4cqw] h-[3.2cqw] rounded-[0.4cqw]" />+40
                <svg viewBox="0 0 24 24" className="w-[2.4cqw] h-[2.4cqw] text-slate-500" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M6 9l6 6 6-6" strokeLinecap="round" /></svg>
              </span>
              {/* valid phone gets a green ring + check in the real form */}
              <span className="flex-1 rounded-[2cqw] bg-slate-900/60 border border-green-500/60 px-[3cqw] py-[2.4cqw] flex items-center gap-[1.6cqw] min-w-0">
                <span className="h-[1.6cqw] rounded-full bg-slate-700 flex-1" />
                <svg viewBox="0 0 24 24" className="w-[3cqw] h-[3cqw] text-green-500 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.4">{CheckCircleIc}</svg>
              </span>
            </div>
          </div>

          <FormSec icon={TruckIc} title={f.scVehicleInfoH} />
          <Field label={f.scTruckNo} col="#60a5fa" icon={TruckIc} w="44%" req />
          <Field label={f.scTrailerNo} col="#60a5fa" icon={TrailerIc} w="38%" optional={f.scOptional} />

          <FormSec icon={BoxesIc} title={f.scUnloadingInfo} />
          <span className="flex items-center gap-[1.4cqw] text-[2.8cqw] font-medium text-slate-300">
            <svg viewBox="0 0 24 24" className="w-[3cqw] h-[3cqw]" fill="none" stroke="#60a5fa" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">{BoxesIc}</svg>{f.scType}<Req />
          </span>
          {/* real control: 2-col (Unloading | Loading) + a full-width Both below.
              Selected = solid fill + white text; unselected = flat grey. */}
          <div className="grid grid-cols-2 gap-[1.8cqw]">
            <span className="rounded-[2cqw] flex items-center justify-center gap-[1.4cqw] py-[2.2cqw] text-[2.7cqw] font-semibold text-white" style={{ background: "#16a34a" }}>
              <svg viewBox="0 0 24 24" className="w-[3.2cqw] h-[3.2cqw]" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M6 13l6 6 6-6" /></svg>{f.scUnloading}
            </span>
            <span className="rounded-[2cqw] flex items-center justify-center gap-[1.4cqw] py-[2.2cqw] text-[2.7cqw] font-semibold bg-slate-700/50 text-slate-400">
              <svg viewBox="0 0 24 24" className="w-[3.2cqw] h-[3.2cqw]" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M6 11l6-6 6 6" /></svg>{f.scLoading}
            </span>
          </div>
          <span className="rounded-[2cqw] flex items-center justify-center gap-[1.4cqw] py-[2.2cqw] text-[2.7cqw] font-semibold bg-slate-700/50 text-slate-400">
            <svg viewBox="0 0 24 24" className="w-[3.2cqw] h-[3.2cqw]" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M6 13l6 6 6-6" /></svg>
            <svg viewBox="0 0 24 24" className="w-[3.2cqw] h-[3.2cqw]" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M6 11l6-6 6 6" /></svg>
            {f.scBoth}
          </span>

          {/* the reference the status screen later displays */}
          <Field label={f.scUnloadingRef} col="#4ade80" icon={BarcodeIc} w="46%" optional={f.scOptional} />

          <span className="rounded-[2.2cqw] text-white text-center font-semibold text-[3.2cqw] py-[2.8cqw] flex items-center justify-center gap-[1.6cqw]" style={{ background: HDR }}><svg viewBox="0 0 24 24" className="w-[3.4cqw] h-[3.4cqw]" fill="currentColor"><path d="M3 20l18-8L3 4l4 8-4 8z" /></svg>{f.scSubmit}</span>
        </div>
      </div>
    </div>,
    // 3) live status — the real screen top-to-bottom in the "assigned" state:
    // status+QR, What to do, Assigned Ramp (photo + Maps + instructions), Driver
    // Information, Vehicle Information, Check-in Information, Event Timeline,
    // Check-in Times. It slowly auto-scrolls so all of it is visible, exactly as
    // a driver would scroll it. (The real app has no driver-side cancel button.)
    <div key="st" className="flex-1 min-h-0 flex flex-col">
      <OrgStrip />
      <div className="mx-[3cqw] mb-[3cqw] rounded-[3cqw] overflow-hidden border border-slate-700 bg-slate-800/70 flex-1 min-h-0 flex flex-col">
        <GradHeader icon={<path d="M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />} title={f.scStatusTitle} sub="London Warehouse" live liveLabel={f.scLive} />
        <div className="flex-1 min-h-0 overflow-hidden">
          <div key={scr === 2 ? "on" : "off"} className="app-stscroll flex flex-col gap-[3cqw] p-[3cqw]">
            {/* status + QR */}
            <div className="rounded-[2.4cqw] bg-slate-900/50 p-[3cqw] flex flex-col gap-[2.4cqw]">
              <div className="flex items-start justify-between gap-[2.4cqw]">
                <span className="flex flex-col items-center gap-[1.6cqw] flex-1 min-w-0">
                  <span className="relative w-[14cqw] h-[14cqw] rounded-full bg-purple-500/15 flex items-center justify-center">
                    <span className="absolute inset-0 rounded-full border-[0.8cqw] border-purple-400/25 animate-ping" style={{ animationDuration: "2.4s" }} />
                    <svg viewBox="0 0 24 24" className="w-[6.6cqw] h-[6.6cqw] text-purple-400" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{PinIc}</svg>
                  </span>
                  <span className="rounded-full border-[0.45cqw] border-purple-400/50 bg-purple-500/15 text-purple-300 px-[2.6cqw] py-[1.2cqw] text-[2.9cqw] font-bold flex items-center gap-[1.2cqw]">
                    <svg viewBox="0 0 24 24" className="w-[2.8cqw] h-[2.8cqw]" fill="none" stroke="currentColor" strokeWidth="2">{PinIc}</svg>{f.scStatus}
                  </span>
                  <span className="text-[2.4cqw] text-slate-400 text-center leading-snug">{f.scAssignedDesc}</span>
                </span>
                <span className="flex flex-col items-center gap-[1.2cqw] shrink-0">
                  <span className="w-[24cqw] h-[24cqw] rounded-[1.6cqw] bg-white p-[1.2cqw] block"><QRBlock /></span>
                  <span className="text-[2.1cqw] text-slate-500 font-mono">a3f8c1d2…</span>
                </span>
              </div>
              {/* delivery receipt */}
              <span className="flex items-center justify-end gap-[1.2cqw] pt-[2cqw] border-t border-slate-700 text-[2.2cqw] text-slate-400">
                {f.scSeen}
                <svg viewBox="0 0 24 24" className="w-[3.4cqw] h-[3.4cqw] text-blue-400" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 13l4 4L14 7M10 15l1.5 1.5L21 7" /></svg>
                14:31
              </span>
            </div>

            {/* What to do */}
            <div className="rounded-[2.4cqw] bg-green-900/25 border border-green-500/30 p-[3cqw] flex flex-col gap-[1.8cqw]">
              <span className="flex items-center gap-[2cqw]">
                <span className="w-[7cqw] h-[7cqw] rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                  <svg viewBox="0 0 24 24" className="w-[3.6cqw] h-[3.6cqw] text-green-400" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">{PinIc}</svg>
                </span>
                <span className="text-green-300 font-semibold text-[3.1cqw]">{f.scWhatToDo}</span>
              </span>
              <span className="text-green-200 font-bold text-[4.2cqw]">{f.scGoTo}</span>
            </div>

            {/* Assigned Ramp */}
            <div className="rounded-[2.4cqw] p-[3cqw] flex flex-col gap-[2.2cqw] border-[0.45cqw] border-blue-500/25" style={{ background: "linear-gradient(to right,#1E3A5F,#1E4A6F)" }}>
              <span className="flex items-center gap-[2cqw]">
                <span className="w-[7cqw] h-[7cqw] rounded-full bg-blue-500/30 flex items-center justify-center shrink-0">
                  <svg viewBox="0 0 24 24" className="w-[3.6cqw] h-[3.6cqw] text-blue-200" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">{WarehouseIc}</svg>
                </span>
                <span className="text-white font-semibold text-[3.1cqw]">{f.scAssignedRamp}</span>
              </span>
              <span className="text-white font-bold text-[4.2cqw]">Dock 4</span>
              {/* dock photo + count chip */}
              <span className="relative block h-[17cqw] rounded-[2cqw] overflow-hidden bg-gradient-to-b from-slate-500 to-slate-700">
                <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
                  <rect width="100" height="40" fill="#64748b" />
                  <rect y="26" width="100" height="14" fill="#475569" />
                  <rect x="8" y="6" width="28" height="22" rx="1" fill="#334155" />
                  <rect x="11" y="9" width="22" height="16" rx="1" fill="#1e293b" />
                  <rect x="46" y="6" width="28" height="22" rx="1" fill="#334155" />
                  <rect x="49" y="9" width="22" height="16" rx="1" fill="#1e293b" />
                  <rect x="20" y="27" width="60" height="1.6" fill="#fbbf24" />
                  <text x="22" y="22" fontSize="9" fontWeight="bold" fill="#e2e8f0">4</text>
                </svg>
                <span className="absolute bottom-[1.4cqw] right-[1.4cqw] rounded-full bg-black/60 text-white text-[2.1cqw] px-[2cqw] py-[0.9cqw] flex items-center gap-[1cqw]">
                  <svg viewBox="0 0 24 24" className="w-[2.6cqw] h-[2.6cqw]" fill="none" stroke="currentColor" strokeWidth="1.9">{CameraIc}</svg>{f.scPhotos}
                </span>
              </span>
              <span className="rounded-[2cqw] text-white text-center font-medium text-[3cqw] py-[2.4cqw] flex items-center justify-center gap-[1.6cqw]" style={{ background: "#2563eb" }}>
                <svg viewBox="0 0 24 24" className="w-[3.4cqw] h-[3.4cqw]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{RouteIc}</svg>{f.scOpenMaps}
              </span>
              <span className="rounded-[2cqw] bg-white/10 border border-blue-400/20 p-[2.4cqw] flex items-start gap-[1.6cqw] text-[2.4cqw] text-blue-100 leading-snug">
                <svg viewBox="0 0 24 24" className="w-[3cqw] h-[3cqw] text-blue-300 shrink-0 mt-[0.3cqw]" fill="none" stroke="currentColor" strokeWidth="1.9">{InfoIc}</svg>{f.scRampInstr}
              </span>
            </div>

            {/* Driver Information */}
            <Sec icon={UserIc} title={f.scDriverInfo}>
              <div className="grid grid-cols-2 gap-[2.4cqw]">
                <KV label={f.scName}>Andrei Popescu</KV>
                <KV label={f.scPhone}>+40 722 145 890</KV>
              </div>
            </Sec>

            {/* Vehicle Information */}
            <Sec icon={TruckIc} title={f.scVehicleInfo}>
              <div className="flex flex-col gap-[2.2cqw]">
                <span className="flex items-center justify-between gap-[2cqw]"><span className="text-[2.1cqw] uppercase tracking-wide text-slate-500 font-semibold">{f.scTruck}</span><Plate text="B 214 XYZ" /></span>
                <span className="flex items-center justify-between gap-[2cqw]"><span className="text-[2.1cqw] uppercase tracking-wide text-slate-500 font-semibold">{f.scTrailer}</span><Plate text="B 87 ABC" /></span>
                <span className="h-px bg-slate-700" />
                <div className="grid grid-cols-2 gap-[2.4cqw]">
                  <KV label={f.scCompany}><span className="flex items-center gap-[1.4cqw]"><FlagRO className="w-[3.4cqw] h-[2.5cqw] rounded-[0.3cqw] shrink-0" />Transilvania Log</span></KV>
                  <KV label={f.scTruckType}>{f.scTruckTrailer}</KV>
                </div>
              </div>
            </Sec>

            {/* Check-in Information */}
            <Sec icon={InfoIc} title={f.scCheckinInfo}>
              <div className="flex flex-col gap-[2.2cqw]">
                <span className="self-center rounded-full bg-green-500/15 border border-green-500/40 text-green-300 px-[3cqw] py-[1.3cqw] text-[2.7cqw] font-semibold flex items-center gap-[1.4cqw]">
                  <svg viewBox="0 0 24 24" className="w-[2.8cqw] h-[2.8cqw]" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M6 13l6 6 6-6" /></svg>{f.scUnloading}
                </span>
                <span className="rounded-[2cqw] bg-green-900/20 border border-green-500/25 p-[2.4cqw] flex items-center gap-[1.8cqw]">
                  <svg viewBox="0 0 24 24" className="w-[3cqw] h-[3cqw] text-green-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M6 13l6 6 6-6" /></svg>
                  <span className="flex flex-col leading-tight min-w-0"><span className="text-[2.1cqw] uppercase tracking-wide text-slate-500 font-semibold">{f.scUnloadingRef}</span><span className="text-[2.8cqw] font-mono text-slate-100">DL-2026-4471</span></span>
                </span>
                <div className="grid grid-cols-2 gap-[2.4cqw]">
                  <KV label={f.scScheduled}><span className="text-orange-400">15 Jul, 14:00</span></KV>
                  <KV label={f.scCargo}>Palletised</KV>
                </div>
              </div>
            </Sec>

            {/* Event Timeline — newest first */}
            <Sec icon={ListIc} title={f.scTimeline}>
              <div className="flex flex-col gap-[2.2cqw]">
                {([[WarehouseIc, "#c084fc", f.scEvRamp, f.scEvRampDesc, "14:31"], [CheckCircleIc, "#60a5fa", f.scEvConfirmed, f.scEvConfirmedDesc, "14:22"], [PlusIc, "#38bdf8", f.scEvCreated, "", "14:18"]] as const).map(([ic, col, ttl, desc, tm], k) => (
                  <span key={k} className="flex items-start gap-[2cqw]">
                    <span className="w-[3cqw] h-[3cqw] rounded-full shrink-0 mt-[0.6cqw]" style={k === 0 ? { background: col } : { border: `0.4cqw solid #475569` }} />
                    <span className="flex flex-col leading-tight min-w-0 gap-[0.5cqw]">
                      <span className="flex items-center gap-[1.4cqw] text-[2.7cqw] font-semibold text-slate-100">
                        <svg viewBox="0 0 24 24" className="w-[2.8cqw] h-[2.8cqw] shrink-0" style={{ color: col }} fill="none" stroke="currentColor" strokeWidth="2">{ic}</svg>{ttl}
                      </span>
                      {desc && <span className="text-[2.2cqw] text-slate-400">{desc}</span>}
                      <span className="text-[2.1cqw] text-slate-500">{tm}</span>
                    </span>
                  </span>
                ))}
              </div>
            </Sec>

            {/* Check-in Times — the one block the real app renders without an icon circle */}
            <div className="flex flex-col gap-[2cqw]">
              <span className="flex items-center gap-[1.6cqw] text-[2.5cqw] font-semibold text-slate-400">
                <svg viewBox="0 0 24 24" className="w-[3cqw] h-[3cqw]" fill="none" stroke="currentColor" strokeWidth="1.9">{ClockIc}</svg>{f.scTimes}
              </span>
              {([[CheckCircleIc, "#60a5fa", f.scTConfirmed, "14:22"], [PinIc, "#c084fc", f.scStatus, "14:31"]] as const).map(([ic, col, lbl, tm], k) => (
                <span key={k} className="flex items-center gap-[2cqw]">
                  <span className="w-[6cqw] h-[6cqw] rounded-[1.4cqw] flex items-center justify-center shrink-0" style={{ background: `${col}1f` }}>
                    <svg viewBox="0 0 24 24" className="w-[3cqw] h-[3cqw]" style={{ color: col }} fill="none" stroke="currentColor" strokeWidth="2">{ic}</svg>
                  </span>
                  <span className="text-[2.7cqw] text-slate-300">{lbl}</span>
                  <span className="ml-auto text-[2.7cqw] font-bold text-slate-100 tabular-nums">{tm}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>,
    // 4) chat — full thread, composer pinned to the bottom
    <div key="ch" className="flex-1 min-h-0 flex flex-col">
      {/* real chat is a full-screen modal: X on the left, round icon, title
          "Chat with Dispatcher", and no org-name subtitle */}
      <div className="flex items-center gap-[2.4cqw] px-[3cqw] py-[2.8cqw] shrink-0" style={{ background: HDR }}>
        <span className="w-[8cqw] h-[8cqw] rounded-full flex items-center justify-center text-white shrink-0">
          <svg viewBox="0 0 24 24" className="w-[4.4cqw] h-[4.4cqw]" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </span>
        <span className="w-[8cqw] h-[8cqw] rounded-full bg-white/20 flex items-center justify-center text-white shrink-0">
          <svg viewBox="0 0 24 24" className="w-[4.4cqw] h-[4.4cqw]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
        </span>
        <span className="text-white font-bold text-[3.7cqw] truncate">{f.scChatTitle}</span>
      </div>
      <div className="flex-1 min-h-0 flex flex-col justify-end gap-[2.4cqw] px-[3cqw] py-[3cqw] overflow-hidden">
        {chat.map(([m, own], i) => (
          <span key={i} className={`flex items-end gap-[1.6cqw] max-w-[86%] ${own ? "self-end flex-row-reverse" : "self-start"}`}>
            {/* driver = amber truck avatar, dispatcher = blue initials */}
            <span className={`w-[6.4cqw] h-[6.4cqw] rounded-full flex items-center justify-center shrink-0 ${own ? "bg-amber-500/25 text-amber-300" : "bg-blue-500/25 text-blue-300"}`}>
              {own
                ? <svg viewBox="0 0 24 24" className="w-[3.4cqw] h-[3.4cqw]" fill="none" stroke="currentColor" strokeWidth="1.9">{TruckIc}</svg>
                : <span className="text-[2.4cqw] font-bold">MI</span>}
            </span>
            <span className={`flex flex-col gap-[0.6cqw] min-w-0 ${own ? "items-end" : "items-start"}`}>
              <span className="text-[2.1cqw] text-slate-500 px-[0.6cqw]">{own ? `Andrei P. (${f.scRoleDriver})` : `Maria I. (${f.scRoleDispatcher})`}</span>
              <span className={`px-[3cqw] py-[2.2cqw] text-[3.1cqw] leading-snug ${own ? "rounded-[3cqw] rounded-br-[0.8cqw] text-white" : "rounded-[3cqw] rounded-bl-[0.8cqw] bg-gray-800 text-slate-100"}`} style={own ? { background: "#2563eb" } : undefined}>{m}</span>
              <span className="flex items-center gap-[0.8cqw] text-[2cqw] text-slate-500 px-[0.6cqw]">
                14:2{i + 2}
                {own && <svg viewBox="0 0 24 24" className="w-[2.8cqw] h-[2.8cqw] text-blue-400" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M1 13l4 4L14 7M10 15l1.5 1.5L21 7" /></svg>}
              </span>
            </span>
          </span>
        ))}
      </div>
      <div className="flex items-center gap-[2cqw] px-[3cqw] py-[2.4cqw] bg-slate-900/70 border-t border-slate-700 shrink-0">
        <svg viewBox="0 0 24 24" className="w-[5cqw] h-[5cqw] text-slate-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="9" /><path d="M8.5 14a4 4 0 0 0 7 0M9 10h.01M15 10h.01" strokeLinecap="round" /></svg>
        <svg viewBox="0 0 24 24" className="w-[5.2cqw] h-[5.2cqw] text-slate-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="6" width="18" height="14" rx="2" /><circle cx="12" cy="13" r="3.2" /><path d="M8 6l1.5-2.5h5L16 6" /></svg>
        {/* the real composer has a third (gallery) button */}
        <svg viewBox="0 0 24 24" className="w-[5cqw] h-[5cqw] text-slate-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{ImageIc}</svg>
        <span className="flex-1 rounded-[2.2cqw] bg-slate-800 px-[3cqw] py-[2.2cqw] text-slate-500 text-[3.1cqw] truncate">{f.scTypeMsg}</span>
        <span className="w-[8.4cqw] h-[8.4cqw] rounded-full flex items-center justify-center text-white shrink-0" style={{ background: "#2563eb" }}><svg viewBox="0 0 24 24" className="w-[4cqw] h-[4cqw]" fill="currentColor"><path d="M3 20l18-8L3 4l4 8-4 8z" /></svg></span>
      </div>
    </div>,
  ];

  return (
    <div ref={rootRef} className="@container absolute inset-0 p-[3cqw] flex items-center justify-center gap-[5cqw]" aria-hidden="true">
      {/* feature strip */}
      <div className="hidden sm:flex flex-col gap-[2.2cqw] w-[38%] max-w-[54cqw]">
        <div className="flex items-center justify-center gap-[2cqw]">
          <QLogo s="7cqw" />
          <span className="text-white font-bold text-[3cqw]">QRGO Driver</span>
        </div>
        <div className="flex flex-col gap-[1.3cqw]">
          {feats.map((ft, i) => (
            <div key={i} className="flex items-center gap-[1.8cqw] rounded-[1.4cqw] border border-slate-700/70 bg-slate-800/50 px-[1.8cqw] py-[1.4cqw]">
              <span className="w-[4cqw] h-[4cqw] rounded-[1cqw] bg-blue-500/15 text-blue-300 flex items-center justify-center [&_svg]:w-[2.4cqw] [&_svg]:h-[2.4cqw] shrink-0"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{ft.ic}</svg></span>
              <span className="text-slate-200 text-[1.75cqw] font-medium">{ft.l}</span>
            </div>
          ))}
        </div>
        {/* both platforms */}
        <div className="flex items-center justify-center gap-[1.4cqw]">
          {[[APPLE_D, "iOS"], [ANDROID_D, "Android"]].map(([d, l], i) => (
            <span key={i} className="inline-flex items-center gap-[1.2cqw] rounded-full border border-slate-600 bg-slate-800 px-[2cqw] py-[1cqw] text-[1.7cqw] font-semibold text-slate-200">
              <svg viewBox="0 0 24 24" className="w-[2.4cqw] h-[2.4cqw] text-slate-100" fill="currentColor"><path d={d} /></svg>{l}
            </span>
          ))}
        </div>
      </div>

      {/* devices — an Android beside the iPhone so both platforms are obvious */}
      <div className="relative h-[96%] shrink-0 flex items-end">
        <div className="hidden md:block h-[80%] shrink-0 -mr-[7cqw] relative z-0">
          <AndroidFrame time="14:32" screenClassName="bg-gradient-to-b from-slate-900 to-slate-800">
            {screens[1]}
          </AndroidFrame>
        </div>
        <div className="h-full shrink-0 relative z-10">
          <PhoneFrame16 time="14:32" screenClassName="bg-gradient-to-b from-slate-900 to-slate-800">
            <div className="flex-1 min-h-0 relative overflow-hidden">
              {screens.map((s, i) => (
                <div key={i} className="absolute inset-0 flex flex-col transition-opacity duration-500 pt-[1.5cqw]" style={{ opacity: scr === i ? 1 : 0, pointerEvents: "none" }}>{s}</div>
              ))}
            </div>
          </PhoneFrame16>
        </div>
      </div>
    </div>
  );
}
