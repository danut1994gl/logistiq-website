import type { Translations } from "@/lib/i18n/translations";
import { LogistiqCloud } from "./LogistiqCloud";

// Second illustrations for the mid-page `split` sections on f15/f16/f17. Small,
// static, presentational diagrams — they sit beside prose, so they explain one
// idea each rather than animate a flow. Server Components. aria-hidden.
//
// Each fills the split section's dark 4:3 panel (which is `isolate` + bordered),
// so the root is the usual @container absolute-inset pattern.

// ── f15: "It never phones in. It only phones out." ──────────────────────────
// The box sits behind the customer's firewall; every connection is OUTBOUND
// (MQTT session + a 30s HTTPS heartbeat), and the inbound direction is blocked —
// the whole IT-objection argument in one picture.
export function GateNetworkArt({ t }: { t: Translations }) {
  const f = t.f15Page;
  return (
    <div className="@container absolute inset-0 p-[3cqw] select-none" aria-hidden="true">
      <svg viewBox="0 0 400 300" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
        {/* the yard, left of the firewall: the QRGoBox device wired to the gate */}
        <rect x="14" y="90" width="168" height="124" rx="10" fill="#1b2532" stroke="#334155" strokeWidth="1.5" />
        <text x="98" y="110" textAnchor="middle" fill="#94a3b8" style={{ fontSize: 11, fontWeight: 600 }}>{f.uiGate}</text>

        {/* the wire from the box to the barrier's motor */}
        <path d="M80 152 C100 152 110 168 122 168" fill="none" stroke="#3f4a5a" strokeWidth="2" />

        {/* the QRGoBox device */}
        <rect x="28" y="128" width="52" height="42" rx="6" fill="#0f1720" stroke="#475569" strokeWidth="1.5" />
        <rect x="36" y="136" width="36" height="7" rx="2" fill="#243040" />
        <circle cx="41" cy="158" r="3" fill="#22c55e" />
        <rect x="48" y="155" width="26" height="6" rx="3" fill="#334155" />
        <text x="54" y="184" textAnchor="middle" fill="#7dd3fc" style={{ fontSize: 10, fontWeight: 700 }}>QRGoBox</text>

        {/* the barrier it controls: motor housing, post, raised boom */}
        <rect x="118" y="160" width="16" height="16" rx="2" fill="#334155" stroke="#475569" strokeWidth="1" />
        <rect x="124" y="136" width="4" height="24" rx="1" fill="#475569" />
        <g transform="translate(126 138) rotate(-32)">
          <rect x="0" y="-3" width="46" height="6" rx="3" fill="#e2e8f0" />
          <rect x="1" y="-2" width="40" height="1.6" rx="0.8" fill="#3b82f6" />
          <rect x="34" y="-3" width="12" height="6" rx="3" fill="#3b82f6" />
        </g>

        {/* the firewall wall */}
        <g>
          {[0, 1, 2, 3, 4, 5, 6].map((r) => (
            <g key={r}>
              {[0, 1].map((c) => (
                <rect key={c} x={196 + ((r % 2) ? c * 16 - 8 : c * 16)} y={70 + r * 22} width="14" height="18" rx="2"
                  fill="#7f1d1d" stroke="#b91c1c" strokeWidth="1" opacity="0.8" />
              ))}
            </g>
          ))}
          <text x="204" y="290" textAnchor="middle" fill="#f87171" style={{ fontSize: 11, fontWeight: 700 }}>{f.uiFirewall}</text>
        </g>

        {/* the cloud/broker, right of the firewall — the shared logistiq.cloud mark */}
        <g transform="translate(336 150) scale(0.36)">
          <LogistiqCloud id="gnet" />
        </g>

        {/* OUTBOUND: two arrows leaving the yard, crossing the wall unimpeded */}
        <defs>
          <marker id="s15-out" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
            <path d="M0 1L6 4L0 7Z" fill="#38bdf8" />
          </marker>
        </defs>
        <g stroke="#38bdf8" strokeWidth="2.4" fill="none" markerEnd="url(#s15-out)">
          <path d="M128 148 C 210 118, 236 128, 288 140" />
          <path d="M128 168 C 210 196, 236 182, 292 162" />
        </g>
        <g>
          <rect x="150" y="106" width="86" height="20" rx="10" fill="#0f1720" stroke="#334155" />
          <circle cx="164" cy="116" r="3.4" fill="#38bdf8" />
          <text x="175" y="120" fill="#7dd3fc" style={{ fontSize: 9, fontWeight: 600 }}>MQTT ↗</text>
          <rect x="150" y="200" width="120" height="20" rx="10" fill="#0f1720" stroke="#334155" />
          <circle cx="164" cy="210" r="3.4" fill="#38bdf8" />
          <text x="175" y="214" fill="#7dd3fc" style={{ fontSize: 9, fontWeight: 600 }}>HTTPS · {f.uiHeartbeat}</text>
        </g>

        {/* INBOUND: blocked */}
        <g>
          <line x1="288" y1="240" x2="150" y2="240" stroke="#475569" strokeWidth="2" strokeDasharray="5 5" />
          <g stroke="#ef4444" strokeWidth="2.6" strokeLinecap="round">
            <line x1="212" y1="232" x2="226" y2="248" /><line x1="226" y1="232" x2="212" y2="248" />
          </g>
          <text x="336" y="244" textAnchor="middle" fill="#94a3b8" style={{ fontSize: 9, fontWeight: 600 }}>{f.uiNoInbound}</text>
        </g>

        {/* the headline claim */}
        <g>
          <rect x="14" y="16" width="150" height="30" rx="15" fill="#22c55e" fillOpacity="0.12" stroke="#22c55e" strokeOpacity="0.5" />
          <text x="89" y="35" textAnchor="middle" fill="#4ade80" style={{ fontSize: 12, fontWeight: 700 }}>{f.uiOutbound}</text>
        </g>
      </svg>
    </div>
  );
}

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
