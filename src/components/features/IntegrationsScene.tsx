import type { Translations } from "@/lib/i18n/translations";
import { LogistiqCloud } from "./LogistiqCloud";

// Systems Integrations & API (feature 16): one clean interconnection map.
// logistiq.cloud sits in the middle as the hub; the surfaces that feed it — the
// QRGoBox gate device API, the warehouse self-service portal, and the QRGO Driver
// apps — hang off the left, and the warehouse's own systems (TMS / WMS / ERP)
// connect through the cloud over the API on the right. Every edge is a live,
// packet-carrying connection: the picture is about how the pieces talk to each
// other, not about what is or isn't shipped. Pure CSS (ix16-*), no client JS.
// Presentational Server Component. aria-hidden.

const CORE = { x: 600, y: 350 };
const LIVE_X = 205; // centre of the left (logistiq surfaces) node cards
const SYS_X = 995; // centre of the right (your systems) node cards
const NODE_HW = 100; // node card half-width
const ROWS = [168, 350, 532]; // node card centres
const L_PORT = 442; // where the left edges meet the cloud
const R_PORT = 758; // where the right edges meet the cloud
const PORTS_Y = [316, 350, 384]; // cloud-side edge endpoints, fanned around centre

const Pkt = ({ x, y, dx, dy, delay, fill }: { x: number; y: number; dx: number; dy: number; delay: number; fill: string }) => (
  <circle className="ix16-pkt" cx={x} cy={y} r={6} fill={fill}
    style={{ ["--dx" as string]: `${dx}px`, ["--dy" as string]: `${dy}px`, animationDelay: `${delay}s` }} />
);

// The QRGoBox gate device: a barrier lifting next to the reader box, with the
// org-scoped key that authenticates it. `org_` + 32 hex is the real key format.
function DeviceNode({ y }: { y: number }) {
  return (
    <g transform={`translate(${LIVE_X} ${y})`}>
      <rect x={-100} y={-52} width={200} height={104} rx={10} fill="#1b2532" stroke="#334155" strokeWidth="1.5" />
      <rect x={-72} y={-34} width={10} height={44} rx={2} fill="#475569" />
      <g transform="rotate(-22 -62 -28)">
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
    </g>
  );
}

// The warehouse self-service portal: a browser with the warehouse's own bookings,
// carriers and drivers — kept current by the people who run the yard.
function PortalNode({ y }: { y: number }) {
  return (
    <g transform={`translate(${LIVE_X} ${y})`}>
      <rect x={-100} y={-52} width={200} height={104} rx={10} fill="#1b2532" stroke="#334155" strokeWidth="1.5" />
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
    </g>
  );
}

// The QRGO Driver apps: three phones, each a driver's check-in on their own screen.
function DriversNode({ y }: { y: number }) {
  const cols = ["#38bdf8", "#22c55e", "#f59e0b"];
  return (
    <g transform={`translate(${LIVE_X} ${y})`}>
      <rect x={-100} y={-52} width={200} height={104} rx={10} fill="#1b2532" stroke="#334155" strokeWidth="1.5" />
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
    </g>
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
        {ROWS.map((ny, i) => {
          const nx = LIVE_X + NODE_HW;
          const cx = L_PORT, cy = PORTS_Y[i];
          const dx = cx - nx, dy = cy - ny;
          return (
            <g key={`l${i}`}>
              <line x1={nx} y1={ny} x2={cx} y2={cy} stroke="#3b82f6" strokeWidth="2.5" strokeOpacity="0.8" />
              <circle cx={nx} cy={ny} r={4.5} fill="#3b82f6" />
              <Pkt x={nx} y={ny} dx={dx} dy={dy} delay={i * 0.5} fill="#38bdf8" />
              <Pkt x={cx} y={cy} dx={-dx} dy={-dy} delay={i * 0.5 + 1.3} fill="#4ade80" />
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
        <DeviceNode y={ROWS[0]} />
        <PortalNode y={ROWS[1]} />
        <DriversNode y={ROWS[2]} />
        {[f.uiDeviceApi, f.uiCarrier, f.uiRealtime].map((label, i) => (
          <text key={i} x={LIVE_X} y={ROWS[i] + 78} textAnchor="middle" fill="#cbd5e1" style={{ fontSize: 16, fontWeight: 600 }}>
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
