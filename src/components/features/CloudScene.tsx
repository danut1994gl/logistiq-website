"use client";

import { useEffect, useRef, useState } from "react";
import type { Translations } from "@/lib/i18n/translations";

// Cloud - No Equipment (feature 9): logistiq.cloud in the middle with the
// Logistiq mark, FOUR named warehouses hanging off it, and driver phones that
// appear at random spots around a warehouse, run through a check-in and leave —
// the way real traffic actually arrives.
//
// Grounded in the reality audit: there is no on-prem component anywhere — a
// warehouse is onboarded through a web form and its check-in link is live, so
// the only thing on site is a browser and the driver's phone.
//
// The phones are a client player because the brief is genuine randomness (random
// spot, random timing, random warehouse), which CSS delays can only fake. The
// cloud's breathing and the warehouse<->cloud packets stay pure CSS.
// SSR renders zero phones, so there is nothing to mismatch on hydration.

const CX = 600, CY = 330;          // cloud centre — everything is measured from here

// The logistiq.cloud banner, sized from the asset's own viewBox (1162.5 x 187.5)
// so it is never squashed. It already carries the wordmark, so the scene draws no
// separate label — f9Page.uiCloud stays the accessible/i18n source of that name.
const BANNER_W = 228;
const BANNER_H = Math.round((BANNER_W * 187.5) / 1162.5);

const NODES = [
  { x: 170, y: 150, n: 1 },
  { x: 1030, y: 150, n: 2 },
  { x: 170, y: 560, n: 3 },
  { x: 1030, y: 560, n: 4 },
];

// Spots a phone can pop up in around a warehouse. All clear of the box (x +-86,
// y +-52) and of its label band (y 62..80), so a phone never lands on the
// warehouse it belongs to.
// (no slot directly above: that one lands under warehouse 1's "Browser only" badge)
const SLOTS = [
  { dx: -132, dy: -4 }, { dx: 132, dy: -4 },
  { dx: -120, dy: -74 }, { dx: 120, dy: -74 },
  { dx: -120, dy: 78 }, { dx: 120, dy: 78 },
];

// The lobes the cloud is built from. Drawn as a union of CIRCLES rather than one
// path: that keeps the outline continuous and round on EVERY side including the
// bottom (a path with a flat base is what this replaced), with no internal seams
// — the outline is a slightly larger copy of the same circles drawn behind.
const LOBES = [
  { cx: -108, cy: 8, r: 50 },
  { cx: -48, cy: -30, r: 58 },
  { cx: 28, cy: -40, r: 66 },
  { cx: 104, cy: 4, r: 52 },
  { cx: 60, cy: 40, r: 46 },
  { cx: -8, cy: 46, r: 50 },
  { cx: -66, cy: 40, r: 44 },
];

type Phone = { id: number; w: number; slot: number; state: 0 | 1 | 2 };

const DocIc = <><rect x="4" y="2.5" width="16" height="19" rx="2" /><path d="M8 8h8M8 12h8M8 16h5" /></>;
const HourIc = <path d="M6 2h12M6 22h12M7 2v3l5 5 5-5V2M7 22v-3l5-5 5 5v3" />;
const SeenIc = <path d="M1 13l4 4L14 7M10 15l1.5 1.5L21 7" />;
const STATE = [
  { ic: DocIc, col: "#60a5fa" },   // filling the check-in in
  { ic: HourIc, col: "#f59e0b" },  // waiting for the operator
  { ic: SeenIc, col: "#22c55e" },  // seen
];

