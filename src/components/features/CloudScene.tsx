import type { Translations } from "@/lib/i18n/translations";

// Cloud - No Equipment (feature 9): logistiq.cloud in the middle, warehouses and
// a driver's phone hanging off it, packets travelling BOTH ways on every link so
// the sync reads as bidirectional. Grounded in the reality audit: there is no
// on-prem component — a warehouse is onboarded through a web form and its
// check-in link is live, so the only thing on site is a browser and a phone.
// Pure CSS (cl9-*), no client JS. Presentational Server Component. aria-hidden.

const CLOUD = { x: 600, y: 340 };
const NODES: { x: number; y: number; kind: "wh" | "phone"; delay: number }[] = [
  { x: 190, y: 180, kind: "wh", delay: 0 },
  { x: 1010, y: 180, kind: "wh", delay: 0.5 },
  { x: 190, y: 560, kind: "wh", delay: 1.0 },
  { x: 1010, y: 560, kind: "phone", delay: 1.5 },
];

// a soft cloud outline, drawn once
const CLOUD_D =
  "M-150 34c-30 0-54-24-54-54 0-27 20-49 46-53 6-38 39-67 79-67 30 0 56 16 70 40 9-6 20-9 32-9 30 0 55 23 58 52 28 5 49 29 49 58 0 33-27 60-60 60z";

