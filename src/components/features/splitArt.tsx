import type { Translations } from "@/lib/i18n/translations";

// Second illustrations for the mid-page `split` sections on f16/f17. Small,
// static, presentational diagrams — they sit beside prose, so they explain one
// idea each rather than animate a flow. Server Components. aria-hidden.
//
// Each fills the split section's dark 4:3 panel (which is `isolate` + bordered),
// so the root is the usual @container absolute-inset pattern.

// ── f16: "The objects your systems would exchange already exist" ─────────────
// Two real record shapes (booking + check-in) with actual column names, and the
// five-stamp lifecycle as a chain. Column names are literal (they are the API
// contract); only the framing is translated.
const BOOKING_FIELDS = ["booking_reference", "external_reference", "booking_status", "type", "scheduled_date", "transport_company"];
const CHECKIN_FIELDS = ["truck_number", "trailer_number", "cargo_category_id", "assigned_ramp_id", "driver_name", "extra_references"];
const LIFECYCLE = ["checked_in_at", "confirmed_at", "assigned_at", "started_at", "completed_at"];

function RecordCard({ title, fields, highlight }: { title: string; fields: string[]; highlight?: string }) {
  return (
    <div className="flex-1 rounded-[2cqw] border border-slate-700 bg-slate-900/60 overflow-hidden min-w-0">
      <div className="px-[1.8cqw] py-[1.2cqw] bg-slate-800/70 border-b border-slate-700 flex items-center gap-[1.2cqw]">
        <span className="w-[2.2cqw] h-[2.2cqw] rounded-[0.5cqw] bg-blue-500/25" />
        <span className="text-slate-200 font-mono font-bold text-[2cqw] truncate">{title}</span>
      </div>
      <div className="p-[1.6cqw] flex flex-col gap-[1cqw]">
        {fields.map((k) => (
          <span key={k} className="flex items-center gap-[1.2cqw] min-w-0">
            <span className="w-[1.4cqw] h-[1.4cqw] rounded-full bg-slate-600 shrink-0" />
            <span className={`font-mono text-[1.65cqw] truncate ${k === highlight ? "text-cyan-300" : "text-slate-400"}`}>{k}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export function SchemaArt({ t }: { t: Translations }) {
  const f = t.f16Page;
  return (
    <div className="@container absolute inset-0 p-[3cqw] flex flex-col gap-[2cqw] select-none" aria-hidden="true">
      <div className="flex-1 flex gap-[2.4cqw] min-h-0">
        <div className="flex flex-col flex-1 min-w-0">
          <RecordCard title="booking" fields={BOOKING_FIELDS} highlight="external_reference" />
          <span className="mt-[0.8cqw] flex items-center gap-[1cqw] text-cyan-300 text-[1.5cqw]">
            <span className="w-[2cqw] h-px bg-cyan-400/60" />{f.uiYourId} → external_reference
          </span>
        </div>
        <RecordCard title="check_in" fields={CHECKIN_FIELDS} />
      </div>
      {/* the five-stamp lifecycle */}
      <div className="shrink-0">
        <span className="text-slate-500 text-[1.5cqw] uppercase tracking-wide font-semibold">{f.uiLifecycle}</span>
        <div className="mt-[1cqw] flex items-center gap-[0.8cqw] overflow-hidden">
          {LIFECYCLE.map((s, i) => (
            <span key={s} className="flex items-center gap-[0.8cqw] min-w-0">
              <span className="rounded-full bg-slate-800 border border-slate-600 px-[1.4cqw] py-[0.7cqw] font-mono text-[1.4cqw] text-slate-300 whitespace-nowrap">{s}</span>
              {i < LIFECYCLE.length - 1 && <span className="text-slate-600 text-[1.6cqw] shrink-0">→</span>}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── f17: "Two flags that shape a department" ────────────────────────────────
// A department card with the two real checkboxes — Entry Point (one per
// warehouse) and Office / Reception — shown as what they are: flags on the
// department, not roles or access levels.
export function DeptFlagsArt({ t }: { t: Translations }) {
  const f = t.f17Page;
  const flags: { label: string; note: string; on: boolean }[] = [
    { label: f.uiEntryPoint, note: f.uiOnePer, on: true },
    { label: f.uiOffice, note: "", on: false },
  ];
  return (
    <div className="@container absolute inset-0 p-[4cqw] flex flex-col justify-center gap-[2.4cqw] select-none" aria-hidden="true">
      <span className="text-slate-500 text-[1.8cqw] uppercase tracking-wide font-semibold">{f.uiDepartments}</span>
      <div className="rounded-[2.4cqw] border border-slate-700 bg-slate-900/60 p-[3cqw] flex flex-col gap-[2.4cqw]">
        <span className="flex items-center gap-[1.8cqw]">
          <span className="w-[7cqw] h-[7cqw] rounded-[1.4cqw] bg-blue-500/20 text-blue-300 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 24 24" className="w-[4cqw] h-[4cqw]" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 21V9l9-5 9 5v12M8 21v-6h8v6M8 12h8" />
            </svg>
          </span>
          <span className="text-white font-bold text-[3cqw]">Reception</span>
        </span>
        {flags.map((fl) => (
          <span key={fl.label} className={`flex items-center gap-[1.8cqw] rounded-[1.4cqw] border px-[2.2cqw] py-[1.8cqw] ${fl.on ? "border-emerald-500/40 bg-emerald-500/10" : "border-slate-700 bg-slate-800/40"}`}>
            <span className={`w-[3.4cqw] h-[3.4cqw] rounded-[0.8cqw] border-[0.35cqw] flex items-center justify-center shrink-0 ${fl.on ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-600 text-transparent"}`}>
              <svg viewBox="0 0 24 24" className="w-[2.2cqw] h-[2.2cqw]" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12l5 5L20 6" /></svg>
            </span>
            <span className="flex flex-col min-w-0">
              <span className={`font-semibold text-[2.4cqw] ${fl.on ? "text-white" : "text-slate-300"}`}>{fl.label}</span>
              {fl.note && <span className="text-slate-500 text-[1.7cqw]">{fl.note}</span>}
            </span>
          </span>
        ))}
      </div>
      <span className="text-slate-500 text-[1.7cqw] leading-snug">{f.coTitle}</span>
    </div>
  );
}
