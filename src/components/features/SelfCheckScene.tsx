"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { Translations } from "@/lib/i18n/translations";
import type { Locale } from "@/lib/i18n/config";
import { DRIVER_POOLS } from "./driverPools";
import { FlagRO, FlagGB, FlagDE, FlagPL, FlagHU, FlagBG, FlagFR, FlagNL } from "@/components/icons/flags";

// QRGO Self (feature 14) — an ANNOUNCED, not-yet-built counter kiosk. The scene
// stages the whole flow the page argues for, left to right on one office
// counter: a tablet on a stand runs the same check-in form the driver app uses,
// a receipt printer beside it prints his ticket, and a plain feature phone —
// the entire point of the feature — receives the SMS code and, later, the ramp.
// The window above the counter looks onto the yard, so the loop closes where the
// driver actually goes. Client player (8 staged steps, crossfaded tablet
// screens); a fully-populated static frame on reduced-motion.
//
// Deliberately NOT labelled: the name / truck / type fields carry no caption
// text because the copy block only authors `uiPhone` as a field label. They read
// from their icon + their real typed value (the driver's own name and plate),
// which is both legible at tablet scale and honest about the real form's shape:
// Driver Full Name / Phone Number / Truck Number / Unloading·Loading·Both.

// Step machine — one dwell per stage of the story. STATIC is the reduced-motion
// frame and deliberately sorts last, so every `step >= X` reveal below lights up
// for it without a special case; only the handful of "this stage only" states
// (which screen is up, the truck, the spotlight) test it explicitly.
const S = { COUNTER: 0, FORM: 1, PHONE: 2, CODE: 3, VERIFY: 4, TICKET: 5, SMS: 6, RAMP: 7, STATIC: 8 } as const;
const DWELL = [2600, 4600, 3000, 4000, 2200, 4400, 3000, 3400]; // ≈ 27s loop

// the ticket's check-in reference + the code that lands on the feature phone
const CHECKIN_ID = "a3f8c1d2";
const SMS_CODE = "418902";

// The number the driver types is locale-matched, like his name and plate: a
// German page must not show a Romanian mobile. Numerals are literals (all are
// from each country's reserved/fictional mobile ranges).
const PHONES: Record<Locale, { flag: typeof FlagRO; dial: string; num: string }> = {
  ro: { flag: FlagRO, dial: "+40", num: "722 145 890" },
  en: { flag: FlagGB, dial: "+44", num: "7700 900145" },
  de: { flag: FlagDE, dial: "+49", num: "151 2345 6789" },
  pl: { flag: FlagPL, dial: "+48", num: "512 345 678" },
  hu: { flag: FlagHU, dial: "+36", num: "20 345 6789" },
  bg: { flag: FlagBG, dial: "+359", num: "87 634 5678" },
  fr: { flag: FlagFR, dial: "+33", num: "6 12 34 56 78" },
  nl: { flag: FlagNL, dial: "+31", num: "6 12345678" },
};

const HDR = "linear-gradient(to right, #2563eb, #1d4ed8)";

const UserIc = <><circle cx="12" cy="8" r="3.4" /><path d="M5 21a7 7 0 0 1 14 0" /></>;
const TruckIc = <><path d="M1 6h13v8H1zM14 9h4l3 3v2h-7z" /><circle cx="5" cy="17" r="1.6" /><circle cx="18" cy="17" r="1.6" /></>;
const PhoneIc = <path d="M5 4h4l2 5-3 2a12 12 0 0 0 5 5l2-3 5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />;
const MailIc = <><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2.5 6.5 12 13l9.5-6.5" /></>;
const CheckIc = <path d="M4 12.5l5 5L20 6.5" />;
const DownIc = <path d="M12 5v14M6 13l6 6 6-6" />;
const UpIc = <path d="M12 19V5M6 11l6-6 6 6" />;
const KeyIc = <><rect x="3" y="11" width="18" height="10" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></>;
const PrinterIc = <><path d="M6 9V3h12v6" /><rect x="2" y="9" width="20" height="8" rx="2" /><path d="M6 14h12v7H6z" /></>;