function Warehouse({ x, y, label }: { x: number; y: number; label: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-92} y={-58} width={184} height={116} rx={10} fill="#1b2532" stroke="#334155" strokeWidth="1.5" />
      {/* a browser chrome — the only "equipment" a warehouse needs */}
      <rect x={-92} y={-58} width={184} height={24} rx={10} fill="#243040" />
      <rect x={-92} y={-46} width={184} height={12} fill="#243040" />
      {[-78, -66, -54].map((cx, i) => (
        <circle key={i} cx={cx} cy={-46} r={3.4} fill={["#ef4444", "#f59e0b", "#22c55e"][i]} />
      ))}
      <rect x={-40} y={-52} width={126} height={12} rx={6} fill="#1b2532" />
      {/* a tiny check-in list */}
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(0 ${-20 + i * 22})`}>
          <rect x={-78} y={-8} width={156} height={16} rx={4} fill="#141d28" />
          <circle cx={-66} cy={0} r={4} fill={["#6a9e7e", "#c07070", "#8e7ab8"][i]} />
          <rect x={-56} y={-3} width={52} height={6} rx={3} fill="#334155" />
          <rect x={30} y={-3} width={40} height={6} rx={3} fill="#2a3644" />
        </g>
      ))}
      <text x={0} y={80} textAnchor="middle" fill="#94a3b8" style={{ fontSize: 17, fontWeight: 600 }}>{label}</text>
    </g>
  );
}

function Phone({ x, y, label }: { x: number; y: number; label: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-38} y={-64} width={76} height={128} rx={12} fill="#1b2532" stroke="#334155" strokeWidth="1.5" />
      <rect x={-32} y={-56} width={64} height={112} rx={7} fill="#0f1720" />
      <rect x={-9} y={-60} width={18} height={5} rx={2.5} fill="#334155" />
      {/* QR + status lines */}
      <rect x={-20} y={-44} width={40} height={40} rx={4} fill="#e2e8f0" />
      {[[-16, -40], [-16, -16], [8, -40]].map(([qx, qy], i) => (
        <g key={i}><rect x={qx} y={qy} width={12} height={12} fill="#1f2937" /><rect x={qx + 3} y={qy + 3} width={6} height={6} fill="#e2e8f0" /></g>
      ))}
      <rect x={-20} y={4} width={40} height={6} rx={3} fill="#334155" />
      <rect x={-20} y={16} width={28} height={6} rx={3} fill="#2a3644" />
      <rect x={-20} y={30} width={40} height={14} rx={4} fill="#2563eb" />
      <text x={0} y={86} textAnchor="middle" fill="#94a3b8" style={{ fontSize: 17, fontWeight: 600 }}>{label}</text>
    </g>
  );
}

export function CloudScene({ t }: { t: Translations }) {
  const f = t.f9Page;
  return (
    <div className="@container absolute inset-0 p-[2cqw] select-none" aria-hidden="true">
      <svg viewBox="0 0 1200 760" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="cl9-cloud" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>
          <radialGradient id="cl9-glow">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.30" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </radialGradient>
        </defs>

        <circle cx={CLOUD.x} cy={CLOUD.y} r={230} fill="url(#cl9-glow)" />

        {/* links + bidirectional packets */}
        {NODES.map((n, i) => {
          const dx = CLOUD.x - n.x, dy = CLOUD.y - n.y;
          return (
            <g key={i}>
              <line x1={n.x} y1={n.y} x2={CLOUD.x} y2={CLOUD.y} stroke="#334155" strokeWidth="2" strokeDasharray="6 7" />
              {/* node -> cloud (blue) */}
              <circle className="cl9-pkt" cx={n.x} cy={n.y} r={6.5} fill="#38bdf8"
                style={{ ["--dx" as string]: `${dx}px`, ["--dy" as string]: `${dy}px`, animationDelay: `${n.delay}s` }} />
              {/* cloud -> node (green) — the reply, so the link reads both ways */}
              <circle className="cl9-pkt" cx={CLOUD.x} cy={CLOUD.y} r={6.5} fill="#22c55e"
                style={{ ["--dx" as string]: `${-dx}px`, ["--dy" as string]: `${-dy}px`, animationDelay: `${n.delay + 1.2}s` }} />
            </g>
          );
        })}

        {/* the cloud itself. CLOUD_D's bbox is centred at x=-37, but the links and
            the label both converge on the origin — so nudge the shape (in its own
            wrapper, never on the path: the CSS `transform` on .cl9-breathe would
            override an SVG transform attribute on the same element). */}
        <g transform={`translate(${CLOUD.x} ${CLOUD.y})`}>
          <g transform="translate(37 0)">
            <path className="cl9-breathe" d={CLOUD_D} fill="url(#cl9-cloud)" stroke="#3b82f6" strokeWidth="2" />
          </g>
          <text x={0} y={-2} textAnchor="middle" fill="#fff" style={{ fontSize: 30, fontWeight: 800 }}>{f.uiCloud}</text>
          <g transform="translate(0 26)">
            <rect x={-64} y={-14} width={128} height={28} rx={14} fill="#fff" fillOpacity="0.18" />
            <circle className="cl9-live" cx={-46} cy={0} r={5} fill="#4ade80" />
            <text x={8} y={5} textAnchor="middle" fill="#dbeafe" style={{ fontSize: 15, fontWeight: 600 }}>{f.uiRealtime}</text>
          </g>
        </g>

        {NODES.map((n, i) =>
          n.kind === "wh"
            ? <Warehouse key={i} x={n.x} y={n.y} label={f.uiWarehouse} />
            : <Phone key={i} x={n.x} y={n.y} label={f.uiDriver} />
        )}

        {/* both-directions caption on one link */}
        <g transform="translate(392 262)">
          <rect x={-62} y={-15} width={124} height={30} rx={15} fill="#0f1720" fillOpacity="0.92" stroke="#334155" />
          <text x={0} y={5} textAnchor="middle" fill="#7dd3fc" style={{ fontSize: 14, fontWeight: 600 }}>{f.uiSync}</text>
        </g>

        {/* what you do NOT need */}
        <g transform="translate(600 706)">
          {[f.uiNoServer, f.uiNoInstall, f.uiNoHardware].map((label, i, arr) => {
            const w = 200, gap = 16;
            const total = arr.length * w + (arr.length - 1) * gap;
            const x = -total / 2 + i * (w + gap);
            return (
              <g key={i} transform={`translate(${x} 0)`}>
                <rect x={0} y={-19} width={w} height={38} rx={19} fill="#1b2532" stroke="#3f4a5a" />
                <g stroke="#ef4444" strokeWidth="2.4" strokeLinecap="round">
                  <line x1={22} y1={-6} x2={34} y2={6} /><line x1={34} y1={-6} x2={22} y2={6} />
                </g>
                <text x={48} y={5} fill="#cbd5e1" style={{ fontSize: 15, fontWeight: 600 }}>{label}</text>
              </g>
            );
          })}
        </g>

        {/* browser-only badge over the first warehouse */}
        <g transform="translate(190 92)">
          <rect x={-58} y={-15} width={116} height={30} rx={15} fill="#22c55e" fillOpacity="0.14" stroke="#22c55e" strokeOpacity="0.5" />
          <text x={0} y={5} textAnchor="middle" fill="#4ade80" style={{ fontSize: 14, fontWeight: 600 }}>{f.uiBrowser}</text>
        </g>
      </svg>
    </div>
  );
}
