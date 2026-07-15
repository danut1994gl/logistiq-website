import type { FC } from "react";
import type { Translations } from "@/lib/i18n/translations";
import {
  FlagRO, FlagGB, FlagDE, FlagFR, FlagPL, FlagIT,
  FlagES, FlagNL, FlagHU, FlagBG, FlagCZ, FlagSK,
} from "@/components/icons/flags";

// Multi-language (feature 7) — "his screen, your screen".
// Four drivers, four languages, one warehouse. Each driver speaks in turn: his
// greeting pops, his qrgo.ro card lights up rendered ENTIRELY in his own language,
// and the check-in travels the rail into the single dispatcher panel — where the
// SAME row is rendered in ROMANIAN. That contrast is the whole product and the
// whole honest claim: the INTERFACE is localized into 12 languages; the dispatcher
// is not reading Polish, and nothing anyone typed was machine-translated.
//
// Grounded in the reality audit:
//  * exactly 12 locales, in the product's own order (apps/driver/i18n.ts:5)
//  * language is PICKED from a 12-flag picker — there is NO Accept-Language and no
//    geo-IP in apps/driver (middleware.ts:45 hard-defaults to 'ro'), hence uiPickerNote
//  * the dashboard is RO/EN only (apps/dashboard/i18n.ts:29) — hence the 2-state
//    RO/EN toggle on the panel, and hence the panel being in Romanian
//  * SMS/push are TEMPLATE tables sent outbound from the warehouse, so their chips
//    sit on the warehouse side — deliberately NOT wired to the driver's picked flag
//    (the driver web never persists driver_language, so claiming that would be false)
// Pure CSS (ml7-*), no client JS. Presentational Server Component. aria-hidden.

type FlagCmp = FC<{ className?: string }>;

// The 12 real driver locales, in the product's own order — ro, en, de, fr, pl, it,
// es, nl, hu, bg, cs, sk (apps/driver/i18n.ts:5, "ordered by importance for
// international transport"). This strip IS the first-visit picker. All 12, equally
// weighted: there is no 13th and none of them is a second-class fallback.
const PICKER: FlagCmp[] = [FlagRO, FlagGB, FlagDE, FlagFR, FlagPL, FlagIT, FlagES, FlagNL, FlagHU, FlagBG, FlagCZ, FlagSK];

type StatusKey = "waiting" | "confirmed" | "assigned" | "in_progress";

// Verbatim from the real dark driver-web badge classes (StatusView.tsx getStatusColors):
// waiting=yellow, confirmed=blue, assigned=purple, in_progress=indigo. The dashboard
// table happens to use the same hue per status (CheckinsTable.tsx:583-588), so one map
// serves both sides of the diagram — which is itself the point: same row, same colour,
// different words.
const PILL: Record<StatusKey, string> = {
  waiting: "bg-yellow-900/40 text-yellow-300 border-yellow-800",
  confirmed: "bg-blue-900/40 text-blue-300 border-blue-800",
  assigned: "bg-purple-900/40 text-purple-300 border-purple-800",
  in_progress: "bg-indigo-900/40 text-indigo-300 border-indigo-800",
};

type Driver = {
  Flag: FlagCmp;
  code: string;
  greeting: string; // the driver's OWN words — human speech, not product UI
  title: string;    // checkin.title      — verbatim from apps/driver/messages/<code>.json
  field: string;    // checkin.truckNumber — verbatim
  plate: string;
  status: StatusKey;
  mine: string;     // status.<status> in HIS language — what he reads at qrgo.ro
  ro: string;       // status.<status> in RO — what the dispatcher reads on the dashboard
};

