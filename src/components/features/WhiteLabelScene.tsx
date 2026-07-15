"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { Translations } from "@/lib/i18n/translations";
import type { Locale } from "@/lib/i18n/config";
import { DRIVER_POOLS } from "./driverPools";

// White-Label & API (feature 8). Split scene, both halves pinned to the audit.
//
// LEFT — the driver check-in page re-skinning to a customer's brand. Three
// fictional warehouses crossfade through the real ProfileHeader (cover photo,
// overlapping round avatar, org name, address, contact + hours), which is
// exactly what a warehouse_manager can upload/edit for their own org
// (organizations.avatar_url / cover_url / name / address / settings.contact_info)
// and what qrgo.ro/[slug] renders. A browser address bar carries the org's own
// custom domain with a Verified pill — the real Vercel-backed CNAME/A-record
// flow (organizations.custom_domain_verified; middleware rewrites the host to
// /{slug}).
//
// The one thing that deliberately NEVER changes is the blue chrome: the check-in
// card header below the profile stays identical for every brand. Per the audit
// the colour theme is NOT per-org — it is a single platform-wide row
// (platform_settings.driver_theme, live value 'ocean-blue') that only Logistiq's
// root admin can change, applied to every warehouse at once. So the per-brand
// colour here lives only where it is genuinely the customer's: inside their
// uploaded logo and their uploaded cover photo. No colour picker, no hex input,
// no "adopts your brand colours". The browser tab strip is cropped out on
// purpose — the real tab reads "QRGO Driver" on every domain.
//
// RIGHT — the only real "API": device credentials for QRGoBox gate hardware. A
// per-organization key (org_ + 32 hex, shared by every gate) that an ESP32
// controller POSTs to /api/gate/validate {gate_id, api_key, checkin_code} to
// lift a barrier. Deliberately NOT a REST/TMS/WMS/ERP integration API, not an
// API explorer, no webhooks, no personal tokens — none of those exist.
//
// Client player: one gate call per brand, brand swaps while the barrier is down.
// Static frame on reduced-motion. aria-hidden decorative.

// the real driver card header — bg-gradient-to-r from-theme-600 to-theme-700.
// Platform-wide, so it is drawn once and shared by every brand below.
const HDR = "linear-gradient(to right, #2563eb, #1d4ed8)";

const InfoIc = <><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></>;
const PinIc = <><path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11z" /><circle cx="12" cy="10" r="2.5" /></>;
const PhoneIc = <path d="M5 4h4l2 5-3 2a12 12 0 0 0 5 5l2-3 5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />;
const ClockIc = <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>;
const LockIc = <><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>;
const CheckIc = <path d="M4 12.5l5 5L20 6.5" />;
const ImageIc = <><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="8.5" cy="9.5" r="1.6" /><path d="M21 16l-5-5-6 6-3-3-4 4" /></>;
// the logo is uploaded as a round-cropped avatar — a disc with a mark in it
const LogoIc = <><circle cx="12" cy="12" r="9.5" /><path d="M12 7.5l3.2 7-3.2-1.7-3.2 1.7z" /></>;
const ClipboardIc = <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2M9 12l1.5 1.5L14 10" />;
const CopyIc = <><rect x="9" y="9" width="12" height="12" rx="2" /><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" /></>;
const KeyIc = <><circle cx="7" cy="16" r="4" /><path d="M10 13l9-9 2 2-2 2 2 2-2 2-2-2-2 2-2-2" /></>;
// a microchip — the panel is device credentials, not a web API console
const ChipIc = <><rect x="6" y="6" width="12" height="12" rx="2" /><rect x="10" y="10" width="4" height="4" /><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4" /></>;

