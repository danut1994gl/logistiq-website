import type { ReactNode } from "react";
import type { Translations } from "@/lib/i18n/translations";
import { LogistiqCloud } from "./LogistiqCloud";

// Systems Integrations & API (feature 16): one clean interconnection map.
// logistiq.cloud sits in the middle as the hub. On the left hang the surfaces that
// talk to it today, top to bottom: the QRGo Self kiosk (a tablet and a ticket printer
// on the office counter), the gate scanner (the device at the gate that validates the
// driver's check-in against the cloud), the warehouse self-service portal, the QRGo
// Driver apps and the carrier portal (a transport company's own dashboard account,
// booking slots). Until 2026-11-28 the left column held only the middle three; its
// cards are drawn at LIVE_S so five fit the same frame. On the right, the warehouse's own systems (TMS / WMS / ERP)
// reach it through the Integration API (/api/v1), the one edge the API tag marks.
// Each edge is a connection that works today. The barrier beside the gate scanner
// is drawn down: opening it on a valid scan, with QRGoBox, is in progress (until
// 2026-11-24 this node was labelled "Integration API" and its barrier was lifted).
// Pure CSS (ix16-*), no client JS. Presentational Server Component. aria-hidden.

const CORE = { x: 600, y: 350 };
const LIVE_X = 222; // centre of the left (logistiq surfaces) node cards
const LIVE_S = 0.8; // the left cards' scale: five of them share the frame's height
const SYS_X = 995; // centre of the right (your systems) node cards
const NODE_HW = 100; // node card half-width (unscaled)
const LIVE_ROWS = [94, 222, 350, 478, 606]; // left node card centres
const ROWS = [168, 350, 532]; // right node card centres
const L_PORT = 446; // where the left edges meet the cloud
const R_PORT = 758; // where the right edges meet the cloud
// cloud-side edge endpoints, fanned around centre; every one stays inside the
// cloud's left lobe, so each edge disappears under it
const L_PORTS_Y = [312, 331, 350, 369, 388];
const PORTS_Y = [316, 350, 384];

const Pkt = ({ x, y, dx, dy, delay, fill }: { x: number; y: number; dx: number; dy: number; delay: number; fill: string }) => (
  <circle className="ix16-pkt" cx={x} cy={y} r={6} fill={fill}
    style={{ ["--dx" as string]: `${dx}px`, ["--dy" as string]: `${dy}px`, animationDelay: `${delay}s` }} />
);

// A left card: the shared frame, placed in its row at the left column's scale.
function LiveCard({ y, children }: { y: number; children: ReactNode }) {
  return (
    <g transform={`translate(${LIVE_X} ${y}) scale(${LIVE_S})`}>
      <rect x={-100} y={-52} width={200} height={104} rx={10} fill="#1b2532" stroke="#334155" strokeWidth="1.5" />
      {children}
    </g>
  );
}

// QRGo Self: the tablet on the office counter, its check-in form confirmed, and the
// printer beside it handing the driver a ticket.
function SelfNode({ y }: { y: number }) {
  return (
    <LiveCard y={y}>
      {/* the tablet on its stand */}
      <rect x={-34} y={26} width={16} height={10} fill="#475569" />
      <rect x={-48} y={35} width={44} height={4} rx={2} fill="#475569" />
      <rect x={-80} y={-40} width={108} height={68} rx={7} fill="#0f1720" stroke="#475569" strokeWidth="1.5" />
      <rect x={-74} y={-34} width={96} height={56} rx={3} fill="#141d28" />
      <rect x={-68} y={-29} width={40} height={5} rx={2.5} fill="#38bdf8" />
      {[-19, -10, -1].map((ry) => (
        <rect key={ry} x={-68} y={ry} width={52} height={6} rx={2} fill="#243040" />
      ))}
      <rect x={-68} y={9} width={30} height={7} rx={3.5} fill="#22c55e" />
      <circle cx={2} cy={-4} r={11} fill="none" stroke="#22c55e" strokeWidth="2.4" />
      <path d="M-3 -4 l3.5 3.5 l6.5 -7" stroke="#22c55e" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {/* the ticket printer, a ticket coming out */}
      <rect x={46} y={-38} width={28} height={36} rx={2} fill="#e2e8f0" />
      {[-31, -25].map((ry) => (
        <rect key={ry} x={51} y={ry} width={18} height={3} rx={1.5} fill="#94a3b8" />
      ))}
      {[[51, -18], [59, -18], [51, -10], [63, -10]].map(([qx, qy]) => (
        <rect key={`${qx}${qy}`} x={qx} y={qy} width={6} height={6} fill="#334155" />
      ))}
      <rect x={38} y={-6} width={44} height={32} rx={5} fill="#243040" stroke="#3f4a5a" />
      <rect x={44} y={-6} width={32} height={3} fill="#0f1720" />
      <circle className="ix16-live" cx={74} cy={16} r={3.5} fill="#22c55e" />
      <rect x={46} y={13} width={18} height={4} rx={2} fill="#334155" />
    </LiveCard>
  );
}