function Warehouse({ x, y, label }: { x: number; y: number; label: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-86} y={-52} width={172} height={104} rx={9} fill="#1b2532" stroke="#334155" strokeWidth="1.5" />
      {/* browser chrome — the only "equipment" a warehouse needs */}
      <rect x={-86} y={-52} width={172} height={22} rx={9} fill="#243040" />
      <rect x={-86} y={-41} width={172} height={11} fill="#243040" />
      {[-74, -63, -52].map((cx, i) => (
        <circle key={i} cx={cx} cy={-41} r={3} fill={["#ef4444", "#f59e0b", "#22c55e"][i]} />
      ))}
      <rect x={-38} y={-47} width={120} height={11} rx={5.5} fill="#1b2532" />
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(0 ${-16 + i * 20})`}>
          <rect x={-72} y={-7.5} width={144} height={15} rx={4} fill="#141d28" />
          <circle cx={-61} cy={0} r={3.6} fill={["#6a9e7e", "#c07070", "#8e7ab8"][i]} />
          <rect x={-52} y={-2.5} width={46} height={5} rx={2.5} fill="#334155" />
          <rect x={28} y={-2.5} width={36} height={5} rx={2.5} fill="#2a3644" />
        </g>
      ))}
      <text x={0} y={72} textAnchor="middle" fill="#cbd5e1" style={{ fontSize: 17, fontWeight: 600 }}>{label}</text>
    </g>
  );
}

// A driver's phone at one spot: a link back to its warehouse carrying a packet
// each way, and one of three check-in states on screen.
function DriverPhone({ p, label }: { p: Phone; label?: string }) {
  const n = NODES[p.w], s = SLOTS[p.slot];
  const x = n.x + s.dx, y = n.y + s.dy;
  const st = STATE[p.state];
  return (
    <g className="cl9-phone">
      {/* phone <-> warehouse, both directions */}
      <line x1={x} y1={y} x2={n.x} y2={n.y} stroke="#334155" strokeWidth="1.4" strokeDasharray="3 4" />
      <circle className="cl9-ppkt" cx={x} cy={y} r={3.4} fill="#38bdf8"
        style={{ ["--dx" as string]: `${n.x - x}px`, ["--dy" as string]: `${n.y - y}px` }} />
      <circle className="cl9-ppkt" cx={n.x} cy={n.y} r={3.4} fill="#22c55e"
        style={{ ["--dx" as string]: `${x - n.x}px`, ["--dy" as string]: `${y - n.y}px`, animationDelay: "0.9s" }} />

      <g transform={`translate(${x} ${y})`}>
        <rect x={-17} y={-29} width={34} height={58} rx={6} fill="#0f1720" stroke="#475569" strokeWidth="1.4" />
        <rect x={-4} y={-26} width={8} height={2.4} rx={1.2} fill="#475569" />
        <rect x={-13} y={-21} width={26} height={42} rx={3} fill="#141d28" />
        {/* the state icon — swapped by the player, cross-faded by key */}
        <g key={p.state} className="cl9-icon" transform="translate(0 -4)" style={{ color: st.col }}>
          <svg x={-9} y={-9} width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{st.ic}</svg>
        </g>
        <rect x={-9} y={12} width={18} height={2.6} rx={1.3} fill="#334155" />
        {label && <text x={0} y={44} textAnchor="middle" fill="#64748b" style={{ fontSize: 11, fontWeight: 600 }}>{label}</text>}
      </g>
    </g>
  );
}

export function CloudScene({ t }: { t: Translations }) {
  const f = t.f9Page;
  const [phones, setPhones] = useState<Phone[]>([]);
  const rootRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // Static frame: one phone per warehouse, caught mid-flow. Set here rather
      // than in the initial state because matchMedia does not exist during SSR —
      // same pattern as NotificationsScene/SelfCheckScene. It runs once and then
      // the effect returns, so there are no cascading renders to worry about.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPhones(NODES.map((_, w) => ({ id: w, w, slot: w % SLOTS.length, state: (w % 3) as 0 | 1 | 2 })));
      return;
    }
    let cancelled = false, visible = true;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0.15 });
    if (rootRef.current) io.observe(rootRef.current);

    // Spawn a phone at a random free spot; step it doc -> hourglass -> seen; drop
    // it. Each phone owns its own timers, so arrivals and departures never fall
    // into lockstep — which is the whole point of doing this in JS.
    const spawn = () => {
      if (cancelled || !visible) return;
      setPhones((cur) => {
        if (cur.length >= 5) return cur;
        const w = Math.floor(Math.random() * NODES.length);
        const taken = new Set(cur.filter((p) => p.w === w).map((p) => p.slot));
        const free = SLOTS.map((_, i) => i).filter((i) => !taken.has(i));
        if (!free.length) return cur;
        const slot = free[Math.floor(Math.random() * free.length)];
        const id = idRef.current++;
        const step = (state: 1 | 2) =>
          setTimeout(() => { if (!cancelled) setPhones((c) => c.map((p) => (p.id === id ? { ...p, state } : p))); },
                     state === 1 ? 1100 : 2300);
        step(1); step(2);
        setTimeout(() => { if (!cancelled) setPhones((c) => c.filter((p) => p.id !== id)); }, 3500);
        return [...cur, { id, w, slot, state: 0 }];
      });
    };
    const tick = () => {
      if (cancelled) return;
      spawn();
      setTimeout(tick, 500 + Math.random() * 900);
    };
    const to = setTimeout(tick, 400);
    return () => { cancelled = true; clearTimeout(to); io.disconnect(); };
  }, []);

  return (
    <div ref={rootRef} className="@container absolute inset-0 p-[2cqw] select-none" aria-hidden="true">
      <svg viewBox="0 0 1200 760" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="cl9-cloud" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>
          <radialGradient id="cl9-glow">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </radialGradient>
        </defs>

        <circle cx={CX} cy={CY} r={250} fill="url(#cl9-glow)" />

        {/* warehouse <-> cloud links, with a packet each way */}
        {NODES.map((n, i) => {
          const dx = CX - n.x, dy = CY - n.y;
          return (
            <g key={i}>
              <line x1={n.x} y1={n.y} x2={CX} y2={CY} stroke="#334155" strokeWidth="2" strokeDasharray="6 7" />
              <circle className="cl9-pkt" cx={n.x} cy={n.y} r={6} fill="#38bdf8"
                style={{ ["--dx" as string]: `${dx}px`, ["--dy" as string]: `${dy}px`, animationDelay: `${i * 0.5}s` }} />
              <circle className="cl9-pkt" cx={CX} cy={CY} r={6} fill="#22c55e"
                style={{ ["--dx" as string]: `${-dx}px`, ["--dy" as string]: `${-dy}px`, animationDelay: `${i * 0.5 + 1.2}s` }} />
            </g>
          );
        })}

        {NODES.map((n, i) => <Warehouse key={i} x={n.x} y={n.y} label={`${f.uiWarehouse} ${n.n}`} />)}
        {phones.map((p, i) => <DriverPhone key={p.id} p={p} label={i === 0 ? f.uiDriver : undefined} />)}

        {/* The cloud. Mark + wordmark live INSIDE the breathing group, so they
            move with it instead of sitting still while the shape swells. */}
        {/* The translate lives on the OUTER g and the animation on the inner one:
            a CSS `transform` REPLACES an element's SVG transform attribute, so
            putting .cl9-breathe here would silently drop the translate and fling
            the cloud into the corner. (It did exactly that once.) */}
        <g transform={`translate(${CX} ${CY})`}>
          <g className="cl9-breathe">
            {/* outline: the same lobes, slightly larger, behind the fill */}
            <g fill="#60a5fa">
              {LOBES.map((l, i) => <circle key={i} cx={l.cx} cy={l.cy} r={l.r + 2} />)}
            </g>
            <g fill="url(#cl9-cloud)">
              {LOBES.map((l, i) => <circle key={i} cx={l.cx} cy={l.cy} r={l.r} />)}
            </g>
            {/* The official logistiq.cloud banner on a white plate. The banner is
                the dark-on-light variant (its wordmark is #373636), so the plate
                is what makes it legible on the blue cloud — and it keeps the white
                background the icon at its front already had. Sized from the asset's
                own 1162.5:187.5 ratio so the artwork is never squashed. */}
            <rect x={-BANNER_W / 2 - 13} y={-BANNER_H / 2 - 11} width={BANNER_W + 26} height={BANNER_H + 22} rx={12} fill="#fff" />
            <image href="/logistiq-banner-dark.svg" x={-BANNER_W / 2} y={-BANNER_H / 2} width={BANNER_W} height={BANNER_H} preserveAspectRatio="xMidYMid meet" />
          </g>
        </g>

        {/* Live sync sits under the cloud — inside, the lower lobes crowd it */}
        <g transform={`translate(${CX} ${CY + 118})`}>
          <rect x={-62} y={-14} width={124} height={28} rx={14} fill="#1b2532" stroke="#3b82f6" strokeOpacity="0.45" />
          <circle className="cl9-live" cx={-44} cy={0} r={4.5} fill="#4ade80" />
          <text x={10} y={5} textAnchor="middle" fill="#93c5fd" style={{ fontSize: 14, fontWeight: 600 }}>{f.uiRealtime}</text>
        </g>

        {/* both-directions caption, on the link with room for it */}
        <g transform="translate(370 236)">
          <rect x={-60} y={-14} width={120} height={28} rx={14} fill="#0f1720" fillOpacity="0.92" stroke="#334155" />
          <text x={0} y={5} textAnchor="middle" fill="#7dd3fc" style={{ fontSize: 13.5, fontWeight: 600 }}>{f.uiSync}</text>
        </g>

        {/* browser-only badge over the first warehouse */}
        <g transform="translate(170 40)">
          <rect x={-56} y={-14} width={112} height={28} rx={14} fill="#22c55e" fillOpacity="0.14" stroke="#22c55e" strokeOpacity="0.5" />
          <text x={0} y={5} textAnchor="middle" fill="#4ade80" style={{ fontSize: 13.5, fontWeight: 600 }}>{f.uiBrowser}</text>
        </g>

        {/* what you do NOT need */}
        <g transform="translate(600 716)">
          {[f.uiNoServer, f.uiNoInstall, f.uiNoHardware].map((label, i, arr) => {
            const w = 196, gap = 14;
            const total = arr.length * w + (arr.length - 1) * gap;
            const x = -total / 2 + i * (w + gap);
            return (
              <g key={i} transform={`translate(${x} 0)`}>
                <rect x={0} y={-18} width={w} height={36} rx={18} fill="#1b2532" stroke="#3f4a5a" />
                <g stroke="#ef4444" strokeWidth="2.4" strokeLinecap="round">
                  <line x1={22} y1={-6} x2={34} y2={6} /><line x1={34} y1={-6} x2={22} y2={6} />
                </g>
                <text x={48} y={5} fill="#cbd5e1" style={{ fontSize: 14.5, fontWeight: 600 }}>{label}</text>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