// --- the three customer brands -------------------------------------------
// Sample data, like "London Warehouse" in AppTourScene: the logo mark and the
// cover photo palette are the customer's own artwork (an uploaded avatar/cover),
// which is the only place a customer colour legitimately appears.
type Brand = {
  name: string;
  addr: string;
  phone: string;
  hours: string;
  logoBg: string;
  logoFg: string;
  mark: ReactNode;
  sky: [string, string];
  sun: string;
  far: string;
  bldg: string;
  roof: string;
  ground: string;
};

const BRANDS: Brand[] = [
  {
    name: "Nordwind Logistik",
    addr: "Hafenstraße 40 · Hamburg",
    phone: "+49 40 218 4470",
    hours: "06:00 – 22:00",
    logoBg: "#0f766e",
    logoFg: "#5eead4",
    mark: <path d="M12 2.5 21.5 21.5 12 16.8 2.5 21.5z" />,
    sky: ["#0e4f5c", "#3f8fa3"],
    sun: "#7dd3fc",
    far: "#1c5b64",
    bldg: "#134e4a",
    roof: "#0d3b38",
    ground: "#2a4a4d",
  },
  {
    name: "Vertex Cargo",
    addr: "Via Emilia 214 · Bologna",
    phone: "+39 051 640 2210",
    hours: "07:00 – 19:00",
    logoBg: "#b45309",
    logoFg: "#fde68a",
    mark: <path d="M12 2.2 21 7.4v9.2L12 21.8 3 16.6V7.4z" />,
    sky: ["#7c4a1e", "#d9974a"],
    sun: "#fde68a",
    far: "#8a5a2b",
    bldg: "#78350f",
    roof: "#5a2708",
    ground: "#5c4326",
  },
  {
    name: "Meridian Depot",
    addr: "Kanaalweg 6 · Rotterdam",
    phone: "+31 10 476 3390",
    hours: "24/7",
    logoBg: "#5b21b6",
    logoFg: "#ddd6fe",
    mark: <><circle cx="12" cy="12" r="9.2" /><path d="M12 2.8v18.4M3 12h18" stroke="#5b21b6" strokeWidth="1.8" fill="none" /></>,
    sky: ["#241d52", "#6d5aa8"],
    sun: "#c4b5fd",
    far: "#312a63",
    bldg: "#2e1065",
    roof: "#1f0a4a",
    ground: "#332b56",
  },
];

// The uploaded cover photo. Drawn as an obvious *photograph* of the customer's
// own yard (sky, silos, dock building, trucks) rather than a flat colour band —
// so it never reads as "the page took my brand colour".
function Cover({ b, i }: { b: Brand; i: number }) {
  const g = `wl8-sky-${i}`;
  return (
    <svg viewBox="0 0 300 110" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id={g} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={b.sky[0]} />
          <stop offset="100%" stopColor={b.sky[1]} />
        </linearGradient>
      </defs>
      <rect width="300" height="110" fill={`url(#${g})`} />
      {/* the band is object-cover cropped (roughly y 27..83 at the header's
          aspect), so the sun sits mid-frame rather than up at the top edge */}
      <circle cx="150" cy="40" r="10" fill={b.sun} fillOpacity="0.75" />
      {/* distant skyline */}
      <path d="M0 62h34l8-9h30l6 9h48l10-7h40l7 7h60l9-6h48v10H0z" fill={b.far} fillOpacity="0.75" />
      {/* silos */}
      {[196, 214, 232].map((x) => (
        <g key={x}>
          <rect x={x} y={38} width={13} height={36} rx={6} fill={b.bldg} />
          <ellipse cx={x + 6.5} cy={38} rx={6.5} ry={3} fill={b.roof} />
        </g>
      ))}
      {/* dock building with its roller doors */}
      <path d="M18 40 62 28l44 12v34H18z" fill={b.roof} />
      <rect x="18" y="44" width="88" height="30" fill={b.bldg} />
      {[26, 50, 74].map((x) => <rect key={x} x={x} y={52} width={16} height={22} rx={1} fill={b.roof} />)}
      {/* apron + trucks parked on it */}
      <rect x="0" y="74" width="300" height="36" fill={b.ground} />
      <rect x="0" y="74" width="300" height="1.6" fill="#0f172a" fillOpacity="0.35" />
      {[120, 168].map((x) => (
        <g key={x}>
          <rect x={x} y={58} width={30} height={16} rx={1.5} fill={b.roof} />
          <rect x={x + 30} y={64} width={12} height={10} rx={1.5} fill={b.bldg} />
        </g>
      ))}
      {[16, 60, 104, 148, 192, 236, 280].map((x) => (
        <rect key={x} x={x} y={92} width={18} height={2} fill="#f8fafc" fillOpacity="0.18" />
      ))}
    </svg>
  );
}

