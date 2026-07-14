"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { Translations } from "@/lib/i18n/translations";
import { PhoneFrame16 } from "./PhoneFrame16";

// Android & iOS App (feature 6): the shared iPhone 16 Pro Max frame running a
// product tour through faithful re-creations of the real QRGO Driver screens —
// dark theme, blue-gradient card headers, exactly like the live driver web
// (language -> check-in form -> live status -> chat), beside a feature strip.
// Client player; static first screen on reduced-motion. aria-hidden decorative.

const HDR = "linear-gradient(to right, #2563eb, #1d4ed8)";
const LANGS = [["🇷🇴", "Română"], ["🇬🇧", "English"], ["🇩🇪", "Deutsch"], ["🇫🇷", "Français"], ["🇵🇱", "Polski"]];

function QLogo({ s }: { s: string }) {
  return <span className="rounded-[2.4cqw] flex items-center justify-center font-black text-white" style={{ width: s, height: s, fontSize: `calc(${s} * 0.58)`, background: "linear-gradient(135deg, #3b82f6, #2563eb)" }}>Q</span>;
}
const TruckIc = <><path d="M1 6h13v8H1zM14 9h4l3 3v2h-7z" /><circle cx="5" cy="17" r="1.6" /><circle cx="18" cy="17" r="1.6" /></>;

  function OrgStrip() { return (
    <div className="flex items-center gap-[2.4cqw] px-[3.5cqw] py-[2.6cqw]">
      <span className="w-[9cqw] h-[9cqw] rounded-full bg-blue-500/20 text-blue-300 flex items-center justify-center [&_svg]:w-[5cqw] [&_svg]:h-[5cqw] shrink-0">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">{TruckIc}</svg>
      </span>
      <span className="flex flex-col leading-tight min-w-0">
        <span className="text-white font-bold text-[3.6cqw] truncate">London Warehouse</span>
        <span className="text-slate-400 text-[2.8cqw] truncate">Industriilor 19 · Chiajna</span>
      </span>
    </div>
  ); }
  function GradHeader({ icon, title, sub, live, liveLabel }: { icon: ReactNode; title: string; sub?: string; live?: boolean; liveLabel?: string }) { return (
    <div className="flex items-center gap-[2.6cqw] px-[3.5cqw] py-[3cqw]" style={{ background: HDR }}>
      <span className="w-[9cqw] h-[9cqw] rounded-[2.2cqw] bg-white/20 flex items-center justify-center text-white [&_svg]:w-[5cqw] [&_svg]:h-[5cqw] shrink-0"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{icon}</svg></span>
      <span className="flex flex-col leading-tight min-w-0">
        <span className="text-white font-bold text-[4cqw] truncate">{title}</span>
        {sub && <span className="text-blue-100 text-[2.9cqw] truncate">{sub}</span>}
      </span>
      {live && <span className="ml-auto inline-flex items-center gap-[1cqw] bg-white/20 rounded-full px-[2.4cqw] py-[1.2cqw] text-white text-[2.7cqw] font-medium"><span className="relative flex w-[1.8cqw] h-[1.8cqw]"><span className="absolute inline-flex w-full h-full rounded-full bg-green-400 opacity-75 animate-ping" /><span className="relative rounded-full w-[1.8cqw] h-[1.8cqw] bg-green-400" /></span>{liveLabel}</span>}
    </div>
  ); }
  function Field({ label, ph, col, icon, w = "60%" }: { label: string; ph?: boolean; col: string; icon: ReactNode; w?: string }) { return (
    <div className="flex flex-col gap-[1.4cqw]">
      <span className="flex items-center gap-[1.4cqw] text-[2.9cqw] font-medium text-slate-300"><svg viewBox="0 0 24 24" className="w-[3.2cqw] h-[3.2cqw]" fill="none" stroke={col} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">{icon}</svg>{label}</span>
      <span className="rounded-[2.2cqw] bg-slate-900/60 border border-slate-700 px-[3cqw] py-[2.6cqw] flex items-center">{ph ? <span className="h-[1.8cqw] rounded-full bg-slate-700" style={{ width: w }} /> : null}</span>
    </div>
  ); }

