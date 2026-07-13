import type { Translations } from "@/lib/i18n/translations";

// Professional top-down yard map (YMS, feature 13): a central warehouse with
// dock doors on its top and bottom edges, a parking card on the left, a gate
// + boom barrier and a fenced perimeter — mirroring the real dashboard yard
// view and its exact status palette. One truck animates gate -> parking ->
// backs into a dock (ym2-* loop). Decorative (aria-hidden). Server Component.
// Base (unanimated) styles form a populated static yard for reduced motion.

const C = {
  waiting: "#eab308",
  confirmed: "#3b82f6",
  loading: "#c07070",
  unloading: "#6a9e7e",
  both: "#8e7ab8",
  gate: "#f59e0b",
  building: "#475569",
  cab: "#334155",
};

// top-down truck (34 wide x 64 tall). trailerAt 'top' -> trailer up + cab at
// bottom (backs into a dock ABOVE it); 'bottom' -> trailer down + cab at top
// (backs into a dock BELOW it). Drawn directly (no mirror) so it composes
// cleanly at any anchor.
function Truck({ x, y, fill, trailerAt = "top", bodyClass = "", groupClass = "" }: { x: number; y: number; fill: string; trailerAt?: "top" | "bottom"; bodyClass?: string; groupClass?: string }) {
  const tY = trailerAt === "top" ? 0 : 18; // trailer y
  const cY = trailerAt === "top" ? 50 : 0; // cab y
  const kY = trailerAt === "top" ? 46 : 14; // coupling y
  return (
    <g transform={`translate(${x} ${y})`} className={groupClass}>
      <rect x="0" y={tY} width="34" height="46" rx="4" fill={fill} className={bodyClass} />
      {[8, 16, 24, 32].map((o) => (
        <line key={o} x1="2" y1={tY + o} x2="32" y2={tY + o} stroke="#ffffff" strokeOpacity="0.22" strokeWidth="1" />
      ))}
      <rect x="6" y={kY} width="22" height="4" rx="2" fill="#1e293b" />
      <rect x="3" y={cY} width="28" height="14" rx="3" fill={C.cab} />
      <rect x="6" y={cY + 2} width="22" height="4" rx="2" fill="#93c5fd" opacity="0.5" />
    </g>
  );
}

function DockDoors({ x, y, count, from }: { x: number; y: number; count: number; from: string }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <g key={i}>
          <rect x={x + i * 74} y={y} width="60" height="12" rx="2" fill="#1e293b" stroke="#334155" strokeWidth="1.5" />
          <text x={x + i * 74 + 30} y={y + (from === "top" ? -6 : 24)} textAnchor="middle" fill="#64748b" style={{ fontSize: 11, fontWeight: 700 }}>
            {`D${from === "top" ? i + 1 : i + 6}`}
          </text>
        </g>
      ))}
    </>
  );
}

