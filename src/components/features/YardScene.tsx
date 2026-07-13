import type { Translations } from "@/lib/i18n/translations";

// Top-down live yard map (feature 13, YMS). Trucks are colour-coded tokens
// moving gate -> parking -> dock on one shared 24s ym-* loop, using the real
// product palette (Waiting #eab308, Confirmed #3b82f6, Loading #c07070,
// Unloading #6a9e7e, Both #8e7ab8, idle amber/red). Decorative (aria-hidden).
// Server Component. Base (unanimated) styles form a coherent yard for
// prefers-reduced-motion. No animation-delay.

const C = {
  waiting: "#eab308",
  confirmed: "#3b82f6",
  loading: "#c07070",
  unloading: "#6a9e7e",
  both: "#8e7ab8",
  gate: "#f59e0b",
};

// nose-up top-down truck (cab at the top), origin at its top-left
function Truck({ x, y, fill, bodyClass = "", groupClass = "" }: { x: number; y: number; fill: string; bodyClass?: string; groupClass?: string }) {
  return (
    <g transform={`translate(${x} ${y})`} className={groupClass}>
      <rect x="0" y="13" width="40" height="52" rx="6" fill={fill} className={bodyClass} />
      <rect x="5" y="0" width="30" height="16" rx="4" fill="#1e293b" />
      <rect x="9" y="3" width="22" height="7" rx="2" fill="#bae6fd" opacity="0.55" />
    </g>
  );
}

export function YardScene({ t }: { t: Translations }) {
  const y = t.ymsPage;
  const docks = [200, 348, 496, 644, 792, 940];
  return (
    <svg viewBox="0 0 1200 520" className="w-full h-full block" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      {/* asphalt */}
      <rect x="0" y="0" width="1200" height="520" fill="#0b1220" />
      <rect x="24" y="150" width="1152" height="316" rx="10" fill="#0f172a" />

      {/* warehouse building + numbered dock doors (top) */}
      <rect x="120" y="24" width="984" height="98" rx="6" fill="#1e293b" stroke="#334155" strokeWidth="2" />
      <rect x="120" y="24" width="984" height="9" fill="#2563eb" />
      <text x="612" y="70" textAnchor="middle" fill="#64748b" style={{ fontSize: 18, fontWeight: 700, letterSpacing: 5 }}>
        {y.uiDocks}
      </text>
      {docks.map((dx, i) => (
        <g key={i}>
          <rect
            x={dx} y="110" width="94" height="20" rx="3"
            className={i === 2 ? "ym-dock3" : i === 0 ? "ym-dock1" : ""}
            fill={i === 0 ? C.unloading : "#334155"}
          />
          <text x={dx + 47} y="107" textAnchor="middle" fill="#64748b" style={{ fontSize: 12, fontWeight: 700 }}>
            {`D${i + 1}`}
          </text>
        </g>
      ))}

      {/* gate (left, amber barrier) */}
      <rect x="30" y="250" width="26" height="120" rx="4" fill="#1e293b" stroke="#334155" strokeWidth="2" />
      <rect x="60" y="300" width="10" height="40" rx="2" fill="#475569" />
      <g transform="translate(66 306)">
        <rect x="0" y="-5" width="120" height="10" rx="5" fill="#e2e8f0" className="ym-barrier" />
        {[16, 46, 76].map((bx) => (
          <rect key={bx} x={bx} y="-5" width="16" height="10" fill={C.gate} className="ym-barrier" />
        ))}
      </g>
      <text x="43" y="245" textAnchor="middle" fill="#94a3b8" style={{ fontSize: 12, fontWeight: 600 }}>
        {y.uiGate}
      </text>

      {/* parking block P1 (dashed slots) */}
      <rect x="150" y="330" width="440" height="160" rx="8" fill="none" stroke="#334155" strokeWidth="2" strokeDasharray="6 6" />
      <text x="164" y="350" fill="#64748b" style={{ fontSize: 13, fontWeight: 700 }}>{y.uiParking}</text>
      {[0, 1, 2, 3, 4].map((col) =>
        [0, 1].map((row) => (
          <rect
            key={`${col}-${row}`}
            x={166 + col * 84} y={360 + row * 62} width="70" height="54" rx="5"
            fill="none" stroke="#22c55e" strokeOpacity="0.35" strokeWidth="1.5" strokeDasharray="4 4"
          />
        ))
      )}

      {/* static parked trucks (occupy slots) */}
      <Truck x={173} y={362} fill={C.unloading} />
      <Truck x={341} y={424} fill={C.both} groupClass="ym-idlehost" />
      {/* idle badge on the 'both' truck */}
      <g transform="translate(388 452)">
        <circle cx="0" cy="0" r="13" fill="#0f172a" stroke="#334155" strokeWidth="2" className="ym-idle" />
        <text x="0" y="4" textAnchor="middle" className="ym-idletext" style={{ fontSize: 10, fontWeight: 700 }}>2h</text>
      </g>

      {/* moving truck A: gate -> parking slot -> dock D3 */}
      <g className="ym-a">
        <Truck x={64} y={286} fill={C.waiting} bodyClass="ym-a-body" />
      </g>
      {/* moving truck C: gate -> dock D1 directly (live unload) */}
      <g className="ym-c">
        <Truck x={64} y={286} fill={C.confirmed} bodyClass="ym-c-body" />
      </g>

      {/* legend */}
      <g transform="translate(150 500)">
        {[
          { c: C.waiting, l: y.legWaiting },
          { c: C.confirmed, l: y.legConfirmed },
          { c: C.loading, l: y.legLoading },
          { c: C.unloading, l: y.legUnloading },
          { c: C.both, l: y.legBoth },
        ].map((item, i, arr) => {
          const offsets = arr.slice(0, i).reduce((acc, it) => acc + 34 + it.l.length * 7.4, 0);
          return (
            <g key={i} transform={`translate(${offsets} 0)`}>
              <rect x="0" y="-10" width="14" height="14" rx="3" fill={item.c} />
              <text x="20" y="1" fill="#cbd5e1" style={{ fontSize: 12.5, fontWeight: 500 }}>{item.l}</text>
            </g>
          );
        })}
      </g>
    </svg>
  );
}