// The carrier portal: a transport company's own account, a truck and the booking grid
// it picks a slot from — booked, confirmed and still-scheduled slots among free ones.
function CarrierPortalNode({ y }: { y: number }) {
  const slot = ["#141d28", "#3b82f6", "#141d28", "#22c55e", "#141d28", "#141d28", "#3b82f6", "#f59e0b", "#3b82f6", "#141d28", "#141d28", "#141d28"];
  return (
    <LiveCard y={y}>
      <rect x={-100} y={-52} width={200} height={22} rx={10} fill="#243040" />
      <rect x={-100} y={-42} width={200} height={12} fill="#243040" />
      {[-86, -76, -66].map((cx, i) => (
        <circle key={cx} cx={cx} cy={-41} r={3} fill={["#ef4444", "#f59e0b", "#22c55e"][i]} />
      ))}
      <rect x={-52} y={-47} width={140} height={12} rx={6} fill="#1b2532" />
      {/* the carrier's truck */}
      <g transform="translate(0 4)">
        <rect x={-90} y={-14} width={36} height={22} rx={2} fill="#38bdf8" />
        <path d="M-52 -6 h9 l5 6 v8 h-14 z" fill="#60a5fa" />
        <rect x={-50} y={-4} width={7} height={5} rx={1} fill="#0f1720" />
        {[-80, -64, -45].map((wx) => (
          <circle key={wx} cx={wx} cy={10} r={4} fill="#0f1720" stroke="#64748b" strokeWidth="1.5" />
        ))}
      </g>
      {/* the booking grid: 3 rows of 4 slots */}
      {slot.map((fill, i) => (
        <rect key={i} x={-28 + (i % 4) * 30} y={-22 + Math.floor(i / 4) * 18} width={24} height={13} rx={3}
          fill={fill} stroke="#2a3644" strokeWidth="1" />
      ))}
      <rect x={-28} y={33} width={60} height={5} rx={2.5} fill="#334155" />
    </LiveCard>
  );
}

// The gate scanner: the reader on its post, with the organisation's key it
// authenticates with (`org_` + 32 hex is the real key format), and the barrier
// beside it, down, because opening it with QRGoBox is in progress.
function DeviceNode({ y }: { y: number }) {
  return (
    <LiveCard y={y}>
      <rect x={-72} y={-34} width={10} height={44} rx={2} fill="#475569" />
      {/* the barrier arm, down */}
      <g>
        <rect x={-62} y={-32} width={56} height={8} rx={4} fill="#e2e8f0" />
        <rect x={-60} y={-31} width={44} height={2} rx={1} fill="#3b82f6" />
        {[-40, -22].map((bx) => (
          <rect key={bx} x={bx} y={-32} width={8} height={8} fill="#3b82f6" />
        ))}
      </g>
      <rect x={-80} y={10} width={40} height={3} rx={1.5} fill="#2a3644" />
      {/* the reader box on the post */}
      <rect x={24} y={-36} width={48} height={40} rx={6} fill="#243040" stroke="#3f4a5a" />
      <circle className="ix16-live" cx={48} cy={-26} r={3.5} fill="#22c55e" />
      <rect x={34} y={-16} width={28} height={4} rx={2} fill="#334155" />
      <rect x={34} y={-8} width={18} height={4} rx={2} fill="#2a3644" />
      {/* the per-organisation key the device authenticates with */}
      <rect x={-84} y={16} width={168} height={22} rx={6} fill="#0f1720" stroke="#2a3644" />
      <text x={-74} y={31} fill="#7dd3fc" style={{ fontSize: 12, fontWeight: 600, fontFamily: "ui-monospace, monospace" }}>
        org_3f2a9c1b4d5e…
      </text>
    </LiveCard>
  );
}