export function AppTourScene({ t }: { t: Translations }) {
  const f = t.f6Page;
  const [scr, setScr] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let cancelled = false, visible = true;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0.2 });
    if (rootRef.current) io.observe(rootRef.current);
    let i = 0;
    const step = () => { if (cancelled) return; if (!visible) { setTimeout(step, 300); return; } i = (i + 1) % 4; setScr(i); setTimeout(step, 3200); };
    const to = setTimeout(step, 3200);
    return () => { cancelled = true; clearTimeout(to); io.disconnect(); };
  }, []);

  const feats = [
    { l: f.feat12Lang, ic: <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18M3.5 9h17M3.5 15h17" /> },
    { l: f.featScan, ic: <path d="M4 7V5a1 1 0 0 1 1-1h2M17 4h2a1 1 0 0 1 1 1v2M20 17v2a1 1 0 0 1-1 1h-2M7 20H5a1 1 0 0 1-1-1v-2M4 12h16" /> },
    { l: f.featStatus, ic: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></> },
    { l: f.featChat, ic: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /> },
    { l: f.featDirections, ic: <><path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11z" /><circle cx="12" cy="10" r="2.5" /></> },
    { l: f.featAuto, ic: <><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" /></> },
  ];


  const screens = [
    // 1) language
    <div key="l" className="flex-1 flex flex-col">
      <OrgStrip />
      <div className="mx-[3cqw] rounded-[3cqw] overflow-hidden border border-slate-700 bg-slate-800/70">
        <GradHeader icon={<path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18M3.5 9h17M3.5 15h17" />} title={f.scLang} sub={f.scWelcome} />
        <div className="p-[3cqw] flex flex-col gap-[2cqw]">
          {LANGS.map(([fl, n], k) => (
            <span key={k} className={`flex items-center gap-[2.6cqw] rounded-[2.4cqw] border px-[3cqw] py-[2.6cqw] text-[3.4cqw] font-semibold ${k === 1 ? "border-blue-500 bg-blue-500/15 text-white" : "border-slate-700 bg-slate-900/40 text-slate-200"}`}>
              <span className="text-[4.6cqw] leading-none">{fl}</span>{n}
            </span>
          ))}
        </div>
      </div>
    </div>,
    // 2) check-in form
    <div key="c" className="flex-1 flex flex-col">
      <OrgStrip />
      <div className="mx-[3cqw] rounded-[3cqw] overflow-hidden border border-slate-700 bg-slate-800/70">
        <GradHeader icon={<path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2M9 12l1.5 1.5L14 10" />} title={f.scCheckin} sub="London Warehouse" />
        <div className="p-[3.4cqw] flex flex-col gap-[2.8cqw]">
          <span className="flex items-center gap-[2cqw] text-[3.4cqw] font-bold text-white"><span className="w-[6.4cqw] h-[6.4cqw] rounded-full flex items-center justify-center text-white [&_svg]:w-[3.4cqw] [&_svg]:h-[3.4cqw]" style={{ background: "linear-gradient(135deg,#3b82f6,#2563eb)" }}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="3.4" /><path d="M5 21a7 7 0 0 1 14 0" strokeLinecap="round" /></svg></span>{f.scPersonal}</span>
          <Field label={f.scDriverName} ph col="#60a5fa" icon={<><circle cx="12" cy="8" r="3.4" /><path d="M5 21a7 7 0 0 1 14 0" /></>} w="52%" />
          <div className="flex flex-col gap-[1.4cqw]">
            <span className="flex items-center gap-[1.4cqw] text-[2.9cqw] font-medium text-slate-300"><svg viewBox="0 0 24 24" className="w-[3.2cqw] h-[3.2cqw]" fill="none" stroke="#60a5fa" strokeWidth="1.9"><path d="M5 4h4l2 5-3 2a12 12 0 0 0 5 5l2-3 5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" strokeLinecap="round" /></svg>{f.scPhone}</span>
            <div className="flex gap-[2cqw]">
              <span className="rounded-[2.2cqw] bg-slate-900/60 border border-slate-700 px-[2.4cqw] py-[2.6cqw] text-[3cqw] text-slate-300 flex items-center gap-[1.2cqw]">🇷🇴 +40</span>
              <span className="flex-1 rounded-[2.2cqw] bg-slate-900/60 border border-slate-700 px-[3cqw] py-[2.6cqw] flex items-center"><span className="h-[1.8cqw] rounded-full bg-slate-700 w-[60%]" /></span>
            </div>
          </div>
          <span className="text-[3cqw] font-medium text-slate-300 mt-[0.5cqw]">{f.scType}</span>
          <div className="grid grid-cols-3 gap-[2cqw]">
            {[[f.scUnloading, "M12 5v14M6 13l6 6 6-6", true, "#22c55e"], [f.scLoading, "M12 19V5M6 11l6-6 6 6", false, "#f97316"], [f.scBoth, "M8 20V7M4.5 10.5 8 7l3.5 3.5M16 4v13M12.5 13.5 16 17l3.5-3.5", false, "#a855f7"]].map(([lbl, d, on, c], k) => (
              <span key={k} className="rounded-[2.2cqw] border flex flex-col items-center gap-[1cqw] py-[2.4cqw] text-[2.7cqw] font-semibold" style={{ borderColor: on ? (c as string) : "#334155", background: on ? `${c}22` : "transparent", color: on ? (c as string) : "#94a3b8" }}>
                <svg viewBox="0 0 24 24" className="w-[3.4cqw] h-[3.4cqw]" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d={d as string} /></svg>{lbl}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-[2cqw]">
            {[[f.scTruck, false], [f.scTruckTrailer, true]].map(([lbl, on], k) => (
              <span key={k} className={`rounded-[2.2cqw] border flex flex-col items-center gap-[1.2cqw] py-[2.6cqw] text-[2.7cqw] font-medium ${on ? "border-blue-500 bg-blue-500/15 text-blue-300" : "border-slate-700 text-slate-400"}`}>
                <svg viewBox="0 0 24 24" className="w-[5cqw] h-[5cqw]" fill="none" stroke="currentColor" strokeWidth="1.5">{TruckIc}</svg>{lbl}
              </span>
            ))}
          </div>
          <span className="mt-[0.5cqw] rounded-[2.4cqw] text-white text-center font-semibold text-[3.4cqw] py-[3cqw] flex items-center justify-center gap-[1.6cqw]" style={{ background: HDR }}><svg viewBox="0 0 24 24" className="w-[3.6cqw] h-[3.6cqw]" fill="currentColor"><path d="M3 20l18-8L3 4l4 8-4 8z" /></svg>{f.scSubmit}</span>
        </div>
      </div>
    </div>,
    // 3) status
    <div key="st" className="flex-1 flex flex-col">
      <OrgStrip />
      <div className="mx-[3cqw] rounded-[3cqw] overflow-hidden border border-slate-700 bg-slate-800/70">
        <GradHeader icon={<path d="M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />} title={f.scStatusTitle} sub="London Warehouse" live liveLabel={f.scLive} />
        <div className="p-[4cqw] flex flex-col items-center gap-[2.4cqw]">
          <span className="relative w-[20cqw] h-[20cqw] rounded-full bg-blue-500/15 flex items-center justify-center">
            <span className="absolute inset-0 rounded-full border-[1cqw] border-blue-500/40 animate-ping" style={{ animationDuration: "2s" }} />
            <svg viewBox="0 0 24 24" className="w-[9cqw] h-[9cqw] text-blue-400 animate-[spin_3s_ease-in-out_infinite]" fill="none" stroke="currentColor" strokeWidth="1.7">{TruckIc}</svg>
          </span>
          <span className="text-white font-bold text-[4.2cqw]">{f.scStatus}</span>
          <span className="w-full rounded-[2.4cqw] bg-slate-900/50 border border-slate-700 p-[3cqw] flex items-center gap-[3cqw]">
            <span className="w-[11cqw] h-[9cqw] rounded-[1.8cqw] bg-gradient-to-br from-orange-500/25 to-orange-500/5 border border-orange-400/40 flex items-center justify-center text-orange-400 text-[3.6cqw] font-bold shrink-0">4</span>
            <span className="flex flex-col leading-tight"><span className="text-[2.8cqw] text-slate-400">Dock</span><span className="text-[3.6cqw] font-bold text-white">Dock 4</span></span>
            <span className="ml-auto rounded-full text-white text-[2.9cqw] font-semibold px-[3cqw] py-[1.8cqw] flex items-center gap-[1.4cqw]" style={{ background: HDR }}>
              <svg viewBox="0 0 24 24" className="w-[3.2cqw] h-[3.2cqw]" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11z" /><circle cx="12" cy="10" r="2.5" /></svg>{f.scDirections}
            </span>
          </span>
        </div>
      </div>
    </div>,
    // 4) chat
    <div key="ch" className="flex-1 flex flex-col">
      <GradHeader icon={<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />} title={f.scChat} sub="London Warehouse" />
      <div className="flex-1 flex flex-col gap-[2.6cqw] p-[4cqw]">
        <span className="self-start max-w-[76%] rounded-[3cqw] rounded-bl-[0.8cqw] bg-slate-700 px-[3cqw] py-[2.4cqw] text-slate-100 text-[3.4cqw]">Dock 4 is free — send me the CMR when you arrive.</span>
        <span className="self-end max-w-[76%] rounded-[3cqw] rounded-br-[0.8cqw] text-white px-[3cqw] py-[2.4cqw] text-[3.4cqw]" style={{ background: "#2563eb" }}>On my way 👍</span>
      </div>
      <div className="flex items-center gap-[2.4cqw] px-[4cqw] py-[2.6cqw] bg-slate-900/70 border-t border-slate-700">
        <span className="flex-1 rounded-full bg-slate-800 px-[4cqw] py-[2.4cqw] text-slate-500 text-[3.4cqw]">Message</span>
        <span className="w-[9cqw] h-[9cqw] rounded-full flex items-center justify-center text-white [&_svg]:w-[4.4cqw] [&_svg]:h-[4.4cqw]" style={{ background: "#2563eb" }}><svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 20l18-8L3 4l4 8-4 8z" /></svg></span>
      </div>
    </div>,
  ];

  return (
    <div ref={rootRef} className="@container absolute inset-0 p-[3cqw] flex items-center justify-center gap-[5cqw]" aria-hidden="true">
      {/* feature strip */}
      <div className="hidden sm:flex flex-col gap-[2.6cqw] w-[46%] max-w-[62cqw]">
        <div className="flex items-center gap-[2cqw]">
          <QLogo s="7cqw" />
          <span className="text-white font-bold text-[3.2cqw]">QRGO Driver</span>
        </div>
        <div className="flex flex-col gap-[1.6cqw]">
          {feats.map((ft, i) => (
            <div key={i} className="flex items-center gap-[2cqw] rounded-[1.4cqw] border border-slate-700/70 bg-slate-800/50 px-[2cqw] py-[1.6cqw]">
              <span className="w-[4.4cqw] h-[4.4cqw] rounded-[1cqw] bg-blue-500/15 text-blue-300 flex items-center justify-center [&_svg]:w-[2.6cqw] [&_svg]:h-[2.6cqw] shrink-0"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{ft.ic}</svg></span>
              <span className="text-slate-200 text-[1.9cqw] font-medium">{ft.l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* phone */}
      <div className="h-[96%] shrink-0">
        <PhoneFrame16 time="14:32" screenClassName="bg-gradient-to-b from-slate-900 to-slate-800">
          <div className="flex-1 min-h-0 relative overflow-hidden">
            {screens.map((s, i) => (
              <div key={i} className="absolute inset-0 transition-opacity duration-500 pt-[2cqw]" style={{ opacity: scr === i ? 1 : 0, pointerEvents: "none" }}>{s}</div>
            ))}
          </div>
        </PhoneFrame16>
      </div>
    </div>
  );
}
