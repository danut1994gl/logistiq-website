import type { Translations } from "@/lib/i18n/translations";

// Systems Integrations & API (feature 16): a two-state surface map that does the
// page's honesty work before a word is read. logistiq.cloud sits in the middle
// holding the data objects that really exist in the schema today (bookings,
// check-ins). SOLID blue edges, with packets moving on them, run to the three
// surfaces that are actually live: the QRGOBox gate device API (org-scoped key),
// the carrier self-service portal, and Supabase Realtime pushing into OUR OWN
// apps (the label says so). DASHED, dimmed, packet-less edges run to generic
// TMS / WMS / ERP boxes under a Roadmap badge — no connector exists, so those
// lines are deliberately dead: no packet, no dash drift, nothing that reads as
// flow. The solid/dashed contrast IS the argument.
//
// Grounded in the reality audit (integrations.json): deliberately NO /api/v1
// endpoint table, no curl/JSON sample, no EDI, no file exchange, no webhooks-out
// and no named/certified vendor anywhere in this drawing — none of those exist.
// Pure CSS (ix16-*), no client JS. Presentational Server Component. aria-hidden.

const CORE = { x: 600, y: 355 };
const CORE_L = 450;
const CORE_R = 750;
const LIVE_X = 210; // centre of the live-cluster node cards
const ROAD_X = 990; // centre of the roadmap node cards
const NODE_HW = 100; // node card half-width
const ROWS = [175, 355, 535]; // node card centres, both clusters
const PORTS = [305, 355, 405]; // where the edges meet the core card

// Packets per live edge. `up` = node -> cloud (a request), `down` = cloud -> node
// (the reply). Realtime is push-only: the cloud streams to our own apps, nothing
// is sent up — so it carries `down` packets only. Values are animation delays (s).
const LIVE_EDGES: { up: number[]; down: number[] }[] = [
  { up: [0], down: [1.4] }, // gate device API — the real request/response handshake
  { up: [0.6], down: [2.0] }, // carrier portal — carriers push their own data in
  { up: [], down: [0.3, 1.7] }, // realtime — cloud -> our apps only
];

function CoreCard({ title, objects }: { title: string; objects: string }) {
  return (
    <g transform={`translate(${CORE.x} ${CORE.y})`}>
      <rect x={-150} y={-80} width={300} height={160} rx={16} fill="url(#ix16-core)" stroke="#3b82f6" strokeWidth="2" />
      <text x={0} y={-17} textAnchor="middle" fill="#fff" style={{ fontSize: 30, fontWeight: 800 }}>
        {title}
      </text>
      {/* the objects that already exist in the schema — the nouns a future API would read */}
      <g transform="translate(0 37)">
        <rect x={-120} y={-17} width={240} height={34} rx={17} fill="#fff" fillOpacity="0.16" />
        <g transform="translate(-100 0)" fill="#dbeafe">
          <rect x={0} y={-6} width={12} height={3} rx={1.5} />
          <rect x={0} y={-1} width={12} height={3} rx={1.5} />
          <rect x={0} y={4} width={12} height={3} rx={1.5} />
        </g>
        <text x={8} y={5} textAnchor="middle" fill="#dbeafe" style={{ fontSize: 15, fontWeight: 600 }}>
          {objects}
        </text>
      </g>
    </g>
  );
}

