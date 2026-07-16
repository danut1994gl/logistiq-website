"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { Translations } from "@/lib/i18n/translations";
import type { Locale } from "@/lib/i18n/config";
import { DRIVER_POOLS } from "./driverPools";

// White-Label (feature 8): the driver check-in page re-skinning to a customer's
// brand, and nothing else. Two panels, wired together.
//
// LEFT — the Basic Info side of Settings: the uploaded logo, the uploaded cover
// photo, the warehouse name + address, contact details, working hours, and the
// custom domain with its Verified pill. Each of these is a real per-org field
// (organizations.avatar_url / cover_url / name / address / settings.contact_info
// / working hours; custom_domain + custom_domain_verified behind the CNAME/A
// flow).
//
// RIGHT — qrgo.ro/[slug] as the driver sees it, wearing whatever the left panel
// currently holds. Three fictional warehouses take turns; per cycle the fields
// land one at a time (logo -> cover -> name/contact/hours -> domain verified) so
// a single watch shows the mechanic: edit a field, the driver page changes.
//
// The load-bearing honesty, and the whole reason the loop is built this way:
// EVERYTHING THAT IS NOT AN IMAGE OR A STRING STAYS PUT. The browser chrome, the
// address bar, and the blue check-in card header below the profile are byte-for-
// byte identical for all three brands, because the colour theme is NOT per-org —
// it is one platform-wide row (platform_settings.driver_theme, root-only, live
// value 'ocean-blue') applied to every warehouse at once. So there is no colour
// picker, no hex field, no brand-tinted header here; the customer's colour only
// ever reaches the page through artwork they uploaded themselves (logo + cover).
// The browser tab is drawn on purpose and never changes either: it reads
// "QRGO Driver" with our icon, on every custom domain.
//
// Nothing about QRGOBox, gates, barriers, device keys or any API appears here —
// those are separate pages, and the integrations audit forbids dressing any of
// it up as a customer-facing API.
//
// Client player: async loop + IntersectionObserver pause, static branded frame
// on reduced-motion. aria-hidden decorative.

// the real driver card header — bg-gradient-to-r from-theme-600 to-theme-700.
// Platform-wide, so it is drawn ONCE and shared by every brand below.
const HDR = "linear-gradient(to right, #2563eb, #1d4ed8)";

const SlidersIc = <><path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h10M18 18h2" /><circle cx="16" cy="6" r="2" /><circle cx="10" cy="12" r="2" /><circle cx="16" cy="18" r="2" /></>;
const EyeIc = <><path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></>;
const PinIc = <><path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11z" /><circle cx="12" cy="10" r="2.5" /></>;
const PhoneIc = <path d="M5 4h4l2 5-3 2a12 12 0 0 0 5 5l2-3 5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />;
const MailIc = <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></>;
const ClockIc = <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>;
const LockIc = <><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>;
const CheckIc = <path d="M4 12.5l5 5L20 6.5" />;
const GlobeIc = <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.6 3.8 5.7 3.8 9S14.5 18.4 12 21c-2.5-2.6-3.8-5.7-3.8-9S9.5 5.6 12 3z" /></>;
const UploadIc = <><path d="M12 16V4M7.5 8.5 12 4l4.5 4.5" /><path d="M4 16v2.5A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5V16" /></>;
const BuildingIc = <><path d="M4 21V6a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v15M15 21V10h3a2 2 0 0 1 2 2v9M2 21h20" /><path d="M8 8h3M8 12h3M8 16h3" /></>;
const ClipboardIc = <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2M9 12l1.5 1.5L14 10" />;

