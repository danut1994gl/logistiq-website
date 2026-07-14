"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { Translations } from "@/lib/i18n/translations";
import type { Locale } from "@/lib/i18n/config";
import { DRIVER_POOLS } from "./driverPools";

// Department & Truck Categories (feature 4) — "Cargo Routing". Each check-in
// carries a cargo category + truck type; a routing rule (Frozen -> Cold,
// Vegetables -> Fresh, Dry -> Dry Goods) sends it to the matching department
// column automatically. Trucks fade in to the right column; the oldest is
// released when a column is full. Client player; static on reduced-motion.

type DeptKey = "cold" | "fresh" | "dry";
type Cargo = { key: string; label: string; dept: DeptKey; icon: ReactNode };
type TruckType = { key: string; label: string };
type Card = { id: number; plate: string; cargo: Cargo; tt: TruckType; state: "in" | "leaving" };

const SNOW = <path d="M12 2v20M4.2 6.6l15.6 10.8M19.8 6.6 4.2 17.4M12 6l-3 2 3 2 3-2zM6 9l-.3 3.5L3 14M18 9l.3 3.5L21 14" />;
const LEAF = <path d="M11 20A7 7 0 0 1 4 13c0-5 4-9 16-10-1 10-4 16-9 17zM4 21c1.5-4 4-6.5 8-8.5" />;
const BOX = <path d="M12 3 3 7.5v9L12 21l9-4.5v-9L12 3zM3 7.5 12 12l9-4.5M12 12v9" />;

