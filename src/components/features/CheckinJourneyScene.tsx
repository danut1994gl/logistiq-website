import { QRCodeSVG } from "@/components/mockups/QRCodeSVG";

// Panoramic animated check-in scene (truck → QR scan → barrier). Decorative:
// the step cards below carry the full story as text. Pure CSS animation via
// .cj-* classes in globals.css; the unanimated base state is a complete
// static scene for prefers-reduced-motion. Server Component.
export function CheckinJourneyScene({ dockLabel }: { dockLabel: string }) {
  return (
    <svg viewBox="0 0 1200 400" className="w-full h-auto block" aria-hidden="true">
      {/* ambient glows */}
      <circle cx="180" cy="90" r="100" className="fill-blue-600" opacity="0.08" />
      <circle cx="1020" cy="70" r="80" className="fill-cyan-500" opacity="0.07" />

      {/* road */}
      <rect x="0" y="344" width="1200" height="24" className="fill-slate-800" />
      <line x1="0" y1="356" x2="1200" y2="356" className="stroke-slate-600" strokeWidth="3" strokeDasharray="24 18" />

      {/* warehouse */}
      <rect x="760" y="110" width="400" height="234" rx="4" className="fill-slate-800 stroke-slate-700" strokeWidth="2" />
      <rect x="760" y="110" width="400" height="10" className="fill-blue-600" />
      <text x="960" y="152" textAnchor="middle" className="fill-slate-500" style={{ fontSize: 20, fontWeight: 700, letterSpacing: 6 }}>
        LOGISTIQ
      </text>
      {[800, 900, 1000].map((x) => (
        <g key={x}>
          <rect x={x} y="214" width="72" height="130" className="fill-slate-700 stroke-slate-600" strokeWidth="2" />
          {[240, 266, 292, 318].map((y) => (
            <line key={y} x1={x + 4} y1={y} x2={x + 68} y2={y} className="stroke-slate-600" strokeWidth="2" />
          ))}
        </g>
      ))}

      {/* dock badge (phase 3) */}
      <g className="cj-dock-badge">
        <line x1="936" y1="192" x2="936" y2="212" className="stroke-blue-500" strokeWidth="2" strokeDasharray="3 3" />
        <rect x="888" y="158" width="96" height="32" rx="16" className="fill-blue-600" />
        <text x="936" y="179" textAnchor="middle" className="fill-white" style={{ fontSize: 15, fontWeight: 700, letterSpacing: 1 }}>
          {dockLabel}
        </text>
      </g>

      {/* gate booth */}
      <rect x="690" y="252" width="72" height="92" rx="4" className="fill-slate-800 stroke-slate-700" strokeWidth="2" />
      <rect x="684" y="246" width="84" height="8" rx="3" className="fill-slate-600" />
      <rect x="704" y="266" width="44" height="26" rx="3" className="fill-cyan-900" opacity="0.55" />

      {/* QR panel on a pole, roadside */}
      <rect x="566" y="306" width="6" height="38" className="fill-slate-600" />
      <rect x="540" y="246" width="58" height="58" rx="8" className="fill-slate-900 stroke-cyan-500" strokeWidth="2" opacity="0.95" />
      <svg x="547" y="253" width="44" height="44">
        <QRCodeSVG />
      </svg>
      {/* scan line (phase 2) */}
      <rect x="547" y="255" width="44" height="3" rx="1.5" className="cj-scan fill-cyan-400" />
      {/* pulse rings (phase 2) */}
      <circle cx="569" cy="275" r="16" className="cj-pulse stroke-cyan-400 fill-none" strokeWidth="2" />
      <circle cx="569" cy="275" r="16" className="cj-pulse cj-pulse-2 stroke-cyan-400 fill-none" strokeWidth="2" />

      {/* truck (local nose at x=218; base = stopped at gate) */}
      <g className="cj-truck">
        <rect x="0" y="248" width="142" height="70" rx="6" className="fill-slate-600 stroke-slate-500" strokeWidth="2" />
        <rect x="12" y="262" width="52" height="8" rx="4" className="fill-blue-500" />
        <rect x="142" y="306" width="14" height="10" className="fill-slate-700" />
        <path
          d="M156 344 L156 272 Q156 264 164 264 L192 264 Q199 264 203 269 L214 287 Q218 292 218 298 L218 344 Z"
          className="fill-blue-600"
        />
        <path d="M166 272 L190 272 L200 287 L166 287 Z" className="fill-cyan-200" opacity="0.75" />
        {[28, 58, 190].map((cx) => (
          <g key={cx}>
            <circle cx={cx} cy="331" r="13" className="fill-slate-900 stroke-slate-500" strokeWidth="3" />
            <circle cx={cx} cy="331" r="4" className="fill-slate-500" />
          </g>
        ))}
      </g>

      {/* driver's phone, in front of the cab window (phase 2) */}
      <g className="cj-phone">
        <rect x="496" y="258" width="30" height="54" rx="7" className="fill-slate-800 stroke-slate-500" strokeWidth="2" />
        <rect x="501" y="266" width="20" height="34" rx="2" className="fill-cyan-950" />
        <rect x="504" y="272" width="14" height="14" rx="2" className="fill-cyan-400" opacity="0.85" />
      </g>

      {/* barrier (post + arm; base = up) */}
      <rect x="654" y="294" width="12" height="50" rx="2" className="fill-slate-600" />
      <g transform="translate(660 300)">
        <g className="cj-barrier-arm">
          <rect x="4" y="-6" width="168" height="12" rx="6" className="fill-slate-200" />
          {[24, 64, 104, 144].map((x) => (
            <rect key={x} x={x} y="-6" width="20" height="12" className="fill-blue-600" />
          ))}
          <circle cx="166" cy="0" r="4" className="fill-emerald-400" />
        </g>
      </g>

      {/* confirmation check (phase 3) */}
      <g className="cj-check">
        <circle cx="600" cy="190" r="24" className="fill-emerald-500" />
        <path d="M588 190 l9 9 l17 -19" className="stroke-white fill-none" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
}
