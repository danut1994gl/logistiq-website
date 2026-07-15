"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import type { Translations } from "@/lib/i18n/translations";
import type { Locale } from "@/lib/i18n/config";
import { PhoneFrame16 } from "./PhoneFrame16";
import { DRIVER_POOLS } from "./driverPools";

// Automatic Location Detection (feature 12) — the honest version of the mechanic.
// LEFT: the operator's map. A cursor arms "Draw Zone" and clicks 4 vertices; the
// polygon closes on the first point (exactly how the real GeofenceConfigModal's
// Google drawing manager works) and the counter reads "Geofence has 4 points" —
// which the real modal only renders at >= 3 points, so ours does too. Polygon
// colours are the modal's own polygonOptions (fill #10b981, stroke #059669,
// weight 3), with only the fill opacity dialled back off the real 0.3 — see the
// note at the <polygon>. The button is the real bg-emerald-600, dimmed while drawing.
// RIGHT: the QRGO Driver app (dark theme — the app is ThemeMode.system) showing
// the real AutoCheckinBanner 1:1 with auto_checkin_banner.dart: #10B981 -> #059669
// topLeft->bottomRight, 16px radius, two white 2px rings scaling 0.5->1.5 over
// 1500ms with the second delayed 750ms, white button with #059669 text, and the
// whole thing fading in + sliding Y -0.2->0 over 300ms.
//
// The three things this scene exists to get RIGHT (see the f12 audit's doNotClaim):
//  1. It DETECTS and SUGGESTS. A finger visibly taps Check-in and the normal form
//     opens — nothing is ever submitted off a GPS fix (home_screen.dart:210).
//  2. The test runs ON THE PHONE: the ray-cast (the real algorithm — one crossing
//     => inside) fires next to the "On device" chip, not on a server.
//  3. The operator never tracks anyone. The marker + ray belong to the phone's own
//     evaluation, which is why the "On device" chip is pinned to them.
// No radius circle anywhere — geofences are polygon-only. Client player; static
// frame on reduced-motion.

// yard boundary, in map user units — an irregular quad, never a radius
const V = [
  { x: 150, y: 110 },
  { x: 500, y: 96 },
  { x: 520, y: 330 },
  { x: 166, y: 348 },
];
// the driver's own marker: in off-map on the road, then a left turn through the
// gate into the yard. Rotation interpolates with the translate, so it arcs.
const TRUCK = [
  { x: -60, y: 414, r: 0, d: 0 },
  { x: 304, y: 414, r: 0, d: 1800 },
  { x: 304, y: 268, r: -90, d: 1500 },
];
// where the ray-cast lands: a horizontal ray right from the marker crosses edge
// V2->V3 exactly once => odd => inside (location_service.dart:60-87)
const RAY_Y = 268;
const RAY_X0 = 304;
const HIT_X = 515;

const CURSOR_HOME = { x: 300, y: 300 };
const CURSOR_BTN = { x: 60, y: 484 };

// map furniture — neighbouring blocks in the industrial park, i.e. the six
// warehouses on the same access road that the copy talks about
const BLOCKS = [
  { x: 82, y: 96, w: 48, h: 120 },
  { x: 82, y: 240, w: 48, h: 90 },
  { x: 540, y: 100, w: 48, h: 130 },
  { x: 540, y: 250, w: 48, h: 80 },
];
const ROADS = [
  { x: 0, y: 36, w: 660, h: 32 },
  { x: 0, y: 396, w: 660, h: 32 },
  { x: 36, y: 0, w: 32, h: 452 },
  { x: 596, y: 0, w: 32, h: 452 },
  { x: 288, y: 336, w: 32, h: 64 },
];

