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
// the driver app's 12 languages, in the app's own order, with real SVG flags
const LANGS: [FC<{ className?: string }>, string][] = [
  [FlagRO, "Română"], [FlagGB, "English"], [FlagDE, "Deutsch"], [FlagFR, "Français"],
  [FlagPL, "Polski"], [FlagIT, "Italiano"], [FlagES, "Español"], [FlagNL, "Nederlands"],
  [FlagHU, "Magyar"], [FlagBG, "Български"], [FlagCZ, "Čeština"], [FlagSK, "Slovenčina"],
];
const TruckIc = <><path d="M1 6h13v8H1zM14 9h4l3 3v2h-7z" /><circle cx="5" cy="17" r="1.6" /><circle cx="18" cy="17" r="1.6" /></>;
const GlobeIc = <><circle cx="12" cy="12" r="9.5" /><path d="M2.5 12h19M12 2.5a15 15 0 0 1 4 9.5 15 15 0 0 1-4 9.5 15 15 0 0 1-4-9.5 15 15 0 0 1 4-9.5z" /></>;
const PinIc = <><path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11z" /><circle cx="12" cy="10" r="2.5" /></>;

// the official QRGO mark on a white tile — same treatment as the other scenes
function QLogo({ s }: { s: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/qrgo-icon.svg" alt="" className="rounded-[2.2cqw] bg-white shrink-0" style={{ width: s, height: s, padding: `calc(${s} * 0.09)` }} />
  );
}

