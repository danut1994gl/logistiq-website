import type { Translations } from "@/lib/i18n/translations";

// Intuitive top-down yard map (YMS, feature 13). Goal: a first-time visitor
// instantly grasps the product — a live overhead view of the whole yard where
// every truck is colour-coded by status and trucks are routed to docks. Not a
// literal copy of a customer layout; it borrows the real ingredients
// (warehouse, numbered docks, parking, gate, fence, colour-coded trucks) and
// the exact dashboard palette, arranged for clarity. One truck animates
// gate -> waits in the yard -> backs into an open dock (ym3-* loop). Decorative
// (aria-hidden). Server Component; base (unanimated) styles = a populated yard.

const C = {
  loading: "#c07070",
  unloading: "#6a9e7e",
  both: "#8e7ab8",
  waiting: "#eab308",
  confirmed: "#3b82f6",
  floating: "#94a3b8",
  wh: "#3f4a5a",
  whStroke: "#5b6b7f",
  ground: "#131b25",
  grid: "#22303f",
  border: "#334155",
  cab: "#334155",
  coupling: "#475569",
  amber: "#f59e0b",
  surface: "#1b2532",
  surfaceHi: "#243040",
};

const DOCK_N = 7;
const WH = { x: 90, y: 50, w: 1020, h: 150 };
const WALL_Y = WH.y + WH.h; // 200 — the loading face
const PITCH = WH.w / DOCK_N;
const dockCx = (i: number) => WH.x + (i + 0.5) * PITCH;

// vertical truck backed into a top dock: trailer up (toward the door), cab down
// (toward the yard). cy = centre; body height ~92 trailer + 30 cab.
function DockTruck({ cx, top, fill }: { cx: number; top: number; fill: string }) {
  const w = 58;
  const tH = 92;
  return (
    <g>
      <rect x={cx - w / 2} y={top} width={w} height={tH} rx={5} fill={fill} />
      {[0.2, 0.35, 0.5, 0.65, 0.8].map((o) => (
        <line key={o} x1={cx - w / 2 + 3} y1={top + tH * o} x2={cx + w / 2 - 3} y2={top + tH * o} stroke="#ffffff" strokeOpacity="0.22" strokeWidth="1" />
      ))}
      <rect x={cx - 25} y={top + tH} width={50} height={7} rx={3} fill={C.coupling} />
      <rect x={cx - 27} y={top + tH + 7} width={54} height={30} rx={5} fill={C.cab} stroke="#ffffff" strokeOpacity="0.12" />
      <rect x={cx - 21} y={top + tH + 29} width={42} height={6} rx={3} fill="#ffffff" fillOpacity="0.2" />
    </g>
  );
}

// small portrait truck inside a parking stall (cab at bottom)
function StallTruck({ cx, top, h, fill }: { cx: number; top: number; h: number; fill: string }) {
  const w = 30;
  const tH = h - 16;
  return (
    <g>
      <rect x={cx - w / 2} y={top} width={w} height={tH} rx={3} fill={fill} />
      <rect x={cx - w / 2 + 2} y={top + tH * 0.5} width={w - 4} height={1} stroke="#ffffff" strokeOpacity="0.2" />
      <rect x={cx - 11} y={top + tH + 2} width={22} height={12} rx={2} fill={C.cab} />
    </g>
  );
}

// floating unassigned-truck token in the open yard: rounded plate badge + idle
function FloatingTruck({ x, y, fill, plate, idle }: { x: number; y: number; fill: string; plate: string; idle: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="-16" y="-16" width="32" height="32" rx="6" fill={fill} filter="url(#ymShadow)" />
      <rect x="-12" y="-13" width="24" height="18" rx="2" fill="#ffffff" fillOpacity="0.28" />
      <rect x="-12" y="6" width="24" height="4" rx="1.5" fill="#ffffff" fillOpacity="0.18" />
      <circle cx="16" cy="-16" r="11" fill={C.surface} stroke={C.border} />
      <text x="16" y="-12.5" textAnchor="middle" fill="#cbd5e1" style={{ fontSize: 9, fontWeight: 600 }}>{idle}</text>
      <text x="0" y="30" textAnchor="middle" fill="#e2e8f0" style={{ fontSize: 11, fontWeight: 700, fontFamily: "monospace" }}>{plate}</text>
    </g>
  );
}

