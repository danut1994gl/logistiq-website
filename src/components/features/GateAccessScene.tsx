"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { Translations } from "@/lib/i18n/translations";
import type { Locale } from "@/lib/i18n/config";
import { DRIVER_POOLS } from "./driverPools";
import { QRCodeSVG } from "@/components/mockups/QRCodeSVG";

// Yard access control (feature 15) — the gate chain as a loop, left to right: the
// driver's phone DISPLAYS the check-in QR -> the gate scanner (a terminal mounted at
// the gate; it scans, the box never does) reads it -> the cloud runs the checks of
// POST /api/gate/validate. That much works today, and the loop stops there: the
// check-in is validated, or refused (one truck in four, whose status does not let
// it in).
//
// What comes after is in progress (owner, 2026-11-24): the open command will go to
// the barrier only over a secure (TLS) connection, which is being prepared, and
// QRGoBox, the box that will open it, is being redesigned. Until then a valid scan
// is answered 503 and kept in the gate log as refused, "Gate did not respond"
// (Logistiq apps/dashboard/app/api/gate/validate/route.ts). So the box, the cable,
// the barrier and the timeline row a passage would write ("Entry: <gate>") are drawn
// greyed and dashed, each marked in progress, and the barrier stays down: nothing in
// the scene opens it. Until 2026-11-24 the loop sent the command on, pulsed a relay,
// lifted the barrier, drove the truck through and showed the ramp box of a granted
// answer, as if all of it were live.
//
// Also not drawn, by design: the terminal never shows the driver's name, plate or
// company (they live on the driver's phone), and there is no beep or haptic. The
// terminal UI follows the app: 50/50 split, camera + 200x200 target frame, grey[900]
// InfoPanel, status pill, message box. States cycle with their colours: READY (blue)
// -> PROCESSING (orange) -> CHECK-IN VALIDATED (green), or ACCESS DENIED (red).
// Client player; pauses off-screen; the server-rendered and reduced-motion frame is
// the validated check-in at the closed barrier.

type Status = "ready" | "processing" | "validated" | "denied";

// the app's real state colours (blue / orange / green / red)
const C: Record<Status, string> = {
  ready: "#3b82f6",
  processing: "#f59e0b",
  validated: "#22c55e",
  denied: "#ef4444",
};

// Material icons the app actually uses: qr_code_scanner, hourglass_empty,
// check_circle, error
const ICON: Record<Status, ReactNode> = {
  ready: (
    <>
      <path d="M3 8V5.5A2.5 2.5 0 0 1 5.5 3H8M21 8V5.5A2.5 2.5 0 0 0 18.5 3H16M3 16v2.5A2.5 2.5 0 0 0 5.5 21H8M21 16v2.5A2.5 2.5 0 0 1 18.5 21H16" />
      <rect x="7" y="7" width="4" height="4" rx="0.8" />
      <rect x="13" y="13" width="4" height="4" rx="0.8" />
      <path d="M13.5 7h3.5M13.5 10h2M7 13.5h4M7 17h2" />
    </>
  ),
  processing: (
    <>
      <path d="M7 3h10M7 21h10" />
      <path d="M8 3v3.4c0 1.3.6 2.5 1.7 3.2L12 12l-2.3 2.4A4 4 0 0 0 8 17.6V21M16 3v3.4a4 4 0 0 1-1.7 3.2L12 12l2.3 2.4a4 4 0 0 1 1.7 3.2V21" />
    </>
  ),
  validated: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m7.8 12.4 2.8 2.8L16.2 9.6" />
    </>
  ),
  denied: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.2v5.6M12 16.3v.1" />
    </>
  ),
};

const CLOUD_ICON = <path d="M7 19a4.5 4.5 0 0 1-.6-8.96 5.5 5.5 0 0 1 10.5-1.3A4 4 0 0 1 17.5 19z" />;
const GATE_ICON = (
  <>
    <path d="M4 20V6M4 8h16M4 12h16" />
    <path d="M9 8v4M14 8v4M20 6v14" />
  </>
);
const KEY_ICON = (
  <>
    <circle cx="7.5" cy="12" r="3.5" />
    <path d="M11 12h10M18 12v3M15 12v2.5" />
  </>
);

// the ladder's skeleton bars — deterministic widths (no Math.random at module
// scope / during render: it would break SSR hydration)
const CHECK_W = [64, 79, 55, 71, 47, 67, 59, 75];
// one truck in four is refused, so the DENIED frame is guaranteed on one watch
const SEQ = [true, true, false, true];

