import type { Translations } from "@/lib/i18n/translations";

// Cloud - No Equipment (feature 9): logistiq.cloud in the middle with the
// Logistiq mark, FOUR named warehouses hanging off it, and driver phones that
// pop up beside a warehouse, run through a check-in and vanish — the way real
// traffic actually arrives. Packets travel BOTH ways on every warehouse link.
//
// Grounded in the reality audit: there is no on-prem component anywhere — a
// warehouse is onboarded through a web form and its check-in link is live, so
// the only thing on site is a browser and the driver's phone.
//
// Layout is deliberately symmetric: the cloud sits at the centre of a 1200x760
// viewBox and the four warehouses are placed on a fixed radius around it, so
// nothing crowds anything. Pure CSS (cl9-*), no client JS. aria-hidden.

const CX = 600, CY = 330;          // cloud centre — everything is measured from here

// Four warehouses on a symmetric arc, each with its own phone anchor. `n` numbers
// the warehouse label; `pd` staggers its phone so they never pop in together.
const NODES = [
  { x: 170, y: 150, n: 1, pd: 0.0, px: -122, py: 0 },
  { x: 1030, y: 150, n: 2, pd: 1.6, px: 122, py: 0 },
  { x: 170, y: 560, n: 3, pd: 3.2, px: -122, py: 0 },
  { x: 1030, y: 560, n: 4, pd: 4.8, px: 122, py: 0 },
];

// An upright, symmetric cloud: three lobes on a flat base, centred on x=0 so the
// label and the logo land dead centre. (The previous path was authored off-axis,
// which pushed the label out of the shape.)
const CLOUD_D =
  "M-150 40 A46 46 0 0 1 -150 -34 A62 62 0 0 1 -34 -74 A70 70 0 0 1 96 -50 " +
  "A48 48 0 0 1 150 40 Z";