export function YardScene({ t }: { t: Translations }) {
  const y = t.ymsPage;
  // occupied docks by index -> operation colour; D4 (i=3) stays empty (target)
  const occupied: Record<number, string> = { 1: C.unloading, 4: C.loading, 5: C.both };
  const legend = [
    { c: C.waiting, l: y.legWaiting },
    { c: C.confirmed, l: y.legConfirmed },
    { c: C.loading, l: y.legLoading },
    { c: C.unloading, l: y.legUnloading },
    { c: C.both, l: y.legBoth },
  ];

  return (
    <svg viewBox="0 0 1200 780" className="w-full h-full block" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <defs>
        <pattern id="ymGrid" width="34" height="34" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" fill={C.grid} />
        </pattern>
        <filter id="ymShadow" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.35" />
        </filter>
      </defs>

      {/* ground */}
      <rect x="0" y="0" width="1200" height="780" fill={C.ground} />
      <rect x="0" y="0" width="1200" height="780" fill="url(#ymGrid)" />

      {/* ===== warehouse ===== */}
      <rect x={WH.x} y={WH.y} width={WH.w} height={WH.h} rx="8" fill={C.wh} stroke={C.whStroke} strokeWidth="2" />
      {Array.from({ length: 24 }).map((_, i) => (
        <line key={i} x1={WH.x + 20 + i * 42} y1={WH.y + 14} x2={WH.x + 20 + i * 42} y2={WALL_Y - 14} stroke={C.whStroke} strokeOpacity="0.28" strokeWidth="1" />
      ))}
      <text x={WH.x + WH.w / 2} y={WH.y + 92} textAnchor="middle" fill="#cbd5e1" style={{ fontSize: 30, fontWeight: 800, letterSpacing: 8 }}>WAREHOUSE</text>

      {/* ===== docks along the warehouse loading face ===== */}
      {Array.from({ length: DOCK_N }).map((_, i) => {
        const cx = dockCx(i);
        const occ = occupied[i];
        const bayW = 112;
        return (
          <g key={i}>
            {/* dock door on the wall */}
            <rect x={cx - 38} y={WALL_Y - 6} width={76} height={12} rx={2} fill="#0f1720" stroke={C.border} strokeWidth="1.5" />
            {/* bay */}
            <rect x={cx - bayW / 2} y={WALL_Y + 8} width={bayW} height={132} rx={4} fill="none" stroke={occ ? "transparent" : "#3b4a5e"} strokeWidth="1.5" strokeDasharray="5 5" />
            {occ ? (
              <DockTruck cx={cx} top={WALL_Y + 8} fill={occ} />
            ) : (
              <text x={cx} y={WALL_Y + 78} textAnchor="middle" fill="#64748b" style={{ fontSize: 24, fontWeight: 800 }}>{`D${i + 1}`}</text>
            )}
            {/* the animation-target dock (D4) highlights when the truck arrives */}
            {i === 3 && <rect x={cx - bayW / 2} y={WALL_Y + 8} width={bayW} height={132} rx={4} className="ym3-target" opacity="0" fill="none" stroke={C.unloading} strokeWidth="2.5" />}
          </g>
        );
      })}

      {/* ===== floating waiting trucks in the yard (clear of the moving corridor) ===== */}
      <FloatingTruck x={300} y={440} fill={C.waiting} plate="CJ 12 QRG" idle="45m" />
      <FloatingTruck x={735} y={455} fill={C.confirmed} plate="TM 08 LOG" idle="12m" />

      {/* ===== moving truck: gate -> wait -> back into D4 ===== */}
      <g className="ym3-truck" transform="translate(455 520)">
        <g>
          <rect x="-29" y="-46" width="58" height="92" rx="5" className="ym3-body" fill={C.waiting} />
          {[0.2, 0.35, 0.5, 0.65, 0.8].map((o) => (
            <line key={o} x1="-26" y1={-46 + 92 * o} x2="26" y2={-46 + 92 * o} stroke="#ffffff" strokeOpacity="0.22" strokeWidth="1" />
          ))}
          <rect x="-25" y="46" width="50" height="7" rx="3" fill={C.coupling} />
          <rect x="-27" y="53" width="54" height="30" rx="5" fill={C.cab} stroke="#ffffff" strokeOpacity="0.12" />
          <rect x="-21" y="75" width="42" height="6" rx="3" fill="#ffffff" fillOpacity="0.2" />
          <g className="ym3-idle" transform="translate(29 -44)">
            <circle r="12" fill={C.surface} stroke={C.border} />
            <text y="4" textAnchor="middle" fill="#cbd5e1" style={{ fontSize: 10, fontWeight: 700 }}>1h</text>
          </g>
        </g>
      </g>

      {/* ===== parking card (bottom-right) ===== */}
      <g>
        <rect x="812" y="556" width="300" height="150" rx="10" fill={C.surface} stroke={C.border} strokeWidth="1.5" filter="url(#ymShadow)" />
        <rect x="812" y="556" width="300" height="36" rx="10" fill={C.surfaceHi} />
        <text x="830" y="580" fill="#e2e8f0" style={{ fontSize: 15, fontWeight: 700 }}>{y.uiParking}</text>
        <text x="1094" y="580" textAnchor="end" fill="#94a3b8" style={{ fontSize: 13 }}>3/6</text>
        <rect x="826" y="600" width="272" height="5" rx="2.5" fill={C.border} />
        <rect x="826" y="600" width="136" height="5" rx="2.5" fill={C.waiting} />
        {Array.from({ length: 6 }).map((_, i) => {
          const sx = 830 + i * 45;
          const fills = [C.loading, null, C.unloading, null, C.both, null];
          const f = fills[i];
          return (
            <g key={i}>
              <rect x={sx} y={618} width={38} height={78} rx={3} fill="none" stroke={C.border} strokeWidth="1.2" strokeDasharray="4 3" />
              {f && <StallTruck cx={sx + 19} top={622} h={70} fill={f} />}
            </g>
          );
        })}
      </g>

      {/* ===== fence + gate (bottom) ===== */}
      <g>
        {/* rails with a gap for the gate at x 150..250 */}
        <line x1="60" y1="712" x2="150" y2="712" stroke="#6b7280" strokeWidth="2" />
        <line x1="250" y1="712" x2="800" y2="712" stroke="#6b7280" strokeWidth="2" />
        <line x1="60" y1="717" x2="150" y2="717" stroke="#6b7280" strokeWidth="1" strokeOpacity="0.6" />
        <line x1="250" y1="717" x2="800" y2="717" stroke="#6b7280" strokeWidth="1" strokeOpacity="0.6" />
        {Array.from({ length: 31 }).map((_, i) => {
          const px = 66 + i * 24;
          if (px > 148 && px < 252) return null;
          if (px > 798) return null;
          return <rect key={i} x={px} y="708" width="3" height="9" rx="1" fill="#9ca3af" />;
        })}
        {/* gate boom */}
        <rect x="150" y="700" width="10" height="24" rx="2" fill={C.border} />
        <g transform="translate(160 706)">
          <rect x="0" y="-4" width="92" height="8" rx="4" fill="#e2e8f0" />
          {[6, 34, 62].map((bx) => (<rect key={bx} x={bx} y="-4" width="16" height="8" fill={C.amber} />))}
        </g>
        <text x="205" y="742" textAnchor="middle" fill="#94a3b8" style={{ fontSize: 12, fontWeight: 600 }}>{y.uiGate}</text>
      </g>

      {/* ===== legend (bottom-left) ===== */}
      <g transform="translate(300 726)">
        <rect x="-8" y="-4" width="500" height="34" rx="8" fill={C.surface} fillOpacity="0.9" stroke={C.border} strokeWidth="1" />
        {legend.map((item, i, arr) => {
          const off = arr.slice(0, i).reduce((a, it) => a + 26 + it.l.length * 6.6, 0);
          return (
            <g key={i} transform={`translate(${off + 6} 13)`}>
              <rect x="0" y="-7" width="13" height="13" rx="3" fill={item.c} />
              <text x="18" y="3" fill="#cbd5e1" style={{ fontSize: 11.5, fontWeight: 500 }}>{item.l}</text>
            </g>
          );
        })}
      </g>
    </svg>
  );
}
