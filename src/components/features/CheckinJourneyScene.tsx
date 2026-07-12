import { QRCodeSVG } from "@/components/mockups/QRCodeSVG";

// 3-scene animated check-in journey (parking → phone close-up backdrop →
// gate & ramp). Decorative: the step cards carry the full story as text.
// One shared 27s CSS timeline (cj2-* classes in globals.css, NO
// animation-delay anywhere — the scene-jump controller seeks every animation
// to the same currentTime). Base (unanimated) styles compose the scene-3 end
// state, which is the prefers-reduced-motion static frame. Server Component.

// Detailed side-view truck, drawn once and reused (hero + parked variants).
// Local coords: trailer x0–160, cab x178–248 (nose = 248), wheels cy=331,
// ground contact y=344.
function TruckArt({ variant = "hero" }: { variant?: "hero" | "parked" }) {
  return (
    <g className={variant === "parked" ? "cj2-parked" : undefined}>
      {/* trailer box, ribs, rear-door hinges */}
      <rect x="0" y="240" width="160" height="78" rx="4" fill="url(#cj2-trailer)" className="stroke-slate-500" strokeWidth="1.5" />
      {[14, 28, 42, 56, 70, 84, 98, 112, 126, 140].map((x) => (
        <line key={x} x1={x} y1="246" x2={x} y2="312" className="stroke-slate-500" strokeWidth="1" opacity="0.35" />
      ))}
      <rect x="2" y="252" width="4" height="10" rx="1" className="fill-slate-400" />
      <rect x="2" y="278" width="4" height="10" rx="1" className="fill-slate-400" />
      <rect x="1" y="242" width="3" height="7" rx="1" className="cj2-brake fill-red-500" />
      <rect x="14" y="254" width="58" height="9" rx="4.5" className="fill-blue-500" />
      {/* side skirt + mudflaps */}
      <rect x="10" y="318" width="112" height="9" rx="3" className="fill-slate-700" />
      <rect x="72" y="330" width="9" height="13" className="fill-slate-900" />
      <rect x="186" y="330" width="8" height="13" className="fill-slate-900" />
      {/* chassis, coupling, fuel tank, exhaust */}
      <rect x="156" y="304" width="26" height="10" className="fill-slate-700" />
      <rect x="160" y="314" width="82" height="7" className="fill-slate-800" />
      <rect x="184" y="320" width="32" height="13" rx="6" className="fill-slate-500" />
      <rect x="190" y="320" width="3" height="13" className="fill-slate-600" />
      <rect x="204" y="320" width="3" height="13" className="fill-slate-600" />
      <rect x="173" y="248" width="5" height="62" rx="2" className="fill-slate-500" />
      {/* cab + roof deflector */}
      <path d="M180 344 V254 Q180 246 188 246 H216 Q224 246 229 252 L244 274 Q248 280 248 287 V344 Z" fill="url(#cj2-cab)" />
      <path d="M180 246 L188 231 Q190 228 194 228 H206 Q210 228 212 231 L218 246 Z" className="fill-blue-700" />
      {/* glazing */}
      <path d="M188 254 H208 V276 H188 Q186 276 186 274 V256 Q186 254 188 254 Z" className="fill-cyan-200" opacity="0.75" />
      <path d="M214 254 Q220 254 224 259 L236 276 H214 Z" className="fill-cyan-100" opacity="0.6" />
      {/* door seam, handle, mirror */}
      <line x1="212" y1="252" x2="212" y2="322" className="stroke-blue-800" strokeWidth="1.5" />
      <rect x="200" y="288" width="9" height="3" rx="1.5" className="fill-blue-900" />
      <line x1="216" y1="254" x2="224" y2="247" className="stroke-slate-400" strokeWidth="2" />
      <rect x="222" y="240" width="5" height="11" rx="2" className="fill-slate-600" />
      {/* grille, headlight, bumper, entry step */}
      <rect x="240" y="300" width="8" height="20" rx="2" className="fill-slate-300" opacity="0.9" />
      <line x1="241" y1="305" x2="247" y2="305" className="stroke-slate-500" strokeWidth="1.5" />
      <line x1="241" y1="310" x2="247" y2="310" className="stroke-slate-500" strokeWidth="1.5" />
      <line x1="241" y1="315" x2="247" y2="315" className="stroke-slate-500" strokeWidth="1.5" />
      <rect x="242" y="324" width="6" height="7" rx="2" className="fill-amber-300" />
      <rect x="234" y="334" width="16" height="10" rx="3" className="fill-slate-600" />
      <rect x="214" y="328" width="14" height="4" rx="1" className="fill-slate-600" />
      <rect x="216" y="336" width="10" height="4" rx="1" className="fill-slate-700" />
      {/* axles */}
      {[34, 62, 196, 232].map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy="331" r="13" className="fill-slate-900 stroke-slate-600" strokeWidth="2.5" />
          <circle cx={cx} cy="331" r="7" className="fill-slate-500" />
          <circle cx={cx} cy="331" r="2.5" className="fill-slate-300" />
        </g>
      ))}
    </g>
  );
}

export function CheckinJourneyScene({ dockLabel }: { dockLabel: string }) {
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
        <text x="980" y="164" textAnchor="middle" className="fill-slate-500" style={{ fontSize: 20, fontWeight: 700, letterSpacing: 6 }}>
          LOGISTIQ
        </text>
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
        {/* dock 12 highlight + assigned badge */}
        <rect x="1060" y="224" width="90" height="120" className="cj2-dockglow stroke-emerald-400" fill="none" strokeWidth="3" />
        <g className="cj2-badge">
          <rect x="1053" y="166" width="104" height="30" rx="15" className="fill-blue-600" />
          <text x="1105" y="186" textAnchor="middle" className="fill-white" style={{ fontSize: 14, fontWeight: 700, letterSpacing: 1 }}>
            {dockLabel}
          </text>
        </g>
        {/* gate QR post + scan pulse */}
        <rect x="622" y="300" width="5" height="44" className="fill-slate-600" />
        <rect x="606" y="270" width="36" height="36" rx="6" className="fill-slate-900 stroke-cyan-500" strokeWidth="2" />
        <svg x="611" y="275" width="26" height="26">
          <QRCodeSVG />
        </svg>
        <circle cx="624" cy="288" r="12" className="cj2-gatepulse stroke-cyan-400" fill="none" strokeWidth="2" />
        {/* booth */}
        <rect x="646" y="252" width="64" height="92" rx="4" className="fill-slate-800 stroke-slate-700" strokeWidth="2" />
        <rect x="640" y="246" width="76" height="8" rx="3" className="fill-slate-600" />
        <rect x="658" y="266" width="40" height="24" rx="3" className="fill-cyan-900" opacity="0.55" />
        {/* hero truck: stops at the barrier, then docks at ramp 12 */}
        <g className="cj2-truck3"><TruckArt /></g>
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
      </g>
    </svg>
  );
}