function OrgStrip() {
  return (
    <div className="flex items-center gap-[2.4cqw] px-[3.5cqw] py-[2.2cqw] shrink-0">
      <span className="w-[8cqw] h-[8cqw] rounded-full bg-blue-500/20 text-blue-300 flex items-center justify-center [&_svg]:w-[4.4cqw] [&_svg]:h-[4.4cqw] shrink-0">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">{TruckIc}</svg>
      </span>
      <span className="flex flex-col leading-tight min-w-0">
        <span className="text-white font-bold text-[3.4cqw] truncate">London Warehouse</span>
        <span className="text-slate-400 text-[2.6cqw] truncate">Industriilor 19 · Chiajna</span>
      </span>
    </div>
  );
}
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
function Field({ label, col, icon, w = "60%" }: { label: string; col: string; icon: ReactNode; w?: string }) {
  return (
    <div className="flex flex-col gap-[1.2cqw]">
      <span className="flex items-center gap-[1.4cqw] text-[2.8cqw] font-medium text-slate-300"><svg viewBox="0 0 24 24" className="w-[3cqw] h-[3cqw]" fill="none" stroke={col} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">{icon}</svg>{label}</span>
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
    const step = () => { if (cancelled) return; if (!visible) { setTimeout(step, 300); return; } i = (i + 1) % 4; setScr(i); setTimeout(step, 3400); };
    const to = setTimeout(step, 3400);
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
      <div className="mx-[3cqw] rounded-[3cqw] overflow-hidden border border-slate-700 bg-slate-800/70 flex flex-col min-h-0">
        <GradHeader icon={GlobeIc} title={f.scLang} sub={f.scWelcome} />
        <div className="p-[2.4cqw] flex flex-col gap-[1.3cqw] min-h-0 overflow-hidden">
          {LANGS.map(([Flag, n], k) => (
            <span key={k} className={`flex items-center gap-[2.4cqw] rounded-[2cqw] border px-[2.6cqw] py-[1.6cqw] text-[2.9cqw] font-semibold shrink-0 ${k === 1 ? "border-blue-500 bg-blue-500/15 text-white" : "border-slate-700 bg-slate-900/40 text-slate-200"}`}>
              <Flag className="w-[5.2cqw] h-[3.9cqw] rounded-[0.5cqw] shrink-0" />{n}
            </span>
          ))}
        </div>
      </div>
    </div>,
    // 2) check-in form
    <div key="c" className="flex-1 min-h-0 flex flex-col">
      <OrgStrip />
      <div className="mx-[3cqw] rounded-[3cqw] overflow-hidden border border-slate-700 bg-slate-800/70">
        <GradHeader icon={<path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2M9 12l1.5 1.5L14 10" />} title={f.scCheckin} sub="London Warehouse" />
        <div className="p-[3.2cqw] flex flex-col gap-[2.4cqw]">
          <span className="flex items-center gap-[2cqw] text-[3.2cqw] font-bold text-white"><span className="w-[6cqw] h-[6cqw] rounded-full flex items-center justify-center text-white [&_svg]:w-[3.2cqw] [&_svg]:h-[3.2cqw]" style={{ background: "linear-gradient(135deg,#3b82f6,#2563eb)" }}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="3.4" /><path d="M5 21a7 7 0 0 1 14 0" strokeLinecap="round" /></svg></span>{f.scPersonal}</span>
          <Field label={f.scDriverName} col="#60a5fa" icon={<><circle cx="12" cy="8" r="3.4" /><path d="M5 21a7 7 0 0 1 14 0" /></>} w="52%" />
          <div className="flex flex-col gap-[1.2cqw]">
            <span className="flex items-center gap-[1.4cqw] text-[2.8cqw] font-medium text-slate-300"><svg viewBox="0 0 24 24" className="w-[3cqw] h-[3cqw]" fill="none" stroke="#60a5fa" strokeWidth="1.9"><path d="M5 4h4l2 5-3 2a12 12 0 0 0 5 5l2-3 5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" strokeLinecap="round" /></svg>{f.scPhone}</span>
            <div className="flex gap-[1.8cqw]">
              <span className="rounded-[2cqw] bg-slate-900/60 border border-slate-700 px-[2.2cqw] py-[2.4cqw] text-[2.8cqw] text-slate-300 flex items-center gap-[1.2cqw]"><FlagRO className="w-[4.4cqw] h-[3.2cqw] rounded-[0.4cqw]" />+40</span>
              <span className="flex-1 rounded-[2cqw] bg-slate-900/60 border border-slate-700 px-[3cqw] py-[2.4cqw] flex items-center"><span className="h-[1.6cqw] rounded-full bg-slate-700 w-[60%]" /></span>
            </div>
          </div>
          <Field label={f.scTruckNo} col="#60a5fa" icon={TruckIc} w="44%" />
          <span className="text-[2.9cqw] font-medium text-slate-300">{f.scType}</span>
          <div className="grid grid-cols-3 gap-[1.8cqw]">
            {[[f.scUnloading, "M12 5v14M6 13l6 6 6-6", true, "#22c55e"], [f.scLoading, "M12 19V5M6 11l6-6 6 6", false, "#f97316"], [f.scBoth, "M8 20V7M4.5 10.5 8 7l3.5 3.5M16 4v13M12.5 13.5 16 17l3.5-3.5", false, "#a855f7"]].map(([lbl, d, on, col], k) => (
              <span key={k} className="rounded-[2cqw] border flex flex-col items-center gap-[0.8cqw] py-[2.2cqw] text-[2.5cqw] font-semibold" style={{ borderColor: on ? (col as string) : "#334155", background: on ? `${col}22` : "transparent", color: on ? (col as string) : "#94a3b8" }}>
                <svg viewBox="0 0 24 24" className="w-[3.2cqw] h-[3.2cqw]" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d={d as string} /></svg>{lbl}
              </span>
            ))}
          </div>
          <span className="rounded-[2.2cqw] text-white text-center font-semibold text-[3.2cqw] py-[2.8cqw] flex items-center justify-center gap-[1.6cqw]" style={{ background: HDR }}><svg viewBox="0 0 24 24" className="w-[3.4cqw] h-[3.4cqw]" fill="currentColor"><path d="M3 20l18-8L3 4l4 8-4 8z" /></svg>{f.scSubmit}</span>
        </div>
      </div>
    </div>,
    // 3) live status — "assigned": purple map-pin, exactly like the real app
    <div key="st" className="flex-1 min-h-0 flex flex-col">
      <OrgStrip />
      <div className="mx-[3cqw] rounded-[3cqw] overflow-hidden border border-slate-700 bg-slate-800/70">
        <GradHeader icon={<path d="M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />} title={f.scStatusTitle} sub="London Warehouse" live liveLabel={f.scLive} />
        <div className="p-[3.6cqw] flex flex-col items-center gap-[2.2cqw]">
          <span className="relative w-[18cqw] h-[18cqw] rounded-full bg-purple-500/15 flex items-center justify-center">
            <span className="absolute inset-0 rounded-full border-[0.9cqw] border-purple-500/30 animate-ping" style={{ animationDuration: "2.4s" }} />
            <svg viewBox="0 0 24 24" className="w-[8cqw] h-[8cqw] text-purple-400" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{PinIc}</svg>
          </span>
          <span className="text-white font-bold text-[3.9cqw]">{f.scStatus}</span>
          <span className="w-full rounded-[2.2cqw] bg-slate-900/50 border border-slate-700 p-[2.6cqw] flex items-center gap-[2.6cqw]">
            <span className="w-[10cqw] h-[8cqw] rounded-[1.6cqw] bg-gradient-to-br from-orange-500/25 to-orange-500/5 border border-orange-400/40 flex items-center justify-center text-orange-400 text-[3.4cqw] font-bold shrink-0">4</span>
            <span className="flex flex-col leading-tight"><span className="text-[2.6cqw] text-slate-400">Dock</span><span className="text-[3.4cqw] font-bold text-white">Dock 4</span></span>
            <span className="ml-auto rounded-full text-white text-[2.7cqw] font-semibold px-[2.8cqw] py-[1.6cqw] flex items-center gap-[1.2cqw] shrink-0" style={{ background: HDR }}>
              <svg viewBox="0 0 24 24" className="w-[3cqw] h-[3cqw]" fill="none" stroke="currentColor" strokeWidth="2">{PinIc}</svg>{f.scDirections}
            </span>
          </span>
        </div>
      </div>
    </div>,
    // 4) chat — full thread, composer pinned to the bottom
    <div key="ch" className="flex-1 min-h-0 flex flex-col">
      <GradHeader icon={<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />} title={f.scChat} sub="London Warehouse" />
      <div className="flex-1 min-h-0 flex flex-col justify-end gap-[2.2cqw] px-[3.4cqw] py-[3cqw] overflow-hidden">
        {chat.map(([m, own], i) => (
          <span key={i} className={`max-w-[80%] px-[3cqw] py-[2.2cqw] text-[3.1cqw] leading-snug ${own ? "self-end rounded-[3cqw] rounded-br-[0.8cqw] text-white" : "self-start rounded-[3cqw] rounded-bl-[0.8cqw] bg-slate-700 text-slate-100"}`} style={own ? { background: "#2563eb" } : undefined}>{m}</span>
        ))}
      </div>
      <div className="flex items-center gap-[2.2cqw] px-[3.4cqw] py-[2.4cqw] bg-slate-900/70 border-t border-slate-700 shrink-0">
        <svg viewBox="0 0 24 24" className="w-[5cqw] h-[5cqw] text-slate-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="9" /><path d="M8.5 14a4 4 0 0 0 7 0M9 10h.01M15 10h.01" strokeLinecap="round" /></svg>
        <svg viewBox="0 0 24 24" className="w-[5.2cqw] h-[5.2cqw] text-slate-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="6" width="18" height="14" rx="2" /><circle cx="12" cy="13" r="3.2" /><path d="M8 6l1.5-2.5h5L16 6" /></svg>
        <span className="flex-1 rounded-full bg-slate-800 px-[3.4cqw] py-[2.2cqw] text-slate-500 text-[3.1cqw]">{c.uiMessage}</span>
        <span className="w-[8.4cqw] h-[8.4cqw] rounded-full flex items-center justify-center text-white shrink-0" style={{ background: "#2563eb" }}><svg viewBox="0 0 24 24" className="w-[4cqw] h-[4cqw]" fill="currentColor"><path d="M3 20l18-8L3 4l4 8-4 8z" /></svg></span>
      </div>
    </div>,
  ];

  return (
    <div ref={rootRef} className="@container absolute inset-0 p-[3cqw] flex items-center justify-center gap-[5cqw]" aria-hidden="true">
      {/* feature strip */}
      <div className="hidden sm:flex flex-col gap-[2.2cqw] w-[38%] max-w-[54cqw]">
        <div className="flex items-center gap-[2cqw]">
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
        <div className="flex items-center gap-[1.4cqw]">
          {[[APPLE_D, "iOS"], [ANDROID_D, "Android"]].map(([d, l], i) => (
            <span key={i} className="inline-flex items-center gap-[1.2cqw] rounded-full border border-slate-600 bg-slate-800 px-[2cqw] py-[1cqw] text-[1.7cqw] font-semibold text-slate-200">
              <svg viewBox="0 0 24 24" className="w-[2.4cqw] h-[2.4cqw] text-slate-100" fill="currentColor"><path d={d} /></svg>{l}
            </span>
          ))}
        </div>
      </div>

      {/* devices — an Android beside the iPhone so both platforms are obvious */}
      <div className="relative h-[96%] shrink-0 flex items-end">
        <div className="hidden md:block h-[80%] shrink-0 -mr-[7cqw]">
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