// road-band geometry (viewBox user units)
const TX_AWAY = -320;
const TX_GATE = 713; // nose (local x 247) lands just short of the barrier post

// the control cable QRGoBox will drive, from the box card's output (top edge, x≈1112 —
// directly under the box card) down into the barrier's motor housing (≈980,146). Drawn
// dashed and grey: nothing runs down it today.
const CABLE = "M1112 4 C1112 74 1046 106 980 146";

// European articulated semi, side view — same drawing as the Digital Check-in
// scene, but its gradients are re-declared under OUR prefix (url(#cj2-…) would
// resolve to nothing on this page) and the cj2-brake class is dropped: it drags
// in a 32s timeline that means nothing here.
// Local coords: trailer x0–178, cab x186–247 (nose = 247), wheels cy=331,
// ground contact y=344.
function TruckArt() {
  return (
    <g>
      <rect x="0" y="224" width="178" height="90" rx="6" fill="url(#ga15-trailer)" />
      {[36, 72, 108, 144].map((x) => (
        <line key={x} x1={x} y1="232" x2={x} y2="306" className="stroke-slate-500" strokeWidth="1.5" opacity="0.3" />
      ))}
      <rect x="14" y="238" width="56" height="9" rx="4.5" className="fill-blue-500" />
      <rect x="1" y="227" width="3" height="8" rx="1.5" className="fill-red-500" opacity="0.55" />
      <rect x="2" y="248" width="4" height="10" rx="1" className="fill-slate-400" />
      <rect x="2" y="278" width="4" height="10" rx="1" className="fill-slate-400" />
      <rect x="8" y="314" width="162" height="5" className="fill-slate-800" />
      <rect x="76" y="316" width="44" height="8" rx="3" className="fill-slate-700" />
      <rect x="128" y="314" width="5" height="22" className="fill-slate-500" />
      <rect x="124" y="336" width="13" height="4" rx="1.5" className="fill-slate-600" />
      <rect x="66" y="330" width="9" height="13" className="fill-slate-900" />
      <rect x="150" y="314" width="92" height="7" className="fill-slate-800" />
      <rect x="152" y="318" width="95" height="13" rx="3" className="fill-blue-700" />
      <rect x="180" y="250" width="4" height="60" rx="2" className="fill-slate-500" />
      <path d="M186 318 V250 Q186 238 198 238 H226 Q240 238 244 250 L246 260 Q247 263 247 267 V318 Z" fill="url(#ga15-cab)" />
      <path d="M188 238 L194 226 Q195 224 198 224 H212 Q215 224 216 226 L222 238 Z" className="fill-blue-700" />
      <path d="M200 246 H228 Q238 246 241 254 L243 262 Q244 266 240 266 H200 Q194 266 194 260 V252 Q194 246 200 246 Z" className="fill-cyan-200" opacity="0.85" />
      <line x1="240" y1="244" x2="248" y2="238" className="stroke-slate-400" strokeWidth="2" />
      <rect x="246" y="234" width="5" height="13" rx="2.5" className="fill-slate-500" />
      <rect x="239" y="300" width="8" height="3" rx="1.5" className="fill-slate-100" opacity="0.9" />
      <rect x="239" y="306" width="8" height="5" rx="2" className="fill-amber-300" />
      {[30, 58, 166, 232].map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy="331" r="13" fill="#0f172a" className="stroke-slate-700" strokeWidth="1.5" />
          <circle cx={cx} cy="331" r="6.5" className="fill-slate-400" />
          <circle cx={cx} cy="331" r="2" className="fill-slate-200" />
        </g>
      ))}
    </g>
  );
}