export function YardScene({ t }: { t: Translations }) {
  const y = t.ymsPage;
  return (
    <svg viewBox="0 0 1200 800" className="w-full h-full block" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <rect x="0" y="0" width="1200" height="800" fill="#0b1220" />
      {/* fenced yard perimeter */}
      <rect x="24" y="24" width="1152" height="752" rx="14" fill="#0f172a" stroke="#334155" strokeWidth="2" strokeDasharray="2 10" />

      {/* ===== parking card (left) ===== */}
      <g>
        <rect x="60" y="150" width="270" height="500" rx="10" fill="#111827" stroke="#334155" strokeWidth="1.5" />
        <rect x="60" y="150" width="270" height="42" rx="10" fill="#1e293b" />
        <text x="80" y="177" fill="#e2e8f0" style={{ fontSize: 16, fontWeight: 700 }}>{y.uiParking}</text>
        <text x="310" y="177" textAnchor="end" fill="#94a3b8" style={{ fontSize: 13 }}>4/12</text>
        {/* utilization bar */}
        <rect x="72" y="198" width="246" height="5" rx="2.5" fill="#334155" />
        <rect x="72" y="198" width="82" height="5" rx="2.5" fill="#eab308" />
        {/* stalls: 2 cols x 4 rows portrait */}
        {[0, 1, 2, 3].map((r) =>
          [0, 1].map((col) => {
            const sx = 82 + col * 122;
            const sy = 222 + r * 100;
            const occ = (r === 0 && col === 0) || (r === 1 && col === 1) || (r === 3 && col === 0);
            const fill = r === 0 ? C.unloading : r === 1 ? C.both : C.loading;
            return (
              <g key={`${r}-${col}`}>
                <rect x={sx} y={sy} width="104" height="86" rx="4" fill="none" stroke="#3f4b5e" strokeWidth="1.5" strokeDasharray="4 4" />
                {occ && (
                  <g transform={`translate(${sx + 35} ${sy + 12})`}>
                    <Truck x={0} y={0} fill={fill} trailerAt="top" />
                  </g>
                )}
              </g>
            );
          })
        )}
      </g>

      {/* ===== central warehouse ===== */}
      <rect x="430" y="300" width="420" height="230" rx="8" fill={C.building} stroke="#64748b" strokeWidth="2" />
      {Array.from({ length: 12 }).map((_, i) => (
        <line key={i} x1={445 + i * 34} y1="312" x2={445 + i * 34} y2="518" stroke="#334155" strokeWidth="1" opacity="0.4" />
      ))}
      <text x="640" y="420" textAnchor="middle" fill="#cbd5e1" style={{ fontSize: 26, fontWeight: 800, letterSpacing: 6 }}>WAREHOUSE</text>
      {/* dock doors on top + bottom edges */}
      <DockDoors x={452} y={288} count={5} from="top" />
      <DockDoors x={452} y={530} count={5} from="bottom" />
      {/* trucks backed into some docks — top row trailerAt bottom (touching the
          top edge), bottom row trailerAt top (touching the bottom edge). Dock i
          centers at x = 452 + i*74 + 13. */}
      <Truck x={465} y={224} fill={C.unloading} trailerAt="bottom" />
      <Truck x={613} y={224} fill={C.both} trailerAt="bottom" />
      <Truck x={761} y={224} fill={C.loading} trailerAt="bottom" />
      <Truck x={465} y={542} fill={C.loading} trailerAt="top" />
      <Truck x={761} y={542} fill={C.unloading} trailerAt="top" />
      {/* the bottom dock (i=2) the moving truck backs into highlights on arrival */}
      <rect x="600" y="530" width="60" height="12" rx="2" className="ym2-dock" fill="#1e293b" />

      {/* ===== gate + barrier (bottom-right entry) ===== */}
      <rect x="1040" y="600" width="28" height="120" rx="4" fill="#1e293b" stroke="#334155" strokeWidth="2" />
      <text x="1054" y="590" textAnchor="middle" fill="#94a3b8" style={{ fontSize: 12, fontWeight: 600 }}>{y.uiGate}</text>
      <rect x="1074" y="654" width="10" height="40" rx="2" fill="#475569" />
      <g transform="translate(1080 660)">
        <g className="ym2-barrier">
          <rect x="-118" y="-5" width="118" height="10" rx="5" fill="#e2e8f0" />
          {[-104, -74, -44].map((bx) => (<rect key={bx} x={bx} y="-5" width="16" height="10" fill={C.gate} />))}
        </g>
      </g>

      {/* ===== moving truck: gate -> parking stall -> bottom dock i=2 =====
          outer group anchors at the gate; ym2-truck CSS translates the path. */}
      <g transform="translate(1046 600)">
        <g className="ym2-truck">
          <Truck x={0} y={0} fill={C.waiting} trailerAt="top" bodyClass="ym2-body" />
          <g transform="translate(42 8)">
            <circle cx="0" cy="0" r="13" fill="#0f172a" stroke="#334155" strokeWidth="2" className="ym2-idle" />
            <text x="0" y="4" textAnchor="middle" className="ym2-idletext" style={{ fontSize: 10, fontWeight: 700 }}>1h</text>
          </g>
        </g>
      </g>

      {/* ===== legend (bottom-right) ===== */}
      <g transform="translate(700 748)">
        <rect x="-14" y="-22" width="500" height="36" rx="8" fill="#0f172a" fillOpacity="0.85" stroke="#334155" strokeWidth="1" />
        {[
          { c: C.waiting, l: y.legWaiting },
          { c: C.confirmed, l: y.legConfirmed },
          { c: C.loading, l: y.legLoading },
          { c: C.unloading, l: y.legUnloading },
          { c: C.both, l: y.legBoth },
        ].map((item, i, arr) => {
          const off = arr.slice(0, i).reduce((a, it) => a + 30 + it.l.length * 6.7, 0);
          return (
            <g key={i} transform={`translate(${off} 0)`}>
              <rect x="0" y="-8" width="13" height="13" rx="3" fill={item.c} />
              <text x="18" y="2" fill="#cbd5e1" style={{ fontSize: 11.5, fontWeight: 500 }}>{item.l}</text>
            </g>
          );
        })}
      </g>
    </svg>
  );
}