// The warehouse self-service portal: a browser with the warehouse's own bookings,
// carriers and drivers — kept current by the people who run the yard.
function PortalNode({ y }: { y: number }) {
  return (
    <LiveCard y={y}>
      <rect x={-100} y={-52} width={200} height={22} rx={10} fill="#243040" />
      <rect x={-100} y={-42} width={200} height={12} fill="#243040" />
      {[-86, -76, -66].map((cx, i) => (
        <circle key={cx} cx={cx} cy={-41} r={3} fill={["#ef4444", "#f59e0b", "#22c55e"][i]} />
      ))}
      <rect x={-52} y={-47} width={140} height={12} rx={6} fill="#1b2532" />
      {[-14, 8, 30].map((ry, i) => (
        <g key={ry} transform={`translate(0 ${ry})`}>
          <rect x={-86} y={-8} width={172} height={16} rx={4} fill="#141d28" />
          <circle cx={-74} cy={0} r={4} fill={["#38bdf8", "#22c55e", "#a78bfa"][i]} />
          <rect x={-64} y={-3} width={60} height={6} rx={3} fill="#334155" />
          <rect x={40} y={-3} width={38} height={6} rx={3} fill="#2a3644" />
        </g>
      ))}
    </LiveCard>
  );
}

// The QRGo Driver apps: three phones, each a driver's check-in on their own screen.
function DriversNode({ y }: { y: number }) {
  const cols = ["#38bdf8", "#22c55e", "#f59e0b"];
  return (
    <LiveCard y={y}>
      {[-56, 0, 56].map((dx, i) => (
        <g key={i} transform={`translate(${dx} 0)`}>
          <rect x={-19} y={-40} width={38} height={80} rx={8} fill="#0f1720" stroke="#475569" strokeWidth="1.5" />
          <rect x={-5} y={-35} width={10} height={2.6} rx={1.3} fill="#475569" />
          <rect x={-14} y={-29} width={28} height={58} rx={3} fill="#141d28" />
          <g stroke={cols[i]} strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d="M-7 -2 l4 4 l8 -9" />
          </g>
          <rect x={-10} y={14} width={20} height={2.6} rx={1.3} fill="#334155" />
          <rect x={-10} y={20} width={14} height={2.6} rx={1.3} fill="#2a3644" />
        </g>
      ))}
    </LiveCard>
  );
}

// One of the warehouse's own systems (TMS / WMS / ERP). A solid, connected box —
// a server stack and a live dot — reached through the cloud over the API.
function SystemNode({ y, label }: { y: number; label: string }) {
  return (
    <g transform={`translate(${SYS_X} ${y})`}>
      <rect x={-100} y={-46} width={200} height={92} rx={10} fill="#1b2532" stroke="#334155" strokeWidth="1.5" />
      {[-16, 0, 16].map((ry) => (
        <g key={ry}>
          <rect x={-74} y={ry - 6} width={36} height={12} rx={2.5} fill="#0f1720" stroke="#475569" strokeWidth="1.3" />
          <circle cx={-66} cy={ry} r={2} fill="#22c55e" />
          <rect x={-58} y={ry - 1.5} width={14} height={3} rx={1.5} fill="#334155" />
        </g>
      ))}
      <text x={26} y={8} textAnchor="middle" fill="#cbd5e1" style={{ fontSize: 24, fontWeight: 700 }}>
        {label}
      </text>
    </g>
  );
}

