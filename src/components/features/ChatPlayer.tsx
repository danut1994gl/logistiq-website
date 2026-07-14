"use client";

import { useEffect, useRef, useState } from "react";
import type { Translations } from "@/lib/i18n/translations";
import type { Locale } from "@/lib/i18n/config";
import { DRIVER_POOLS } from "./driverPools";
import { PhoneFrame16 } from "./PhoneFrame16";

type Side = "driver" | "disp";
type Step = { f: Side; k?: string; img?: boolean };
type Tick = "sending" | "sent" | "delivered" | "read";
type Msg = { mid: number; from: Side; k?: string; img?: boolean; time: string; onDash: boolean; onPhone: boolean; tick: Tick };

// The five scripted field scenarios (from the real check-in chat). Text lives
// in i18n (t.chatPage.s{n}m{k}); from/type live here.
const SCENARIOS: Step[][] = [
  [{ f: "driver", k: "s1m1" }, { f: "disp", k: "s1m2" }, { f: "disp", k: "s1m3" }, { f: "driver", k: "s1m4" }, { f: "disp", k: "s1m5" }],
  [{ f: "disp", k: "s2m1" }, { f: "driver", img: true }, { f: "disp", k: "s2m3" }, { f: "disp", k: "s2m4" }],
  [{ f: "driver", k: "s3m1" }, { f: "disp", k: "s3m2" }, { f: "disp", k: "s3m3" }, { f: "driver", k: "s3m4" }],
  [{ f: "disp", k: "s4m1" }, { f: "driver", k: "s4m2" }, { f: "disp", k: "s4m3" }],
  [{ f: "driver", k: "s5m1" }, { f: "disp", k: "s5m2" }, { f: "driver", img: true }, { f: "disp", k: "s5m4" }, { f: "driver", k: "s5m5" }],
];

function DocThumb() {
  return (
    <div className="rounded-[0.5em] bg-slate-100 w-full aspect-[7/4] flex items-center justify-center relative overflow-hidden" style={{ fontSize: "1em" }}>
      <div className="absolute rounded-full bg-slate-400" style={{ left: "14%", right: "34%", top: "22%", height: "0.14em" }} />
      <div className="absolute rounded-full bg-slate-300" style={{ left: "14%", right: "20%", top: "42%", height: "0.14em" }} />
      <div className="absolute rounded-full bg-slate-300" style={{ left: "14%", right: "46%", top: "60%", height: "0.14em" }} />
      <svg viewBox="0 0 24 24" className="relative text-slate-400" style={{ width: "1.5em", height: "1.5em" }} fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="8.5" cy="10" r="1.5" /><path d="M21 17l-5-5L5 19" />
      </svg>
    </div>
  );
}

function Dots({ unit }: { unit: string }) {
  return (
    <span className="inline-flex items-center gap-[0.35em]" style={{ fontSize: unit }}>
      {[0, 1, 2].map((i) => (
        <span key={i} className="rounded-full bg-current opacity-60 animate-bounce" style={{ width: "0.5em", height: "0.5em", animationDelay: `${i * 0.15}s`, animationDuration: "0.6s" }} />
      ))}
    </span>
  );
}

