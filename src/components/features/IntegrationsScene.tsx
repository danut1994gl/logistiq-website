import type { ReactNode } from "react";
import type { Translations } from "@/lib/i18n/translations";
import { LogistiqCloud } from "./LogistiqCloud";
import { IntegrationsInfoTip, type TipSide } from "./IntegrationsInfoTip";

// Systems Integrations & API (feature 16): one clean interconnection map, drawn as a
// wheel. logistiq.cloud is the hub and eight cards sit around it, each on a spoke aimed
// at the hub's centre, mirrored left to right and top to bottom:
//   - above: QRGo Self (the tablet and ticket printer on the office counter);
//   - left, top to bottom: QRGo Access (the gate scanner, which validates the driver's
//     check-in against the cloud), the warehouse self-service portal, QRGo Driver;
//   - below: the carrier portal (a transport company's own dashboard account, booking slots);
//   - right, top to bottom: the warehouse's own systems (TMS / WMS / ERP), reached through
//     the Integration API (/api/v1), the edge the API tag marks.
// Each spoke is a connection that works today. QRGo Access's barrier is drawn down: opening
// it on a valid scan is in progress (until 2026-11-24 this node was labelled "Integration
// API" and its barrier was lifted). Until 2026-11-28 the map was two columns of cards, the
// surfaces on the left and the systems on the right, without QRGo Self or the carrier portal.
// Each card carries an info button on its inner top corner (IntegrationsInfoTip, the one
// client leaf) that says what that part does; the buttons sit in an HTML layer over the SVG,
// in a box of the drawing's own proportions, so a percentage of the box is a point of the
// drawing and the notes stay legible however small the drawing is shown. The drawing itself
// is pure CSS (ix16-*), aria-hidden, a Server Component.
// Two geometries of the same wheel: WIDE (1200 x 760) from 640 px up, and TALL (800 x 1000)
// on a phone, whose cards stand in three rows each side and whose names are half as big
// again, so the map stays readable at a third of its size (until 2026-11-28 a phone showed
// the wide drawing at about a quarter, its names some 4 px tall). Only one is displayed.

const S = 0.85; // every card's scale
const CARD_HW = 100 * S; // a card's half-width and half-height, as drawn
const CARD_HH = 52 * S;

type Spot = "n" | "nw" | "w" | "sw" | "s" | "ne" | "e" | "se";
const SPOKES: Spot[] = ["n", "ne", "e", "se", "s", "sw", "w", "nw"];

type Layout = {
  id: string; // namespaces the SVG's gradients and filters
  w: number;
  h: number;
  hub: { x: number; y: number };
  cloud: number; // the cloud's scale
  glow: number;
  tag: number; // the API tag's scale
  label: number; // a surface name's font size
  above: Spot[]; // the surfaces named above their card: their spoke leaves downwards
  // the eight card centres, mirrored about the hub on both axes
  pos: Record<Spot, { x: number; y: number }>;
};

const WIDE: Layout = {
  id: "ix16", w: 1200, h: 760, hub: { x: 600, y: 380 }, cloud: 1.16, glow: 300, tag: 1, label: 16, above: ["n"],
  pos: {
    n: { x: 600, y: 100 }, nw: { x: 300, y: 175 }, w: { x: 175, y: 380 }, sw: { x: 300, y: 585 },
    s: { x: 600, y: 660 }, ne: { x: 900, y: 175 }, e: { x: 1025, y: 380 }, se: { x: 900, y: 585 },
  },
};
const TALL: Layout = {
  id: "ix16t", w: 800, h: 1000, hub: { x: 400, y: 500 }, cloud: 0.75, glow: 260, tag: 0.8, label: 24, above: ["n", "nw"],
  pos: {
    n: { x: 400, y: 105 }, nw: { x: 140, y: 290 }, w: { x: 140, y: 500 }, sw: { x: 140, y: 710 },
    s: { x: 400, y: 890 }, ne: { x: 660, y: 290 }, e: { x: 660, y: 500 }, se: { x: 660, y: 710 },
  },
};

// The cloud's half-width at scale 1 (LogistiqCloud's CLOUD_HW), and the ellipse inside its
// outline where a spoke ends, so each spoke and its packets disappear beneath its edge.
const CLOUD_HALF_W = 158;
const hubEllipse = (L: Layout) => ({ rx: (160 / 1.16) * L.cloud, ry: (100 / 1.16) * L.cloud });

// A spoke from a card to the hub: where it leaves the card and where it goes under the cloud.
function spoke(L: Layout, at: Spot) {
  const c = L.pos[at];
  const vx = L.hub.x - c.x, vy = L.hub.y - c.y;
  const len = Math.hypot(vx, vy);
  const ux = vx / len, uy = vy / len;
  const out = Math.min(ux ? CARD_HW / Math.abs(ux) : Infinity, uy ? CARD_HH / Math.abs(uy) : Infinity);
  const { rx, ry } = hubEllipse(L);
  const under = 1 / Math.hypot(ux / rx, uy / ry);
  const r = (n: number) => Math.round(n * 10) / 10;
  return {
    x1: r(c.x + ux * out), y1: r(c.y + uy * out),
    x2: r(L.hub.x - ux * under), y2: r(L.hub.y - uy * under),
  };
}

