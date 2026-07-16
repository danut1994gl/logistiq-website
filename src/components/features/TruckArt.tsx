// The European cab-over articulated semi, side view — the truck the Digital
// Check-in journey established, extracted so other scenes can reuse it instead of
// drawing their own. (Before this there were four different trucks in the folder.)
//
// It draws in its host's coordinate space: roughly x 0..251, y 224..343.
//
// The fills reference two gradients by id, and the caller MUST declare them —
// `<TruckDefs idPrefix="…" />` inside its own <defs>. That is deliberate: the
// original was hard-wired to `url(#cj2-trailer)`, which resolves against the
// document, so it happened to work only on a page where the check-in scene was
// mounted and rendered black anywhere else. Parameterising the id makes that
// dependency explicit and impossible to forget.

export function TruckDefs({ idPrefix }: { idPrefix: string }) {
  return (
    <>
      <linearGradient id={`${idPrefix}-trailer`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#64748b" />
        <stop offset="1" stopColor="#475569" />
      </linearGradient>
      <linearGradient id={`${idPrefix}-cab`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#3b82f6" />
        <stop offset="1" stopColor="#1d4ed8" />
      </linearGradient>
    </>
  );
}

export function TruckArt({
  idPrefix,
  className,
  brakeClass,
}: {
  idPrefix: string;
  /** applied to the whole truck (e.g. the check-in journey's "parked" state) */
  className?: string;
  /** the brake light's animation, if the host has a timeline for it. Left off,
   *  the light is simply static — a scene without the cj2 timeline must not
   *  inherit keyframes whose offsets mean nothing to it. */
  brakeClass?: string;
}) {
  return (
    <g className={className}>
      {/* semi-trailer box: clean panels, brand stripe, brake light, hinges */}
      <rect x="0" y="224" width="178" height="90" rx="6" fill={`url(#${idPrefix}-trailer)`} />
      {[36, 72, 108, 144].map((x) => (
        <line key={x} x1={x} y1="232" x2={x} y2="306" className="stroke-slate-500" strokeWidth="1.5" opacity="0.3" />
      ))}
      <rect x="14" y="238" width="56" height="9" rx="4.5" className="fill-blue-500" />
      <rect x="1" y="227" width="3" height="8" rx="1.5" className={`fill-red-500 ${brakeClass ?? ""}`} />
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
      <path d="M186 318 V250 Q186 238 198 238 H226 Q240 238 244 250 L246 260 Q247 263 247 267 V318 Z" fill={`url(#${idPrefix}-cab)`} />
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
