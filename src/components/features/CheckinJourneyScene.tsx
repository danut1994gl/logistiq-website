import { QRCodeSVG } from "@/components/mockups/QRCodeSVG";

// 3-scene animated check-in journey (parking → phone close-up backdrop →
// gate & ramp). Decorative: the step cards carry the full story as text.
// One shared 27s CSS timeline (cj2-* classes in globals.css, NO
// animation-delay anywhere — the scene-jump controller seeks every animation
// to the same currentTime). Base (unanimated) styles compose the scene-3 end
// state, which is the prefers-reduced-motion static frame. Server Component.

// European articulated semi (cab-over tractor + semi-trailer), side view,
// drawn once and reused (hero + parked variants). The trailer overhangs the
// tractor frame (fifth-wheel coupling): rear axles clustered at the trailer's
// tail, landing gear mid-front, tractor rear axle under the trailer nose.
// Local coords: trailer x0–178, cab x186–247 (nose = 247, mirror to 254),
// wheels cy=331, ground contact y=344.
function TruckArt({ variant = "hero" }: { variant?: "hero" | "parked" }) {
  return (
    <g className={variant === "parked" ? "cj2-parked" : undefined}>
      {/* semi-trailer box: clean panels, brand stripe, brake light, hinges */}
      <rect x="0" y="224" width="178" height="90" rx="6" fill="url(#cj2-trailer)" />
      {[36, 72, 108, 144].map((x) => (
        <line key={x} x1={x} y1="232" x2={x} y2="306" className="stroke-slate-500" strokeWidth="1.5" opacity="0.3" />
      ))}
      <rect x="14" y="238" width="56" height="9" rx="4.5" className="fill-blue-500" />
      <rect x="1" y="227" width="3" height="8" rx="1.5" className="cj2-brake fill-red-500" />
      <rect x="2" y="248" width="4" height="10" rx="1" className="fill-slate-400" />
      <rect x="2" y="278" width="4" height="10" rx="1" className="fill-slate-400" />
      {/* under-frame, side skirt, landing gear (support legs) */}
      <rect x="8" y="314" width="162" height="5" className="fill-slate-800" />
      <rect x="76" y="316" width="44" height="8" rx="3" className="fill-slate-700" />
      <rect x="128" y="314" width="5" height="22" className="fill-slate-500" />
      <rect x="124" y="336" width="13" height="4" rx="1.5" className="fill-slate-600" />
      {/* trailer rear axles (clustered at the tail) + mudflap */}
      <rect x="66" y="330" width="9" height="13" className="fill-slate-900" />
      {/* tractor frame + full-length side skirt (wheel to wheel) */}
      <rect x="150" y="314" width="92" height="7" className="fill-slate-800" />
      <rect x="152" y="318" width="95" height="13" rx="3" className="fill-blue-700" />
      {/* exhaust stack in the cab–trailer gap */}
      <rect x="180" y="250" width="4" height="60" rx="2" className="fill-slate-500" />
      {/* cab-over tractor (body at trailer level, wheels exposed below) */}
      <path d="M186 318 V250 Q186 238 198 238 H226 Q240 238 244 250 L246 260 Q247 263 247 267 V318 Z" fill="url(#cj2-cab)" />
      <path d="M188 238 L194 226 Q195 224 198 224 H212 Q215 224 216 226 L222 238 Z" className="fill-blue-700" />
      {/* one-piece wrap-around glass */}
      <path d="M200 246 H228 Q238 246 241 254 L243 262 Q244 266 240 266 H200 Q194 266 194 260 V252 Q194 246 200 246 Z" className="fill-cyan-200" opacity="0.85" />
      {/* forward-mounted mirror */}
      <line x1="240" y1="244" x2="248" y2="238" className="stroke-slate-400" strokeWidth="2" />
      <rect x="246" y="234" width="5" height="13" rx="2.5" className="fill-slate-500" />
      {/* LED strip + headlight on the front face */}
      <rect x="239" y="300" width="8" height="3" rx="1.5" className="fill-slate-100" opacity="0.9" />
      <rect x="239" y="306" width="8" height="5" rx="2" className="fill-amber-300" />
      {/* wheels: trailer tail pair, tractor rear (under trailer) + front */}
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

export function CheckinJourneyScene({
  dockLabel,
  scanLine1,
  scanLine2,
}: {
  dockLabel: string;
  scanLine1: string;
  scanLine2: string;
}) {
  return (
    <svg viewBox="0 0 1200 400" className="w-full h-full block" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <defs>
        <linearGradient id="cj2-trailer" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#64748b" />
          <stop offset="1" stopColor="#475569" />
        </linearGradient>
        <linearGradient id="cj2-cab" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3b82f6" />
          <stop offset="1" stopColor="#1d4ed8" />
        </linearGradient>
      </defs>

      {/* ambient glows (shared by all scenes) */}
      <circle cx="180" cy="90" r="100" className="fill-blue-600" opacity="0.08" />
      <circle cx="1020" cy="70" r="80" className="fill-cyan-500" opacity="0.07" />

      {/* ============ Scene 1 — truck parking ============ */}
      <g className="cj2-s1">
        <rect x="0" y="318" width="1200" height="50" className="fill-slate-800" opacity="0.6" />
        {[250, 530, 810, 1090].map((x) => (
          <line key={x} x1={x} y1="326" x2={x} y2="362" className="stroke-slate-300" strokeWidth="3" opacity="0.5" strokeDasharray="10 8" />
        ))}
        {/* light poles */}
        {[150, 980].map((x) => (
          <g key={x} opacity="0.75">
            <rect x={x} y="180" width="5" height="164" className="fill-slate-600" />
            <rect x={x - 20} y="172" width="46" height="8" rx="4" className="fill-slate-500" />
            <ellipse cx={x + 3} cy="186" rx="30" ry="9" className="fill-amber-200" opacity="0.12" />
          </g>
        ))}
        {/* check-in signboard over slot 2: QR + localized "scan to check in" */}
        <rect x="570" y="214" width="6" height="130" className="fill-slate-600" />
        <rect x="754" y="214" width="6" height="130" className="fill-slate-600" />
        <rect x="548" y="138" width="234" height="76" rx="10" className="fill-slate-800 stroke-slate-600" strokeWidth="2" />
        <svg x="564" y="150" width="52" height="52">
          <QRCodeSVG />
        </svg>
        <text x="630" y="170" className="fill-white" style={{ fontSize: 13, fontWeight: 700 }}>
          {scanLine1}
        </text>
        <text x="630" y="190" className="fill-slate-400" style={{ fontSize: 11.5, fontWeight: 500 }}>
          {scanLine2}
        </text>
        <circle cx="590" cy="176" r="30" className="cj2-signpulse stroke-cyan-400" fill="none" strokeWidth="2" />
        {/* parked trucks (slots 1 and 3), hero parks in slot 2 */}
        <g transform="translate(270 0)"><TruckArt variant="parked" /></g>
        <g transform="translate(830 0)"><TruckArt variant="parked" /></g>
        <g className="cj2-truck1"><TruckArt /></g>
      </g>

      {/* ============ Scene 2 — driver close-up backdrop ============ */}
      {/* (the large phone itself is an HTML overlay on top of this SVG) */}
      <g className="cj2-s2">
        <g opacity="0.14">
          <rect x="0" y="318" width="1200" height="50" className="fill-slate-800" />
          <g transform="translate(40 0)"><TruckArt variant="parked" /></g>
          <g transform="translate(930 0)"><TruckArt variant="parked" /></g>
        </g>
        {/* driver, facing left toward the phone */}
        <g transform="translate(-52 0)">
          <rect x="742" y="278" width="13" height="60" rx="4" className="fill-slate-800" />
          <rect x="760" y="278" width="13" height="60" rx="4" className="fill-slate-700" />
          <rect x="736" y="336" width="20" height="8" rx="3" className="fill-slate-900" />
          <rect x="756" y="336" width="20" height="8" rx="3" className="fill-slate-900" />
          {/* hi-vis vest + reflective stripes */}
          <rect x="734" y="212" width="46" height="70" rx="12" className="fill-amber-400" />
          <rect x="734" y="230" width="46" height="6" className="fill-slate-100" opacity="0.9" />
          <rect x="734" y="252" width="46" height="6" className="fill-slate-100" opacity="0.9" />
          {/* extended arm + hand toward the phone */}
          <path d="M738 224 Q712 228 696 240" className="stroke-slate-600" fill="none" strokeWidth="11" strokeLinecap="round" />
          <circle cx="694" cy="242" r="6" fill="#f1c27d" />
          {/* head + cap (brim toward the phone) */}
          <circle cx="757" cy="192" r="15" fill="#f1c27d" />
          <path d="M742 190 A15 15 0 0 1 772 190 L772 184 Q771 176 763 175 L751 175 Q743 176 742 184 Z" className="fill-blue-600" />
          <rect x="732" y="186" width="18" height="5" rx="2.5" className="fill-blue-700" />
        </g>
      </g>

      {/* ============ Scene 3 — gate, barrier, docks ============ */}
      <g className="cj2-s3">
        <rect x="0" y="344" width="1200" height="24" className="fill-slate-800" />
        <line x1="0" y1="356" x2="1200" y2="356" className="stroke-slate-600" strokeWidth="3" strokeDasharray="24 18" />
        {/* warehouse, canopy, numbered docks */}
        <rect x="780" y="120" width="400" height="224" rx="4" className="fill-slate-800 stroke-slate-700" strokeWidth="2" />
        <rect x="780" y="120" width="400" height="10" className="fill-blue-600" />
        <image href="/banner-nav.svg" x="880" y="132" width="200" height="50" opacity="0.9" />
        <rect x="770" y="196" width="420" height="12" rx="3" className="fill-slate-600" />
        <rect x="792" y="208" width="5" height="20" className="fill-slate-600" />
        <rect x="1166" y="208" width="5" height="20" className="fill-slate-600" />
        {[
          { x: 800, n: "10" },
          { x: 930, n: "11" },
          { x: 1060, n: "12" },
        ].map((d) => (
          <g key={d.n}>
            <rect x={d.x} y="224" width="90" height="120" className="fill-slate-700 stroke-slate-600" strokeWidth="2" />
            {[248, 272, 296, 320].map((y) => (
              <line key={y} x1={d.x + 5} y1={y} x2={d.x + 85} y2={y} className="stroke-slate-600" strokeWidth="2" />
            ))}
            <text x={d.x + 45} y="219" textAnchor="middle" className="fill-slate-400" style={{ fontSize: 15, fontWeight: 700 }}>
              {d.n}
            </text>
          </g>
        ))}
        {/* dock 12 highlight */}
        <rect x="1060" y="224" width="90" height="120" className="cj2-dockglow stroke-emerald-400" fill="none" strokeWidth="3" />
        {/* booth */}
        <rect x="646" y="252" width="64" height="92" rx="4" className="fill-slate-800 stroke-slate-700" strokeWidth="2" />
        <rect x="640" y="246" width="76" height="8" rx="3" className="fill-slate-600" />
        <rect x="658" y="266" width="40" height="24" rx="3" className="fill-cyan-900" opacity="0.55" />
        {/* gate scanner terminal on the driver's side lane — drawn BEFORE the
            truck so the passing truck covers it (device sits behind/left of
            the truck as it enters the gate) */}
        <rect x="620" y="300" width="6" height="44" className="fill-slate-600" />
        <rect x="604" y="256" width="38" height="50" rx="6" className="fill-slate-800 stroke-slate-600" strokeWidth="2" />
        <rect x="610" y="264" width="26" height="16" rx="3" className="fill-cyan-950" />
        <rect x="613" y="270" width="20" height="3" rx="1.5" className="fill-cyan-400" opacity="0.8" />
        <rect x="610" y="288" width="26" height="10" rx="3" className="fill-cyan-500" opacity="0.18" />
        <rect x="610" y="288" width="26" height="10" rx="3" className="stroke-cyan-400" fill="none" strokeWidth="1.5" />
        {/* hero truck: stops short of the scanner, then docks at ramp 12 */}
        <g className="cj2-truck3"><TruckArt /></g>
        {/* driver's phone tapping the scanner + confirmation pulse */}
        <g className="cj2-gatephone">
          <rect x="592" y="282" width="17" height="30" rx="4" className="fill-slate-900 stroke-slate-500" strokeWidth="1.5" />
          <rect x="595" y="286" width="11" height="19" rx="2" className="fill-cyan-400" opacity="0.7" />
          <line x1="604" y1="293" x2="609" y2="293" className="stroke-cyan-400" strokeWidth="2" strokeDasharray="2 2" />
        </g>
        <circle cx="623" cy="293" r="12" className="cj2-gatepulse stroke-cyan-400" fill="none" strokeWidth="2" />
        {/* barrier (post + arm, base = up) */}
        <rect x="714" y="294" width="11" height="50" rx="2" className="fill-slate-600" />
        <g transform="translate(720 300)">
          <g className="cj2-barrier">
            <rect x="4" y="-6" width="168" height="12" rx="6" className="fill-slate-200" />
            {[24, 64, 104, 144].map((x) => (
              <rect key={x} x={x} y="-6" width="20" height="12" className="fill-blue-600" />
            ))}
            <circle cx="166" cy="0" r="4" className="fill-emerald-400" />
          </g>
        </g>
        {/* assigned badge — drawn last so it floats over the docked truck */}
        <g className="cj2-badge">
          <rect x="1053" y="238" width="104" height="30" rx="15" className="fill-blue-600" />
          <text x="1105" y="258" textAnchor="middle" className="fill-white" style={{ fontSize: 14, fontWeight: 700, letterSpacing: 1 }}>
            {dockLabel}
          </text>
        </g>
      </g>
    </svg>
  );
}