function Warehouse({ x, y, label }: { x: number; y: number; label: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-86} y={-52} width={172} height={104} rx={9} fill="#1b2532" stroke="#334155" strokeWidth="1.5" />
      {/* browser chrome — the only "equipment" a warehouse needs */}
      <rect x={-86} y={-52} width={172} height={22} rx={9} fill="#243040" />
      <rect x={-86} y={-41} width={172} height={11} fill="#243040" />
      {[-74, -63, -52].map((cx, i) => (
        <circle key={i} cx={cx} cy={-41} r={3} fill={["#ef4444", "#f59e0b", "#22c55e"][i]} />
      ))}
      <rect x={-38} y={-47} width={120} height={11} rx={5.5} fill="#1b2532" />
      {/* a tiny live check-in list */}
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(0 ${-16 + i * 20})`}>
          <rect x={-72} y={-7.5} width={144} height={15} rx={4} fill="#141d28" />
          <circle cx={-61} cy={0} r={3.6} fill={["#6a9e7e", "#c07070", "#8e7ab8"][i]} />
          <rect x={-52} y={-2.5} width={46} height={5} rx={2.5} fill="#334155" />
          <rect x={28} y={-2.5} width={36} height={5} rx={2.5} fill="#2a3644" />
        </g>
      ))}
      <text x={0} y={72} textAnchor="middle" fill="#cbd5e1" style={{ fontSize: 17, fontWeight: 600 }}>{label}</text>
    </g>
  );
}

// A driver's phone: appears beside its warehouse, steps through three check-in
// frames, then leaves. Minimal on purpose — it reads as traffic, not as a mockup.
function DriverPhone({ x, y, delay, label }: { x: number; y: number; delay: number; label?: string }) {
  return (
    <g className="cl9-phone" transform={`translate(${x} ${y})`} style={{ animationDelay: `${delay}s` }}>
      <rect x={-17} y={-29} width={34} height={58} rx={6} fill="#0f1720" stroke="#475569" strokeWidth="1.4" />
      <rect x={-4} y={-26} width={8} height={2.4} rx={1.2} fill="#475569" />
      {/* three frames of a check-in, cross-fading in place */}
      <g className="cl9-f1">
        <rect x={-11} y={-19} width={22} height={22} rx={2.5} fill="#e2e8f0" />
        {[[-8, -16], [-8, -6], [2, -16]].map(([qx, qy], i) => (
          <g key={i}><rect x={qx} y={qy} width={7} height={7} fill="#1f2937" /><rect x={qx + 1.8} y={qy + 1.8} width={3.4} height={3.4} fill="#e2e8f0" /></g>
        ))}
      </g>
      <g className="cl9-f2">
        <rect x={-11} y={-19} width={22} height={4} rx={2} fill="#334155" />
        <rect x={-11} y={-12} width={22} height={4} rx={2} fill="#334155" />
        <rect x={-11} y={-5} width={14} height={4} rx={2} fill="#334155" />
        <rect x={-11} y={3} width={22} height={7} rx={2} fill="#2563eb" />
      </g>
      <g className="cl9-f3">
        <circle cx={0} cy={-8} r={9} fill="#22c55e" fillOpacity="0.18" stroke="#22c55e" strokeWidth="1.4" />
        <path d="M-4 -8 l3 3 l5.5 -6" fill="none" stroke="#22c55e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <rect x={-11} y={6} width={22} height={3.4} rx={1.7} fill="#334155" />
      </g>
      {label && <text x={0} y={42} textAnchor="middle" fill="#64748b" style={{ fontSize: 11, fontWeight: 600 }}>{label}</text>}
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
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>
          <radialGradient id="cl9-glow">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </radialGradient>
        </defs>

        <circle cx={CX} cy={CY} r={250} fill="url(#cl9-glow)" />

        {/* warehouse <-> cloud links, with a packet each way */}
        {NODES.map((n, i) => {
          const dx = CX - n.x, dy = CY - n.y;
          return (
            <g key={i}>
              <line x1={n.x} y1={n.y} x2={CX} y2={CY} stroke="#334155" strokeWidth="2" strokeDasharray="6 7" />
              <circle className="cl9-pkt" cx={n.x} cy={n.y} r={6} fill="#38bdf8"
                style={{ ["--dx" as string]: `${dx}px`, ["--dy" as string]: `${dy}px`, animationDelay: `${i * 0.5}s` }} />
              <circle className="cl9-pkt" cx={CX} cy={CY} r={6} fill="#22c55e"
                style={{ ["--dx" as string]: `${-dx}px`, ["--dy" as string]: `${-dy}px`, animationDelay: `${i * 0.5 + 1.2}s` }} />
            </g>
          );
        })}

        {/* warehouses + their drivers */}
        {NODES.map((n, i) => (
          <g key={i}>
            <Warehouse x={n.x} y={n.y} label={`${f.uiWarehouse} ${n.n}`} />
            <DriverPhone x={n.x + n.px} y={n.y + n.py} delay={n.pd} label={i === 0 ? f.uiDriver : undefined} />
          </g>
        ))}

        {/* the cloud — drawn last so it sits above the links converging on it.
            Logo + wordmark are laid out as ONE row centred on the cloud's axis:
            the mark occupies x -100..-56, the label starts at -46 and runs ~150,
            so the pair is optically centred without either touching a lobe. */}
        <g transform={`translate(${CX} ${CY})`}>
          <path className="cl9-breathe" d={CLOUD_D} fill="url(#cl9-cloud)" stroke="#60a5fa" strokeWidth="2" />
          {/* the Logistiq mark on a white tile — icon.svg is the square mark
              (logo.svg bakes in a wordmark and collides with the label) */}
          <rect x={-100} y={-24} width={44} height={44} rx={10} fill="#fff" />
          <image href="/icon.svg" x={-96} y={-20} width={36} height={36} preserveAspectRatio="xMidYMid meet" />
          <text x={-46} y={8} textAnchor="start" fill="#fff" style={{ fontSize: 25, fontWeight: 800 }}>{f.uiCloud}</text>
        </g>

        {/* Live sync sits just under the cloud — inside it, the cloud's base
            would clip the pill and crowd the wordmark */}
        <g transform={`translate(${CX} ${CY + 62})`}>
          <rect x={-62} y={-14} width={124} height={28} rx={14} fill="#1b2532" stroke="#3b82f6" strokeOpacity="0.45" />
          <circle className="cl9-live" cx={-44} cy={0} r={4.5} fill="#4ade80" />
          <text x={10} y={5} textAnchor="middle" fill="#93c5fd" style={{ fontSize: 14, fontWeight: 600 }}>{f.uiRealtime}</text>
        </g>

        {/* both-directions caption, on the link with room for it */}
        <g transform="translate(392 250)">
          <rect x={-60} y={-14} width={120} height={28} rx={14} fill="#0f1720" fillOpacity="0.92" stroke="#334155" />
          <text x={0} y={5} textAnchor="middle" fill="#7dd3fc" style={{ fontSize: 13.5, fontWeight: 600 }}>{f.uiSync}</text>
        </g>

        {/* browser-only badge over the first warehouse */}
        <g transform="translate(170 66)">
          <rect x={-56} y={-14} width={112} height={28} rx={14} fill="#22c55e" fillOpacity="0.14" stroke="#22c55e" strokeOpacity="0.5" />
          <text x={0} y={5} textAnchor="middle" fill="#4ade80" style={{ fontSize: 13.5, fontWeight: 600 }}>{f.uiBrowser}</text>
        </g>

        {/* what you do NOT need */}
        <g transform="translate(600 712)">
          {[f.uiNoServer, f.uiNoInstall, f.uiNoHardware].map((label, i, arr) => {
            const w = 196, gap = 14;
            const total = arr.length * w + (arr.length - 1) * gap;
            const x = -total / 2 + i * (w + gap);
            return (
              <g key={i} transform={`translate(${x} 0)`}>
                <rect x={0} y={-18} width={w} height={36} rx={18} fill="#1b2532" stroke="#3f4a5a" />
                <g stroke="#ef4444" strokeWidth="2.4" strokeLinecap="round">
                  <line x1={22} y1={-6} x2={34} y2={6} /><line x1={34} y1={-6} x2={22} y2={6} />
                </g>
                <text x={48} y={5} fill="#cbd5e1" style={{ fontSize: 14.5, fontWeight: 600 }}>{label}</text>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