// A plausible, deterministic QR for the printed ticket — the real product
// renders a QRCodeSVG of the check-in id. Module scope + an LCG seed so the
// pattern is stable across renders (Math.random here would break hydration).
const QR_CELLS: [number, number][] = (() => {
  const N = 21, out: [number, number][] = [];
  const finder = (x: number, y: number) => (x < 8 && y < 8) || (x >= N - 8 && y < 8) || (x < 8 && y >= N - 8);
  let s = 14071450;
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    if (finder(x, y)) continue;
    if ((s >>> 16) % 100 < 45) out.push([x, y]);
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

// the official QRGO mark on a white tile — same treatment as the other scenes
function QLogo({ s }: { s: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/qrgo-icon.svg" alt="" className="rounded-[1.2cqw] bg-white shrink-0" style={{ width: s, height: s, padding: `calc(${s} * 0.1)` }} />
  );
}

function Ic({ d, cls, w = "1.9" }: { d: ReactNode; cls: string; w?: string }) {
  return <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth={w} strokeLinecap="round" strokeLinejoin="round">{d}</svg>;
}

// One reused form row: the icon says what it is, the typed value proves it.
// `on` mounts the value, which is what fires its type-in animation exactly once.
function FormRow({ icon, value, on, delay, mono }: { icon: ReactNode; value: string; on: boolean; delay: string; mono?: boolean }) {
  return (
    <span className={`rounded-[0.8cqw] border bg-[#0b1219] px-[1.2cqw] py-[1.25cqw] flex items-center gap-[1cqw] min-w-0 transition-colors duration-300 ${on ? "border-slate-600" : "border-slate-700/60"}`}>
      <Ic d={icon} cls="w-[2cqw] h-[2cqw] text-blue-400 shrink-0" />
      {/* the name is the longest value the row ever holds (up to ~14 chars across
          the pools), so it runs a step smaller than the short mono plate */}
      {on
        ? <span className={`qs14-type text-slate-100 truncate ${mono ? "font-mono font-bold tracking-wide text-[1.5cqw]" : "font-medium text-[1.4cqw]"}`} style={{ animationDelay: delay }}>{value}</span>
        : <span className="h-[0.9cqw] w-[45%] rounded-full bg-slate-700/70" />}
    </span>
  );
}

// The plain, non-smartphone handset — small LCD, soft keys, D-pad, 12-key pad.
// This is the whole argument of the feature, so it must never read as an iPhone.
function FeaturePhone({ screen, codeLabel, notify, buzzKey }: { screen: "idle" | "code" | "notify"; codeLabel: string; notify: string; buzzKey: number }) {
  const lit = screen !== "idle";
  return (
    <div key={buzzKey} className={`w-[12cqw] shrink-0 rounded-[1.4cqw] p-[0.7cqw] flex flex-col gap-[0.6cqw] bg-gradient-to-b from-slate-600 via-slate-700 to-slate-800 border border-slate-500/60 shadow-2xl ${lit ? "qs14-buzz" : ""}`}>
      {/* earpiece */}
      <span className="w-[3.4cqw] h-[0.45cqw] rounded-full bg-slate-900/80 self-center shrink-0" />
      {/* LCD — backlight comes on when a message lands */}
      <span className={`relative block rounded-[0.5cqw] border border-slate-900 overflow-hidden aspect-[4/3] p-[0.6cqw] transition-colors duration-500 ${lit ? "bg-[#12233a]" : "bg-[#0f1720]"}`}>
        {/* status line */}
        <span className="flex items-center justify-between text-[0.85cqw] text-slate-400 leading-none">
          <svg viewBox="0 0 12 8" className="h-[0.9cqw] w-auto" fill="currentColor"><rect x="0" y="5" width="2" height="3" /><rect x="3.3" y="3.4" width="2" height="4.6" /><rect x="6.6" y="1.7" width="2" height="6.3" /><rect x="9.9" y="0" width="2" height="8" /></svg>
          <svg viewBox="0 0 14 8" className="h-[0.85cqw] w-auto" fill="none"><rect x="0.4" y="0.4" width="11" height="7.2" rx="1" stroke="currentColor" strokeOpacity="0.6" /><rect x="1.6" y="1.6" width="8" height="4.8" fill="currentColor" /><rect x="12" y="2.6" width="1.6" height="2.8" rx="0.6" fill="currentColor" fillOpacity="0.6" /></svg>
        </span>
        {screen === "idle" && (
          <span className="absolute inset-0 flex items-center justify-center text-slate-500 text-[1.6cqw] font-mono tabular-nums">07:41</span>
        )}
        {screen !== "idle" && (
          <span className="absolute inset-x-[0.6cqw] bottom-[0.6cqw] top-[2.2cqw] flex flex-col items-center justify-center gap-[0.4cqw] text-center">
            <Ic d={MailIc} cls="w-[1.6cqw] h-[1.6cqw] text-blue-300" w="2" />
            {screen === "code" ? (
              <>
                <span className="text-[0.95cqw] text-slate-400 leading-none truncate max-w-full">{codeLabel}</span>
                <span className="text-[2.1cqw] font-mono font-bold text-white tracking-[0.15em] leading-none">{SMS_CODE}</span>
              </>
            ) : (
              <span className="text-[1.15cqw] font-semibold text-white leading-tight">{notify}</span>
            )}
          </span>
        )}
      </span>
      {/* soft keys + D-pad */}
      <span className="flex items-center justify-between gap-[0.5cqw] shrink-0">
        <span className="w-[2.4cqw] h-[0.9cqw] rounded-[0.4cqw] bg-slate-800 border border-slate-600" />
        <span className="w-[3.4cqw] h-[3.4cqw] rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center">
          <span className="w-[1.4cqw] h-[1.4cqw] rounded-full bg-slate-700 border border-slate-600" />
        </span>
        <span className="w-[2.4cqw] h-[0.9cqw] rounded-[0.4cqw] bg-slate-800 border border-slate-600" />
      </span>
      <span className="flex items-center justify-between gap-[0.5cqw] shrink-0">
        <span className="w-[2.6cqw] h-[1cqw] rounded-[0.4cqw] bg-green-700/80" />
        <span className="w-[2.6cqw] h-[1cqw] rounded-[0.4cqw] bg-red-800/80" />
      </span>
      {/* 12-key pad — the giveaway that this is not a smartphone */}
      <span className="grid grid-cols-3 gap-[0.4cqw] shrink-0">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"].map((k) => (
          <span key={k} className="h-[1.35cqw] rounded-[0.3cqw] bg-slate-800 border border-slate-600/80 text-slate-400 text-[0.8cqw] leading-none flex items-center justify-center font-medium">{k}</span>
        ))}
      </span>
    </div>
  );
}

