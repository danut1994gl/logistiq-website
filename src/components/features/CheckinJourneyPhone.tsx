import type { Translations } from "@/lib/i18n/translations";
import { QRCodeSVG } from "@/components/mockups/QRCodeSVG";

// Scene-2 phone: large, realistic driver-app mockup rendered as an HTML
// overlay on top of the SVG stage (PhoneFrame visual language, localized via
// the existing t.qrgoDriver keys). Five screen states crossfade on the shared
// 27s cj2 timeline: scan → form → OK → waiting → ramp assigned. Sized with
// clamp() + container-query units so it stays legible on mobile regardless
// of the SVG scale. Decorative (aria-hidden). Server Component.
export function CheckinJourneyPhone({ t }: { t: Translations }) {
  const q = t.qrgoDriver;
  const dock = t.checkinJourney.dockBadge;

  return (
    <div className="cj2-phone absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
      <div className="@container relative h-[clamp(200px,84%,340px)] aspect-[10/19] -translate-x-[14%]">
        {/* side buttons */}
        <div className="absolute -left-[2%] top-[22%] w-[2.5%] h-[7%] bg-slate-600 rounded-l" />
        <div className="absolute -left-[2%] top-[31%] w-[2.5%] h-[7%] bg-slate-600 rounded-l" />
        <div className="absolute -right-[2%] top-[25%] w-[2.5%] h-[11%] bg-slate-600 rounded-r" />
        {/* frame */}
        <div className="absolute inset-0 bg-slate-800 rounded-[14cqw] border-[3px] border-slate-600 shadow-2xl" />
        {/* notch */}
        <div className="absolute top-[2.6%] left-1/2 -translate-x-1/2 w-[36%] h-[3%] bg-slate-900 rounded-full z-10" />
        {/* screen */}
        <div className="absolute inset-x-[4.5%] top-[6.5%] bottom-[4.5%] bg-slate-900 rounded-[9cqw] overflow-hidden">
          {/* app header */}
          <div className="absolute inset-x-0 top-0 h-[16%] bg-blue-600 flex flex-col items-center justify-center gap-[1cqw] px-[6cqw] z-10">
            <span className="text-white font-bold leading-none text-[6.5cqw]">Logistiq</span>
            <span className="text-blue-200 leading-none text-[4.6cqw] truncate max-w-full">{q.warehouseName}</span>
          </div>

          {/* 1 — QR scan */}
          <div className="cj2-ph1 absolute inset-0 top-[16%]">
            <div className="absolute inset-0 bg-slate-950" />
            <div className="absolute left-1/2 top-[44%] -translate-x-1/2 -translate-y-1/2 w-[60%] aspect-square">
              <div className="absolute inset-[9%] bg-white rounded-[2cqw] p-[3cqw]">
                <QRCodeSVG />
              </div>
              <span className="absolute left-0 top-0 w-[24%] h-[24%] border-l-2 border-t-2 border-cyan-400 rounded-tl" />
              <span className="absolute right-0 top-0 w-[24%] h-[24%] border-r-2 border-t-2 border-cyan-400 rounded-tr" />
              <span className="absolute left-0 bottom-0 w-[24%] h-[24%] border-l-2 border-b-2 border-cyan-400 rounded-bl" />
              <span className="absolute right-0 bottom-0 w-[24%] h-[24%] border-r-2 border-b-2 border-cyan-400 rounded-br" />
              <div className="cj2-scanline absolute left-[7%] right-[7%] top-[9%] h-[2px] bg-cyan-400 rounded shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
            </div>
            <div className="absolute bottom-[7%] inset-x-0 text-center text-slate-400 text-[5cqw] px-[6cqw]">
              {q.statusCheckin}
            </div>
          </div>

          {/* 2 — form */}
          <div className="cj2-ph2 absolute inset-0 top-[16%] px-[7cqw] py-[6cqw] flex flex-col gap-[4.5cqw]">
            <div className="cj2-row-1 bg-slate-800 rounded-[3cqw] px-[5cqw] py-[3cqw]">
              <div className="text-slate-400 uppercase tracking-wide text-[4cqw] leading-tight">{q.driverNameLabel}</div>
              <div className="text-white font-medium text-[5.4cqw] leading-tight truncate">{q.driverName}</div>
            </div>
            <div className="cj2-row-2 bg-slate-800 rounded-[3cqw] px-[5cqw] py-[3cqw]">
              <div className="text-slate-400 uppercase tracking-wide text-[4cqw] leading-tight">{q.driverPhoneLabel}</div>
              <div className="text-white font-medium text-[5.4cqw] leading-tight truncate">{q.driverPhone}</div>
            </div>
            <div className="cj2-row-3 bg-slate-800 rounded-[3cqw] px-[5cqw] py-[3.5cqw] flex flex-col gap-[2cqw]">
              <div className="w-1/3 h-[2.6cqw] bg-slate-600 rounded-full" />
              <div className="w-2/3 h-[3.4cqw] bg-slate-500 rounded-full" />
            </div>
            <div className="cj2-btn mt-auto h-[13%] min-h-[9cqw] bg-blue-600 rounded-[3cqw] flex items-center justify-center text-white font-semibold text-[5.4cqw]">
              Check-in
            </div>
          </div>

          {/* 3 — OK */}
          <div className="cj2-ph3 absolute inset-0 top-[16%] flex items-center justify-center">
            <div className="w-[34%] aspect-square rounded-full bg-emerald-500 flex items-center justify-center shadow-[0_0_24px_rgba(16,185,129,0.5)]">
              <svg viewBox="0 0 24 24" className="w-[55%] h-[55%] text-white" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>

          {/* 4 — waiting (hourglass) */}
          <div className="cj2-ph4 absolute inset-0 top-[16%] flex flex-col items-center justify-center gap-[4cqw] px-[8cqw] text-center">
            <svg viewBox="0 0 24 24" className="cj2-hg w-[20%] aspect-square text-amber-400" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M7 3h10M7 21h10M8 3v2c0 2.5 4 4 4 7s-4 4.5-4 7v2M16 3v2c0 2.5-4 4-4 7s4 4.5 4 7v2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="text-white font-semibold text-[6cqw] leading-tight">
              {q.waiting}
              <span className="cj2-dot">.</span>
              <span className="cj2-dot">.</span>
              <span className="cj2-dot">.</span>
            </div>
            <div className="text-slate-400 text-[4.6cqw] leading-snug">{q.pleaseWait}</div>
          </div>

          {/* 5 — ramp assigned */}
          <div className="cj2-ph5 absolute inset-0 top-[16%] flex flex-col items-center justify-center gap-[3.5cqw] px-[7cqw] text-center">
            <div className="w-[19%] aspect-square rounded-full bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-[55%] h-[55%]" fill="none" stroke="currentColor" strokeWidth="2.6">
                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="text-emerald-400 font-bold uppercase tracking-wider text-[5.6cqw] leading-none">{q.assigned}</div>
            <div className="bg-blue-600 text-white font-extrabold text-[8.5cqw] px-[8cqw] py-[3cqw] rounded-[3.5cqw] tracking-wider leading-none">
              {dock}
            </div>
            <div className="text-slate-400 text-[4.6cqw] leading-snug">{q.assignedDesc}</div>
          </div>

          {/* home indicator */}
          <div className="absolute bottom-[1.6%] left-1/2 -translate-x-1/2 w-[34%] h-[1.4cqw] bg-slate-600 rounded-full z-10" />
        </div>
      </div>
    </div>
  );
}
