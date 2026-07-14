"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { Translations } from "@/lib/i18n/translations";
import type { Locale } from "@/lib/i18n/config";
import { DRIVER_POOLS } from "./driverPools";

type Op = "loading" | "unloading" | "both";
type CardState = "in" | "entering" | "leaving";
type Card = { id: number; name: string; plate: string; company: string; op: Op; waitMin: number; parking?: boolean; state: CardState };
type Dock = { plate: string; op: Op; status: "assigned" | "in_progress"; seq: number } | null;
type ActKey = "assign" | "wait" | "office" | "parking" | "cancel";

const OP_BADGE: Record<Op, string> = {
  loading: "bg-orange-500/15 text-orange-300 border-orange-500/30",
  unloading: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  both: "bg-purple-500/15 text-purple-300 border-purple-500/30",
};
const OP_TILE: Record<Op, string> = {
  loading: "from-orange-500/25 to-orange-500/[0.04] border-orange-500/40",
  unloading: "from-blue-500/25 to-blue-500/[0.04] border-blue-500/40",
  both: "from-purple-500/25 to-purple-500/[0.04] border-purple-500/40",
};
const OP_ICONCOL: Record<Op, string> = { loading: "text-orange-400", unloading: "text-blue-400", both: "text-purple-400" };
const DOCKS_L = [1, 2, 3, 4];
const DOCKS_U = [5, 6, 7, 8];
// international freight brands — same across locales (only names/plates localize)
const COMPANIES = ["Tranself", "Delamode", "Waberer's", "Girteka", "DSV", "Raben", "Dachser", "Gebrüder Weiss", "Kühne+Nagel", "DB Schenker", "Rhenus", "Duvenbeck", "LKW Walter", "Ekol", "Hödlmayr", "GEODIS"];
const OPS: Op[] = ["loading", "unloading", "both"];

// operation arrow: up = loading, down = unloading, dual = both
function OpArrow({ op, className }: { op: Op; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      {op === "loading" && <path d="M12 19V5M6 11l6-6 6 6" />}
      {op === "unloading" && <path d="M12 5v14M6 13l6 6 6-6" />}
      {op === "both" && <path d="M8 20V7M4.5 10.5 8 7l3.5 3.5M16 4v13M12.5 13.5 16 17l3.5-3.5" />}
    </svg>
  );
}

// small action-menu icons (match the real dashboard Actions dropdown)
const ICONS: Record<ActKey, ReactNode> = {
  assign: <path d="M4 20V9l8-5 8 5v11M4 20h16M9 20v-6h6v6" />,
  wait: <path d="M6 2h12M6 22h12M7 2v3l5 5 5-5V2M7 22v-3l5-5 5 5v3" />,
  office: <><circle cx="12" cy="8" r="3.4" /><path d="M5 21a7 7 0 0 1 14 0" /></>,
  parking: <><rect x="4" y="4" width="16" height="16" rx="3" /><path d="M9.5 17V8h3.2a2.6 2.6 0 0 1 0 5.2H9.5" /></>,
  cancel: <><circle cx="12" cy="12" r="8.5" /><path d="M6 6l12 12" /></>,
};
const ACT_COLOR: Record<ActKey, string> = { assign: "text-purple-400", wait: "text-yellow-400", office: "text-blue-400", parking: "text-teal-400", cancel: "text-orange-400" };

