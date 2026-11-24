import type { Translations } from "@/lib/i18n/translations";

// Second illustrations for the mid-page `split` sections (f17's). Small,
// static, presentational diagrams — they sit beside prose, so they explain one
// idea each rather than animate a flow. Server Components. aria-hidden.
//
// Each fills the split section's dark 4:3 panel (which is `isolate` + bordered),
// so the root is the usual @container absolute-inset pattern.

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