// FontAwesome's faDrawPolygon, as used by the real modal's Draw Zone button and
// its "Geofence has N points" strip
const POLY_ICON = (
  <>
    <path d="M4 6.5 14 3l6 9-9 8.5-7-6z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    {([[4, 6.5], [14, 3], [20, 12], [11, 20.5]] as const).map(([x, y], i) => (
      <rect key={i} x={x - 1.7} y={y - 1.7} width={3.4} height={3.4} rx={0.7} fill="currentColor" />
    ))}
  </>
);
// Material Icons.location_on / Icons.login — the two glyphs the real banner uses
const PIN_FILLED = "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z";
const LOGIN_D = "M11 7 9.6 8.4l2.6 2.6H2v2h10.2l-2.6 2.6L11 17l5-5-5-5zm9 12h-8v2h8c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-8v2h8v14z";
// Icons.warehouse — the banner's avatar fallback, #10B981 on a white tile
const WarehouseIc = <><path d="M3 21V9l9-5 9 5v12" /><path d="M8 21v-6h8v6" /><path d="M8 12h8" /></>;
const TruckIc = <><path d="M1 6h13v8H1zM14 9h4l3 3v2h-7z" /><circle cx="5" cy="17" r="1.6" /><circle cx="18" cy="17" r="1.6" /></>;
const UserIc = <><circle cx="12" cy="8" r="3.4" /><path d="M5 21a7 7 0 0 1 14 0" /></>;
const PhoneCallIc = <path d="M5 4h4l2 5-3 2a12 12 0 0 0 5 5l2-3 5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />;
const BoxesIc = <><rect x="3" y="13" width="8" height="8" rx="1" /><rect x="13" y="13" width="8" height="8" rx="1" /><rect x="8" y="3" width="8" height="8" rx="1" /></>;
const TrailerIc = <><rect x="2" y="7" width="18" height="9" rx="1" /><path d="M6 16v2M14 16v2M20 11h2" /></>;
const BarcodeIc = <path d="M4 5v14M7 5v14M10 5v10M13 5v14M16 5v10M20 5v14" />;
const DeviceIc = <><rect x="7" y="2" width="10" height="20" rx="2.4" /><path d="M10.6 18.6h2.8" /></>;
const SearchIc = <><circle cx="11" cy="11" r="7" /><path d="M20 20l-4.3-4.3" /></>;
// A pointing hand, built from two rounded shapes rather than one clever path —
// at this size an outline path turns to mush, and this tap has to be unmistakable:
// it is the whole argument of the page that the driver presses the button himself.
const Hand = ({ cls, style }: { cls: string; style?: CSSProperties }) => (
  <svg viewBox="0 0 24 24" className={cls} style={style}>
    <g fill="#f1f5f9" stroke="#0f1720" strokeWidth="1.5" strokeLinejoin="round">
      <rect x="5.5" y="9.5" width="13" height="13" rx="5" />
      <rect x="8.4" y="1.5" width="5" height="12" rx="2.5" />
    </g>
  </svg>
);

// Reduced motion is read as an external store rather than pushed into state from
// the effect, so the static frame is derived during render (no cascading render,
// and `react-hooks/set-state-in-effect` stays happy). getServerSnapshot is false
// so SSR always emits the animated markup and hydration stays consistent.
const REDUCE_Q = "(prefers-reduced-motion: reduce)";
const subscribeReduce = (cb: () => void) => {
  const m = window.matchMedia(REDUCE_Q);
  m.addEventListener("change", cb);
  return () => m.removeEventListener("change", cb);
};
function usePrefersReduced() {
  return useSyncExternalStore(subscribeReduce, () => window.matchMedia(REDUCE_Q).matches, () => false);
}

// ---- phone helpers (hoisted: react-hooks/static-components) ----------------
// 1pt of the real 440pt-wide viewport = 0.2135cqw of the phone body, so every
// size below is the Flutter number converted straight across.
function Skel({ w, h = "1.7cqw", dim }: { w: string; h?: string; dim?: boolean }) {
  return <span className="rounded-full block shrink-0" style={{ width: w, height: h, background: dim ? "#2D2D2D99" : "#2D2D2D" }} />;
}
function Ic({ d, cls, w = "2" }: { d: ReactNode; cls: string; w?: string }) {
  return <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth={w} strokeLinecap="round" strokeLinejoin="round">{d}</svg>;
}
// a row of the real check-in form: icon + label + input. Values that are filled
// in are the ones the driver types — the form is never pre-submitted for him.
function FormRow({ icon, value, w }: { icon: ReactNode; value?: string; w: string }) {
  return (
    <div className="flex flex-col gap-[1.3cqw]">
      <span className="flex items-center gap-[1.5cqw]">
        <Ic d={icon} cls="w-[3.1cqw] h-[3.1cqw] text-[#3B82F6] shrink-0" w="1.9" />
        <Skel w={w} h="1.6cqw" />
      </span>
      <span className="rounded-[2.56cqw] border border-[#2D2D2D] bg-[#1E1E1E] px-[3cqw] py-[2.4cqw] flex items-center">
        {value ? <span className="text-[#F1F5F9] text-[2.9cqw] font-medium truncate">{value}</span> : <Skel w="42%" h="1.6cqw" dim />}
      </span>
    </div>
  );
}