export function DockBoardPlayer({ t, locale }: { t: Translations; locale: Locale }) {
  const d = t.dockPage;
  const POOL = DRIVER_POOLS[locale];
  const opLabel = (op: Op) => (op === "loading" ? d.uiLoading : op === "unloading" ? d.uiUnloading : d.uiBoth);

  // initial (SSR-stable) frame: 5 waiting cards + 2 occupied docks (localized)
  const [cards, setCards] = useState<Card[]>(() =>
    [0, 1, 2, 3, 4].map((i) => ({ id: i, name: POOL[i].name, plate: POOL[i].plate, company: COMPANIES[i % COMPANIES.length], op: OPS[i % 3], waitMin: [8, 21, 14, 33, 5][i], state: "in" as CardState }))
  );
  const [docks, setDocks] = useState<Record<number, Dock>>(() => ({ 3: { plate: POOL[5].plate, op: "loading", status: "in_progress", seq: -2 }, 6: { plate: POOL[6].plate, op: "unloading", status: "assigned", seq: -1 } }));
  const [cursor, setCursor] = useState<{ x: number; y: number; down: boolean; on: boolean }>({ x: 50, y: 60, down: false, on: false });
  const [menu, setMenu] = useState<{ cardId: number; active: number | null; up: boolean } | null>(null);
  const [rampPick, setRampPick] = useState<{ driver: string; free: number[]; picked: number | null } | null>(null);
  const [toast, setToast] = useState<{ text: string; tone: "success" | "info" } | null>(null);
  const [banner, setBanner] = useState<string | null>(null);

  const stageRef = useRef<HTMLDivElement>(null);
  const btnRefs = useRef<Map<number, HTMLElement>>(new Map());
  const itemRefs = useRef<Map<number, HTMLElement>>(new Map());
  const rampRefs = useRef<Map<number, HTMLElement>>(new Map());
  const cardsRef = useRef(cards);
  const docksRef = useRef(docks);
  const idRef = useRef(5);
  const seqRef = useRef(1);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let cancelled = false;
    let visible = true;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0.1 });
    if (stageRef.current) io.observe(stageRef.current);
    const sleep = (ms: number) => new Promise<void>((res) => {
      const started = Date.now();
      const tick = () => {
        if (cancelled) return res();
        if (visible && Date.now() - started >= ms) return res();
        setTimeout(tick, visible ? Math.min(80, ms) : 120);
      };
      setTimeout(tick, Math.min(80, ms));
    });

    const rectPct = (el: HTMLElement | undefined) => {
      const s = stageRef.current;
      if (!el || !s) return null;
      const b = el.getBoundingClientRect();
      const r = s.getBoundingClientRect();
      return { x: ((b.left + b.width / 2 - r.left) / r.width) * 100, y: ((b.top + b.height / 2 - r.top) / r.height) * 100 };
    };
    const moveTo = async (el: HTMLElement | undefined, ms = 620) => {
      const p = rectPct(el);
      if (p) setCursor((c) => ({ ...c, x: p.x, y: p.y, on: true }));
      await sleep(ms);
    };
    const click = async () => { setCursor((c) => ({ ...c, down: true })); await sleep(140); setCursor((c) => ({ ...c, down: false })); await sleep(160); };
    const hideCursor = () => setCursor((c) => ({ ...c, on: false }));
    // refs are the authoritative store (kept in sync synchronously so the async
    // loop never reads stale state and double-assigns a plate/dock)
    const applyCards = (fn: (c: Card[]) => Card[]) => { cardsRef.current = fn(cardsRef.current); setCards(cardsRef.current); };
    const applyDocks = (fn: (dk: Record<number, Dock>) => Record<number, Dock>) => { docksRef.current = fn(docksRef.current); setDocks(docksRef.current); };
    // any truck (loading/unloading/both) can be assigned to any free dock in
    // either department — departments are named zones, not operation types
    const freeDocks = (): number[] => [...DOCKS_L, ...DOCKS_U].filter((n) => !docksRef.current[n]);
    const addCard = (): boolean => {
      const used = new Set<string>([...cardsRef.current.map((c) => c.plate), ...Object.values(docksRef.current).filter(Boolean).map((o) => (o as NonNullable<Dock>).plate)]);
      const availIdx = POOL.map((_, i) => i).filter((i) => !used.has(POOL[i].plate));
      if (!availIdx.length) return false; // never duplicate a plate
      const i = availIdx[Math.floor(Math.random() * availIdx.length)];
      const id = idRef.current++;
      const r = Math.random();
      const op: Op = r < 0.42 ? "loading" : r < 0.84 ? "unloading" : "both";
      const card: Card = { id, name: POOL[i].name, plate: POOL[i].plate, company: COMPANIES[i % COMPANIES.length], op, waitMin: 1 + Math.floor(Math.random() * 6), state: "entering" };
      applyCards((cs) => [...cs, card]);
      setTimeout(() => { if (!cancelled) applyCards((cs) => cs.map((c) => (c.id === id ? { ...c, state: "in" } : c))); }, 60);
      return true;
    };
    const showToast = (text: string, tone: "success" | "info" = "success") => { setToast({ text, tone }); setTimeout(() => { if (!cancelled) setToast(null); }, 2600); };

    // dock lifecycle housekeeping: advance the oldest occupied dock
    const advanceDocks = () => {
      const entries = Object.entries(docksRef.current).filter(([, v]) => v) as [string, NonNullable<Dock>][];
      if (!entries.length) return;
      entries.sort((a, b) => a[1].seq - b[1].seq);
      const [numStr, occ] = entries[0];
      const num = Number(numStr);
      if (occ.status === "assigned") {
        applyDocks((dk) => ({ ...dk, [num]: { ...occ, status: "in_progress" } }));
      } else {
        applyDocks((dk) => { const n = { ...dk }; delete n[num]; return n; });
        showToast(d.evComplete, "success");
      }
    };

    const run = async () => {
      await sleep(900);
      while (!cancelled) {
        // keep the queue populated (longer queue)
        while (cardsRef.current.filter((c) => c.state !== "leaving").length < 5) { if (!addCard()) break; await sleep(360); }

        // housekeeping: cycle docks only once the board is fairly full
        const occCount = Object.keys(docksRef.current).length;
        if (occCount >= 5 || (occCount >= 3 && Math.random() < 0.45)) { advanceDocks(); await sleep(450); }

        const live = cardsRef.current.filter((c) => c.state === "in");
        if (!live.length) { await sleep(400); continue; }
        const card = live[Math.floor(Math.random() * live.length)];

        // move cursor to the card's Actions button and click to open the menu
        await moveTo(btnRefs.current.get(card.id));
        const bp = rectPct(btnRefs.current.get(card.id));
        const up = bp ? bp.y > 52 : false;
        await click();
        setMenu({ cardId: card.id, active: null, up });
        await sleep(560);

        // choose a random valid action
        const canAssign = freeDocks().length > 0;
        const choices: ActKey[] = [];
        if (canAssign) { choices.push("assign", "assign", "assign", "assign", "assign"); } // assignment dominates
        choices.push("wait", "parking", "office", "cancel");
        const act = choices[Math.floor(Math.random() * choices.length)];
        const order: ActKey[] = ["assign", "wait", "office", "parking", "cancel"];
        const activeIdx = order.indexOf(act);
        // move cursor onto the item FIRST, then highlight when it arrives (fix)
        await moveTo(itemRefs.current.get(activeIdx), 460);
        setMenu({ cardId: card.id, active: activeIdx, up });
        await sleep(240);
        await click();
        setMenu(null);
        await sleep(120);

        // execute
        if (act === "assign") {
          const free = freeDocks();
          if (free.length) {
            // ramp-picker dialog: operator chooses which ramp to give the driver
            setRampPick({ driver: card.name, free, picked: null });
            await sleep(650);
            const dock = free[Math.floor(Math.random() * free.length)];
            await moveTo(rampRefs.current.get(dock), 560);
            setRampPick((rp) => (rp ? { ...rp, picked: dock } : rp));
            await sleep(300);
            await click();
            setRampPick(null);
            hideCursor();
            // reserve the dock synchronously (no double-book) and fade the card out
            applyCards((cs) => cs.map((c) => (c.id === card.id ? { ...c, state: "leaving" } : c)));
            applyDocks((dk) => ({ ...dk, [dock]: { plate: card.plate, op: card.op, status: "assigned", seq: seqRef.current++ } }));
            showToast(`${d.uiDock} ${dock} ${d.evAssignedTo} ${card.name}`, "success");
            setTimeout(() => { if (!cancelled) applyCards((cs) => cs.filter((c) => c.id !== card.id)); }, 480);
          } else hideCursor();
        } else if (act === "wait") {
          hideCursor();
          applyCards((cs) => cs.map((c) => (c.id === card.id ? { ...c, waitMin: c.waitMin + 30 } : c)));
          showToast(d.evWaitBanner, "info");
        } else if (act === "parking") {
          hideCursor();
          applyCards((cs) => cs.map((c) => (c.id === card.id ? { ...c, parking: true } : c)));
          showToast(`${card.name} — ${d.uiParkingBadge}`, "info");
          setTimeout(() => { if (!cancelled) applyCards((cs) => cs.map((c) => (c.id === card.id ? { ...c, state: "leaving" } : c))); }, 1100);
          setTimeout(() => { if (!cancelled) applyCards((cs) => cs.filter((c) => c.id !== card.id)); }, 1600);
        } else if (act === "office") {
          hideCursor();
          setBanner(`${card.name} — ${d.evOffice}`);
          await sleep(2400);
          if (!cancelled) setBanner(null);
        } else if (act === "cancel") {
          hideCursor();
          applyCards((cs) => cs.map((c) => (c.id === card.id ? { ...c, state: "leaving" } : c)));
          showToast(d.evCancelled, "info");
          setTimeout(() => { if (!cancelled) applyCards((cs) => cs.filter((c) => c.id !== card.id)); }, 480);
        }
        await sleep(1300);
      }
    };
    run();
    return () => { cancelled = true; io.disconnect(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const order: { key: ActKey; label: string }[] = [
    { key: "assign", label: d.actAssign },
    { key: "wait", label: d.actWait },
    { key: "office", label: d.actOffice },
    { key: "parking", label: d.actParking },
    { key: "cancel", label: d.actCancel },
  ];
  const depts: { label: string; docks: number[]; icon: ReactNode }[] = [
    { label: d.dept1, docks: DOCKS_L, icon: <><path d="M5 21c0-9 7-15 15-15 0 9-6 15-15 15z" /><path d="M5 21c3-6 7-10 12-12" /></> },
    { label: d.dept2, docks: DOCKS_U, icon: <><path d="M12 2v20M2 12h20M4.6 4.6l14.8 14.8M19.4 4.6L4.6 19.4" /><path d="M12 7l2.4-2.4M12 7L9.6 4.6M12 17l2.4 2.4M12 17l-2.4 2.4M7 12L4.6 9.6M7 12l-2.4 2.4M17 12l2.4-2.4M17 12l2.4 2.4" /></> },
  ];

  return (
    <div ref={stageRef} className="@container absolute inset-0 p-[2cqw] text-slate-200 select-none" aria-hidden="true">
      <div className="w-full h-full rounded-[1.4cqw] bg-slate-900/70 border border-slate-700/70 flex flex-col overflow-hidden">
        {/* header (assignment toast surfaces centered here) */}
        <div className="relative flex items-center gap-[1.2cqw] px-[1.8cqw] py-[1.1cqw] border-b border-slate-700/70 bg-slate-800/60 shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="" className="w-[2.6cqw] h-[2.6cqw] rounded-[0.6cqw]" />
          <span className="font-bold text-white text-[2cqw]">{d.uiBoardTitle}</span>
          <span className="ml-auto inline-flex items-center gap-[0.6cqw] text-[1.35cqw] font-semibold text-emerald-400 bg-emerald-500/15 rounded-full px-[1.2cqw] py-[0.4cqw]">
            <span className="w-[0.9cqw] h-[0.9cqw] rounded-full bg-emerald-400" /> {d.uiLive}
          </span>
          {/* centered notification in the header */}
          {toast && !banner && (
            <div className={`absolute left-1/2 -translate-x-1/2 z-40 flex items-center gap-[1cqw] rounded-full bg-slate-900 border shadow-2xl px-[1.6cqw] py-[0.7cqw] ${toast.tone === "success" ? "border-emerald-500/60" : "border-blue-500/50"}`}>
              <span className={`w-[2cqw] h-[2cqw] rounded-full flex items-center justify-center text-white [&_svg]:w-[1.3cqw] [&_svg]:h-[1.3cqw] ${toast.tone === "success" ? "bg-emerald-500" : "bg-blue-500"}`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">{toast.tone === "success" ? <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" /> : <path d="M12 8v5M12 16.5v.01" strokeLinecap="round" />}</svg>
              </span>
              <span className="text-[1.45cqw] font-semibold text-white whitespace-nowrap">{toast.text}</span>
            </div>
          )}
          {/* call-to-office banner, in the header */}
          {banner && (
            <div className="absolute left-1/2 -translate-x-1/2 z-40 flex items-center gap-[1cqw] rounded-full bg-blue-600 shadow-2xl px-[1.8cqw] py-[0.7cqw]">
              <svg viewBox="0 0 24 24" className="w-[1.7cqw] h-[1.7cqw] text-white" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" strokeLinecap="round" /></svg>
              <span className="text-[1.45cqw] font-semibold text-white whitespace-nowrap">{banner}</span>
            </div>
          )}
        </div>

        <div className="flex-1 flex gap-[1.6cqw] p-[1.6cqw] min-h-0">
          {/* ===== waiting queue ===== */}
          <div className="w-[41%] flex flex-col min-h-0">
            <div className="flex items-center gap-[0.8cqw] mb-[1cqw]">
              <span className="text-[1.35cqw] font-semibold text-slate-400 uppercase tracking-wide">{d.uiQueue}</span>
              <span className="text-[1.2cqw] font-semibold text-yellow-400 bg-yellow-500/15 rounded-full px-[1cqw] py-[0.2cqw]">{cards.filter((c) => c.state !== "leaving").length}</span>
            </div>
            <div className="flex flex-col gap-[1cqw] overflow-hidden">
              {cards.map((c) => {
                const hidden = c.state !== "in";
                return (
                  <div
                    key={c.id}
                    className="relative rounded-[1cqw] border border-slate-700 bg-slate-800/70 px-[1.3cqw] py-[1.1cqw] transition-all duration-500"
                    style={{ opacity: hidden ? 0 : 1, transform: hidden ? "translateX(-6%)" : "none", maxHeight: hidden ? "0cqw" : "18cqw", marginBottom: hidden ? "-1cqw" : undefined, paddingTop: hidden ? 0 : undefined, paddingBottom: hidden ? 0 : undefined }}
                  >
                    <div className="flex items-center gap-[1cqw]">
                      <span className="w-[3.4cqw] h-[3.4cqw] rounded-[0.8cqw] bg-blue-500/20 text-blue-300 flex items-center justify-center shrink-0 [&_svg]:w-[2cqw] [&_svg]:h-[2cqw]">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="3.5" /><path d="M5 20a7 7 0 0 1 14 0" strokeLinecap="round" /></svg>
                      </span>
                      <span className="flex flex-col leading-tight min-w-0">
                        <span className="font-semibold text-white text-[1.6cqw] truncate">{c.name}</span>
                        <span className="text-slate-400 text-[1.25cqw] truncate">{c.plate} · {c.company}</span>
                      </span>
                      <span className={`ml-auto shrink-0 inline-flex items-center gap-[0.5cqw] rounded-full border px-[0.9cqw] py-[0.35cqw] text-[1.1cqw] font-semibold ${OP_BADGE[c.op]}`}>
                        <OpArrow op={c.op} className="w-[1.3cqw] h-[1.3cqw]" /> {opLabel(c.op)}
                      </span>
                    </div>
                    <div className="mt-[0.9cqw] flex items-center gap-[1cqw]">
                      <span className="inline-flex items-center gap-[0.5cqw] text-slate-400 text-[1.2cqw]">
                        <svg viewBox="0 0 24 24" className="w-[1.3cqw] h-[1.3cqw]" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" strokeLinecap="round" /></svg>
                        {c.waitMin}m
                      </span>
                      {c.parking && (
                        <span className="inline-flex items-center gap-[0.5cqw] text-teal-300 bg-teal-500/15 rounded-full px-[0.9cqw] py-[0.25cqw] text-[1.1cqw] font-semibold">
                          <svg viewBox="0 0 24 24" className="w-[1.2cqw] h-[1.2cqw]" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="4" width="16" height="16" rx="3" /><path d="M9.5 17V8h3.2a2.6 2.6 0 0 1 0 5.2H9.5" /></svg>
                          {d.uiParkingBadge}
                        </span>
                      )}
                      <span
                        ref={(el) => { if (el) btnRefs.current.set(c.id, el); else btnRefs.current.delete(c.id); }}
                        className="ml-auto inline-flex items-center gap-[0.5cqw] text-slate-300 bg-slate-700/70 rounded-[0.7cqw] px-[1cqw] py-[0.4cqw] text-[1.15cqw] font-medium"
                      >
                        {d.uiActions}
                        <svg viewBox="0 0 24 24" className="w-[1.2cqw] h-[1.2cqw]" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </span>
                    </div>

                    {/* actions menu */}
                    {menu?.cardId === c.id && (
                      <div className="absolute right-[1cqw] z-30 w-[19cqw] rounded-[1cqw] border border-slate-600 bg-slate-800 shadow-2xl py-[0.6cqw]" style={menu.up ? { bottom: "calc(100% - 1cqw)" } : { top: "calc(100% - 1cqw)" }}>
                        {order.map((a, i) => (
                          <div
                            key={a.key}
                            ref={(el) => { if (menu.cardId === c.id) { if (el) itemRefs.current.set(i, el); } }}
                            className={`flex items-center gap-[1cqw] px-[1.2cqw] py-[0.7cqw] text-[1.3cqw] ${menu.active === i ? "bg-slate-700" : ""}`}
                          >
                            <svg viewBox="0 0 24 24" className={`w-[1.7cqw] h-[1.7cqw] ${ACT_COLOR[a.key]}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{ICONS[a.key]}</svg>
                            <span className="text-slate-100 whitespace-nowrap">{a.label}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ===== ramps overview ===== */}
          <div className="flex-1 flex flex-col gap-[1.4cqw] min-w-0">
            {depts.map((dept) => {
              const occ = dept.docks.filter((n) => docks[n]).length;
              return (
                <div key={dept.label} className="flex-1 flex flex-col min-h-0">
                  <div className="flex items-center gap-[0.7cqw] mb-[0.8cqw]">
                    <svg viewBox="0 0 24 24" className="w-[1.7cqw] h-[1.7cqw] text-slate-500" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{dept.icon}</svg>
                    <span className="text-[1.35cqw] font-semibold text-slate-400 uppercase tracking-wide">{dept.label}</span>
                    <span className="text-[1.2cqw] text-slate-500">({occ}/{dept.docks.length})</span>
                  </div>
                  <div className="grid grid-cols-4 gap-[1cqw] flex-1">
                    {dept.docks.map((n) => {
                      const o = docks[n];
                      if (!o) {
                        return (
                          <div key={n} className="rounded-[1cqw] border border-dashed border-slate-700 bg-slate-800/30 flex flex-col items-center justify-center gap-[0.3cqw] transition-all duration-500">
                            <span className="text-[1.9cqw] font-bold text-slate-600">{n}</span>
                            <span className="text-[1.1cqw] text-slate-600">{d.uiAvailable}</span>
                          </div>
                        );
                      }
                      return (
                        <div key={n} className={`relative rounded-[1cqw] border bg-gradient-to-b p-[1cqw] flex flex-col justify-between transition-all duration-500 ${OP_TILE[o.op]}`}>
                          <div className="flex items-center justify-between">
                            <span className="text-[1.5cqw] font-bold text-slate-300">{n}</span>
                            <OpArrow op={o.op} className={`w-[1.7cqw] h-[1.7cqw] ${OP_ICONCOL[o.op]}`} />
                          </div>
                          <div className="flex flex-col leading-tight">
                            <span className="text-white font-semibold text-[1.35cqw] truncate">{o.plate}</span>
                            <span className={`text-[1.15cqw] font-medium ${o.status === "assigned" ? "text-purple-300" : "text-indigo-300"}`}>{o.status === "assigned" ? d.stAssigned : d.stInProgress}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ramp-picker dialog (opens after "Assign to ramp") */}
      {rampPick && (
        <div className="absolute inset-0 z-40 flex items-center justify-center">
          <div className="absolute inset-0 bg-slate-950/55" />
          <div className="relative rounded-[1.4cqw] border border-slate-600 bg-slate-800 shadow-2xl px-[2.2cqw] py-[1.8cqw] w-[38cqw]">
            <div className="flex items-center gap-[1cqw] mb-[0.3cqw]">
              <span className="w-[2.6cqw] h-[2.6cqw] rounded-[0.7cqw] bg-purple-500/20 text-purple-300 flex items-center justify-center [&_svg]:w-[1.6cqw] [&_svg]:h-[1.6cqw]">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20V9l8-5 8 5v11M4 20h16M9 20v-6h6v6" /></svg>
              </span>
              <span className="text-white font-bold text-[1.75cqw]">{d.rampDialogTitle}</span>
            </div>
            <div className="text-slate-400 text-[1.3cqw] mb-[1.3cqw] ml-[0.2cqw]">{rampPick.driver}</div>
            <div className="grid grid-cols-4 gap-[0.9cqw]">
              {rampPick.free.map((n) => (
                <div
                  key={n}
                  ref={(el) => { if (el) rampRefs.current.set(n, el); }}
                  className={`rounded-[0.9cqw] border py-[1.2cqw] flex flex-col items-center gap-[0.2cqw] transition-all duration-200 ${rampPick.picked === n ? "border-purple-400 bg-purple-500/25 text-purple-100" : "border-slate-600 bg-slate-700/40 text-slate-300"}`}
                >
                  <span className="text-[1.7cqw] font-bold">{n}</span>
                  <span className="text-[1cqw] opacity-70">{d.uiDock}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* simulated operator cursor */}
      <div
        className="absolute z-50 pointer-events-none transition-all duration-[600ms] ease-out"
        style={{ left: `${cursor.x}%`, top: `${cursor.y}%`, opacity: cursor.on ? 1 : 0, transform: `translate(-14%, -8%) scale(${cursor.down ? 0.82 : 1})` }}
      >
        <svg viewBox="0 0 24 24" className="w-[3cqw] h-[3cqw] drop-shadow-lg" fill="#ffffff" stroke="#0f172a" strokeWidth="1.4" strokeLinejoin="round">
          <path d="M5 3l14 7-6 2-2 6-6-15z" />
        </svg>
      </div>
    </div>
  );
}