export function CategoryRoutingScene({ t, locale }: { t: Translations; locale: Locale }) {
  const f = t.f4Page;
  const plates = DRIVER_POOLS[locale].map((d) => d.plate);
  const DEPTS: { key: DeptKey; name: string; icon: ReactNode; ring: string; chip: string; dot: string }[] = [
    { key: "cold", name: f.deptCold, icon: SNOW, ring: "ring-cyan-500/70", chip: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30", dot: "text-cyan-400" },
    { key: "fresh", name: f.deptFresh, icon: LEAF, ring: "ring-emerald-500/70", chip: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30", dot: "text-emerald-400" },
    { key: "dry", name: f.deptDry, icon: BOX, ring: "ring-amber-500/70", chip: "bg-amber-500/15 text-amber-300 border-amber-500/30", dot: "text-amber-400" },
  ];
  const CARGOS: Cargo[] = [
    { key: "frozen", label: f.cgFrozen, dept: "cold", icon: SNOW },
    { key: "vegetables", label: f.cgVegetables, dept: "fresh", icon: LEAF },
    { key: "fruits", label: f.cgFruits, dept: "fresh", icon: LEAF },
    { key: "dry", label: f.cgDry, dept: "dry", icon: BOX },
  ];
  const TTS: TruckType[] = [
    { key: "refrigerated", label: f.ttRefrigerated },
    { key: "tarp", label: f.ttTarp },
    { key: "trailer", label: f.ttTrailer },
    { key: "tanker", label: f.ttTanker },
  ];
  const deptMeta = (k: DeptKey) => DEPTS.find((d) => d.key === k)!;

  const [cols, setCols] = useState<Record<DeptKey, Card[]>>({ cold: [], fresh: [], dry: [] });
  const [incoming, setIncoming] = useState<Card | null>(null);
  const [activeDept, setActiveDept] = useState<DeptKey | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const colsRef = useRef(cols);
  colsRef.current = cols;
  const idRef = useRef(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // static populated board
      const mk = (dept: DeptKey, cargoKey: string, i: number): Card => ({ id: i, plate: plates[i % plates.length], cargo: CARGOS.find((c) => c.key === cargoKey)!, tt: TTS[i % TTS.length], state: "in" });
      setCols({ cold: [mk("cold", "frozen", 1), mk("cold", "frozen", 2)], fresh: [mk("fresh", "vegetables", 3), mk("fresh", "fruits", 4)], dry: [mk("dry", "dry", 5)] });
      return;
    }
    let cancelled = false, visible = true;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0.15 });
    if (rootRef.current) io.observe(rootRef.current);
    const sleep = (ms: number) => new Promise<void>((res) => { const s = Date.now(); const tick = () => { if (cancelled) return res(); if (visible && Date.now() - s >= ms) return res(); setTimeout(tick, visible ? 90 : 150); }; setTimeout(tick, 90); });
    const setColsBoth = (fn: (c: Record<DeptKey, Card[]>) => Record<DeptKey, Card[]>) => { colsRef.current = fn(colsRef.current); setCols(colsRef.current); };
    let pi = 0;
    (async () => {
      await sleep(700);
      while (!cancelled) {
        const cargo = CARGOS[Math.floor(Math.random() * CARGOS.length)];
        const card: Card = { id: idRef.current++, plate: plates[pi++ % plates.length], cargo, tt: TTS[Math.floor(Math.random() * TTS.length)], state: "in" };
        // 1) arrives at the entry, routing rule highlights the target department
        setIncoming(card);
        await sleep(500);
        setActiveDept(cargo.dept);
        await sleep(1200);
        if (cancelled) break;
        // 2) routed into the matching department column
        setIncoming(null);
        setColsBoth((c) => {
          const col = [...c[cargo.dept], card];
          if (col.length > 3) { col[0] = { ...col[0], state: "leaving" }; } // release the oldest
          return { ...c, [cargo.dept]: col };
        });
        await sleep(650);
        setActiveDept(null);
        // drop the released card
        setColsBoth((c) => ({ ...c, [cargo.dept]: c[cargo.dept].filter((x) => x.state !== "leaving") }));
        await sleep(900);
      }
    })();
    return () => { cancelled = true; io.disconnect(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const CargoBadge = ({ c, big }: { c: Cargo; big?: boolean }) => {
    const m = deptMeta(c.dept);
    return (
      <span className={`inline-flex items-center gap-[0.5cqw] rounded-full border px-[1cqw] py-[0.3cqw] font-semibold ${m.chip} ${big ? "text-[1.5cqw]" : "text-[1.15cqw]"}`}>
        <svg viewBox="0 0 24 24" className={big ? "w-[1.7cqw] h-[1.7cqw]" : "w-[1.3cqw] h-[1.3cqw]"} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{c.icon}</svg>
        {c.label}
      </span>
    );
  };

  return (
    <div ref={rootRef} className="@container absolute inset-0 p-[2cqw] text-slate-200 select-none" aria-hidden="true">
      <div className="w-full h-full rounded-[1.4cqw] bg-slate-900/70 border border-slate-700/70 flex flex-col overflow-hidden">
        {/* header + routing rules */}
        <div className="flex items-center gap-[1.4cqw] px-[1.8cqw] py-[1.1cqw] border-b border-slate-700/70 bg-slate-800/60 shrink-0">
          <span className="w-[3cqw] h-[3cqw] rounded-[0.8cqw] bg-orange-500/15 text-orange-300 flex items-center justify-center [&_svg]:w-[1.8cqw] [&_svg]:h-[1.8cqw] shrink-0">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3 3 7.5v9L12 21l9-4.5v-9L12 3zM3 7.5 12 12l9-4.5M12 12v9" /></svg>
          </span>
          <span className="font-bold text-white text-[1.9cqw]">{f.uiRouting}</span>
          <span className="ml-auto flex items-center gap-[1cqw]">
            {CARGOS.filter((c) => c.key !== "fruits").map((c) => {
              const m = deptMeta(c.dept);
              return (
                <span key={c.key} className={`inline-flex items-center gap-[0.6cqw] text-[1.15cqw] ${activeDept === c.dept ? "opacity-100" : "opacity-70"}`}>
                  <CargoBadge c={c} />
                  <svg viewBox="0 0 24 24" className="w-[1.3cqw] h-[1.3cqw] text-slate-500" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  <span className={`${m.dot} font-semibold`}>{m.name}</span>
                </span>
              );
            })}
          </span>
        </div>

        <div className="relative flex-1 flex flex-col min-h-0">
          {/* incoming truck being routed */}
          <div className="h-[9cqw] shrink-0 flex items-center justify-center border-b border-slate-800">
            {incoming ? (
              <div className="flex items-center gap-[1.4cqw] rounded-[1cqw] border border-slate-600 bg-slate-800 px-[1.8cqw] py-[1.1cqw] shadow-2xl" style={{ animation: "chpop 0.4s ease both" }}>
                <span className="w-[3.4cqw] h-[3.4cqw] rounded-[0.8cqw] bg-slate-700 text-slate-300 flex items-center justify-center [&_svg]:w-[2.2cqw] [&_svg]:h-[2.2cqw]">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="1" y="6" width="13" height="10" rx="1" /><path d="M14 9h4l3 3v4h-7z" /><circle cx="5.5" cy="18" r="1.6" /><circle cx="18" cy="18" r="1.6" /></svg>
                </span>
                <span className="flex flex-col leading-tight">
                  <span className="text-white font-bold text-[1.7cqw]">{incoming.plate}</span>
                  <span className="text-slate-400 text-[1.2cqw]">{incoming.tt.label}</span>
                </span>
                <CargoBadge c={incoming.cargo} big />
                <svg viewBox="0 0 24 24" className={`w-[2cqw] h-[2cqw] ${activeDept ? deptMeta(incoming.cargo.dept).dot : "text-slate-500"} transition-colors`} fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M12 5v14M6 13l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </div>
            ) : (
              <span className="text-slate-600 text-[1.4cqw]">{f.uiEntry}</span>
            )}
          </div>

          {/* department columns */}
          <div className="flex-1 grid grid-cols-3 gap-[1.4cqw] p-[1.6cqw] min-h-0">
            {DEPTS.map((d) => (
              <div key={d.key} className={`rounded-[1cqw] border bg-slate-800/40 flex flex-col min-h-0 transition-all duration-300 ${activeDept === d.key ? `ring-2 ${d.ring} border-transparent` : "border-slate-700"}`}>
                <div className="flex items-center gap-[0.8cqw] px-[1.2cqw] py-[1cqw] border-b border-slate-700/70">
                  <svg viewBox="0 0 24 24" className={`w-[1.8cqw] h-[1.8cqw] ${d.dot}`} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{d.icon}</svg>
                  <span className="text-[1.4cqw] font-semibold text-white truncate">{d.name}</span>
                  <span className="ml-auto text-[1.2cqw] text-slate-400 tabular-nums">{cols[d.key].filter((c) => c.state === "in").length}</span>
                </div>
                <div className="flex-1 flex flex-col gap-[0.9cqw] p-[1.1cqw] overflow-hidden">
                  {cols[d.key].map((c) => (
                    <div key={c.id} className="rounded-[0.8cqw] border border-slate-700 bg-slate-800/80 px-[1.1cqw] py-[0.9cqw] flex items-center gap-[0.9cqw] transition-all duration-500" style={{ opacity: c.state === "leaving" ? 0 : 1, transform: c.state === "leaving" ? "translateY(-30%)" : "none" }}>
                      <span className={`w-[2.4cqw] h-[2.4cqw] rounded-[0.6cqw] flex items-center justify-center [&_svg]:w-[1.5cqw] [&_svg]:h-[1.5cqw] ${d.chip}`}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{c.cargo.icon}</svg>
                      </span>
                      <span className="flex flex-col leading-tight min-w-0">
                        <span className="text-white font-semibold text-[1.3cqw] truncate">{c.plate}</span>
                        <span className="text-slate-400 text-[1.1cqw] truncate">{c.tt.label}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