// one brand's ProfileHeader, exactly the blocks the real component renders:
// cover, overlapping avatar, org name h1, address behind a pin, contact + hours
function BrandHeader({ b, i }: { b: Brand; i: number }) {
  return (
    <div className="absolute inset-0 flex flex-col">
      <div className="relative h-[52%] shrink-0 overflow-hidden">
        <Cover b={b} i={i} />
        <span className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
      </div>
      <div className="relative flex-1 min-h-0 bg-slate-800/80 px-[2cqw]">
        {/* the uploaded logo, in the real avatar treatment: a round crop with a
            thick page-coloured ring, overlapping the cover */}
        <span
          className="absolute -top-[4.5cqw] left-[2cqw] w-[9cqw] h-[9cqw] rounded-full border-[0.7cqw] border-slate-800 overflow-hidden flex items-center justify-center"
          style={{ background: b.logoBg }}
        >
          <svg viewBox="0 0 24 24" className="w-[4.8cqw] h-[4.8cqw]" fill={b.logoFg}>{b.mark}</svg>
        </span>
        <div className="pt-[5.4cqw] flex flex-col gap-[0.5cqw] min-w-0">
          <span className="text-white font-bold text-[2.1cqw] truncate">{b.name}</span>
          <span className="flex items-center gap-[0.7cqw] text-slate-400 text-[1.3cqw] min-w-0">
            <svg viewBox="0 0 24 24" className="w-[1.4cqw] h-[1.4cqw] shrink-0" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">{PinIc}</svg>
            <span className="truncate">{b.addr}</span>
          </span>
          {/* contact_info + working hours — theme-600 links on the real page;
              blue-400 here, the only tone that clears AA on dark */}
          <span className="flex items-center gap-[1.8cqw] pt-[0.4cqw] text-[1.25cqw] font-medium text-blue-400 min-w-0">
            <span className="flex items-center gap-[0.6cqw] shrink-0">
              <svg viewBox="0 0 24 24" className="w-[1.4cqw] h-[1.4cqw]" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">{PhoneIc}</svg>
              {b.phone}
            </span>
            <span className="flex items-center gap-[0.6cqw] shrink-0">
              <svg viewBox="0 0 24 24" className="w-[1.4cqw] h-[1.4cqw]" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">{ClockIc}</svg>
              {b.hours}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}

// a label pinned to the one thing on screen it names
function Tag({ icon, label, className }: { icon: ReactNode; label: string; className: string }) {
  return (
    <span className={`absolute z-10 inline-flex items-center gap-[0.5cqw] rounded-full border border-blue-400/50 bg-slate-950/85 px-[0.9cqw] py-[0.35cqw] text-[1.1cqw] font-semibold text-blue-300 whitespace-nowrap ${className}`}>
      <svg viewBox="0 0 24 24" className="w-[1.2cqw] h-[1.2cqw]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{icon}</svg>
      {label}
    </span>
  );
}

// a skeleton form field on the constant (platform-themed) check-in card
function SkelField({ w }: { w: string }) {
  return (
    <span className="flex flex-col gap-[0.5cqw]">
      <span className="h-[0.7cqw] rounded-full bg-slate-600" style={{ width: w }} />
      <span className="h-[2.6cqw] rounded-[0.7cqw] bg-slate-900/60 border border-slate-700" />
    </span>
  );
}

export function WhiteLabelScene({ t, locale }: { t: Translations; locale: Locale }) {
  const f = t.f8Page;
  const plates = DRIVER_POOLS[locale].map((d) => d.plate);

  // cycle drives the brand (cycle % 3) and the truck at the barrier, so trucks
  // keep changing while the three brands repeat.
  const [cycle, setCycle] = useState(0);
  // 0 idle · 1 key armed · 2 POST in flight · 3 200 OK, barrier up
  const [phase, setPhase] = useState(3);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // reduced motion keeps the static frame set above: first brand, gate open —
    // the whole story in one image.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let cancelled = false, visible = true;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0.15 });
    if (rootRef.current) io.observe(rootRef.current);
    const sleep = (ms: number) => new Promise<void>((res) => { const s = Date.now(); const tick = () => { if (cancelled) return res(); if (visible && Date.now() - s >= ms) return res(); setTimeout(tick, visible ? 90 : 150); }; setTimeout(tick, 90); });
    (async () => {
      setPhase(0);
      await sleep(900);
      while (!cancelled) {
        setPhase(1);            // the device key is what authenticates the call
        await sleep(1000);
        setPhase(2);            // POST /api/gate/validate leaves the QRGoBox
        await sleep(850);
        setPhase(3);            // 200 OK -> MQTT open command -> barrier lifts
        await sleep(2400);
        setPhase(0);            // barrier back down
        await sleep(900);
        if (cancelled) break;
        setCycle((c) => c + 1); // next warehouse re-skins the page, next truck
        await sleep(1100);
      }
    })();
    return () => { cancelled = true; io.disconnect(); };
  }, []);

  const brand = cycle % BRANDS.length;
  const plate = plates[cycle % plates.length];
  const open = phase === 3;
  const armed = phase >= 1;

  return (
    <div ref={rootRef} className="@container absolute inset-0 p-[2cqw] flex gap-[2cqw] text-slate-200 select-none" aria-hidden="true">
      {/* ---------- LEFT: the check-in page wearing the customer's brand ---------- */}
      <div className="flex-1 min-w-0 flex flex-col gap-[1cqw]">
        <div className="flex items-center gap-[0.9cqw] shrink-0 px-[0.3cqw]">
          <span className="w-[2.6cqw] h-[2.6cqw] rounded-[0.7cqw] bg-blue-500/15 text-blue-300 flex items-center justify-center [&_svg]:w-[1.6cqw] [&_svg]:h-[1.6cqw] shrink-0">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{InfoIc}</svg>
          </span>
          <span className="font-bold text-white text-[1.6cqw]">{f.uiBranding}</span>
        </div>

        <div className="relative isolate flex-1 min-h-0 rounded-[1.4cqw] border border-slate-700 bg-[#0f1720] overflow-hidden flex flex-col shadow-2xl">
          {/* Browser chrome. No tab strip on purpose: the real tab still reads
              "QRGO Driver" with QRGO's favicon, even on a customer's domain. */}
          <div className="flex items-center gap-[1cqw] px-[1.2cqw] py-[0.9cqw] bg-[#243040] border-b border-slate-700 shrink-0">
            <span className="flex items-center gap-[0.5cqw] shrink-0">
              {["#ef4444", "#f59e0b", "#22c55e"].map((c) => (
                <span key={c} className="w-[0.8cqw] h-[0.8cqw] rounded-full" style={{ background: c }} />
              ))}
            </span>
            <span className="flex-1 min-w-0 flex items-center gap-[0.7cqw] rounded-full bg-[#0f1720] border border-slate-700 px-[1cqw] py-[0.45cqw]">
              <svg viewBox="0 0 24 24" className="w-[1.2cqw] h-[1.2cqw] text-green-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{LockIc}</svg>
              <span className="text-slate-100 text-[1.3cqw] font-medium truncate">{f.uiDomain}</span>
            </span>
            {/* the Domain tab's own status pill, once DNS verification passes */}
            <span className="shrink-0 inline-flex items-center gap-[0.5cqw] rounded-full border border-green-500/40 bg-green-500/15 px-[0.9cqw] py-[0.35cqw] text-[1.15cqw] font-semibold text-green-300">
              <svg viewBox="0 0 24 24" className="w-[1.2cqw] h-[1.2cqw]" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">{CheckIc}</svg>
              {f.uiVerified}
            </span>
          </div>

          <div className="flex-1 min-h-0 flex flex-col bg-gradient-to-b from-slate-900 to-slate-800">
            {/* the per-org half — this is all that re-skins */}
            <div className="relative isolate h-[62%] shrink-0">
              {BRANDS.map((b, i) => (
                <div key={i} className="absolute inset-0 transition-opacity duration-700" style={{ opacity: brand === i ? 1 : 0 }}>
                  <BrandHeader b={b} i={i} />
                </div>
              ))}
              {/* constant annotations, hoisted out of the crossfade so they
                  never flicker with it */}
              {/* concentric with the avatar: it sits at left-2cqw, w-9cqw, centred on the 52% line */}
              <span className="absolute z-10 left-[1.3cqw] top-[52%] -translate-y-1/2 w-[10.4cqw] h-[10.4cqw] rounded-full border-[0.3cqw] border-dashed border-blue-400/60" />
              <Tag icon={LogoIc} label={f.uiLogo} className="left-[12.6cqw] top-[52%] -translate-y-[190%]" />
              <Tag icon={ImageIc} label={f.uiCover} className="right-[1.2cqw] top-[1.2cqw]" />
            </div>

            {/* The check-in card below. Identical for every warehouse: the colour
                scheme is one platform-wide setting, not a per-org choice — which
                is exactly why nothing here changes when the brand does. Text-free
                skeleton: this scene owns no strings for it. */}
            <div className="flex-1 min-h-0 p-[1.4cqw]">
              <div className="h-full rounded-[1.2cqw] border border-slate-700 bg-slate-800/70 overflow-hidden flex flex-col">
                <div className="flex items-center gap-[1cqw] px-[1.3cqw] py-[0.9cqw] shrink-0" style={{ background: HDR }}>
                  <span className="w-[2.6cqw] h-[2.6cqw] rounded-[0.7cqw] bg-white/20 text-white flex items-center justify-center [&_svg]:w-[1.5cqw] [&_svg]:h-[1.5cqw] shrink-0">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{ClipboardIc}</svg>
                  </span>
                  <span className="h-[0.9cqw] w-[26%] rounded-full bg-white/55" />
                </div>
                {/* the form runs past the fold, as it does in a real viewport —
                    the last row clipping is the browser, not a cut-off mockup */}
                <div className="flex-1 min-h-0 p-[1.4cqw] grid grid-cols-2 gap-x-[1.4cqw] gap-y-[1.1cqw] content-start overflow-hidden">
                  <SkelField w="52%" />
                  <SkelField w="38%" />
                  <SkelField w="44%" />
                  <SkelField w="60%" />
                  <SkelField w="48%" />
                  <SkelField w="35%" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ---------- RIGHT: the device credentials that open the gate ---------- */}
      <div className="w-[36%] shrink-0 flex flex-col min-h-0">
        <div className="rounded-[1.4cqw] border border-slate-700 bg-slate-900/70 shrink-0 overflow-hidden">
          <div className="flex items-center gap-[1cqw] px-[1.3cqw] py-[1cqw] border-b border-slate-700/70 bg-slate-800/60">
            <span className="w-[2.6cqw] h-[2.6cqw] rounded-[0.7cqw] bg-cyan-500/15 text-cyan-300 flex items-center justify-center [&_svg]:w-[1.7cqw] [&_svg]:h-[1.7cqw] shrink-0">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">{ChipIc}</svg>
            </span>
            <span className="font-bold text-white text-[1.5cqw] truncate">{f.uiApi}</span>
          </div>

          <div className="p-[1.3cqw] flex flex-col gap-[1.1cqw]">
            {/* Device API Key — one per organization, shared by every gate.
                Masked in the real format: org_ + 32 hex. */}
            <span className="flex flex-col gap-[0.5cqw]">
              <span className="text-[1.1cqw] uppercase tracking-wide text-slate-500 font-semibold">{f.uiKey}</span>
              <span
                className="flex items-center gap-[0.8cqw] rounded-[0.8cqw] border bg-[#0f1720] px-[1cqw] py-[0.7cqw] transition-colors duration-300"
                style={armed ? { borderColor: "#2563eb", boxShadow: "0 0 0 0.25cqw rgba(37,99,235,0.25)" } : { borderColor: "#334155" }}
              >
                <svg viewBox="0 0 24 24" className={`w-[1.4cqw] h-[1.4cqw] shrink-0 transition-colors duration-300 ${armed ? "text-blue-400" : "text-slate-500"}`} fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">{KeyIc}</svg>
                <span className="font-mono text-[1.05cqw] text-slate-200 truncate">org_4f3c1a9e••••••••••••••••b7d28f14</span>
                <svg viewBox="0 0 24 24" className="w-[1.4cqw] h-[1.4cqw] ml-auto text-slate-500 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">{CopyIc}</svg>
              </span>
            </span>

            {/* the one call the barrier depends on */}
            <span
              className="flex flex-col gap-[0.6cqw] rounded-[0.8cqw] border bg-[#0f1720] px-[1cqw] py-[0.9cqw] transition-colors duration-300"
              style={{ borderColor: phase === 2 ? "#2563eb" : "#334155" }}
            >
              <span className="font-mono text-[1.15cqw] font-semibold text-cyan-300 truncate">{f.uiEndpoint}</span>
              <span className="font-mono text-[1.05cqw] leading-relaxed text-slate-500">
                {"{"}
                <span className="block pl-[1.2cqw]"><span className="text-slate-400">&quot;gate_id&quot;</span>: <span className="text-sky-300">&quot;9c2e41a7&quot;</span>,</span>
                <span className={`block pl-[1.2cqw] rounded-[0.4cqw] transition-colors duration-300 ${armed ? "bg-blue-500/15" : ""}`}>
                  <span className="text-slate-400">&quot;api_key&quot;</span>: <span className="text-sky-300">&quot;org_4f3c1a9e…&quot;</span>,
                </span>
                <span className="block pl-[1.2cqw]"><span className="text-slate-400">&quot;checkin_code&quot;</span>: <span className="text-sky-300">&quot;a3f8c1d2&quot;</span></span>
                {"}"}
              </span>
              {/* the response the controller acts on */}
              <span className="flex items-center gap-[0.6cqw] h-[2cqw]">
                {open && (
                  <span
                    className="inline-flex items-center gap-[0.5cqw] rounded-full border border-green-500/40 bg-green-500/15 px-[0.9cqw] py-[0.3cqw] text-[1.05cqw] font-bold text-green-300 font-mono"
                    style={{ animation: "chpop 0.4s ease both" }}
                  >
                    <svg viewBox="0 0 24 24" className="w-[1.1cqw] h-[1.1cqw]" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">{CheckIc}</svg>
                    200 OK
                  </span>
                )}
              </span>
            </span>
          </div>
        </div>

        {/* The physical half: the QRGoBox controller hanging off that key, wired
            to the barrier. xMidYMin keeps the drawing pinned under the panel so
            the request wire reads as continuous. */}
        <div className="flex-1 min-h-0 mt-[0.6cqw]">
          <svg viewBox="0 0 300 250" className="w-full h-full" preserveAspectRatio="xMidYMin meet">
            <defs>
              <linearGradient id="wl8-ground" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1b2532" />
                <stop offset="100%" stopColor="#1b2532" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* The request wire between the credentials and the controller. The
                controller is mounted on the far side of the post, clear of the
                boom: raised to 70° the boom sweeps the whole upper-LEFT quadrant
                around the pivot, so anything left of x=244 above ground is in
                its path. */}
            <path d="M275 0V128" stroke="#334155" strokeWidth="2" strokeDasharray="5 5" />
            {phase === 2 && <circle className="wl8-up" cx="275" cy="126" r="4.5" fill="#60a5fa" />}
            {phase === 3 && <circle className="wl8-down" cx="275" cy="4" r="4.5" fill="#22c55e" />}

            {/* QRGoBox controller */}
            <path d="M290 128v-9" stroke="#475569" strokeWidth="2" />
            <circle cx="290" cy="117" r="2.6" fill="#475569" />
            <rect x="252" y="128" width="46" height="30" rx="4" fill="#1b2532" stroke="#334155" strokeWidth="1.5" />
            <rect x="256" y="132" width="38" height="22" rx="2" fill="#0f1720" />
            <circle className="wl8-led" cx="261" cy="138" r="2.6" fill="#22c55e" />
            {/* the relay LED — only green once the 200 comes back */}
            <circle cx="261" cy="148" r="2.6" fill={open ? "#22c55e" : "#475569"} style={{ transition: "fill 0.3s" }} />
            {[136, 142, 148].map((y) => <rect key={y} x="270" y={y} width="20" height="2" rx="1" fill="#334155" />)}

            {/* post + barrier */}
            <rect x="244" y="158" width="8" height="48" fill="#475569" />
            <rect x="236" y="204" width="24" height="6" rx="2" fill="#334155" />
            <g
              style={{
                transformBox: "fill-box",
                transformOrigin: "100% 50%",
                transform: open ? "rotate(70deg)" : "rotate(0deg)",
                transition: "transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            >
              <rect x="152" y="164" width="92" height="6" rx="3" fill="#e2e8f0" />
              {[158, 180, 202, 224].map((x) => <rect key={x} x={x} y="164" width="11" height="6" fill="#ef4444" />)}
              <circle cx="153" cy="167" r="3.4" fill="#ef4444" />
            </g>

            {/* ground */}
            <rect x="0" y="210" width="300" height="40" fill="url(#wl8-ground)" />
            <path d="M0 210h300" stroke="#334155" strokeWidth="1.5" />
            {[6, 44, 82, 120, 158, 196, 234, 272].map((x) => (
              <rect key={x} x={x} y="226" width="20" height="2.4" rx="1.2" fill="#334155" />
            ))}

            {/* the truck the gate opens for — plate matches the page language.
                It rolls through once the 200 comes back. */}
            <g
              style={{
                transformBox: "view-box",
                transform: open ? "translateX(26px)" : "translateX(0)",
                transition: "transform 0.9s ease-in-out 0.25s",
              }}
            >
              <rect x="30" y="160" width="76" height="42" rx="2" fill="#2d3a4d" stroke="#475569" strokeWidth="1.5" />
              <rect x="106" y="174" width="34" height="28" rx="3" fill="#243040" stroke="#475569" strokeWidth="1.5" />
              <rect x="126" y="178" width="12" height="11" rx="2" fill="#0f1720" />
              <rect x="36" y="179" width="52" height="14" rx="2" fill="#f8fafc" />
              <text
                x="62" y="189.6" textAnchor="middle" textLength="46" lengthAdjust="spacingAndGlyphs"
                fill="#0f172a" style={{ fontSize: 9, fontWeight: 700, fontFamily: "ui-monospace, monospace" }}
              >
                {plate}
              </text>
              {[46, 92, 128].map((x) => (
                <circle key={x} cx={x} cy="204" r="6" fill="#0f1720" stroke="#475569" strokeWidth="1.5" />
              ))}
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
}