// Four of the twelve, kept in the product's locale order (de, pl, hu, bg). The UI
// strings are taken from the real driver message files, with ONE deliberate
// deviation: a handful of hu/pl keys have lost their diacritics in the product
// ("Check-in Urlap", "Kamion Rendszama", "Megerositve", "Varakozas", "Numer
// Ciezarowki"). We render the correct spellings here — this page's whole claim is
// that no screen is left half-translated, so it must not showcase a misspelling.
// Once those keys are fixed in apps/driver/messages/{hu,pl}.json this is 1:1 again.
// The plates are literals; the greetings are the drivers talking, not shipped strings.
const DRIVERS: Driver[] = [
  { Flag: FlagDE, code: "DE", greeting: "Guten Tag",  title: "Check-in Formular",    field: "LKW-Nummer",        plate: "M-TR 2840",  status: "assigned",    mine: "Zugewiesen",  ro: "Alocat" },
  { Flag: FlagPL, code: "PL", greeting: "Dzień dobry", title: "Formularz Check-in",   field: "Numer Ciężarówki",  plate: "WZ 4821G",   status: "in_progress", mine: "W Trakcie",   ro: "În Desfășurare" },
  { Flag: FlagHU, code: "HU", greeting: "Jó napot",    title: "Check-in Űrlap",       field: "Kamion Rendszáma",  plate: "MRT-841",    status: "confirmed",   mine: "Megerősítve", ro: "Confirmat" },
  { Flag: FlagBG, code: "BG", greeting: "Здравейте",   title: "Формуляр за Check-in", field: "Номер на Камиона",  plate: "CB 7314 MX", status: "waiting",     mine: "Изчакване",   ro: "În Așteptare" },
];

// 16s loop / 4 drivers = one 4s speaking slot each.
const SLOT = 4;

const TruckIc = (
  <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="1.6">
    <rect x="1" y="6" width="13" height="10" rx="1" /><path d="M14 9h4l3 3v4h-7z" />
    <circle cx="5.5" cy="18" r="1.6" /><circle cx="18" cy="18" r="1.6" />
  </svg>
);

// One driver: flag chip -> speech bubble -> his qrgo.ro card -> rail into the warehouse.
function DriverRow({ d, i }: { d: Driver; i: number }) {
  const delay = `${i * SLOT}s`;
  return (
    <div className="flex items-center gap-[1cqw] min-h-0">
      {/* who is speaking — the flag he picked himself */}
      <span className="flex flex-col items-center gap-[0.35cqw] w-[4.6cqw] shrink-0">
        <span className="ml7-flag rounded-[0.3cqw] overflow-hidden" style={{ animationDelay: delay }}>
          <d.Flag className="w-[3.4cqw] h-[2.5cqw] block" />
        </span>
        <span className="text-[1.05cqw] font-bold text-slate-500 leading-none">{d.code}</span>
      </span>

      {/* his own words, in his own language */}
      <span
        className="ml7-bubble relative shrink-0 w-[10.5cqw] rounded-[0.9cqw] border border-slate-600 bg-[#243040] px-[1cqw] py-[0.7cqw] text-[1.35cqw] font-medium text-slate-100 leading-none text-center"
        style={{ animationDelay: delay }}
      >
        <span className="absolute left-[-0.45cqw] top-1/2 -translate-y-1/2 rotate-45 w-[0.85cqw] h-[0.85cqw] bg-[#243040] border-l border-b border-slate-600" />
        {d.greeting}
      </span>

      {/* his screen at qrgo.ro — dark, and every label in his language */}
      <div className="ml7-lit flex-1 min-w-0 rounded-[0.8cqw] border border-slate-700 bg-[#0f1720] overflow-hidden" style={{ animationDelay: delay }}>
        <div className="flex items-center gap-[0.7cqw] px-[1cqw] py-[0.55cqw] bg-gradient-to-r from-[#2563eb] to-[#1d4ed8]">
          <span className="w-[1.5cqw] h-[1.5cqw] text-white/90 shrink-0">{TruckIc}</span>
          <span className="text-white font-bold text-[1.3cqw] truncate">{d.title}</span>
        </div>
        <div className="flex items-center gap-[1cqw] px-[1cqw] py-[0.75cqw]">
          <span className="flex flex-col gap-[0.3cqw] min-w-0 flex-1">
            <span className="text-[1cqw] uppercase tracking-wide text-slate-500 font-semibold truncate">{d.field}</span>
            <span className="rounded-[0.45cqw] border border-slate-700 bg-slate-900/60 px-[0.7cqw] py-[0.35cqw] font-mono font-bold text-[1.3cqw] text-slate-100 truncate">{d.plate}</span>
          </span>
          <span className={`shrink-0 rounded-full border px-[0.9cqw] py-[0.4cqw] text-[1.15cqw] font-semibold whitespace-nowrap ${PILL[d.status]}`}>{d.mine}</span>
        </div>
      </div>

      {/* the rail: his check-in leaving for the one warehouse */}
      <span className="relative w-[8cqw] h-[1.4cqw] shrink-0">
        <span className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t border-dashed border-slate-600" />
        <span className="ml7-pkt absolute left-0 top-1/2 -translate-y-1/2 w-[1.1cqw] h-[1.1cqw] rounded-full bg-sky-400" style={{ animationDelay: delay }} />
        <svg viewBox="0 0 24 24" className="absolute right-0 top-1/2 -translate-y-1/2 w-[1.3cqw] h-[1.3cqw] text-slate-600" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 6l6 6-6 6" />
        </svg>
      </span>
    </div>
  );
}