// --- the three customer brands -------------------------------------------
// Sample data, in the spirit of "London Warehouse" in AppTourScene: the logo
// mark and the cover photo are the customer's own artwork — the only place a
// customer's colour legitimately appears anywhere on the check-in page.
type Brand = {
  name: string;
  addr: string;
  phone: string;
  email: string;
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
    email: "info@nordwind-logistik.de",
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
    email: "info@vertexcargo.it",
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
    email: "info@meridiandepot.nl",
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
// so it never reads as "the page took my brand colour". `scope` keeps the
// gradient id unique between the settings thumbnail and the live preview.
function Cover({ b, i, scope }: { b: Brand; i: number; scope: string }) {
  const g = `br8-sky-${scope}-${i}`;
  return (
    <svg viewBox="0 0 300 110" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id={g} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={b.sky[0]} />
          <stop offset="100%" stopColor={b.sky[1]} />
        </linearGradient>
      </defs>
      <rect width="300" height="110" fill={`url(#${g})`} />
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

// the uploaded logo, in the real avatar treatment: a round crop of the
// customer's own mark on their own background
function Logo({ b, size, ring }: { b: Brand; size: string; ring?: boolean }) {
  return (
    <span
      className={`rounded-full overflow-hidden flex items-center justify-center shrink-0 transition-shadow duration-300 ${ring ? "shadow-[0_0_0_0.35cqw_rgba(96,165,250,0.9)]" : ""}`}
      style={{ width: size, height: size, background: b.logoBg }}
    >
      <svg viewBox="0 0 24 24" style={{ width: `calc(${size} * 0.55)`, height: `calc(${size} * 0.55)` }} fill={b.logoFg}>{b.mark}</svg>
    </span>
  );
}

// a settings row — glows while the operator is filling it in
function Row({ label, active, children }: { label?: string; active: boolean; children: ReactNode }) {
  return (
    <div
      className={`rounded-[0.9cqw] border px-[1cqw] py-[0.75cqw] transition-colors duration-300 ${
        active ? "border-blue-500/80 bg-blue-500/10" : "border-slate-700/70 bg-slate-900/40"
      }`}
    >
      {label && (
        <span className={`block text-[1.05cqw] font-semibold uppercase tracking-wide mb-[0.5cqw] transition-colors duration-300 ${active ? "text-blue-300" : "text-slate-500"}`}>
          {label}
        </span>
      )}
      {children}
    </div>
  );
}

// an input-looking field on the settings side
function Field({ icon, children, mono }: { icon: ReactNode; children: ReactNode; mono?: boolean }) {
  return (
    <span className="flex items-center gap-[0.6cqw] rounded-[0.6cqw] border border-slate-700 bg-[#0f1720] px-[0.8cqw] py-[0.5cqw] min-w-0">
      <svg viewBox="0 0 24 24" className="w-[1.3cqw] h-[1.3cqw] shrink-0 text-slate-500" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">{icon}</svg>
      <span className={`text-[1.15cqw] text-slate-200 truncate ${mono ? "font-mono" : ""}`}>{children}</span>
    </span>
  );
}

// a skeleton form field on the constant (platform-themed) check-in card
function SkelField({ w }: { w: string }) {
  return (
    <span className="flex flex-col gap-[0.5cqw]">
      <span className="h-[0.7cqw] rounded-full bg-slate-600" style={{ width: w }} />
      <span className="h-[2.4cqw] rounded-[0.7cqw] bg-slate-900/60 border border-slate-700" />
    </span>
  );
}

export function WhiteLabelScene({ t, locale }: { t: Translations; locale: Locale }) {
  const f = t.f8Page;
  // the truck in the preview's check-in form — plate matches the page language
  const plate = DRIVER_POOLS[locale][0].plate;

  // cur = the warehouse being configured; step = how far its config has landed.
  // 0 nothing yet (page still shows the previous brand) · 1 logo · 2 cover ·
  // 3 name + contact + hours · 4 domain verified, hold.
  // Initial state IS the reduced-motion / SSR frame: brand 0, fully branded.
  const [{ cur, step }, setS] = useState({ cur: 0, step: 4 });
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let cancelled = false, visible = true;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0.15 });
    if (rootRef.current) io.observe(rootRef.current);
    const sleep = (ms: number) => new Promise<void>((res) => { const s = Date.now(); const tick = () => { if (cancelled) return res(); if (visible && Date.now() - s >= ms) return res(); setTimeout(tick, visible ? 90 : 150); }; setTimeout(tick, 90); });
    (async () => {
      await sleep(1800);
      let c = 0;
      while (!cancelled) {
        c = (c + 1) % BRANDS.length;
        setS({ cur: c, step: 0 });   // next warehouse opens Basic Info — page unchanged so far
        await sleep(750);
        for (const st of [1, 2, 3, 4]) {
          if (cancelled) return;
          setS({ cur: c, step: st });
          await sleep(st === 4 ? 2600 : 950);
        }
      }
    })();
    return () => { cancelled = true; io.disconnect(); };
  }, []);

  const prev = (cur - 1 + BRANDS.length) % BRANDS.length;
  // each part of the page flips to the new brand the moment its field lands
  const iLogo = step >= 1 ? cur : prev;
  const iCover = step >= 2 ? cur : prev;
  const iInfo = step >= 3 ? cur : prev;
  const verified = step >= 4;
  const bLogo = BRANDS[iLogo];
  const bInfo = BRANDS[iInfo];

  return (
    <div ref={rootRef} className="@container absolute inset-0 p-[2cqw] flex gap-[2cqw] text-slate-200 select-none" aria-hidden="true">
      {/* ---------- LEFT: Basic Info — the fields a warehouse manager fills in ---------- */}
      <div className="w-[37%] shrink-0 flex flex-col gap-[1cqw] min-h-0">
        <div className="flex items-center gap-[0.9cqw] shrink-0 px-[0.3cqw]">
          <span className="w-[2.6cqw] h-[2.6cqw] rounded-[0.7cqw] bg-blue-500/15 text-blue-300 flex items-center justify-center [&_svg]:w-[1.6cqw] [&_svg]:h-[1.6cqw] shrink-0">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{SlidersIc}</svg>
          </span>
          <span className="font-bold text-white text-[1.6cqw] truncate">{f.uiBranding}</span>
        </div>

        <div className="flex-1 min-h-0 rounded-[1.4cqw] border border-slate-700 bg-slate-900/70 p-[1.1cqw] flex flex-col gap-[1cqw] overflow-hidden">
          {/* logo upload */}
          <Row label={f.uiLogo} active={step === 1}>
            <span className="flex items-center gap-[1cqw]">
              <span key={iLogo} className="br8-pop flex">
                <Logo b={bLogo} size="5.2cqw" />
              </span>
              <span className="flex-1 h-[2.6cqw] rounded-[0.6cqw] border border-dashed border-slate-600 flex items-center justify-center text-slate-500">
                <svg viewBox="0 0 24 24" className="w-[1.5cqw] h-[1.5cqw]" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">{UploadIc}</svg>
              </span>
            </span>
          </Row>

          {/* cover upload */}
          <Row label={f.uiCover} active={step === 2}>
            <span className="relative isolate block h-[5.4cqw] rounded-[0.6cqw] overflow-hidden border border-slate-700">
              {BRANDS.map((b, i) => (
                <span key={i} className="absolute inset-0 transition-opacity duration-500" style={{ opacity: iCover === i ? 1 : 0 }}>
                  <Cover b={b} i={i} scope="thumb" />
                </span>
              ))}
            </span>
          </Row>

          {/* name + address */}
          <Row active={step === 3}>
            <span className="flex flex-col gap-[0.5cqw]">
              <Field icon={BuildingIc}>{bInfo.name}</Field>
              <Field icon={PinIc}>{bInfo.addr}</Field>
            </span>
          </Row>

          {/* contact */}
          <Row label={f.uiContact} active={step === 3}>
            <span className="flex flex-col gap-[0.5cqw]">
              <Field icon={PhoneIc}>{bInfo.phone}</Field>
              <Field icon={MailIc}>{bInfo.email}</Field>
            </span>
          </Row>

          {/* working hours */}
          <Row label={f.uiHours} active={step === 3}>
            <Field icon={ClockIc}>{bInfo.hours}</Field>
          </Row>

          {/* custom domain + the Verify Domain result */}
          <Row active={step === 4}>
            <span className="flex items-center gap-[0.8cqw] min-w-0">
              <span className="flex-1 min-w-0">
                <Field icon={GlobeIc} mono>{f.uiDomain}</Field>
              </span>
              <span className="w-[7.6cqw] shrink-0 flex justify-end">
                {verified && (
                  <span className="br8-pop inline-flex items-center gap-[0.4cqw] rounded-full border border-green-500/40 bg-green-500/15 px-[0.7cqw] py-[0.3cqw] text-[1.05cqw] font-semibold text-green-300 whitespace-nowrap">
                    <svg viewBox="0 0 24 24" className="w-[1.1cqw] h-[1.1cqw]" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">{CheckIc}</svg>
                    {f.uiVerified}
                  </span>
                )}
              </span>
            </span>
          </Row>
        </div>
      </div>

      {/* ---------- RIGHT: the driver's view of the same warehouse ---------- */}
      <div className="flex-1 min-w-0 flex flex-col gap-[1cqw]">
        <div className="flex items-center gap-[0.9cqw] shrink-0 px-[0.3cqw]">
          <span className="w-[2.6cqw] h-[2.6cqw] rounded-[0.7cqw] bg-cyan-500/15 text-cyan-300 flex items-center justify-center [&_svg]:w-[1.6cqw] [&_svg]:h-[1.6cqw] shrink-0">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{EyeIc}</svg>
          </span>
          <span className="font-bold text-white text-[1.6cqw] truncate">{f.uiPreview}</span>
        </div>

        <div className="relative isolate flex-1 min-h-0 rounded-[1.4cqw] border border-slate-700 bg-[#0f1720] overflow-hidden flex flex-col shadow-2xl">
          {/* Browser chrome — identical on every domain, for every brand. The tab
              is drawn on purpose: it stays "QRGO Driver" with our icon even when
              the address bar carries the customer's own domain. */}
          <div className="flex items-center gap-[0.8cqw] px-[1cqw] pt-[0.8cqw] bg-[#1b2532] shrink-0">
            <span className="flex items-center gap-[0.5cqw] shrink-0">
              {["#ef4444", "#f59e0b", "#22c55e"].map((c) => (
                <span key={c} className="w-[0.75cqw] h-[0.75cqw] rounded-full" style={{ background: c }} />
              ))}
            </span>
            <span className="flex items-center gap-[0.6cqw] rounded-t-[0.7cqw] border-t border-x border-slate-700 bg-[#243040] px-[1cqw] py-[0.5cqw] -mb-px">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/qrgo-icon.svg" alt="" className="w-[1.3cqw] h-[1.3cqw] rounded-[0.25cqw] bg-white p-[0.1cqw]" />
              <span className="text-[1.15cqw] font-medium text-slate-300 whitespace-nowrap">QRGO Driver</span>
            </span>
          </div>
          <div className="flex items-center gap-[1cqw] px-[1cqw] py-[0.7cqw] bg-[#243040] border-b border-slate-700 shrink-0">
            <span className="flex-1 min-w-0 flex items-center gap-[0.7cqw] rounded-full bg-[#0f1720] border border-slate-700 px-[1cqw] py-[0.4cqw]">
              <svg viewBox="0 0 24 24" className="w-[1.2cqw] h-[1.2cqw] text-green-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{LockIc}</svg>
              <span className="text-[1.3cqw] font-medium text-slate-100 font-mono truncate">{f.uiDomain}</span>
            </span>
          </div>

          <div className="flex-1 min-h-0 flex flex-col bg-gradient-to-b from-slate-900 to-slate-800">
            {/* the ProfileHeader — the only half that re-skins */}
            <div className="relative isolate shrink-0">
              <div className="relative isolate h-[13cqw] overflow-hidden">
                {BRANDS.map((b, i) => (
                  <div key={i} className="absolute inset-0 transition-opacity duration-700" style={{ opacity: iCover === i ? 1 : 0 }}>
                    <Cover b={b} i={i} scope="page" />
                  </div>
                ))}
                <span className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
                {/* which field is landing right now */}
                <span
                  className="absolute inset-0 z-10 border-[0.3cqw] border-blue-400/80 transition-opacity duration-300 pointer-events-none"
                  style={{ opacity: step === 2 ? 1 : 0 }}
                />
              </div>

              <div className="relative isolate bg-slate-800/80 px-[2cqw] pb-[1.1cqw]">
                {/* the uploaded logo: round crop, thick page-coloured ring, overlapping the cover */}
                <span key={iLogo} className="br8-pop absolute z-10 -top-[4cqw] left-[2cqw] rounded-full border-[0.6cqw] border-slate-800 flex">
                  <Logo b={bLogo} size="8cqw" ring={step === 1} />
                </span>
                <div key={iInfo} className="br8-in pt-[5.2cqw] flex flex-col gap-[0.45cqw] min-w-0">
                  <span className="text-white font-bold text-[2cqw] truncate">{bInfo.name}</span>
                  <span className="flex items-center gap-[0.7cqw] text-slate-400 text-[1.25cqw] min-w-0">
                    <svg viewBox="0 0 24 24" className="w-[1.35cqw] h-[1.35cqw] shrink-0" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">{PinIc}</svg>
                    <span className="truncate">{bInfo.addr}</span>
                  </span>
                  {/* contact_info + working hours. theme-600 links on the real page;
                      blue-400 here, the only tone that clears AA on dark. */}
                  <span className="flex items-center gap-[1.6cqw] pt-[0.3cqw] text-[1.2cqw] font-medium text-blue-400 min-w-0">
                    <span className="flex items-center gap-[0.5cqw] shrink-0">
                      <svg viewBox="0 0 24 24" className="w-[1.3cqw] h-[1.3cqw]" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">{PhoneIc}</svg>
                      {bInfo.phone}
                    </span>
                    <span className="flex items-center gap-[0.5cqw] min-w-0">
                      <svg viewBox="0 0 24 24" className="w-[1.3cqw] h-[1.3cqw] shrink-0" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">{MailIc}</svg>
                      <span className="truncate">{bInfo.email}</span>
                    </span>
                    <span className="flex items-center gap-[0.5cqw] shrink-0 text-slate-300">
                      <svg viewBox="0 0 24 24" className="w-[1.3cqw] h-[1.3cqw]" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">{ClockIc}</svg>
                      {bInfo.hours}
                    </span>
                  </span>
                </div>
                {/* the name/contact/hours block landing */}
                <span
                  className="absolute z-0 inset-x-[1.4cqw] top-[4.4cqw] bottom-[0.5cqw] rounded-[0.8cqw] border-[0.25cqw] border-blue-400/80 transition-opacity duration-300 pointer-events-none"
                  style={{ opacity: step === 3 ? 1 : 0 }}
                />
              </div>
            </div>

            {/* The check-in card. Identical for every warehouse — the colour theme
                is one platform-wide setting, not a per-org choice, which is
                exactly why nothing here moves when the brand does. Skeleton
                fields: this scene owns no strings for the form. */}
            <div className="flex-1 min-h-0 p-[1.2cqw]">
              <div className="h-full rounded-[1.2cqw] border border-slate-700 bg-slate-800/70 overflow-hidden flex flex-col">
                <div className="flex items-center gap-[1cqw] px-[1.3cqw] py-[0.85cqw] shrink-0" style={{ background: HDR }}>
                  <span className="w-[2.4cqw] h-[2.4cqw] rounded-[0.6cqw] bg-white/20 text-white flex items-center justify-center [&_svg]:w-[1.4cqw] [&_svg]:h-[1.4cqw] shrink-0">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{ClipboardIc}</svg>
                  </span>
                  <span className="h-[0.85cqw] w-[24%] rounded-full bg-white/55" />
                </div>
                {/* the form runs past the fold, as it does in a real viewport — the
                    last row clipping is the browser, not a cut-off mockup */}
                <div className="flex-1 min-h-0 p-[1.3cqw] grid grid-cols-2 gap-x-[1.3cqw] gap-y-[1cqw] content-start overflow-hidden">
                  <span className="flex flex-col gap-[0.5cqw]">
                    <span className="h-[0.7cqw] w-[46%] rounded-full bg-slate-600" />
                    <span className="h-[2.4cqw] rounded-[0.7cqw] bg-slate-900/60 border border-slate-700 flex items-center px-[0.8cqw] text-[1.15cqw] font-mono font-semibold text-slate-200">
                      {plate}
                    </span>
                  </span>
                  <SkelField w="38%" />
                  <SkelField w="52%" />
                  <SkelField w="44%" />
                  <SkelField w="60%" />
                  <SkelField w="35%" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