// WhatsApp-style status ticks: sending (clock) -> sent (1 check) -> delivered
// (2 grey checks) -> read (2 blue checks).
function StatusTick({ tick, size, ownLight }: { tick: Tick; size: string; ownLight: string }) {
  if (tick === "sending") return <svg viewBox="0 0 24 24" className={ownLight} style={{ width: size, height: size }} fill="none" stroke="currentColor" strokeWidth="2.4"><circle cx="12" cy="12" r="8" /><path d="M12 8v4.5l3 1.8" strokeLinecap="round" /></svg>;
  if (tick === "sent") return <svg viewBox="0 0 24 24" className={ownLight} style={{ width: size, height: size }} fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12l5 5L20 6" strokeLinecap="round" strokeLinejoin="round" /></svg>;
  return <svg viewBox="0 0 24 24" className={tick === "read" ? "text-sky-300" : ownLight} style={{ width: size, height: size }} fill="none" stroke="currentColor" strokeWidth="3"><path d="M1 12l6 6L17 6M8 16l1.5 1.5L22 6" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export function ChatPlayer({ t, locale }: { t: Translations; locale: Locale }) {
  const c = t.chatPage;
  const pool = DRIVER_POOLS[locale];
  const driver = pool[0];
  const dispatcher = pool[4]; // the warehouse dispatcher the driver is chatting with
  const dispInit = dispatcher.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const txt = (k?: string) => (k ? (c as unknown as Record<string, string>)[k] : "");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [dashTyping, setDashTyping] = useState(false); // driver typing, seen on the dashboard
  const [phoneTyping, setPhoneTyping] = useState(false); // dispatcher typing, seen on the phone
  const [sendFx, setSendFx] = useState<"dash" | "phone" | null>(null);
  const dashRef = useRef<HTMLDivElement>(null);
  const phoneRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const msgsRef = useRef<Msg[]>([]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMsgs(SCENARIOS[0].map((s, i) => ({ mid: i, from: s.f, k: s.k, img: s.img, time: `14:3${1 + i}`, onDash: true, onPhone: true, tick: "read" as Tick })));
      return;
    }
    let cancelled = false;
    let visible = true;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0.15 });
    if (rootRef.current) io.observe(rootRef.current);
    const sleep = (ms: number) => new Promise<void>((res) => {
      const started = Date.now();
      const tick = () => { if (cancelled) return res(); if (visible && Date.now() - started >= ms) return res(); setTimeout(tick, visible ? 80 : 160); };
      setTimeout(tick, 80);
    });
    const apply = (fn: (m: Msg[]) => Msg[]) => { msgsRef.current = fn(msgsRef.current); setMsgs(msgsRef.current); };
    const setTick = (mid: number, patch: Partial<Msg>) => apply((ms) => ms.map((m) => (m.mid === mid ? { ...m, ...patch } : m)));

    const run = async () => {
      let s = 0;
      while (!cancelled) {
        const scenario = SCENARIOS[s];
        apply(() => []);
        setDashTyping(false); setPhoneTyping(false);
        await sleep(700);
        let mid = 0;
        let clock = 33;
        for (let i = 0; i < scenario.length && !cancelled; i++) {
          const step = scenario[i];
          const time = `14:${clock}`; clock = clock >= 59 ? 33 : clock + 1;
          // 1) the composer types → the OTHER device shows "typing…"
          if (step.f === "disp") setPhoneTyping(true); else setDashTyping(true);
          await sleep(step.img ? 900 : 1200);
          if (cancelled) break;
          if (step.f === "disp") setPhoneTyping(false); else setDashTyping(false);
          // 2) send → appears on the SENDER's device first (sending → sent)
          const id = mid++;
          const m: Msg = { mid: id, from: step.f, k: step.k, img: step.img, time, onDash: step.f === "disp", onPhone: step.f === "driver", tick: "sending" };
          apply((ms) => [...ms, m]);
          setSendFx(step.f === "disp" ? "dash" : "phone");
          await sleep(230);
          setSendFx(null);
          setTick(id, { tick: "sent" });
          // 3) network latency → arrives on the OTHER device (delivered)
          await sleep(step.img ? 1050 : 780);
          if (cancelled) break;
          setTick(id, { onDash: true, onPhone: true, tick: "delivered" });
          // 4) the recipient sees it (read)
          await sleep(760);
          if (cancelled) break;
          setTick(id, { tick: "read" });
          await sleep(360);
        }
        await sleep(2600);
        s = (s + 1) % SCENARIOS.length;
      }
    };
    run();
    return () => { cancelled = true; io.disconnect(); };
  }, []);

  useEffect(() => {
    for (const r of [dashRef.current, phoneRef.current]) if (r) r.scrollTop = r.scrollHeight;
  }, [msgs, dashTyping, phoneTyping]);

  const dashMsgs = msgs.filter((m) => m.onDash);
  const phoneMsgs = msgs.filter((m) => m.onPhone);

  return (
    <div ref={rootRef} className="@container absolute inset-0 p-[2.2cqw] text-slate-200" aria-hidden="true">
      <div className="w-full h-full flex gap-[2.4cqw]">
        {/* ===== dispatcher dashboard ===== */}
        <div className="flex-1 rounded-[1.5cqw] bg-slate-900/70 border border-slate-700/70 flex flex-col overflow-hidden min-w-0">
          <div className="flex items-center gap-[1.4cqw] px-[1.8cqw] py-[1.2cqw] border-b border-slate-700/70 bg-slate-800/60">
            <span className="w-[3.4cqw] h-[3.4cqw] rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 [&_svg]:w-[2cqw] [&_svg]:h-[2cqw]">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 6h11v8H3zM14 9h4l3 3v2h-7z" /><circle cx="6.5" cy="16" r="1.6" /><circle cx="17.5" cy="16" r="1.6" /></svg>
            </span>
            <span className="flex flex-col leading-tight min-w-0">
              <span className="font-bold text-white text-[1.8cqw] truncate">{driver.name} · {driver.plate}</span>
              <span className="text-[1.3cqw] leading-none h-[1.5cqw] text-emerald-400/90">{dashTyping ? `${c.uiDriver} ${c.uiTyping}` : c.uiDriver}</span>
            </span>
            <span className="ml-auto inline-flex items-center gap-[0.7cqw] rounded-full px-[1.4cqw] py-[0.5cqw] text-[1.4cqw] font-semibold text-emerald-400 bg-emerald-500/15">
              <span className="w-[1cqw] h-[1cqw] rounded-full bg-emerald-400" /> {c.uiOnline}
            </span>
          </div>
          <div ref={dashRef} className="flex-1 flex flex-col gap-[1cqw] px-[1.8cqw] py-[1.4cqw] min-h-0 overflow-hidden">
            {dashMsgs.map((m) => {
              const own = m.from === "disp";
              return (
                <div key={m.mid} className={`flex items-end gap-[1cqw] ${own ? "flex-row-reverse" : "flex-row"}`}>
                  {!own && (
                    <span className="w-[3cqw] h-[3cqw] rounded-full bg-amber-100 text-amber-600 shrink-0 flex items-center justify-center [&_svg]:w-[1.7cqw] [&_svg]:h-[1.7cqw]">
                      <svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 6h11v8H3zM14 9h4l3 3v2h-7z" /><circle cx="6.5" cy="16" r="1.6" /><circle cx="17.5" cy="16" r="1.6" /></svg>
                    </span>
                  )}
                  <div className={`ch-pop max-w-[74%] rounded-[1.1cqw] px-[1.4cqw] py-[0.9cqw] ${own ? "bg-blue-600 rounded-br-[0.3cqw]" : "bg-slate-700 rounded-bl-[0.3cqw]"}`} style={{ transformOrigin: own ? "bottom right" : "bottom left" }}>
                    {m.img ? <div className="w-[16cqw]"><DocThumb /></div> : <span className="text-white text-[1.5cqw] leading-snug block">{txt(m.k)}</span>}
                    <span className={`flex items-center gap-[0.4cqw] mt-[0.3cqw] text-[1.1cqw] ${own ? "justify-end text-blue-200" : "text-slate-400"}`}>
                      {m.time}
                      {own && <StatusTick tick={m.tick} size="1.6cqw" ownLight="text-blue-200/80" />}
                    </span>
                  </div>
                </div>
              );
            })}
            {dashTyping && (
              <div className="flex items-center gap-[1cqw] text-slate-400">
                <span className="w-[3cqw] h-[3cqw] rounded-full bg-amber-100 text-amber-600 shrink-0" />
                <span className="ch-pop rounded-[1.1cqw] rounded-bl-[0.3cqw] bg-slate-700 px-[1.6cqw] py-[1.1cqw] text-slate-300" style={{ transformOrigin: "bottom left" }}><Dots unit="1.6cqw" /></span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-[1cqw] px-[1.8cqw] py-[1.1cqw] border-t border-slate-700/70">
            <span className="flex-1 rounded-full bg-slate-800 border border-slate-700 px-[1.6cqw] py-[0.9cqw] text-slate-500 text-[1.4cqw]">{c.uiMessage}…</span>
            <span className="w-[3cqw] h-[3cqw] rounded-full bg-blue-600 flex items-center justify-center text-white [&_svg]:w-[1.7cqw] [&_svg]:h-[1.7cqw] transition-transform duration-200" style={{ transform: sendFx === "dash" ? "scale(1.25)" : "scale(1)" }}><svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 20l18-8L3 4l4 8-4 8z" /></svg></span>
          </div>
        </div>

        {/* ===== driver phone (iPhone 16 Pro Max) ===== */}
        <PhoneFrame16>
          <div className="shrink-0 bg-gradient-to-r from-blue-600 to-blue-700 flex items-center gap-[3cqw] px-[4cqw] pt-[6cqw] pb-[3cqw]">
            <svg viewBox="0 0 24 24" className="w-[4cqw] h-[4cqw] text-white shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            <span className="w-[10cqw] h-[10cqw] rounded-full bg-white/20 flex items-center justify-center text-white [&_svg]:w-[6cqw] [&_svg]:h-[6cqw] shrink-0">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </span>
            <span className="flex flex-col leading-tight min-w-0">
              <span className="text-white font-bold text-[4.4cqw]">{dispatcher.name}</span>
              <span className="text-[3.4cqw] leading-none h-[3.8cqw] text-blue-100">{phoneTyping ? c.uiTyping : c.uiOnline}</span>
            </span>
          </div>
          <div ref={phoneRef} className="flex-1 flex flex-col gap-[2.4cqw] px-[3.5cqw] py-[3cqw] min-h-0 overflow-hidden bg-slate-950">
            {phoneMsgs.map((m) => {
              const own = m.from === "driver";
              return (
                <div key={m.mid} className={`flex items-end gap-[2cqw] ${own ? "flex-row-reverse" : "flex-row"}`}>
                  {!own && <span className="w-[7cqw] h-[7cqw] rounded-full bg-blue-100 text-blue-600 shrink-0 flex items-center justify-center text-[3cqw] font-bold">{dispInit}</span>}
                  <div className={`ch-pop max-w-[80%] rounded-[4cqw] px-[3.4cqw] py-[2.6cqw] ${own ? "bg-blue-600 rounded-br-[1cqw]" : "bg-slate-700 rounded-bl-[1cqw]"}`} style={{ transformOrigin: own ? "bottom right" : "bottom left" }}>
                    {m.img ? <div className="w-[42cqw]"><DocThumb /></div> : <span className="text-white text-[4.4cqw] leading-snug block">{txt(m.k)}</span>}
                    <span className={`flex items-center gap-[1cqw] mt-[0.8cqw] text-[3cqw] ${own ? "justify-end text-blue-200" : "text-slate-400"}`}>
                      {m.time}
                      {own && <StatusTick tick={m.tick} size="3.6cqw" ownLight="text-blue-200/80" />}
                    </span>
                  </div>
                </div>
              );
            })}
            {phoneTyping && (
              <div className="flex items-center gap-[2cqw] text-slate-400">
                <span className="w-[7cqw] h-[7cqw] rounded-full bg-blue-100 text-blue-600 shrink-0 flex items-center justify-center text-[3cqw] font-bold">{dispInit}</span>
                <span className="ch-pop rounded-[4cqw] rounded-bl-[1cqw] bg-slate-700 px-[4cqw] py-[3cqw] text-slate-300" style={{ transformOrigin: "bottom left" }}><Dots unit="3.6cqw" /></span>
              </div>
            )}
          </div>
          <div className="shrink-0 flex items-center gap-[2.4cqw] px-[4cqw] py-[2.6cqw] bg-slate-900 border-t border-slate-800">
            <svg viewBox="0 0 24 24" className="w-[5.4cqw] h-[5.4cqw] text-slate-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="9" /><path d="M8.5 14a4 4 0 0 0 7 0M9 10h.01M15 10h.01" strokeLinecap="round" /></svg>
            <svg viewBox="0 0 24 24" className="w-[5.8cqw] h-[5.8cqw] text-slate-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="6" width="18" height="14" rx="2" /><circle cx="12" cy="13" r="3.2" /><path d="M8 6l1.5-2.5h5L16 6" /></svg>
            <span className="flex-1 rounded-full bg-slate-800 px-[4cqw] py-[2.4cqw] text-slate-500 text-[4cqw]">{c.uiMessage}</span>
            <span className="w-[9cqw] h-[9cqw] rounded-full bg-blue-600 flex items-center justify-center text-white shrink-0 transition-transform duration-200" style={{ transform: sendFx === "phone" ? "scale(1.25)" : "scale(1)" }}><svg viewBox="0 0 24 24" className="w-[4.6cqw] h-[4.6cqw]" fill="currentColor"><path d="M3 20l18-8L3 4l4 8-4 8z" /></svg></span>
          </div>
        </PhoneFrame16>
      </div>
    </div>
  );
}