// The same check-in, on the dispatcher's screen: same plate, same status colour —
// Romanian words. Nothing here was translated; the status is an enum, rendered per viewer.
function PanelRow({ d, i }: { d: Driver; i: number }) {
  return (
    <div
      className="ml7-row flex items-center gap-[0.8cqw] rounded-[0.55cqw] border border-[#243040] bg-[#141d28] px-[0.9cqw] py-[0.7cqw]"
      style={{ animationDelay: `${i * SLOT}s` }}
    >
      <span className="w-[1.6cqw] h-[1.6cqw] text-slate-500 shrink-0">{TruckIc}</span>
      <span className="font-mono font-bold text-[1.25cqw] text-slate-100 truncate">{d.plate}</span>
      <span className={`ml-auto shrink-0 rounded-full border px-[0.8cqw] py-[0.3cqw] text-[1.05cqw] font-semibold whitespace-nowrap ${PILL[d.status]}`}>{d.ro}</span>
    </div>
  );
}

export function MultiLanguageScene({ t }: { t: Translations }) {
  const f = t.f7Page;
  return (
    <div
      className="@container absolute inset-0 p-[2cqw] text-slate-200 select-none"
      // rail 8cqw - chevron 1.3cqw - dot 1.1cqw - 0.2cqw breathing room
      style={{ ["--ml7-run" as string]: "5.4cqw" }}
      aria-hidden="true"
    >
      <div className="w-full h-full flex gap-[2cqw]">
        {/* ---------------- drivers: twelve languages, one tap each ---------------- */}
        <div className="w-[61%] flex flex-col gap-[1cqw] min-h-0">
          <div className="flex items-center gap-[1cqw] shrink-0">
            <span className="font-bold text-white text-[1.9cqw]">{f.uiDrivers}</span>
            <span className="rounded-full border border-blue-500/40 bg-blue-500/12 px-[1cqw] py-[0.35cqw] text-[1.15cqw] font-semibold text-blue-300 whitespace-nowrap">
              {f.uiUiIn}
            </span>
          </div>

          {/* the real first-visit picker: 12 flags, no detection */}
          <div className="flex items-center gap-[1cqw] shrink-0">
            <span className="flex items-center gap-[0.4cqw]">
              {PICKER.map((Flag, i) => (
                <Flag key={i} className="w-[2.1cqw] h-[1.55cqw] rounded-[0.2cqw] block ring-1 ring-slate-700" />
              ))}
            </span>
            <span className="inline-flex items-center gap-[0.55cqw] rounded-full border border-slate-600 bg-slate-800/70 px-[0.9cqw] py-[0.35cqw] text-[1.1cqw] font-semibold text-slate-300 whitespace-nowrap">
              <svg viewBox="0 0 24 24" className="w-[1.2cqw] h-[1.2cqw] text-slate-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 11l3 3L22 4" /><path d="M21 12a9 9 0 1 1-5.2-8.2" />
              </svg>
              {f.uiPickerNote}
            </span>
          </div>

          <div className="flex-1 grid grid-rows-4 gap-[0.9cqw] min-h-0">
            {DRIVERS.map((d, i) => <DriverRow key={d.code} d={d} i={i} />)}
          </div>
        </div>

        {/* ---------------- one warehouse, one dispatcher, RO/EN only ---------------- */}
        <div className="flex-1 flex flex-col gap-[1cqw] min-h-0">
          <span className="font-bold text-white text-[1.9cqw] shrink-0">{f.uiDispatcher}</span>

          <div className="flex-1 rounded-[1cqw] border border-slate-700 bg-slate-900/70 flex flex-col overflow-hidden min-h-0">
            <div className="flex items-center gap-[0.8cqw] px-[1.1cqw] py-[0.85cqw] border-b border-slate-700/70 bg-slate-800/60 shrink-0">
              <svg viewBox="0 0 24 24" className="w-[1.8cqw] h-[1.8cqw] text-blue-300 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 21V9l9-6 9 6v12" /><path d="M9 21v-6h6v6" />
              </svg>
              <span className="font-semibold text-white text-[1.4cqw] truncate">{f.uiOneWarehouse}</span>
              {/* the dashboard has exactly two locales — not twelve */}
              <span className="ml-auto flex items-center gap-[0.3cqw] rounded-[0.5cqw] border border-slate-600 bg-slate-900/70 p-[0.25cqw] shrink-0">
                <span className="flex items-center gap-[0.35cqw] rounded-[0.35cqw] bg-blue-600 px-[0.5cqw] py-[0.2cqw]">
                  <FlagRO className="w-[1.3cqw] h-[0.95cqw] rounded-[0.15cqw] block" />
                  <span className="text-[0.95cqw] font-bold text-white leading-none">RO</span>
                </span>
                <span className="flex items-center gap-[0.35cqw] px-[0.5cqw] py-[0.2cqw] opacity-45">
                  <FlagGB className="w-[1.3cqw] h-[0.95cqw] rounded-[0.15cqw] block" />
                  <span className="text-[0.95cqw] font-bold text-slate-300 leading-none">EN</span>
                </span>
              </span>
            </div>

            <div className="flex items-center gap-[0.6cqw] px-[1.1cqw] pt-[0.9cqw] pb-[0.5cqw] shrink-0">
              <span className="text-[1.15cqw] uppercase tracking-wide font-bold text-slate-500">{f.uiCheckin}</span>
              <span className="flex-1 border-t border-slate-800" />
              <span className="text-[1.15cqw] font-semibold text-slate-500 tabular-nums">{DRIVERS.length}</span>
            </div>

            <div className="flex-1 flex flex-col gap-[0.6cqw] px-[1.1cqw] pb-[1.1cqw] min-h-0">
              {DRIVERS.map((d, i) => <PanelRow key={d.code} d={d} i={i} />)}
            </div>
          </div>

          {/* outbound from the warehouse — template tables, not live translation */}
          <div className="flex flex-col gap-[0.5cqw] shrink-0">
            {[f.uiSmsIn, f.uiPushIn].map((label, i) => (
              <span key={i} className="inline-flex items-center gap-[0.6cqw] rounded-full border border-slate-700 bg-slate-800/50 px-[0.9cqw] py-[0.4cqw] text-[1.1cqw] font-medium text-slate-400">
                <svg viewBox="0 0 24 24" className="w-[1.2cqw] h-[1.2cqw] text-slate-500 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                  {i === 0
                    ? <><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></>
                    : <><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.7 21a2 2 0 0 1-3.4 0" /></>}
                </svg>
                <span className="truncate">{label}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