// Side-view truck for the yard window
function Truck({ cls }: { cls: string }) {
  return (
    <svg viewBox="0 0 64 24" className={cls}>
      <rect x="2" y="3.5" width="35" height="13.5" rx="1.5" fill="#334155" stroke="#64748b" strokeWidth="0.7" />
      <path d="M39 7.5h9.5l5 4.5v5H39z" fill="#2563eb" stroke="#60a5fa" strokeWidth="0.7" strokeLinejoin="round" />
      <path d="M41 9h6.5l3.4 3H41z" fill="#93c5fd" />
      <rect x="37" y="5" width="2" height="12" fill="#475569" />
      <rect x="53" y="12.5" width="1.6" height="2" rx="0.6" fill="#fbbf24" />
      {[10, 30, 48].map((cx) => (
        <g key={cx}><circle cx={cx} cy="18.5" r="3.2" fill="#0f1720" stroke="#64748b" strokeWidth="0.7" /><circle cx={cx} cy="18.5" r="1.1" fill="#475569" /></g>
      ))}
    </svg>
  );
}

export function SelfCheckScene({ t, locale }: { t: Translations; locale: Locale }) {
  const f = t.f14Page;
  const driver = DRIVER_POOLS[locale][0];
  const ph = PHONES[locale];
  const Flag = ph.flag;

  const [step, setStep] = useState<number>(S.COUNTER);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Static frame: the tablet parks on the confirmed form (so uiForm, uiPhone,
    // uiSmsCode and uiVerify all stay readable) while the ticket, the SMS and the
    // parked truck are all forced on — one frame that still tells the whole story.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setStep(S.STATIC); return; }
    let cancelled = false, visible = true;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0.15 });
    if (rootRef.current) io.observe(rootRef.current);
    const sleep = (ms: number) => new Promise<void>((res) => { const s = Date.now(); const tick = () => { if (cancelled) return res(); if (visible && Date.now() - s >= ms) return res(); setTimeout(tick, visible ? 90 : 150); }; setTimeout(tick, 90); });
    (async () => {
      let i = 0;
      while (!cancelled) {
        await sleep(DWELL[i]);
        if (cancelled) break;
        i = (i + 1) % DWELL.length;
        setStep(i);
      }
    })();
    return () => { cancelled = true; io.disconnect(); };
  }, []);

  // which tablet screen is up, and what each prop on the counter is doing
  const reduced = step === S.STATIC;
  const screen = reduced ? "form" : step === S.COUNTER ? "home" : step <= S.VERIFY ? "form" : "ticket";
  const ticketOut = step >= S.TICKET;
  const printing = step === S.TICKET;
  const phoneScreen: "idle" | "code" | "notify" = step === S.CODE || step === S.VERIFY ? "code" : step >= S.SMS ? "notify" : "idle";
  const truckIn = reduced || step === S.RAMP;
  const rampLit = step >= S.SMS;
  // spotlight: the object the story is on stays lit, the rest step back a little
  const lit = (on: boolean) => (reduced || on ? "opacity-100" : "opacity-60");
  const ring = (on: boolean) => (!reduced && on ? "ring-[0.3cqw] ring-blue-500/60 shadow-[0_0_3cqw_rgba(37,99,235,0.35)]" : "ring-0 ring-transparent");

  return (
    <div ref={rootRef} className="@container absolute inset-0 isolate p-[2cqw] flex flex-col gap-[2cqw] text-slate-200 select-none" aria-hidden="true">
      {/* ---- office wall: the QRGO Self lockup + the window onto the yard ---- */}
      <div className="flex items-stretch gap-[2cqw] h-[13cqw] shrink-0">
        <div className="w-[22cqw] shrink-0 rounded-[1.2cqw] border border-slate-700/70 bg-slate-800/60 flex items-center gap-[1.4cqw] px-[1.6cqw]">
          <QLogo s="5cqw" />
          <span className="flex flex-col gap-[0.6cqw] min-w-0">
            <span className="text-white font-bold text-[2.1cqw] truncate">{f.uiKiosk}</span>
            <span className="h-[0.35cqw] w-[6cqw] rounded-full" style={{ background: HDR }} />
          </span>
        </div>

        {/* the yard, seen through the office window: the ramp the SMS names */}
        <div className="relative flex-1 rounded-[1.2cqw] border border-slate-700/70 overflow-hidden bg-gradient-to-b from-[#0d151f] to-[#16202c]">
          {/* facade + shutter doors along the back. Five of them, spread: Ramp 12
              has to read as one ramp out of many, not as the only door here. */}
          <div className="absolute inset-x-0 top-0 h-[58%] bg-[#1b2532] border-b border-slate-700 flex items-end justify-between px-[4cqw]">
            {[0, 1, 2, 3, 4].map((i) => {
              const active = i === 4;
              return (
                <span key={i} className={`relative w-[8cqw] h-[72%] rounded-t-[0.5cqw] border border-b-0 transition-colors duration-500 ${active && rampLit ? "bg-[#1d3a2b] border-green-500/50" : "bg-[#141d28] border-slate-700"}`}>
                  {/* shutter slats */}
                  <span className="absolute inset-[0.4cqw] flex flex-col gap-[0.3cqw]">
                    {[0, 1, 2, 3].map((k) => <span key={k} className="flex-1 rounded-[0.15cqw] bg-black/25" />)}
                  </span>
                  {/* dock light */}
                  <span className={`absolute -top-[1.5cqw] left-1/2 -translate-x-1/2 w-[0.9cqw] h-[0.9cqw] rounded-full transition-colors duration-500 ${active && rampLit ? "bg-green-400 shadow-[0_0_1.2cqw_rgba(34,197,94,0.8)]" : "bg-slate-600"}`} />
                </span>
              );
            })}
          </div>
          {/* asphalt */}
          <span className="absolute inset-x-0 bottom-0 h-[42%] bg-[#243040]" />
          <span className="absolute inset-x-[2cqw] bottom-[4%] h-[0.25cqw] rounded-full bg-slate-600/40" style={{ maskImage: "repeating-linear-gradient(to right,#000 0 3cqw,transparent 3cqw 5cqw)", WebkitMaskImage: "repeating-linear-gradient(to right,#000 0 3cqw,transparent 3cqw 5cqw)" }} />
          {/* other trucks already working the yard — they give Ramp 12 a scale */}
          {[8, 36].map((l) => (
            <span key={l} className="absolute bottom-[6%] w-[13cqw] block opacity-40 saturate-50" style={{ left: `${l}%` }}>
              <Truck cls="w-full h-auto -scale-x-100" />
            </span>
          ))}
          {/* the ramp the driver is sent to — a sign on the door itself */}
          <span className={`absolute top-[3.7cqw] right-[8cqw] translate-x-1/2 rounded-full border px-[1.1cqw] py-[0.35cqw] text-[1.15cqw] font-bold whitespace-nowrap transition-all duration-500 z-10 ${rampLit ? "bg-green-500/20 border-green-500/60 text-green-300" : "bg-slate-800/90 border-slate-600 text-slate-500"}`}>
            {f.uiRamp}
          </span>
          {/* his truck rolls in only once the SMS has told him where to go. It
              enters from the gate side (right) nose-first, so it reads as
              driving in rather than reversing out. */}
          {truckIn && (
            <span className="qs14-truck absolute bottom-[6%] right-[4cqw] w-[14cqw] block">
              <Truck cls="w-full h-auto -scale-x-100" />
            </span>
          )}
        </div>
      </div>

      {/* ---- the counter itself: tablet, printer, his own handset ---- */}
      <div className="flex-1 min-h-0 flex items-end justify-center gap-[3cqw]">
        {/* ============ tablet on a stand ============ */}
        <div className={`flex flex-col items-center shrink-0 transition-opacity duration-500 ${lit(step <= S.VERIFY)}`}>
          <div className={`relative w-[42.5cqw] rounded-[2.2cqw] bg-gradient-to-b from-slate-600 via-slate-700 to-slate-800 shadow-2xl transition-shadow duration-500 ${ring(step <= S.VERIFY)}`} style={{ aspectRatio: "1.44 / 1" }}>
            <span className="absolute inset-[0.7cqw] rounded-[1.7cqw] bg-black" />
            {/* front camera, on the long edge — this tablet lives in landscape */}
            <span className="absolute left-[1.1cqw] top-1/2 -translate-y-1/2 w-[0.45cqw] h-[0.45cqw] rounded-full bg-slate-800" />
            <div className="absolute inset-[1.9cqw] rounded-[1.1cqw] overflow-hidden bg-[#0f1720]">
              {/* ---- home: the branded QRGO Self attract screen ---- */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-[1.6cqw] transition-opacity duration-500" style={{ opacity: screen === "home" ? 1 : 0 }}>
                <QLogo s="7cqw" />
                <span className="text-white font-bold text-[3.2cqw]">{f.uiKiosk}</span>
                <span className="relative mt-[0.6cqw] rounded-full px-[3.4cqw] py-[1.2cqw] text-white font-semibold text-[1.7cqw] shadow-lg" style={{ background: HDR }}>
                  {f.uiForm}
                  {/* the tap that starts it */}
                  <span className="absolute inset-0 rounded-full border-[0.3cqw] border-blue-400/60 animate-ping" style={{ animationDuration: "2s" }} />
                </span>
              </div>

              {/* ---- form: the same check-in form, laid out for landscape ---- */}
              <div className="absolute inset-0 flex flex-col transition-opacity duration-500" style={{ opacity: screen === "form" ? 1 : 0 }}>
                <div className="flex items-center gap-[1.2cqw] px-[1.4cqw] py-[0.9cqw] shrink-0" style={{ background: HDR }}>
                  <QLogo s="3cqw" />
                  <span className="flex flex-col leading-tight min-w-0">
                    <span className="text-white font-bold text-[1.6cqw] truncate">{f.uiKiosk}</span>
                    <span className="text-blue-100 text-[1.2cqw] truncate">{f.uiForm}</span>
                  </span>
                </div>
                <div className="flex-1 min-h-0 grid grid-cols-2 gap-[1.7cqw] p-[1.5cqw]">
                  {/* who + what he drives */}
                  <div className="flex flex-col justify-between gap-[1.4cqw] min-w-0">
                    <FormRow icon={UserIc} value={driver.name} on={step >= S.FORM} delay="0.35s" />
                    <FormRow icon={TruckIc} value={driver.plate} on={step >= S.FORM} delay="1.9s" mono />
                    {/* Unloading · Loading · Both — the real 3-way, icon-only here */}
                    <span className="grid grid-cols-3 gap-[0.9cqw]">
                      {[[DownIc], [UpIc], [DownIc, UpIc]].map((icons, i) => (
                        <span key={i} className="relative rounded-[0.8cqw] bg-slate-700/40 py-[1.15cqw] flex items-center justify-center gap-[0.4cqw] overflow-hidden">
                          {i === 0 && step >= S.FORM && <span className="qs14-fade absolute inset-0 bg-[#16a34a]" style={{ animationDelay: "3.3s" }} />}
                          {icons.map((d, k) => (
                            <Ic key={k} d={d} cls={`relative w-[1.8cqw] h-[1.8cqw] ${i === 0 && step >= S.FORM ? "text-white" : "text-slate-400"}`} w="2.4" />
                          ))}
                        </span>
                      ))}
                    </span>
                  </div>

                  {/* his number, then the code that proves it */}
                  <div className="flex flex-col justify-between gap-[1.4cqw] min-w-0">
                    <span className="flex flex-col gap-[0.6cqw] min-w-0">
                      <span className="flex items-center gap-[0.7cqw] text-[1.25cqw] font-semibold text-slate-400">
                        <Ic d={PhoneIc} cls="w-[1.4cqw] h-[1.4cqw] text-blue-400" />{f.uiPhone}
                      </span>
                      {/* every locale's number has to fit here unclipped — the
                          longest is de (+49 151 2345 6789) — hence the small
                          mono type and tight gaps rather than a truncation. */}
                      <span className={`rounded-[0.8cqw] bg-[#0b1219] border px-[1cqw] py-[1cqw] flex items-center gap-[0.6cqw] min-w-0 transition-colors duration-300 ${step === S.PHONE ? "border-blue-500" : step > S.PHONE ? "border-slate-600" : "border-slate-700/60"}`}>
                        <Flag className="w-[1.9cqw] h-[1.4cqw] rounded-[0.2cqw] shrink-0" />
                        <span className="text-slate-400 text-[1.1cqw] font-mono shrink-0">{ph.dial}</span>
                        {step >= S.PHONE
                          ? <span className="qs14-type text-slate-100 text-[1.1cqw] font-mono font-medium truncate" style={{ animationDelay: "0.3s" }}>{ph.num}</span>
                          : <span className="h-[0.9cqw] w-[50%] rounded-full bg-slate-700/70" />}
                        {step === S.PHONE && <span className="ch-caret w-[0.16cqw] h-[1.5cqw] bg-blue-400 shrink-0" />}
                      </span>
                    </span>

                    <span className="flex flex-col gap-[0.6cqw] min-w-0">
                      <span className={`flex items-center gap-[0.7cqw] text-[1.25cqw] font-semibold transition-colors duration-300 ${step >= S.CODE ? "text-slate-400" : "text-slate-600"}`}>
                        <Ic d={KeyIc} cls={`w-[1.4cqw] h-[1.4cqw] ${step >= S.CODE ? "text-blue-400" : "text-slate-600"}`} />{f.uiSmsCode}
                      </span>
                      {/* 6 boxes, filling as he keys in what the handset shows */}
                      <span className="grid grid-cols-6 gap-[0.6cqw]">
                        {SMS_CODE.split("").map((d, i) => (
                          <span key={i} className={`rounded-[0.6cqw] border bg-[#0b1219] py-[0.9cqw] text-center font-mono font-bold text-[1.6cqw] leading-none transition-colors duration-300 ${step >= S.CODE ? "border-slate-600 text-white" : "border-slate-700/60 text-transparent"}`}>
                            {step >= S.CODE
                              ? <span className="inline-block" style={{ animation: "chpop 0.3s ease both", animationDelay: `${0.9 + i * 0.18}s` }}>{d}</span>
                              : "0"}
                          </span>
                        ))}
                      </span>
                    </span>

                    {/* Confirmed — the number is now provably his. The slot keeps
                        its height whether or not the badge is in it, so the rows
                        above never shift when it lands. */}
                    <span className="h-[3.6cqw] flex items-end shrink-0">
                      {step >= S.VERIFY && (
                        <span className="w-full rounded-[0.8cqw] bg-green-500/15 border border-green-500/50 text-green-300 py-[0.7cqw] flex items-center justify-center gap-[0.7cqw] text-[1.4cqw] font-bold" style={{ animation: "chpop 0.4s ease both" }}>
                          <Ic d={CheckIc} cls="w-[1.7cqw] h-[1.7cqw]" w="2.6" />{f.uiVerify}
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* ---- done: the kiosk's closing screen while the ticket prints ---- */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-[1.2cqw] transition-opacity duration-500" style={{ opacity: screen === "ticket" ? 1 : 0 }}>
                <span className="w-[7cqw] h-[7cqw] rounded-full bg-green-500/15 border-[0.35cqw] border-green-500/50 text-green-400 flex items-center justify-center">
                  <Ic d={CheckIc} cls="w-[3.6cqw] h-[3.6cqw]" w="2.6" />
                </span>
                <span className="text-green-300 font-bold text-[2.4cqw]">{f.uiVerify}</span>
                <span className="flex items-center gap-[1.4cqw] text-slate-400 text-[1.3cqw]">
                  <span className="font-mono font-bold text-slate-200">{driver.plate}</span>
                  <span className="w-px h-[1.4cqw] bg-slate-600" />
                  <span className="font-mono">{CHECKIN_ID}</span>
                </span>
              </div>
            </div>
          </div>
          {/* stand */}
          <span className="w-[6cqw] h-[3cqw] bg-gradient-to-b from-slate-700 to-slate-800 border-x border-slate-600/70 shrink-0" />
          <span className="w-[16cqw] h-[1.6cqw] rounded-[0.8cqw] bg-gradient-to-b from-slate-600 to-slate-800 shadow-lg shrink-0" />
        </div>

        {/* ============ receipt printer + the ticket he leaves with ============ */}
        <div className={`w-[15cqw] shrink-0 flex flex-col items-center transition-opacity duration-500 ${lit(step >= S.TICKET)}`}>
          {/* mask: the paper is clipped to everything above the slot */}
          <div className="h-[17cqw] w-[12cqw] overflow-hidden flex items-end shrink-0">
            {ticketOut && (
              <div className="qs14-feed w-full">
                {/* tear-off edge, first thing out of the slot */}
                <svg viewBox="0 0 60 3" preserveAspectRatio="none" className="w-full h-[0.7cqw] block" fill="#f1f5f9">
                  <path d="M0 3V1.2l3-1.2 3 1.2 3-1.2 3 1.2 3-1.2 3 1.2 3-1.2 3 1.2 3-1.2 3 1.2 3-1.2 3 1.2 3-1.2 3 1.2 3-1.2 3 1.2 3-1.2 3 1.2 3-1.2 3 1.2V3z" />
                </svg>
                <div className="bg-slate-100 px-[0.9cqw] pb-[0.9cqw] pt-[0.4cqw] flex flex-col items-center gap-[0.5cqw]">
                  <span className="text-slate-900 font-bold text-[1.15cqw] uppercase tracking-[0.1em]">{f.uiTicket}</span>
                  <span className="w-full border-t border-dashed border-slate-400" />
                  <span className="w-[7.4cqw] h-[7.4cqw] block">
                    <QRBlock />
                  </span>
                  <span className="text-slate-900 font-mono font-bold text-[1.3cqw] tracking-wide">{driver.plate}</span>
                  <span className="text-slate-500 font-mono text-[1cqw]">{CHECKIN_ID}</span>
                  <svg viewBox="0 0 60 8" preserveAspectRatio="none" className="w-full h-[1.2cqw] block" fill="#0f172a">
                    {[0, 3, 5, 9, 12, 14, 18, 22, 25, 27, 31, 35, 38, 42, 45, 47, 51, 54, 57].map((x, i) => (
                      <rect key={i} x={x} y="0" width={i % 3 === 0 ? 1.6 : 0.8} height="8" />
                    ))}
                  </svg>
                </div>
              </div>
            )}
          </div>
          {/* printer body */}
          <div className={`relative w-full h-[8.5cqw] rounded-[1cqw] bg-gradient-to-b from-[#243040] to-[#1b2532] border border-slate-600 shadow-xl flex flex-col items-center justify-end gap-[0.7cqw] pb-[1cqw] shrink-0 ${printing ? "qs14-print" : ""} ${ring(step === S.TICKET)}`}>
            {/* the slot the paper came out of */}
            <span className="absolute top-[0.7cqw] inset-x-[1.2cqw] h-[0.7cqw] rounded-full bg-black/80 border border-slate-700 shadow-inner" />
            <span className={`inline-flex items-center gap-[0.6cqw] rounded-full border px-[0.9cqw] py-[0.35cqw] text-[1.05cqw] font-semibold transition-colors duration-300 ${printing ? "bg-blue-500/15 border-blue-500/50 text-blue-300" : "bg-slate-800/70 border-slate-600 text-slate-500"}`}>
              <span className={`w-[0.7cqw] h-[0.7cqw] rounded-full ${printing ? "qs14-led bg-green-400" : "bg-slate-600"}`} />
              {f.uiPrinting}
            </span>
            <Ic d={PrinterIc} cls="w-[2cqw] h-[2cqw] text-slate-600" />
          </div>
        </div>

        {/* ============ his own handset — no smartphone in sight ============ */}
        <div className={`flex flex-col items-center transition-opacity duration-500 ${lit(step === S.CODE || step === S.SMS)}`}>
          <FeaturePhone screen={phoneScreen} codeLabel={f.uiSmsCode} notify={f.uiSmsNotify} buzzKey={step} />
        </div>
      </div>

      {/* ---- the counter surface everything stands on ---- */}
      <div className="shrink-0">
        <span className="block h-[1.2cqw] rounded-t-[0.4cqw] bg-gradient-to-b from-[#3b4a5e] to-[#2b3747] border-t border-slate-500/50" />
        <span className="h-[4cqw] rounded-b-[0.8cqw] bg-[#1b2532] border-x border-b border-slate-700 flex items-center justify-center">
          <span className="text-slate-400 text-[1.5cqw] font-semibold tracking-wide">{f.uiCounter}</span>
        </span>
      </div>
    </div>
  );
}