export function GeofenceScene({ t, locale }: { t: Translations; locale: Locale }) {
  const f = t.f12Page;
  const driver = DRIVER_POOLS[locale][0];

  const reduced = usePrefersReduced();

  const [sPts, setPts] = useState(0);
  const [sDrawing, setDrawing] = useState(false);
  const [sClosed, setClosed] = useState(false);
  const [cur, setCur] = useState(CURSOR_HOME);
  const [sCurOn, setCurOn] = useState(true);
  const [clickN, setClickN] = useState(0);
  const [sSeg, setSeg] = useState(0);
  const [sInside, setInside] = useState(false);
  const [sRay, setRay] = useState(false);
  const [fading, setFading] = useState(false);
  const [loop, setLoop] = useState(0);
  // the phone runs one screen behind the map: home -> banner -> tap -> form
  const [sPhone, setPhone] = useState<"home" | "banner" | "tap" | "form">("home");
  const rootRef = useRef<HTMLDivElement>(null);

  // Reduced-motion static frame: the zone is drawn, the marker is inside, the
  // test has run and the banner is up with its tap hint — the whole argument of
  // the page in one still image.
  const pts = reduced ? V.length : sPts;
  const drawing = reduced ? false : sDrawing;
  const closed = reduced ? true : sClosed;
  const curOn = reduced ? false : sCurOn;
  const seg = reduced ? TRUCK.length - 1 : sSeg;
  const inside = reduced ? true : sInside;
  const ray = reduced ? true : sRay;
  const phone = reduced ? "banner" : sPhone;

  useEffect(() => {
    if (reduced) return;
    let cancelled = false, visible = true;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0.15 });
    if (rootRef.current) io.observe(rootRef.current);
    const sleep = (ms: number) => new Promise<void>((res) => { const s = Date.now(); const tick = () => { if (cancelled) return res(); if (visible && Date.now() - s >= ms) return res(); setTimeout(tick, visible ? 90 : 150); }; setTimeout(tick, 90); });
    const click = async () => { setClickN((n) => n + 1); await sleep(170); };

    (async () => {
      await sleep(700);
      while (!cancelled) {
        // 1) arm the drawing manager from the modal footer
        setCurOn(true);
        setCur(CURSOR_BTN);
        await sleep(640);
        await click();
        setDrawing(true);
        await sleep(320);
        if (cancelled) break;

        // 2) click the yard's four corners; the counter appears at 3, as it really does
        for (let i = 0; i < V.length; i++) {
          setCur(V[i]);
          await sleep(560);
          await click();
          setPts(i + 1);
          await sleep(260);
          if (cancelled) break;
        }
        if (cancelled) break;

        // 3) "Close the polygon by clicking on the first point" — the real instruction
        setCur(V[0]);
        await sleep(600);
        await click();
        setClosed(true);
        setDrawing(false);
        await sleep(950);
        setCurOn(false);
        await sleep(350);
        if (cancelled) break;

        // 4) the driver pulls in. From here on nothing on this map is the
        //    operator's — it is the phone testing its own single GPS fix.
        setSeg(1);
        await sleep(TRUCK[1].d + 150);
        setSeg(2);
        await sleep(TRUCK[2].d + 250);
        if (cancelled) break;

        // 5) ray-cast on the device: one crossing => inside
        setRay(true);
        await sleep(900);
        setInside(true);
        await sleep(500);
        if (cancelled) break;

        // 6) the banner suggests the warehouse; 7) the driver taps it himself
        setPhone("banner");
        await sleep(2400);
        setPhone("tap");
        await sleep(560);
        // 8) the normal check-in form — plate, references, documents, as always
        setPhone("form");
        await sleep(3400);
        if (cancelled) break;

        // reset: fade the overlay out so the polygon does not just blink away
        setFading(true);
        setPhone("home");
        await sleep(520);
        setPts(0); setClosed(false); setSeg(0); setInside(false); setRay(false);
        setCur(CURSOR_HOME); setLoop((n) => n + 1);
        await sleep(60);
        setFading(false);
        await sleep(500);
      }
    })();
    return () => { cancelled = true; io.disconnect(); };
  }, [reduced]);

  const tp = TRUCK[seg];
  const truckCol = inside ? "#10b981" : "#64748b";
  const truckCab = inside ? "#34d399" : "#94a3b8";
  const showBanner = phone !== "home";
  // the still frame shows the button already being pressed — the ripple stays
  // out of it, since a frozen ripple would just be a blob over the label
  const pressed = phone === "tap" || reduced;

  // the real banner, rebuilt from auto_checkin_banner.dart
  const banner = (
    // `relative`, not `relative isolate`: the hand is the last child and must be
    // free to paint over both the banner and the hint below it. Isolating here
    // would trap it inside the banner's stacking context.
    <div className="relative flex flex-col shrink-0">
      {/* not overflow-hidden: the tapping hand has to be allowed to hang past
          the banner's bottom edge. The ripple is clipped by the button itself. */}
      <div
        className="gf12-bannerin rounded-[3.4cqw] flex flex-col"
        style={{ background: "linear-gradient(to bottom right, #10B981, #059669)", boxShadow: "0 0.85cqw 2.56cqw rgba(16,185,129,0.3)" }}
      >
        {/* header: the pulsing pin + title + subtitle + dismiss */}
        <div className="flex items-center gap-[2.56cqw] pl-[3.4cqw] pr-[1.7cqw] pt-[2.56cqw]">
          <span className="relative w-[7.7cqw] h-[7.7cqw] flex items-center justify-center shrink-0">
            <span className="gf12-pulse absolute inset-0 rounded-full border-[0.43cqw] border-white" />
            <span className="gf12-pulse gf12-pulse2 absolute inset-0 rounded-full border-[0.43cqw] border-white" />
            <svg viewBox="0 0 24 24" className="relative w-[5.1cqw] h-[5.1cqw] text-white" fill="currentColor"><path d={PIN_FILLED} /></svg>
          </span>
          <span className="flex flex-col min-w-0 flex-1 leading-tight gap-[0.4cqw]">
            <span className="text-white font-semibold text-[3cqw]">{f.uiDetected}</span>
            <span className="text-white/80 text-[2.56cqw]">{f.uiAtWarehouse}</span>
          </span>
          <Ic d={<path d="M6 6l12 12M18 6L6 18" />} cls="w-[4.3cqw] h-[4.3cqw] text-white/80 shrink-0" w="2.2" />
        </div>
        {/* the detected organisation — first polygon match wins, no "nearest" logic */}
        <div className="flex items-center gap-[2.56cqw] px-[3.4cqw] py-[2.56cqw]">
          <span className="w-[10.25cqw] h-[10.25cqw] rounded-[2.56cqw] bg-white flex items-center justify-center shrink-0">
            <Ic d={WarehouseIc} cls="w-[5.1cqw] h-[5.1cqw] text-[#10B981]" w="1.9" />
          </span>
          <span className="flex flex-col min-w-0 leading-tight gap-[0.4cqw]">
            <span className="text-white font-bold text-[3.4cqw] truncate">London Warehouse</span>
            <span className="text-white/80 text-[2.56cqw] truncate">Industriilor 19 · Chiajna</span>
          </span>
        </div>
        {/* the button that does the only thing GPS never does: open the form */}
        <div className="px-[3.4cqw] pb-[3.4cqw]">
          <span
            className="relative isolate overflow-hidden flex items-center justify-center gap-[1.7cqw] rounded-[2.56cqw] bg-white py-[3cqw] font-semibold text-[3.4cqw]"
            style={{ color: "#059669", transform: pressed ? "scale(0.96)" : "none", transition: "transform 130ms ease" }}
          >
            <svg viewBox="0 0 24 24" className="w-[4.3cqw] h-[4.3cqw]" fill="currentColor"><path d={LOGIN_D} /></svg>
            {f.uiCheckinBtn}
            {phone === "tap" && <span className="gf12-ripple absolute w-[30cqw] h-[30cqw] rounded-full" style={{ background: "#05966933" }} />}
          </span>
        </div>
      </div>
      {/* the annotation that keeps the whole page honest */}
      <span className="gf12-coach self-center mt-[7cqw] mb-[3.4cqw] inline-flex items-center gap-[1.5cqw] rounded-full border border-[#10B981]/50 bg-[#0f1720] px-[2.8cqw] py-[1.4cqw]">
        <Ic d={<path d="M12 19V5M6 11l6-6 6 6" />} cls="w-[2.9cqw] h-[2.9cqw] text-[#34d399] shrink-0" w="2.4" />
        <span className="text-[#6ee7b7] text-[2.5cqw] font-semibold whitespace-nowrap">{f.uiTapToCheckin}</span>
      </span>
      {/* the finger — last child, so it paints over the button AND the hint.
          Anchored from the bottom of the block: the button sits a fixed
          distance above the hint, so this stays put whatever the copy does. */}
      <Hand
        cls="absolute w-[12cqw] h-[12cqw] pointer-events-none drop-shadow-lg"
        style={{
          // lands right of the centred label, so the finger presses the button
          // without ever covering the word it is pressing
          left: "62%", bottom: "20cqw",
          opacity: showBanner ? 1 : 0,
          transform: pressed ? "translate(0, 0) scale(0.95)" : "translate(3cqw, 9cqw)",
          transition: "transform 320ms cubic-bezier(0.4, 0, 0.2, 1), opacity 300ms ease",
        }}
      />
    </div>
  );

  // the app's Home screen — dark theme (#121212 background, #1E1E1E surfaces).
  // The banner only ever appears with no active check-in, so the card below it
  // is deliberately in its empty state (home_screen.dart:198-200).
  const home = (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="flex items-center gap-[2.56cqw] px-[3.4cqw] py-[2.6cqw] shrink-0 border-b border-[#2D2D2D] bg-[#1E1E1E]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/qrgo-icon.svg" alt="" className="w-[8cqw] h-[8cqw] rounded-[1.8cqw] bg-white p-[0.7cqw] shrink-0" />
        <span className="text-[#F1F5F9] font-bold text-[3.8cqw]">QRGO Driver</span>
      </div>
      <div className="flex-1 min-h-0 p-[3.4cqw] flex flex-col overflow-hidden">
        {showBanner ? banner : null}
        <div className="rounded-[3.4cqw] border border-dashed border-[#2D2D2D] bg-[#1E1E1E] p-[4cqw] flex flex-col items-center gap-[2.2cqw] shrink-0">
          <span className="w-[11cqw] h-[11cqw] rounded-full bg-[#2D2D2D] flex items-center justify-center">
            <Ic d={TruckIc} cls="w-[5.8cqw] h-[5.8cqw] text-[#64748B]" w="1.7" />
          </span>
          <Skel w="46%" h="1.9cqw" />
          <Skel w="64%" h="1.6cqw" dim />
        </div>
        <div className="grid grid-cols-2 gap-[3cqw] mt-[4cqw] shrink-0">
          {[SearchIc, TruckIc].map((ic, i) => (
            <span key={i} className="rounded-[3.4cqw] border border-[#2D2D2D] bg-[#1E1E1E] p-[3cqw] flex flex-col gap-[2cqw]">
              <span className="w-[8.5cqw] h-[8.5cqw] rounded-[2.2cqw] bg-[#3B82F6]/15 flex items-center justify-center">
                <Ic d={ic} cls="w-[4.4cqw] h-[4.4cqw] text-[#3B82F6]" w="1.9" />
              </span>
              <Skel w="72%" h="1.6cqw" />
            </span>
          ))}
        </div>
        <div className="rounded-[3.4cqw] border border-[#2D2D2D] bg-[#1E1E1E] p-[3cqw] mt-[3cqw] flex items-center gap-[2.4cqw] shrink-0">
          <Ic d={SearchIc} cls="w-[4.4cqw] h-[4.4cqw] text-[#64748B] shrink-0" w="1.9" />
          <Skel w="56%" h="1.7cqw" dim />
        </div>
        {/* the organisation history below — the banner pushes it down and it
            clips at the fold, exactly as it does in the real scroll view */}
        <div className="flex flex-col gap-[2.4cqw] mt-[4cqw]">
          <Skel w="38%" h="1.7cqw" />
          {[0, 1, 2].map((i) => (
            <span key={i} className="rounded-[2.6cqw] border border-[#2D2D2D] bg-[#1E1E1E] p-[2.6cqw] flex items-center gap-[2.4cqw] shrink-0">
              <span className="w-[8cqw] h-[8cqw] rounded-[2cqw] bg-[#2D2D2D] flex items-center justify-center shrink-0">
                <Ic d={WarehouseIc} cls="w-[4.2cqw] h-[4.2cqw] text-[#64748B]" w="1.8" />
              </span>
              <span className="flex flex-col gap-[1.3cqw] min-w-0 flex-1">
                <Skel w={["62%", "48%", "70%"][i]} h="1.7cqw" />
                <Skel w={["40%", "56%", "34%"][i]} h="1.4cqw" dim />
              </span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );

  // the normal check-in form the button opens — plain app blue, because this
  // screen is ordinary product UI, not the detection feature
  const form = (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="flex items-center gap-[2.4cqw] px-[3cqw] py-[3cqw] shrink-0" style={{ background: "linear-gradient(to right, #2563eb, #1d4ed8)" }}>
        <Ic d={<path d="M15 6l-6 6 6 6" />} cls="w-[5cqw] h-[5cqw] text-white shrink-0" w="2.4" />
        <span className="w-[8cqw] h-[8cqw] rounded-[2.2cqw] bg-white/20 flex items-center justify-center shrink-0">
          <Ic d={<path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2M9 12l1.5 1.5L14 10" />} cls="w-[4.4cqw] h-[4.4cqw] text-white" />
        </span>
        <span className="text-white font-bold text-[3.6cqw] truncate">London Warehouse</span>
      </div>
      {/* the same fields the driver always fills: name, phone, truck, trailer,
          cargo, reference — none of it pre-filled by a GPS reading */}
      <div className="flex-1 min-h-0 p-[3.4cqw] flex flex-col gap-[3cqw] overflow-hidden">
        <FormRow icon={UserIc} value={driver.name} w="34%" />
        <FormRow icon={PhoneCallIc} w="28%" />
        <FormRow icon={TruckIc} value={driver.plate} w="38%" />
        <FormRow icon={TrailerIc} w="30%" />
        <FormRow icon={BoxesIc} w="32%" />
        <FormRow icon={BarcodeIc} w="42%" />
        <span className="rounded-[2.56cqw] flex items-center justify-center py-[3cqw] mt-[1cqw] shrink-0" style={{ background: "linear-gradient(to right, #2563eb, #1d4ed8)" }}>
          <span className="h-[1.8cqw] w-[34%] rounded-full bg-white/60" />
        </span>
      </div>
    </div>
  );

  return (
    <div ref={rootRef} className="@container absolute inset-0 p-[2cqw] flex items-center justify-center gap-[3cqw] select-none" aria-hidden="true">
      {/* ---- LEFT: the operator's map, then the phone's own polygon test ---- */}
      <div className="flex-1 min-w-0 h-full flex items-center">
        <svg viewBox="0 0 660 512" className="w-full h-auto max-h-full" preserveAspectRatio="xMidYMid meet">
          <defs>
            <clipPath id="gf12-mapclip"><rect x={2} y={2} width={656} height={450} rx={12} /></clipPath>
          </defs>

          <g clipPath="url(#gf12-mapclip)">
            <rect x={2} y={2} width={656} height={450} fill="#131c26" />
            {/* a plain roadmap — the real modal renders an unstyled GoogleMap */}
            {ROADS.map((r, i) => <rect key={i} x={r.x} y={r.y} width={r.w} height={r.h} fill="#232f3e" />)}
            <g stroke="#3f4a5a" strokeWidth={1.6} strokeDasharray="9 11" opacity={0.7}>
              <line x1={0} y1={52} x2={660} y2={52} />
              <line x1={0} y1={412} x2={660} y2={412} />
              <line x1={52} y1={0} x2={52} y2={452} />
              <line x1={612} y1={0} x2={612} y2={452} />
            </g>
            {/* the neighbouring warehouses on the same access road */}
            {BLOCKS.map((b, i) => <rect key={i} x={b.x} y={b.y} width={b.w} height={b.h} rx={3} fill="#1b2532" stroke="#2f3d4e" strokeWidth={1.2} />)}

            {/* our yard: building + docks + parking bays + gate posts */}
            <rect x={380} y={126} width={120} height={104} rx={4} fill="#1b2532" stroke="#334155" strokeWidth={1.4} />
            {[392, 412, 432, 452, 472].map((x) => <rect key={x} x={x} y={230} width={12} height={7} rx={1.5} fill="#334155" />)}
            <g stroke="#2f3d4e" strokeWidth={1.5}>
              <line x1={186} y1={250} x2={306} y2={250} />
              {[186, 216, 246, 276, 306].map((x) => <line key={x} x1={x} y1={196} x2={x} y2={250} />)}
              {[186, 216, 246, 276, 306].map((x) => <line key={`b${x}`} x1={x} y1={250} x2={x} y2={304} />)}
            </g>
            <g fill="#475569">
              <rect x={284} y={334} width={5} height={12} rx={1} />
              <rect x={319} y={334} width={5} height={12} rx={1} />
            </g>

            {/* everything the loop builds and tears down */}
            <g style={{ opacity: fading ? 0 : 1, transition: "opacity 400ms ease" }}>
              {/* open polyline while drawing, closed polygon once it snaps shut.
                  Both use the modal's real Google polygonOptions. */}
              {!closed && pts >= 2 && (
                <polyline points={V.slice(0, pts).map((p) => `${p.x},${p.y}`).join(" ")} fill="none" stroke="#059669" strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" />
              )}
              {/* Colour + stroke are the modal's exact polygonOptions. The real
                  fillOpacity is 0.3, but that is over a light Google roadmap —
                  on a dark basemap it turns into a slab that swallows the yard,
                  so it is dialled back to read the same way it does in product. */}
              {closed && (
                <polygon className="gf12-fill" points={V.map((p) => `${p.x},${p.y}`).join(" ")} fill="#10b981" fillOpacity={0.17} stroke="#059669" strokeWidth={3} strokeLinejoin="round" />
              )}
              {/* "Close the polygon by clicking on the first point" */}
              {pts === V.length && !closed && (
                <circle className="gf12-ping" cx={V[0].x} cy={V[0].y} r={11} fill="none" stroke="#34d399" strokeWidth={2} style={{ transformOrigin: `${V[0].x}px ${V[0].y}px` }} />
              )}
              {V.slice(0, pts).map((p, i) => (
                <circle key={`${loop}-${i}`} className="gf12-vtx" cx={p.x} cy={p.y} r={6} fill="#059669" stroke="#ffffff" strokeWidth={2} style={{ transformOrigin: `${p.x}px ${p.y}px` }} />
              ))}

              {/* the ray-cast, fired on the phone: one crossing => odd => inside */}
              {ray && (
                <g key={`ray-${loop}`}>
                  <line className="gf12-ray" x1={RAY_X0} y1={RAY_Y} x2={656} y2={RAY_Y} stroke="#34d399" strokeWidth={2} opacity={0.85} />
                  <circle className="gf12-xdot" cx={HIT_X} cy={RAY_Y} r={5.5} fill="#34d399" stroke="#0f1720" strokeWidth={1.4} style={{ transformOrigin: `${HIT_X}px ${RAY_Y}px` }} />
                </g>
              )}

              {/* the accuracy halo of the one high-accuracy fix — white, so it
                  stays legible on top of the emerald zone rather than merging
                  into it. LocationAccuracy.high, one shot, never a trail. */}
              {inside && <circle className="gf12-fill" cx={RAY_X0} cy={RAY_Y} r={44} fill="#ffffff" fillOpacity={0.09} stroke="#ffffff" strokeOpacity={0.32} strokeWidth={1.6} />}
              {/* top-down tractor + trailer: ribs and a windscreen, or it just
                  reads as a green pill once it turns into the yard */}
              <g key={`truck-${loop}`} className="gf12-truck" style={{ transform: `translate(${tp.x}px, ${tp.y}px) rotate(${tp.r}deg)`, transitionDuration: `${tp.d}ms` }}>
                <rect x={-34} y={-11} width={36} height={22} rx={3} fill={truckCol} stroke="#0f1720" strokeWidth={1.6} />
                <g stroke="#0f1720" strokeWidth={1} opacity={0.4}>
                  {[-26, -18, -10].map((x) => <line key={x} x1={x} y1={-11} x2={x} y2={11} />)}
                </g>
                <rect x={1} y={-2.5} width={5} height={5} fill="#0f1720" />
                <rect x={5} y={-10} width={16} height={20} rx={3.5} fill={truckCab} stroke="#0f1720" strokeWidth={1.6} />
                <rect x={16.5} y={-7} width={3.6} height={14} rx={1.3} fill="#0f1720" opacity={0.55} />
              </g>

              {/* the point-in-polygon test never leaves the handset */}
              {ray && (
                <g key={`chip-${loop}`} className="gf12-chip" transform={`translate(${RAY_X0} 206)`}>
                  <rect x={-88} y={-16} width={176} height={32} rx={16} fill="#0f1720" fillOpacity={0.95} stroke="#10b981" strokeOpacity={0.55} strokeWidth={1.4} />
                  <g transform="translate(-78 -8) scale(0.66)" fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{DeviceIc}</g>
                  <text x={7} y={5} textAnchor="middle" fill="#6ee7b7" style={{ fontSize: 13.5, fontWeight: 600 }}>{f.uiOnDevice}</text>
                </g>
              )}
            </g>

            {/* the operator's cursor */}
            <g className="gf12-cursor" style={{ transform: `translate(${cur.x}px, ${cur.y}px)`, opacity: curOn ? 1 : 0 }}>
              <path d="M0 0 0 19 4.7 14.7 7.6 21.2 10.7 19.7 7.8 13.4 13.4 13.4Z" fill="#ffffff" stroke="#0f1720" strokeWidth={1.4} strokeLinejoin="round" />
            </g>
            {clickN > 0 && curOn && (
              <circle key={clickN} className="gf12-click" cx={cur.x} cy={cur.y} r={12} fill="none" stroke="#34d399" strokeWidth={2.5} style={{ transformOrigin: `${cur.x}px ${cur.y}px` }} />
            )}
          </g>
          <rect x={2} y={2} width={656} height={450} rx={12} fill="none" stroke="#334155" strokeWidth={1.5} />

          {/* footer: the modal's real bg-emerald-600 Draw Zone button, dimmed
              while the drawing manager is armed (disabled:opacity-50) */}
          <g transform="translate(4 464)" style={{ opacity: drawing ? 0.5 : 1, transition: "opacity 200ms ease" }}>
            <rect width={188} height={40} rx={8} fill="#059669" />
            <g transform="translate(14 8) scale(1)" fill="none" stroke="#ffffff">{POLY_ICON}</g>
            <text x={46} y={25} fill="#ffffff" style={{ fontSize: 15, fontWeight: 600 }}>{f.uiDrawZone}</text>
          </g>
          {/* the counter only exists at >= 3 points in the real modal */}
          {pts >= 3 && (
            <g key={`cnt-${loop}`} className="gf12-chip" transform="translate(656 466)">
              <rect x={-280} y={0} width={280} height={36} rx={8} fill="#064e3b" fillOpacity={0.35} stroke="#065f46" strokeWidth={1.4} />
              <g transform="translate(-268 8) scale(0.83)" fill="none" stroke="#a7f3d0">{POLY_ICON}</g>
              <text x={-130} y={23} textAnchor="middle" fill="#a7f3d0" style={{ fontSize: 13, fontWeight: 600 }}>
                {f.uiGeofence} {pts} {f.uiPoints}
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* ---- RIGHT: the QRGO Driver app. 05:40 — the hour in the copy. ---- */}
      <div className="h-[97%] shrink-0">
        <PhoneFrame16 time="05:40" screenClassName="bg-[#121212]">
          <div className="flex-1 min-h-0 relative overflow-hidden">
            <div className="absolute inset-0 flex flex-col transition-opacity duration-500" style={{ opacity: phone === "form" ? 0 : 1 }}>{home}</div>
            <div className="absolute inset-0 flex flex-col transition-opacity duration-500" style={{ opacity: phone === "form" ? 1 : 0 }}>{form}</div>
          </div>
        </PhoneFrame16>
      </div>
    </div>
  );
}
