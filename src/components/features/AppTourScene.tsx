"use client";

import { useEffect, useRef, useState } from "react";
import type { Translations } from "@/lib/i18n/translations";
import { PhoneFrame16 } from "./PhoneFrame16";

// Android & iOS App (feature 6): the shared iPhone 16 Pro Max frame running a
// product tour through faithful re-creations of the real QRGO Driver screens
// (language → scan → check-in → status → chat), beside a feature strip. Client
// player; static first screen on reduced-motion. aria-hidden decorative.

const BLUE = "#2563EB";
const LANGS = [["🇬🇧", "English"], ["🇷🇴", "Română"], ["🇩🇪", "Deutsch"], ["🇫🇷", "Français"], ["🇮🇹", "Italiano"], ["🇵🇱", "Polski"]];

function QLogo({ s }: { s: string }) {
  return <span className="rounded-[2.4cqw] flex items-center justify-center font-black text-white" style={{ width: s, height: s, fontSize: `calc(${s} * 0.6)`, background: `linear-gradient(135deg, #3b82f6, ${BLUE})` }}>Q</span>;
}

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
    const step = () => { if (cancelled) return; if (!visible) { setTimeout(step, 300); return; } i = (i + 1) % 5; setScr(i); setTimeout(step, 3000); };
    const to = setTimeout(step, 3000);
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

  const Screen = ({ i }: { i: number }) => {
    const on = scr === i;
    return <div className="absolute inset-0 transition-opacity duration-500" style={{ opacity: on ? 1 : 0, pointerEvents: "none" }}>{screens[i]}</div>;
  };

  const screens = [
    // 1) language picker
    <div key="l" className="flex-1 flex flex-col bg-slate-50">
      <div className="flex flex-col items-center gap-[2cqw] pt-[3cqw] pb-[5cqw] text-white" style={{ background: `linear-gradient(135deg, #3b82f6, ${BLUE})` }}>
        <QLogo s="16cqw" />
        <span className="font-bold text-[5cqw]">QRGO Driver</span>
        <span className="text-[3.6cqw] text-blue-100">{f.scWelcome}</span>
      </div>
      <div className="p-[4cqw]">
        <span className="text-[3.4cqw] font-semibold text-slate-500">{f.scLang}</span>
        <div className="grid grid-cols-2 gap-[2.4cqw] mt-[2.4cqw]">
          {LANGS.map(([fl, n], k) => (
            <span key={k} className={`flex items-center gap-[2cqw] rounded-[3cqw] border px-[3cqw] py-[2.6cqw] text-[3.6cqw] font-medium ${k === 1 ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-700"}`}>
              <span className="text-[5cqw]">{fl}</span>{n}
            </span>
          ))}
        </div>
      </div>
    </div>,
    // 2) scanner
    <div key="s" className="flex-1 flex flex-col items-center justify-center bg-slate-950 relative">
      <span className="absolute top-[5cqw] left-1/2 -translate-x-1/2 rounded-full bg-white/15 text-white text-[3.4cqw] font-medium px-[4cqw] py-[1.8cqw]">{f.scScan}</span>
      <div className="relative w-[62%] aspect-square rounded-[6cqw] overflow-hidden">
        {[["top-0 left-0 border-t-[1.4cqw] border-l-[1.4cqw] rounded-tl-[6cqw]"], ["top-0 right-0 border-t-[1.4cqw] border-r-[1.4cqw] rounded-tr-[6cqw]"], ["bottom-0 left-0 border-b-[1.4cqw] border-l-[1.4cqw] rounded-bl-[6cqw]"], ["bottom-0 right-0 border-b-[1.4cqw] border-r-[1.4cqw] rounded-br-[6cqw]"]].map(([c], k) => (
          <span key={k} className={`absolute w-[10cqw] h-[10cqw] ${c}`} style={{ borderColor: "#60a5fa" }} />
        ))}
        <span className="app-scan absolute left-[6cqw] right-[6cqw] h-[0.7cqw] rounded-full" style={{ background: "#60a5fa", boxShadow: "0 0 3cqw #60a5fa" }} />
      </div>
      <span className="absolute bottom-[6cqw] w-[10cqw] h-[10cqw] rounded-full bg-white/15 flex items-center justify-center text-white [&_svg]:w-[5cqw] [&_svg]:h-[5cqw]">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 18h6M10 21h4M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z" /></svg>
      </span>
    </div>,
    // 3) check-in form
    <div key="c" className="flex-1 flex flex-col bg-slate-50">
      <div className="h-[16%] flex items-end px-[4cqw] pb-[2.6cqw] gap-[2.6cqw]" style={{ background: `linear-gradient(135deg, #1e3a8a, ${BLUE})` }}>
        <span className="w-[11cqw] h-[11cqw] rounded-full bg-white flex items-center justify-center [&_svg]:w-[6cqw] [&_svg]:h-[6cqw] text-blue-600"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 20V9l8-5 8 5v11M4 20h16M9 20v-6h6v6" strokeLinejoin="round" /></svg></span>
        <span className="text-white font-bold text-[4.2cqw] pb-[0.6cqw]">London Warehouse</span>
      </div>
      <div className="p-[4cqw] flex flex-col gap-[2.6cqw]">
        <span className="text-[4.4cqw] font-bold text-slate-800">{f.scCheckin}</span>
        {[["#3b82f6", "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0"], ["#22c55e", "M5 4h4l2 5-3 2a12 12 0 0 0 5 5l2-3 5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"], ["#f97316", "M1 6h13v8H1zM14 9h4l3 3v2h-7z"]].map(([col, d], k) => (
          <span key={k} className="flex items-center gap-[2.6cqw] rounded-[3cqw] bg-white border border-slate-200 px-[3cqw] py-[2.8cqw]">
            <svg viewBox="0 0 24 24" className="w-[4.4cqw] h-[4.4cqw] shrink-0" fill="none" stroke={col} strokeWidth="1.8" strokeLinecap="round"><path d={d} /></svg>
            <span className="h-[1.6cqw] rounded-full bg-slate-200" style={{ width: `${[52, 66, 44][k]}%` }} />
          </span>
        ))}
        <div className="grid grid-cols-4 gap-[2cqw]">
          {[0, 1, 2, 3].map((k) => (<span key={k} className={`aspect-square rounded-[2.4cqw] border flex items-center justify-center [&_svg]:w-[5cqw] [&_svg]:h-[5cqw] ${k === 1 ? "border-blue-500 bg-blue-50 text-blue-600" : "border-slate-200 bg-white text-slate-400"}`}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 6h13v8H1zM14 9h4l3 3v2h-7z" /><circle cx="5" cy="17" r="1.6" /><circle cx="18" cy="17" r="1.6" /></svg></span>))}
        </div>
        <span className="mt-[1cqw] rounded-full text-white text-center font-semibold text-[4cqw] py-[3cqw]" style={{ background: BLUE }}>Check-in →</span>
      </div>
    </div>,
    // 4) status
    <div key="st" className="flex-1 flex flex-col bg-slate-50">
      <div className="h-[13%] flex items-end px-[4cqw] pb-[2.4cqw]" style={{ background: `linear-gradient(135deg, #1e3a8a, ${BLUE})` }}><span className="text-white font-bold text-[4cqw]">London Warehouse</span></div>
      <div className="p-[4cqw] flex flex-col gap-[3cqw]">
        <div className="rounded-[4cqw] bg-white border border-slate-200 p-[4cqw] flex items-center gap-[4cqw]">
          <span className="relative w-[16cqw] h-[16cqw] shrink-0">
            <svg viewBox="0 0 36 36" className="w-full h-full animate-spin" style={{ animationDuration: "3s" }}><circle cx="18" cy="18" r="15" fill="none" stroke="#dbeafe" strokeWidth="3" /><circle cx="18" cy="18" r="15" fill="none" stroke={BLUE} strokeWidth="3" strokeDasharray="24 70" strokeLinecap="round" /></svg>
            <span className="absolute inset-0 flex items-center justify-center [&_svg]:w-[7cqw] [&_svg]:h-[7cqw] text-blue-600"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M1 6h13v8H1zM14 9h4l3 3v2h-7z" /><circle cx="5" cy="17" r="1.6" /><circle cx="18" cy="17" r="1.6" /></svg></span>
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-[3.2cqw] text-slate-400">{f.scStatusLabel}</span>
            <span className="text-[4.4cqw] font-bold text-slate-800">{f.scStatus}</span>
          </span>
          <span className="ml-auto w-[13cqw] h-[13cqw] rounded-[1.6cqw] bg-slate-900 grid grid-cols-4 grid-rows-4 gap-[0.4cqw] p-[1.2cqw] shrink-0">
            {Array.from({ length: 16 }).map((_, k) => (<span key={k} className="rounded-[0.2cqw]" style={{ background: [0, 2, 3, 5, 6, 9, 10, 12, 15].includes(k) ? "#fff" : "transparent" }} />))}
          </span>
        </div>
        <div className="rounded-[4cqw] bg-white border border-slate-200 p-[3cqw] flex items-center gap-[3cqw]">
          <span className="w-[13cqw] h-[10cqw] rounded-[2cqw] bg-gradient-to-br from-orange-500/25 to-orange-500/5 border border-orange-400/40 flex items-center justify-center text-orange-500 text-[4cqw] font-bold shrink-0">4</span>
          <span className="flex flex-col leading-tight"><span className="text-[3.2cqw] text-slate-400">Dock</span><span className="text-[4cqw] font-bold text-slate-800">Dock 4</span></span>
          <span className="ml-auto rounded-full text-white text-[3.2cqw] font-semibold px-[3cqw] py-[1.8cqw] flex items-center gap-[1.4cqw]" style={{ background: BLUE }}>
            <svg viewBox="0 0 24 24" className="w-[3.4cqw] h-[3.4cqw]" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11z" /><circle cx="12" cy="10" r="2.5" /></svg>{f.scDirections}
          </span>
        </div>
      </div>
    </div>,
    // 5) chat
    <div key="ch" className="flex-1 flex flex-col bg-slate-50">
      <div className="flex items-center gap-[3cqw] px-[4cqw] pt-[3cqw] pb-[3cqw] text-white" style={{ background: `linear-gradient(135deg, #3b82f6, ${BLUE})` }}>
        <span className="w-[9cqw] h-[9cqw] rounded-full bg-white/20 flex items-center justify-center [&_svg]:w-[5cqw] [&_svg]:h-[5cqw]"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeLinejoin="round" /></svg></span>
        <span className="font-bold text-[4.2cqw]">{f.scChat}</span>
      </div>
      <div className="flex-1 flex flex-col gap-[2.6cqw] p-[4cqw]">
        <span className="self-start max-w-[75%] rounded-[3cqw] rounded-bl-[0.8cqw] bg-white border border-slate-200 px-[3cqw] py-[2.4cqw] text-slate-700 text-[3.6cqw]">Dock 4 is free — send me the CMR when you arrive.</span>
        <span className="self-end max-w-[75%] rounded-[3cqw] rounded-br-[0.8cqw] text-white px-[3cqw] py-[2.4cqw] text-[3.6cqw]" style={{ background: BLUE }}>On my way 👍</span>
      </div>
      <div className="flex items-center gap-[2.4cqw] px-[4cqw] py-[2.6cqw] bg-white border-t border-slate-200">
        <span className="flex-1 rounded-full bg-slate-100 px-[4cqw] py-[2.4cqw] text-slate-400 text-[3.6cqw]">Message</span>
        <span className="w-[9cqw] h-[9cqw] rounded-full flex items-center justify-center text-white [&_svg]:w-[4.4cqw] [&_svg]:h-[4.4cqw]" style={{ background: BLUE }}><svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 20l18-8L3 4l4 8-4 8z" /></svg></span>
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
        <PhoneFrame16 time="14:32" screenClassName="bg-slate-50" statusDark>
          <div className="flex-1 min-h-0 relative overflow-hidden">
            {screens.map((_, i) => <Screen key={i} i={i} />)}
          </div>
        </PhoneFrame16>
      </div>
    </div>
  );
}
