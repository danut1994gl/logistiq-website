"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { Translations } from "@/lib/i18n/translations";
import { PhoneFrame16 } from "./PhoneFrame16";

// Driver-notifications scene: an iPhone 16 Pro Max lock screen where every
// dispatcher action arrives as a QRGO push notification, revealed one-by-one on
// a loop, with a 2×3 trigger grid on the left lighting up in sync. Client
// player (reveals in JS; reduced-motion shows all six). aria-hidden.
const ICONS: ReactNode[] = [
  <path key="0" d="M4 20V9l8-5 8 5v11M4 20h16M9 20v-6h6v6" />, // dock assigned (warehouse)
  <path key="1" d="M21 15a2 2 0 0 1-2 2H8l-4 4V5a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2z" />, // new instruction (chat)
  <><circle key="2a" cx="12" cy="8" r="3.4" /><path key="2b" d="M5 21a7 7 0 0 1 14 0" /></>, // come to office (person)
  <path key="3" d="M4 20V10M10 20V4M16 20v-8M22 20H2" />, // status updated (bars)
  <><path key="4a" d="M8 10h8M8 14h5" /><path key="4b" d="M21 15a2 2 0 0 1-2 2H8l-4 4V5a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2z" /></>, // new message
  <><rect key="5a" x="4" y="4" width="16" height="16" rx="3" /><path key="5b" d="M9.5 17V8h3.2a2.6 2.6 0 0 1 0 5.2H9.5" /></>, // sent to parking (P)
];

export function NotificationsScene({ t }: { t: Translations }) {
  const c = t.chatPage;
  const items = [
    { title: c.notif1T, body: c.notif1B }, { title: c.notif2T, body: c.notif2B },
    { title: c.notif3T, body: c.notif3B }, { title: c.notif4T, body: c.notif4B },
    { title: c.notif5T, body: c.notif5B }, { title: c.notif6T, body: c.notif6B },
  ];
  const [revealed, setRevealed] = useState(0);
  const [active, setActive] = useState(-1);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setRevealed(6); return; }
    let cancelled = false, visible = true;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0.15 });
    if (rootRef.current) io.observe(rootRef.current);
    const sleep = (ms: number) => new Promise<void>((res) => {
      const started = Date.now();
      const tick = () => { if (cancelled) return res(); if (visible && Date.now() - started >= ms) return res(); setTimeout(tick, visible ? 90 : 150); };
      setTimeout(tick, 90);
    });
    (async () => {
      while (!cancelled) {
        setRevealed(0); setActive(-1);
        await sleep(700);
        for (let i = 0; i < 6 && !cancelled; i++) {
          setActive(i);
          await sleep(160);
          setRevealed(i + 1);
          await sleep(300);
          setActive(-1);
          await sleep(1150);
        }
        await sleep(2400);
      }
    })();
    return () => { cancelled = true; io.disconnect(); };
  }, []);

  return (
    <div ref={rootRef} className="@container absolute inset-0 p-[2.5cqw] flex items-center justify-center gap-[4cqw]" aria-hidden="true">
      {/* trigger grid (dispatcher actions) — 2 columns × 3 rows */}
      <div className="hidden sm:grid grid-cols-2 gap-[1.4cqw] w-[50%] max-w-[66cqw] content-center">
        {items.map((it, i) => (
          <div
            key={i}
            className="flex items-center gap-[1.4cqw] rounded-[1.4cqw] border bg-slate-800/50 px-[1.6cqw] py-[1.4cqw] transition-all duration-300"
            style={{ borderColor: active === i ? "rgba(59,130,246,0.8)" : "rgba(51,65,85,0.7)", backgroundColor: active === i ? "rgba(37,99,235,0.14)" : "rgba(30,41,59,0.5)" }}
          >
            <span className="w-[4cqw] h-[4cqw] rounded-[1cqw] bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <svg viewBox="0 0 24 24" className="w-[2.4cqw] h-[2.4cqw]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{ICONS[i]}</svg>
            </span>
            <span className="text-slate-200 text-[1.55cqw] font-medium leading-tight line-clamp-2">{it.title}</span>
          </div>
        ))}
      </div>

      {/* iPhone 16 Pro Max lock screen (larger) */}
      <div className="h-full shrink-0">
        <PhoneFrame16 time="14:32" screenClassName="bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950">
          <div className="flex-1 min-h-0 flex flex-col px-[4.5cqw]">
            <div className="pt-[7cqw] text-center text-white">
              <div className="text-[4.2cqw] text-slate-300 font-medium">{c.notifDate}</div>
              <div className="text-[18cqw] font-light leading-none tracking-tight mt-[0.8cqw]">14:32</div>
            </div>
            <div className="mt-[6cqw] flex flex-col gap-[2.2cqw]">
              {items.map((it, i) => {
                const on = i < revealed;
                return (
                  <div
                    key={i}
                    className="rounded-[3.6cqw] bg-slate-100/95 backdrop-blur px-[3cqw] py-[2.6cqw] flex items-center gap-[2.6cqw] shadow-lg transition-all duration-300"
                    style={{ opacity: on ? 1 : 0, transform: on ? "translateY(0) scale(1)" : "translateY(-14%) scale(0.96)", maxHeight: on ? "18cqw" : "0cqw", marginTop: on ? undefined : "-2.2cqw", paddingTop: on ? undefined : 0, paddingBottom: on ? undefined : 0 }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/qrgo-icon.svg" alt="" className="w-[8.5cqw] h-[8.5cqw] rounded-[2cqw] shrink-0" />
                    <span className="flex flex-col leading-tight min-w-0">
                      <span className="flex items-center gap-[1.4cqw]">
                        <span className="text-slate-900 font-semibold text-[3.6cqw] truncate">{it.title}</span>
                        <span className="text-slate-500 text-[2.8cqw] ml-auto shrink-0">{c.notifNow}</span>
                      </span>
                      <span className="text-slate-600 text-[3.1cqw] leading-tight line-clamp-2">{it.body}</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </PhoneFrame16>
      </div>
    </div>
  );
}