// The QRGOBox gate device: a barrier lifting next to the reader box, with the
// org-scoped key that authenticates it. `org_` + 32 hex is the real key format.
function DeviceNode({ y }: { y: number }) {
  return (
    <g transform={`translate(${LIVE_X} ${y})`}>
      <rect x={-100} y={-52} width={200} height={104} rx={10} fill="#1b2532" stroke="#334155" strokeWidth="1.5" />
      <rect x={-72} y={-34} width={10} height={44} rx={2} fill="#475569" />
      <g transform="rotate(-22 -62 -28)">
        <rect x={-62} y={-32} width={56} height={8} rx={4} fill="#e2e8f0" />
        {[-52, -34, -16].map((bx) => (
          <rect key={bx} x={bx} y={-32} width={8} height={8} fill="#ef4444" />
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

// The carrier self-service portal: a browser with the carrier's own companies,
// drivers and trucks — typed once by the party that knows them.
function CarrierNode({ y }: { y: number }) {
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

// Supabase Realtime into our own dashboard / driver apps — status pushed, not
// polled. The node label carries the honest scope ("our apps only").
function RealtimeNode({ y }: { y: number }) {
  return (
    <g transform={`translate(${LIVE_X} ${y})`}>
      <rect x={-100} y={-52} width={200} height={104} rx={10} fill="#1b2532" stroke="#334155" strokeWidth="1.5" />
      <rect x={-88} y={-42} width={176} height={22} rx={5} fill="#243040" />
      <circle className="ix16-ping" cx={-76} cy={-31} r={4} fill="none" stroke="#4ade80" strokeWidth="1.5" />
      <circle className="ix16-live" cx={-76} cy={-31} r={4} fill="#4ade80" />
      <rect x={-64} y={-34} width={48} height={6} rx={3} fill="#334155" />
      <rect x={20} y={-34} width={26} height={6} rx={3} fill="#2a3644" />
      {[-6, 16, 38].map((ry, i) => (
        <g key={ry} transform={`translate(0 ${ry})`}>
          <rect x={-88} y={-8} width={176} height={16} rx={4} fill="#141d28" />
          <rect x={-80} y={-3} width={54} height={6} rx={3} fill="#334155" />
          <rect x={44} y={-6} width={36} height={12} rx={6} fill={["#22c55e", "#f59e0b", "#3b82f6"][i]} fillOpacity="0.35" />
        </g>
      ))}
    </g>
  );
}

// A generic third-party system. Deliberately anonymous — no vendor is named,
// logo'd or certified, because no connector exists. Dashed outline + dimmed =
// not built.
function RoadmapNode({ y, label }: { y: number; label: string }) {
  return (
    <g transform={`translate(${ROAD_X} ${y})`}>
      <rect
        x={-100}
        y={-44}
        width={200}
        height={88}
        rx={10}
        fill="#131b26"
        stroke="#475569"
        strokeWidth="1.5"
        strokeDasharray="7 6"
      />
      {[-20, -5, 10].map((ry) => (
        <g key={ry}>
          <rect x={-72} y={ry} width={30} height={11} rx={3} fill="none" stroke="#64748b" strokeWidth="1.4" />
          <circle cx={-66} cy={ry + 5.5} r={1.6} fill="#64748b" />
        </g>
      ))}
      <text x={20} y={8} textAnchor="middle" fill="#64748b" style={{ fontSize: 22, fontWeight: 700 }}>
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
          <linearGradient id="ix16-core" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>
          <radialGradient id="ix16-glow">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.30" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </radialGradient>
        </defs>

        <circle className="ix16-breathe" cx={CORE.x} cy={CORE.y} r={250} fill="url(#ix16-glow)" />

        {/* ===== the two clusters, drawn as regions so the split is readable at a glance ===== */}
        <rect x={60} y={60} width={300} height={590} rx={26} fill="#22c55e" fillOpacity="0.035" stroke="#22c55e" strokeOpacity="0.28" strokeWidth="1.5" />
        <rect x={840} y={60} width={300} height={590} rx={26} fill="#475569" fillOpacity="0.05" stroke="#475569" strokeOpacity="0.45" strokeWidth="1.5" strokeDasharray="8 8" />

        {/* ===== LIVE edges: solid, bright, carrying packets ===== */}
        {LIVE_EDGES.map((e, i) => {
          const nx = LIVE_X + NODE_HW;
          const ny = ROWS[i];
          const cx = CORE_L;
          const cy = PORTS[i];
          const dx = cx - nx;
          const dy = cy - ny;
          return (
            <g key={i}>
              <line x1={nx} y1={ny} x2={cx} y2={cy} stroke="#3b82f6" strokeWidth="2.5" strokeOpacity="0.8" />
              {/* filled ends = a connected socket */}
              <circle cx={nx} cy={ny} r={4.5} fill="#3b82f6" />
              <circle cx={cx} cy={cy} r={4.5} fill="#3b82f6" />
              {e.up.map((d) => (
                <circle
                  key={`u${d}`}
                  className="ix16-pkt"
                  cx={nx}
                  cy={ny}
                  r={6}
                  fill="#38bdf8"
                  style={{ ["--dx" as string]: `${dx}px`, ["--dy" as string]: `${dy}px`, animationDelay: `${d}s` }}
                />
              ))}
              {e.down.map((d) => (
                <circle
                  key={`d${d}`}
                  className="ix16-pkt"
                  cx={cx}
                  cy={cy}
                  r={6}
                  fill="#4ade80"
                  style={{ ["--dx" as string]: `${-dx}px`, ["--dy" as string]: `${-dy}px`, animationDelay: `${d}s` }}
                />
              ))}
            </g>
          );
        })}

        {/* ===== ROADMAP edges: dashed, dimmed, and permanently empty. No packet ever
                travels these, and the dashes never drift — the line is dead because the
                connector does not exist. The node end is a hollow, unplugged socket. ===== */}
        <g opacity="0.75">
          {ROWS.map((ry, i) => (
            <g key={ry}>
              <line
                x1={CORE_R}
                y1={PORTS[i]}
                x2={ROAD_X - NODE_HW}
                y2={ry}
                stroke="#475569"
                strokeWidth="2"
                strokeDasharray="8 8"
              />
              <circle cx={CORE_R} cy={PORTS[i]} r={4} fill="#0f1720" stroke="#475569" strokeWidth="1.8" />
              <circle cx={ROAD_X - NODE_HW} cy={ry} r={5} fill="#0f1720" stroke="#475569" strokeWidth="1.8" />
            </g>
          ))}
          <RoadmapNode y={ROWS[0]} label={f.uiTms} />
          <RoadmapNode y={ROWS[1]} label={f.uiWms} />
          <RoadmapNode y={ROWS[2]} label={f.uiErp} />
        </g>

        <CoreCard title="logistiq.cloud" objects={f.uiObjects} />

        {/* ===== the three surfaces that are live today ===== */}
        <DeviceNode y={ROWS[0]} />
        <CarrierNode y={ROWS[1]} />
        <RealtimeNode y={ROWS[2]} />
        {[f.uiDeviceApi, f.uiCarrier, f.uiRealtime].map((label, i) => (
          <text
            key={i}
            x={LIVE_X}
            y={ROWS[i] + 78}
            textAnchor="middle"
            fill="#cbd5e1"
            style={{ fontSize: 16, fontWeight: 600 }}
          >
            {label}
          </text>
        ))}

        {/* ===== the two badges, sitting on their cluster's top border ===== */}
        <g transform={`translate(${LIVE_X} 60)`}>
          <rect x={-85} y={-17} width={170} height={34} rx={17} fill="#0f1720" stroke="#22c55e" strokeOpacity="0.55" strokeWidth="1.5" />
          <circle className="ix16-live" cx={-64} cy={0} r={5} fill="#4ade80" />
          <text x={10} y={5} textAnchor="middle" fill="#4ade80" style={{ fontSize: 15, fontWeight: 700 }}>
            {f.uiToday}
          </text>
        </g>
        <g transform={`translate(${ROAD_X} 60)`}>
          <rect x={-85} y={-17} width={170} height={34} rx={17} fill="#0f1720" stroke="#475569" strokeWidth="1.5" />
          <g stroke="#94a3b8" strokeWidth="2" strokeLinecap="round">
            <line x1={-70} y1={0} x2={-62} y2={0} />
            <line x1={-56} y1={0} x2={-48} y2={0} />
          </g>
          <text x={12} y={5} textAnchor="middle" fill="#94a3b8" style={{ fontSize: 15, fontWeight: 700 }}>
            {f.uiRoadmap}
          </text>
        </g>
      </svg>
    </div>
  );
}