export function IntegrationsScene({ t }: { t: Translations }) {
  const f = t.f16Page;
  return (
    <div className="@container absolute inset-0 p-[2cqw] select-none" aria-hidden="true">
      <svg viewBox="0 0 1200 700" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
        <defs>
          <radialGradient id="ix16-glow">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.30" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </radialGradient>
        </defs>

        <circle className="ix16-breathe" cx={CORE.x} cy={CORE.y} r={280} fill="url(#ix16-glow)" />

        {/* ===== left edges: the logistiq surfaces feed the cloud ===== */}
        {LIVE_ROWS.map((ny, i) => {
          const nx = LIVE_X + NODE_HW * LIVE_S;
          const cx = L_PORT, cy = L_PORTS_Y[i];
          const dx = cx - nx, dy = cy - ny;
          return (
            <g key={`l${i}`}>
              <line x1={nx} y1={ny} x2={cx} y2={cy} stroke="#3b82f6" strokeWidth="2.5" strokeOpacity="0.8" />
              <circle cx={nx} cy={ny} r={4.5} fill="#3b82f6" />
              <Pkt x={nx} y={ny} dx={dx} dy={dy} delay={i * 0.4} fill="#38bdf8" />
              <Pkt x={cx} y={cy} dx={-dx} dy={-dy} delay={i * 0.4 + 1.3} fill="#4ade80" />
            </g>
          );
        })}

        {/* ===== right edges: logistiq connects to your systems over the API ===== */}
        {ROWS.map((ny, i) => {
          const nx = SYS_X - NODE_HW;
          const cx = R_PORT, cy = PORTS_Y[i];
          const dx = nx - cx, dy = ny - cy;
          return (
            <g key={`r${i}`}>
              <line x1={cx} y1={cy} x2={nx} y2={ny} stroke="#3b82f6" strokeWidth="2.5" strokeOpacity="0.8" />
              <circle cx={nx} cy={ny} r={4.5} fill="#3b82f6" />
              <Pkt x={cx} y={cy} dx={dx} dy={dy} delay={i * 0.5 + 0.4} fill="#38bdf8" />
              <Pkt x={nx} y={ny} dx={-dx} dy={-dy} delay={i * 0.5 + 1.7} fill="#4ade80" />
            </g>
          );
        })}

        {/* ===== the hub: the shared logistiq.cloud mark ===== */}
        <g transform={`translate(${CORE.x} ${CORE.y}) scale(1.16)`}>
          <LogistiqCloud id="ix16" />
        </g>
        {/* the API tag on the connection to your systems */}
        <g transform="translate(830 350)">
          <rect x={-30} y={-15} width={60} height={30} rx={15} fill="#0f1720" stroke="#3b82f6" strokeOpacity="0.5" strokeWidth="1.5" />
          <text x={0} y={5} textAnchor="middle" fill="#7dd3fc" style={{ fontSize: 15, fontWeight: 700 }}>API</text>
        </g>

        {/* ===== the logistiq surfaces (left) ===== */}
        <SelfNode y={LIVE_ROWS[0]} />
        <DeviceNode y={LIVE_ROWS[1]} />
        <PortalNode y={LIVE_ROWS[2]} />
        <DriversNode y={LIVE_ROWS[3]} />
        <CarrierPortalNode y={LIVE_ROWS[4]} />
        {[f.uiSelf, f.uiGateScanner, f.uiCarrier, f.uiRealtime, f.uiCarrierPortal].map((label, i) => (
          <text key={i} x={LIVE_X} y={LIVE_ROWS[i] + 63} textAnchor="middle" fill="#cbd5e1" style={{ fontSize: 16, fontWeight: 600 }}>
            {label}
          </text>
        ))}

        {/* ===== your systems (right), connected over the API ===== */}
        <SystemNode y={ROWS[0]} label={f.uiTms} />
        <SystemNode y={ROWS[1]} label={f.uiWms} />
        <SystemNode y={ROWS[2]} label={f.uiErp} />
      </svg>
    </div>
  );
}