const Pkt = ({ x, y, dx, dy, delay, fill }: { x: number; y: number; dx: number; dy: number; delay: number; fill: string }) => (
  <circle className="ix16-pkt" cx={x} cy={y} r={6} fill={fill}
    style={{ ["--dx" as string]: `${dx}px`, ["--dy" as string]: `${dy}px`, animationDelay: `${delay}s` }} />
);

// A card: the shared frame, placed on its spot at the wheel's scale.
function Card({ x, y, children }: { x: number; y: number; children: ReactNode }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${S})`}>
      <rect x={-100} y={-52} width={200} height={104} rx={10} fill="#1b2532" stroke="#334155" strokeWidth="1.5" />
      {children}
    </g>
  );
}

// QRGo Self: the tablet on the office counter, its check-in form confirmed, and the
// printer beside it handing the driver a ticket.
function SelfNode({ x, y }: { x: number; y: number }) {
  return (
    <Card x={x} y={y}>
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
    </Card>
  );
}

// The carrier portal: a transport company's own account, a truck and the booking grid
// it picks a slot from — booked, confirmed and still-scheduled slots among free ones.
function CarrierPortalNode({ x, y }: { x: number; y: number }) {
  const slot = ["#141d28", "#3b82f6", "#141d28", "#22c55e", "#141d28", "#141d28", "#3b82f6", "#f59e0b", "#3b82f6", "#141d28", "#141d28", "#141d28"];
  return (
    <Card x={x} y={y}>
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
    </Card>
  );
}

// QRGo Access, the gate scanner: the reader on its post, with the organisation's key it
// authenticates with (`org_` + 32 hex is the real key format), and the barrier
// beside it, down, because opening it with QRGoBox is in progress.
function DeviceNode({ x, y }: { x: number; y: number }) {
  return (
    <Card x={x} y={y}>
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
    </Card>
  );
}

// The warehouse self-service portal: a browser with the warehouse's own bookings,
// carriers and drivers — kept current by the people who run the yard.
function PortalNode({ x, y }: { x: number; y: number }) {
  return (
    <Card x={x} y={y}>
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
    </Card>
  );
}

// The QRGo Driver apps: three phones, each a driver's check-in on their own screen.
function DriversNode({ x, y }: { x: number; y: number }) {
  const cols = ["#38bdf8", "#22c55e", "#f59e0b"];
  return (
    <Card x={x} y={y}>
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
    </Card>
  );
}

// One of the warehouse's own systems (TMS / WMS / ERP). A solid, connected box —
// a server stack and a live dot — reached through the cloud over the API.
function SystemNode({ x, y, label }: { x: number; y: number; label: string }) {
  return (
    <Card x={x} y={y}>
      {[-16, 0, 16].map((ry) => (
        <g key={ry}>
          <rect x={-74} y={ry - 6} width={36} height={12} rx={2.5} fill="#0f1720" stroke="#475569" strokeWidth="1.3" />
          <circle cx={-66} cy={ry} r={2} fill="#22c55e" />
          <rect x={-58} y={ry - 1.5} width={14} height={3} rx={1.5} fill="#334155" />
        </g>
      ))}
      <text x={26} y={10} textAnchor="middle" fill="#cbd5e1" style={{ fontSize: 28, fontWeight: 700 }}>
        {label}
      </text>
    </Card>
  );
}

// A surface's name: under its card, or above it when its spoke leaves downwards.
function Label({ L, at, text }: { L: Layout; at: Spot; text: string }) {
  const c = L.pos[at];
  const above = L.above.includes(at);
  // a side card's name above it starts at its left edge and stands higher, clear of the info
  // button on its corner (on a phone the button is large next to the drawing)
  const start = above && at !== "n";
  const y = above ? c.y - CARD_HH - (start ? 28 : 12) : c.y + CARD_HH + 6 + L.label;
  return (
    <text x={start ? c.x - CARD_HW : c.x} y={y} textAnchor={start ? "start" : "middle"} fill="#cbd5e1" style={{ fontSize: L.label, fontWeight: 600 }}>
      {text}
    </text>
  );
}

// Where each card's info button sits (its inner top corner) and where its note opens:
// towards the hub, so it stays inside the frame.
function infoSpot(L: Layout, at: Spot): { x: number; y: number; side: TipSide } {
  const c = L.pos[at];
  const right = c.x > L.hub.x;
  const x = right ? c.x - CARD_HW + 3 : c.x + CARD_HW - 3;
  const y = c.y - CARD_HH + 3;
  const side: TipSide = at === "n" ? "below" : at === "s" ? "above" : right ? "left" : "right";
  return { x, y, side };
}

// One geometry of the wheel: the drawing, and the info buttons over it.
function Wheel({ L, f, className }: { L: Layout; f: Translations["f16Page"]; className: string }) {
  const api = spoke(L, "e");
  const cloudRight = L.hub.x + CLOUD_HALF_W * L.cloud;
  const infos: { at: Spot; name: string; text: string }[] = [
    { at: "n", name: f.uiSelf, text: f.tipSelf },
    { at: "nw", name: f.uiGateScanner, text: f.tipAccess },
    { at: "w", name: f.uiCarrier, text: f.tipPortal },
    { at: "sw", name: f.uiRealtime, text: f.tipDriver },
    { at: "s", name: f.uiCarrierPortal, text: f.tipCarrier },
    { at: "ne", name: f.uiTms, text: f.tipTms },
    { at: "e", name: f.uiWms, text: f.tipWms },
    { at: "se", name: f.uiErp, text: f.tipErp },
  ];
  const P = L.pos;
  return (
    <div className={`absolute inset-0 p-[2cqw] select-none [container-type:size] items-center justify-center ${className}`}>
      <div className="relative" style={{ aspectRatio: `${L.w} / ${L.h}`, width: `min(100cqw, ${L.w / L.h} * 100cqh)` }}>
      <svg viewBox={`0 0 ${L.w} ${L.h}`} data-layout={L.id} className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        <defs>
          <radialGradient id={`${L.id}-glow`}>
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.30" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </radialGradient>
        </defs>

        <circle className="ix16-breathe" cx={L.hub.x} cy={L.hub.y} r={L.glow} fill={`url(#${L.id}-glow)`} />

        {/* ===== the spokes: every card talks to the cloud, packets both ways ===== */}
        {SPOKES.map((at, i) => {
          const { x1, y1, x2, y2 } = spoke(L, at);
          const dx = x2 - x1, dy = y2 - y1;
          return (
            <g key={at}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#3b82f6" strokeWidth="2.5" strokeOpacity="0.8" />
              <circle cx={x1} cy={y1} r={4.5} fill="#3b82f6" />
              <Pkt x={x1} y={y1} dx={dx} dy={dy} delay={i * 0.35} fill="#38bdf8" />
              <Pkt x={x2} y={y2} dx={-dx} dy={-dy} delay={i * 0.35 + 1.3} fill="#4ade80" />
            </g>
          );
        })}

        {/* ===== the hub: the shared logistiq.cloud mark ===== */}
        <g transform={`translate(${L.hub.x} ${L.hub.y}) scale(${L.cloud})`}>
          <LogistiqCloud id={L.id} />
        </g>
        {/* the API tag on the connection to your systems, between the cloud's edge and WMS */}
        <g transform={`translate(${Math.round((cloudRight + api.x1) / 2)} ${L.hub.y}) scale(${L.tag})`}>
          <rect x={-30} y={-15} width={60} height={30} rx={15} fill="#0f1720" stroke="#3b82f6" strokeOpacity="0.5" strokeWidth="1.5" />
          <text x={0} y={5} textAnchor="middle" fill="#7dd3fc" style={{ fontSize: 15, fontWeight: 700 }}>API</text>
        </g>

        {/* ===== the logistiq surfaces: above, left and below ===== */}
        <SelfNode x={P.n.x} y={P.n.y} />
        <DeviceNode x={P.nw.x} y={P.nw.y} />
        <PortalNode x={P.w.x} y={P.w.y} />
        <DriversNode x={P.sw.x} y={P.sw.y} />
        <CarrierPortalNode x={P.s.x} y={P.s.y} />
        <Label L={L} at="n" text={f.uiSelf} />
        <Label L={L} at="nw" text={f.uiGateScanner} />
        <Label L={L} at="w" text={f.uiCarrier} />
        <Label L={L} at="sw" text={f.uiRealtime} />
        <Label L={L} at="s" text={f.uiCarrierPortal} />

        {/* ===== your systems (right), connected over the API ===== */}
        <SystemNode x={P.ne.x} y={P.ne.y} label={f.uiTms} />
        <SystemNode x={P.e.x} y={P.e.y} label={f.uiWms} />
        <SystemNode x={P.se.x} y={P.se.y} label={f.uiErp} />
      </svg>

      {/* ===== what each card does: an info button on its inner top corner ===== */}
      {infos.map(({ at, name, text }) => {
        const { x, y, side } = infoSpot(L, at);
        // no transform here: it would trap the open note's z-index under the later buttons
        return (
          <div key={at} className="absolute select-text"
            style={{ left: `${(x / L.w) * 100}%`, top: `${(y / L.h) * 100}%` }}>
            <IntegrationsInfoTip name={name} text={text} what={f.tipAria} side={side} />
          </div>
        );
      })}
      </div>
    </div>
  );
}

export function IntegrationsScene({ t }: { t: Translations }) {
  const f = t.f16Page;
  return (
    <>
      <Wheel L={WIDE} f={f} className="hidden sm:flex" />
      <Wheel L={TALL} f={f} className="flex sm:hidden" />
    </>
  );
}