function Glyph({ children, cls, w = "2" }: { children: ReactNode; cls: string; w?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth={w} strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}

// one hop of the chain. Every hop points RIGHT. The last one, from the cloud to the
// box, is in progress: drawn dashed, and no packet ever runs along it.
function Hop({ active, muted = false }: { active: boolean; muted?: boolean }) {
  return (
    <div className="relative w-[3cqw] shrink-0 self-center h-[0.7cqw]">
      {muted ? (
        <div className="absolute inset-x-0 top-[0.28cqw] h-0 border-t-[0.14cqw] border-dashed border-slate-600" />
      ) : (
        <div className="absolute inset-x-0 top-[0.28cqw] h-[0.14cqw] rounded-full bg-slate-700" />
      )}
      {active && !muted ? (
        <span className="ga15-packet absolute left-0 top-0 w-[0.7cqw] h-[0.7cqw] rounded-full bg-cyan-400 shadow-[0_0_0.8cqw_rgba(34,211,238,0.9)]" />
      ) : null}
    </div>
  );
}

export function GateAccessScene({ t, locale }: { t: Translations; locale: Locale }) {
  const f = t.f15Page;
  const pool = DRIVER_POOLS[locale];

  // The first frame, also the server-rendered and reduced-motion one: a validated
  // check-in, the truck waiting at the closed barrier.
  const [status, setStatus] = useState<Status>("validated");
  const [checks, setChecks] = useState(8); // rows of the ladder resolved so far
  const [fail, setFail] = useState(false); // the 8th (status) check refused
  const [hop, setHop] = useState(0); // 1 phone->terminal, 2 terminal->cloud
  const [scanning, setScanning] = useState(false);
  const [shown, setShown] = useState(true); // the truck fades out between two runs
  const [tx, setTx] = useState(TX_GATE);
  const [ms, setMs] = useState(2200);
  const [driver, setDriver] = useState(pool[0]);
  const [clock, setClock] = useState(27735); // 07:42:15 — a literal seed, never Date.now()
  const rootRef = useRef<HTMLDivElement>(null);

  // the terminal's big ticking clock (42px mono, letterSpacing 4)
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setClock((c) => (c + 1) % 86400), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    // reduced motion keeps the first frame above: the check-in validated, ladder 8/8,
    // the barrier down.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let cancelled = false;
    let visible = true;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0.15 });
    if (rootRef.current) io.observe(rootRef.current);
    const sleep = (d: number) =>
      new Promise<void>((res) => {
        const s = Date.now();
        const tick = () => {
          if (cancelled) return res();
          if (visible && Date.now() - s >= d) return res();
          setTimeout(tick, visible ? 90 : 150);
        };
        setTimeout(tick, 90);
      });

    (async () => {
      let i = 0;
      await sleep(400);
      while (!cancelled) {
        const grant = SEQ[i % SEQ.length];
        // reset: the truck fades out where it stands, then rolls in again from the left
        setShown(false);
        await sleep(600);
        if (cancelled) break;
        setStatus("ready");
        setChecks(0);
        setFail(false);
        setHop(0);
        setDriver(pool[i % pool.length]);
        setMs(0);
        setTx(TX_AWAY);
        setShown(true);
        await sleep(500);

        // 1) the truck rolls up to the barrier
        setMs(2400);
        setTx(TX_GATE);
        await sleep(2600);
        if (cancelled) break;

        // 2) the driver holds up the QR; the TERMINAL reads it (the box never does)
        setHop(1);
        setScanning(true);
        await sleep(1000);
        setScanning(false);
        setHop(0);

        // 3) POST /api/gate/validate — orange PROCESSING while the call is out
        setStatus("processing");
        await sleep(320);
        setHop(2);
        await sleep(560);
        setHop(0);

        // 4) the eight checks, in the route's real order
        for (let c = 1; c <= 8; c++) {
          if (cancelled) break;
          if (c === 8 && !grant) setFail(true); // status not in confirmed/assigned/in_progress
          setChecks(c);
          await sleep(165);
        }
        await sleep(420);
        if (cancelled) break;

        if (grant) {
          // 5) the check-in is validated. The chain stops here today: no command goes
          // on to the box, the barrier stays down and the truck waits at it.
          setStatus("validated");
          await sleep(3200);
        } else {
          // refused: the truck backs away from the barrier
          setStatus("denied");
          await sleep(2600);
          setMs(1600);
          setTx(TX_AWAY);
          await sleep(1800);
        }
        i++;
      }
    })();

    return () => { cancelled = true; io.disconnect(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const col = C[status];
  const label = status === "ready" ? f.uiScan : status === "processing" ? f.uiValidating : status === "validated" ? f.uiValidated : f.uiDenied;
  const hh = String(Math.floor(clock / 3600)).padStart(2, "0");
  const mm = String(Math.floor((clock % 3600) / 60)).padStart(2, "0");
  const ss = String(clock % 60).padStart(2, "0");

  return (
    <div ref={rootRef} className="@container absolute inset-0 p-[1.6cqw] text-slate-200 select-none" aria-hidden="true">
      <div className="w-full h-full rounded-[1.4cqw] bg-slate-900/70 border border-slate-700/70 flex flex-col overflow-hidden">
        {/* header — which gate this is, and the organisation's key the gate
            scanner authenticates with */}
        <div className="flex items-center gap-[1.2cqw] px-[2cqw] py-[1.1cqw] border-b border-slate-700/70 bg-slate-800/60 shrink-0">
          <span className="w-[2.8cqw] h-[2.8cqw] rounded-[0.7cqw] bg-blue-500/15 text-blue-300 flex items-center justify-center shrink-0">
            <Glyph cls="w-[1.7cqw] h-[1.7cqw]" w="1.8">{GATE_ICON}</Glyph>
          </span>
          <span className="font-bold text-white text-[1.7cqw]">{f.uiGate}</span>
          <span className="ml-auto inline-flex items-center gap-[0.6cqw] rounded-full border border-slate-600 bg-slate-900/70 px-[1cqw] py-[0.35cqw] text-slate-400">
            <Glyph cls="w-[1.2cqw] h-[1.2cqw]" w="1.8">{KEY_ICON}</Glyph>
            <span className="font-mono text-[1.05cqw] tracking-wide">org_5f3a90c4…c17b</span>
          </span>
        </div>

        {/* ============ the chain ============ */}
        <div className="flex-1 min-h-0 flex items-center justify-center gap-0 px-[2cqw] py-[1.6cqw]">
          {/* ---- 1. the driver's phone: it only DISPLAYS the QR ---- */}
          <div className="w-[14cqw] shrink-0 aspect-[9/19] rounded-[1.6cqw] bg-slate-950 border border-slate-700 p-[0.45cqw] shadow-2xl">
            <div className="w-full h-full rounded-[1.2cqw] bg-[#0f1720] flex flex-col items-center p-[0.7cqw] gap-[0.55cqw] overflow-hidden">
              <span className="w-[3.2cqw] h-[0.35cqw] rounded-full bg-slate-700 shrink-0" />
              {/* the driver's own check-in — name and plate live HERE and never on
                  the terminal (the validate response carries no identity) */}
              <span className="w-full flex flex-col items-center leading-tight shrink-0">
                <span className="text-white font-semibold text-[1.05cqw] truncate max-w-full">{driver.name}</span>
                <span className="text-slate-400 text-[0.95cqw] font-mono">{driver.plate}</span>
              </span>
              <span className="rounded-[0.5cqw] bg-white p-[0.35cqw] shrink-0">
                <span className="block w-[8.4cqw] h-[8.4cqw]">
                  <QRCodeSVG />
                </span>
              </span>
              {/* the QR payload is the raw check-in UUID — nothing else */}
              <span className="text-slate-500 font-mono text-[0.85cqw] shrink-0">8f2c41a7…</span>
              <span className="w-full flex flex-col gap-[0.4cqw] mt-[0.2cqw] shrink-0">
                {[86, 62].map((w) => (
                  <span key={w} className="h-[0.5cqw] rounded-full bg-slate-800" style={{ width: `${w}%` }} />
                ))}
              </span>
              <span className="flex-1" />
              {/* the timeline row a passage writes for the driver ("Entry: <gate>").
                  A passage is recorded once the open command has gone out to the
                  barrier, which is in progress: the row is drawn greyed, dashed and
                  marked so, and never appears as if live. */}
              <span className="w-full flex flex-col gap-[0.3cqw] rounded-[0.5cqw] border border-dashed border-slate-600 bg-slate-800/40 px-[0.5cqw] py-[0.45cqw] shrink-0">
                <span className="flex items-start gap-[0.5cqw]">
                  <Glyph cls="w-[1.1cqw] h-[1.1cqw] text-slate-500 shrink-0 mt-[0.1cqw]" w="2.4">
                    <>
                      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                      <path d="M10 17l5-5-5-5M15 12H3" />
                    </>
                  </Glyph>
                  <span className="text-slate-400 text-[0.9cqw] leading-tight">{f.uiTimeline}</span>
                </span>
                <span className="self-start rounded-[0.35cqw] bg-amber-500/15 text-amber-300 text-[0.75cqw] font-semibold leading-tight px-[0.5cqw] py-[0.1cqw]">{f.uiInProgress}</span>
              </span>
            </div>
          </div>

          <Hop active={hop === 1} />

          {/* ---- 2. the gate terminal: the only thing here with a camera ---- */}
          <div className="w-[22cqw] shrink-0 aspect-[9/14] rounded-[1.3cqw] bg-slate-950 border border-slate-700 p-[0.5cqw] shadow-2xl">
            <div className="w-full h-full rounded-[1cqw] overflow-hidden flex flex-col">
              {/* camera — top half, status-coloured border, 200x200 target frame */}
              <div
                className="relative h-1/2 shrink-0 rounded-b-[1.3cqw] bg-[#0b0f14] overflow-hidden flex items-center justify-center transition-colors duration-300"
                style={{ border: "0.16cqw solid", borderColor: col }}
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(56,89,140,0.35),transparent_70%)]" />
                {/* camera-flip (top-left), torch (top-right), and the settings gear
                    the app deliberately fades to alpha .3 (bottom-left) */}
                <Glyph cls="absolute left-[0.7cqw] top-[0.7cqw] w-[1.3cqw] h-[1.3cqw] text-white/70" w="1.8">
                  <>
                    <path d="M15 4h3a2 2 0 0 1 2 2v3M9 20H6a2 2 0 0 1-2-2v-3" />
                    <circle cx="12" cy="12" r="3.4" />
                  </>
                </Glyph>
                <Glyph cls="absolute right-[0.7cqw] top-[0.7cqw] w-[1.3cqw] h-[1.3cqw] text-white/70" w="1.8">
                  <path d="M13 2 4 14h6l-1 8 9-12h-6z" />
                </Glyph>
                <Glyph cls="absolute left-[0.7cqw] bottom-[0.7cqw] w-[1.3cqw] h-[1.3cqw] text-white opacity-30" w="1.8">
                  <>
                    <circle cx="12" cy="12" r="3.2" />
                    <path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 1 1-4 0v-.1A1.6 1.6 0 0 0 7 19.4a1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.6 1.6 0 0 0 3 14.6H3a2 2 0 1 1 0-4h.1A1.6 1.6 0 0 0 4.6 7a1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.6 1.6 0 0 0 9 3h.1a2 2 0 1 1 4 0V3a1.6 1.6 0 0 0 2.7 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0 1.1 2.7H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1.4z" />
                  </>
                </Glyph>
                {/* 200x200 target frame = half the screen width, r16 */}
                <div className="relative w-[11cqw] h-[11cqw] rounded-[0.9cqw] border-[0.12cqw] border-white/50 overflow-hidden">
                  {scanning ? (
                    <>
                      <span className="ga15-qrpop absolute left-1/2 top-1/2 w-[6.4cqw] h-[6.4cqw] -ml-[3.2cqw] -mt-[3.2cqw] rounded-[0.3cqw] bg-white p-[0.25cqw]">
                        <QRCodeSVG />
                      </span>
                      <span className="ga15-sweep absolute inset-x-[4%] h-[0.18cqw] rounded-full bg-cyan-300 shadow-[0_0_1cqw_rgba(103,232,249,0.9)]" />
                    </>
                  ) : null}
                </div>
              </div>

              {/* InfoPanel — grey[900], top corners rounded 24px */}
              <div className="h-1/2 shrink-0 rounded-t-[1.3cqw] bg-[#212121] -mt-[0.9cqw] p-[0.9cqw] flex flex-col gap-[0.6cqw]">
                {/* status pill: colour @15%, 2px border, icon:text = 36:24 */}
                <div
                  className="flex items-center justify-center gap-[0.6cqw] rounded-[0.7cqw] px-[0.7cqw] py-[0.55cqw] shrink-0 transition-colors duration-300"
                  style={{ background: `${col}26`, border: "0.1cqw solid", borderColor: col }}
                >
                  <Glyph cls="w-[2.1cqw] h-[2.1cqw] shrink-0" w="2">{ICON[status]}</Glyph>
                  <span className="font-bold text-[1.4cqw] leading-tight text-center" style={{ color: col, letterSpacing: "0.08em" }}>
                    {label}
                  </span>
                </div>
                {/* message box — grey[850]. The server's sentence arrives in the
                    driver's own language, so it is drawn, not invented. */}
                <div className="flex-1 min-h-0 rounded-[0.5cqw] bg-[#303030] flex flex-col items-center justify-center gap-[0.4cqw] px-[0.8cqw] shrink-0">
                  <span className="h-[0.5cqw] rounded-full transition-all duration-300" style={{ width: status === "processing" ? "42%" : "62%", background: `${col}80` }} />
                  <span className="h-[0.5cqw] rounded-full bg-white/15" style={{ width: status === "validated" ? "38%" : "30%" }} />
                </div>
                {/* the terminal's big ticking clock */}
                <span className="text-center font-mono font-bold text-white/90 text-[2cqw] leading-none shrink-0 tabular-nums" style={{ letterSpacing: "0.1em" }}>
                  {hh}:{mm}:{ss}
                </span>
              </div>
            </div>
          </div>

          <Hop active={hop === 2} />

          {/* ---- 3. the cloud: the only place any decision is made ---- */}
          <div className="flex-1 min-w-0 self-stretch max-h-[34cqw] rounded-[1cqw] border border-slate-700 bg-slate-800/40 flex flex-col overflow-hidden">
            <div className="flex items-center gap-[0.8cqw] px-[1.2cqw] py-[0.9cqw] border-b border-slate-700/70 bg-slate-800/60 shrink-0">
              <Glyph cls="w-[1.6cqw] h-[1.6cqw] text-cyan-300 shrink-0" w="1.8">{CLOUD_ICON}</Glyph>
              <span className="font-mono text-[1.2cqw] text-slate-200 truncate">{f.uiChecks}</span>
            </div>
            <div className="flex-1 min-h-0 flex flex-col justify-evenly px-[1.2cqw] py-[0.6cqw]">
              {CHECK_W.map((w, i) => {
                const done = checks > i;
                const bad = done && fail && i === 7;
                return (
                  <div key={i} className="flex items-center gap-[0.8cqw]">
                    <span
                      className="w-[1.7cqw] h-[1.7cqw] rounded-full flex items-center justify-center shrink-0 text-[0.9cqw] font-bold transition-colors duration-200"
                      style={
                        done
                          ? { background: bad ? "#ef444426" : "#22c55e26", border: `0.1cqw solid ${bad ? "#ef4444" : "#22c55e"}`, color: bad ? "#ef4444" : "#22c55e" }
                          : { background: "#1e293b", border: "0.1cqw solid #334155", color: "#64748b" }
                      }
                    >
                      {done ? (
                        <Glyph cls="ga15-tick w-[1cqw] h-[1cqw]" w="3.2">
                          {bad ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="m5 12.5 4.5 4.5L19 7" />}
                        </Glyph>
                      ) : (
                        i + 1
                      )}
                    </span>
                    <span
                      className="h-[0.55cqw] rounded-full transition-colors duration-200"
                      style={{ width: `${w}%`, background: done ? (bad ? "#ef444466" : "#22c55e59") : "#334155" }}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <Hop active={false} muted />

          {/* ---- 4. QRGoBox, in progress: greyed and dashed, its label says so. It
                sits low in the row (self-end) so it is right above the gate, and
                its output terminal lines up with the cable down to the barrier. ---- */}
          <div className="w-[15cqw] shrink-0 self-end rounded-[1cqw] border border-dashed border-slate-600 bg-slate-800/30 p-[0.9cqw] flex flex-col gap-[0.7cqw]">
            <svg viewBox="0 0 140 96" className="w-full block opacity-60">
              <g fill="none" stroke="#64748b" strokeWidth="2.6" strokeLinecap="round">
                <path d="M24 12a14 14 0 0 1 20 0" />
                <path d="M30 18a6.5 6.5 0 0 1 8 0" />
              </g>
              <rect x="6" y="24" width="128" height="66" rx="4" fill="#1b2532" stroke="#334155" strokeWidth="1.6" />
              {/* the controller + its antenna trace */}
              <rect x="14" y="32" width="46" height="34" rx="2" fill="#243040" stroke="#475569" strokeWidth="1.4" />
              <path d="M34 32V22h4v-6h-8v-4" fill="none" stroke="#64748b" strokeWidth="1.6" />
              {[0, 1, 2, 3, 4].map((n) => (
                <line key={n} x1="18" y1={38 + n * 6} x2="56" y2={38 + n * 6} stroke="#334155" strokeWidth="1.2" />
              ))}
              {/* the relay + its coil, and its LED, dark */}
              <rect x="72" y="32" width="50" height="34" rx="2" fill="#243040" stroke="#475569" strokeWidth="1.4" />
              {[0, 1, 2, 3].map((n) => (
                <line key={n} x1={80 + n * 5} y1="38" x2={80 + n * 5} y2="60" stroke="#334155" strokeWidth="1.6" />
              ))}
              <circle cx="112" cy="42" r="4" fill="#334155" />
              {/* screw terminals — the dry contact that goes to the barrier */}
              {[16, 42, 68, 94, 120].map((x) => (
                <g key={x}>
                  <rect x={x - 8} y="70" width="16" height="16" rx="2" fill="#0f1720" stroke="#334155" strokeWidth="1.2" />
                  <circle cx={x} cy="78" r="3.4" fill="#475569" />
                </g>
              ))}
            </svg>
            {/* "QRGoBox · in progress" */}
            <span className="text-[1cqw] leading-tight text-amber-300">{f.uiRelay}</span>
            {/* output terminal, wired down to the barrier motor. It pokes out the
                card's bottom edge and lines up with the cable. */}
            <span className="self-center -mb-[1.5cqw] flex flex-col items-center opacity-60">
              <span className="w-[2.2cqw] h-[0.5cqw] rounded-full bg-slate-600" />
              <span className="w-[0.6cqw] h-[1.2cqw] rounded-b-[0.3cqw] bg-slate-600" />
            </span>
          </div>
        </div>

        {/* ============ the lane: cable, barrier, truck ============ */}
        <div className="h-[15cqw] shrink-0 px-[2cqw] pb-[0.4cqw]">
          <svg viewBox="0 0 1200 186" className="w-full h-full block" preserveAspectRatio="xMidYMid meet">
            <defs>
              <linearGradient id="ga15-trailer" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#64748b" />
                <stop offset="1" stopColor="#475569" />
              </linearGradient>
              <linearGradient id="ga15-cab" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#3b82f6" />
                <stop offset="1" stopColor="#1d4ed8" />
              </linearGradient>
            </defs>

            {/* the control cable: it leaves the box card (directly above, at
                x≈1112) and runs down into the barrier's motor housing. Dashed:
                in progress, nothing runs down it. */}
            <path d={CABLE} fill="none" stroke="#334155" strokeWidth="3.5" strokeLinecap="round" strokeDasharray="9 9" />
            {/* the plug where the cable leaves the box card above */}
            <rect x="1104" y="-2" width="16" height="8" rx="2" fill="#475569" stroke="#334155" strokeWidth="1" />

            {/* ground */}
            <rect x="0" y="176" width="1200" height="10" className="fill-slate-800" />
            <line x1="0" y1="181" x2="900" y2="181" className="stroke-slate-600" strokeWidth="2" strokeDasharray="22 16" />

            {/* the truck (drawn before the barrier so the arm reads in front) */}
            <g transform="translate(0 -168)">
              <g style={{ opacity: shown ? 1 : 0, transition: "opacity 600ms" }}>
                <g style={{ transform: `translateX(${tx}px)`, transitionDuration: `${ms}ms` }}>
                  <TruckArt />
                </g>
              </g>
            </g>

            {/* the barrier — a compact motor housing at the post base that the
                cable plugs into, the post, then the boom: down, and greyed, since
                opening it is in progress. Nothing in the scene moves it. */}
            <g opacity="0.75">
              <rect x="966" y="150" width="28" height="26" rx="3" className="fill-slate-700" stroke="#475569" strokeWidth="1.5" />
              <circle cx="973" cy="156" r="2.2" className="fill-slate-500" />
              <rect x="975" y="122" width="10" height="30" rx="2" className="fill-slate-600" />
              <g transform="translate(980 126)">
                {/* one continuous boom — a white bar with a full-length blue stripe
                    and a solid tip, so it reads as a single arm. */}
                <rect x="-3" y="-7" width="15" height="14" rx="3" className="fill-slate-500" />
                <rect x="6" y="-6" width="168" height="12" rx="6" className="fill-slate-200" />
                <rect x="10" y="-4.4" width="150" height="3" rx="1.5" className="fill-blue-500" />
                <rect x="150" y="-6" width="24" height="12" rx="6" className="fill-blue-600" />
                <circle cx="170" cy="0" r="3" className="fill-slate-300" />
              </g>
            </g>
            {/* in progress, under the boom's free end: right-aligned, so the longest
                languages stay clear of the motor housing and the waiting truck */}
            <text x="1188" y="162" textAnchor="end" className="fill-amber-300" style={{ fontSize: 13, fontWeight: 600 }}>
              {f.uiInProgress}
            </text>
          </svg>
        </div>
      </div>
    </div>
  );
}
