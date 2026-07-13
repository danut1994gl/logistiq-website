import type { Translations } from "@/lib/i18n/translations";

// Realistic dispatcher-dashboard <-> driver-phone conversation on one shared
// 32s ch-* loop (assign dock -> push -> back-and-forth with typing, a document
// photo and read ticks). Decorative (aria-hidden). The phone is its own
// @container so its cqw units scale to the phone, not the stage. Server
// Component. Base (unanimated) styles = the finished chat for reduced motion.

function DocThumb({ unit }: { unit: string }) {
  return (
    <div className="rounded-[0.6em] bg-slate-100 w-full aspect-[7/4] flex items-center justify-center relative overflow-hidden" style={{ fontSize: unit }}>
      <div className="absolute rounded-full bg-slate-400" style={{ left: "14%", right: "34%", top: "22%", height: "0.16em" }} />
      <div className="absolute rounded-full bg-slate-300" style={{ left: "14%", right: "20%", top: "40%", height: "0.16em" }} />
      <div className="absolute rounded-full bg-slate-300" style={{ left: "14%", right: "46%", top: "58%", height: "0.16em" }} />
      <svg viewBox="0 0 24 24" className="relative text-slate-400" style={{ width: "1.5em", height: "1.5em" }} fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="8.5" cy="10" r="1.5" /><path d="M21 17l-5-5L5 19" />
      </svg>
    </div>
  );
}

function DoubleTick({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="3">
      <path d="M1 12l6 6L17 6M8 16l1.5 1.5L22 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ChatScene({ t }: { t: Translations }) {
  const c = t.chatPage;
  return (
    <div className="@container absolute inset-0 p-[2.2cqw] text-slate-200" aria-hidden="true">
      <div className="w-full h-full flex gap-[2.2cqw]">
        {/* ================= dispatcher dashboard ================= */}
        <div className="flex-1 rounded-[1.5cqw] bg-slate-900/70 border border-slate-700/70 flex flex-col overflow-hidden min-w-0">
          {/* header */}
          <div className="flex items-center gap-[1.4cqw] px-[1.8cqw] py-[1.2cqw] border-b border-slate-700/70 bg-slate-800/60">
            <span className="w-[3.4cqw] h-[3.4cqw] rounded-[0.8cqw] bg-blue-600 flex items-center justify-center text-white text-[1.5cqw] font-bold shrink-0">JS</span>
            <span className="flex flex-col leading-tight min-w-0">
              <span className="font-bold text-white text-[1.8cqw] truncate">John Smith · B 218 QRG</span>
              <span className="relative text-[1.3cqw] leading-none h-[1.5cqw]">
                <span className="ch-dbonline text-slate-400">{c.uiDriver}</span>
                <span className="ch-dbtyping absolute left-0 top-0 text-blue-400 font-medium">{c.uiTyping}</span>
              </span>
            </span>
            <span className="ml-auto relative flex items-center justify-end">
              <span className="ch-assignbtn rounded-full px-[1.5cqw] py-[0.6cqw] text-[1.35cqw] font-semibold bg-blue-600 text-white whitespace-nowrap">{c.uiAssign}</span>
              <span className="ch-toast absolute right-0 inline-flex items-center gap-[0.6cqw] rounded-full px-[1.3cqw] py-[0.55cqw] text-[1.35cqw] font-semibold bg-emerald-500/15 text-emerald-400 whitespace-nowrap">
                <svg viewBox="0 0 24 24" className="w-[1.5cqw] h-[1.5cqw]" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
                {c.uiToast}
              </span>
            </span>
          </div>
          {/* thread (dispatcher view: own = right/blue) */}
          <div className="flex-1 flex flex-col justify-end gap-[1cqw] px-[1.8cqw] py-[1.4cqw] min-h-0 overflow-hidden">
            <div className="ch-d1 self-end max-w-[72%] rounded-[1.1cqw] rounded-br-[0.3cqw] bg-blue-600 px-[1.4cqw] py-[0.9cqw]">
              <span className="text-white text-[1.5cqw] leading-snug block">{c.msgD1}</span>
              <span className="flex items-center justify-end gap-[0.5cqw] mt-[0.3cqw] text-[1.1cqw] text-blue-200">
                14:31 <DoubleTick className="ch-seen w-[1.6cqw] h-[1.6cqw]" />
              </span>
            </div>
            <div className="ch-u1 self-start max-w-[72%] rounded-[1.1cqw] rounded-bl-[0.3cqw] bg-slate-700 px-[1.4cqw] py-[0.9cqw]">
              <span className="text-white text-[1.5cqw] leading-snug">{c.msgU1}</span>
            </div>
            <div className="ch-doc self-start w-[26%] rounded-[1.1cqw] bg-slate-700 p-[0.6cqw]">
              <DocThumb unit="3.2cqw" />
              <span className="block mt-[0.4cqw] text-slate-300 text-[1.1cqw] px-[0.3cqw] truncate">{c.uiDoc}</span>
            </div>
            <div className="ch-d2 self-end max-w-[72%] rounded-[1.1cqw] rounded-br-[0.3cqw] bg-blue-600 px-[1.4cqw] py-[0.9cqw]">
              <span className="text-white text-[1.5cqw] leading-snug">{c.msgD2}</span>
            </div>
            <div className="ch-u2 self-start rounded-[1.1cqw] rounded-bl-[0.3cqw] bg-slate-700 px-[1.4cqw] py-[0.9cqw]">
              <span className="text-white text-[1.5cqw] leading-snug">{c.msgU2}</span>
            </div>
          </div>
          {/* input row */}
          <div className="flex items-center gap-[1cqw] px-[1.8cqw] py-[1.1cqw] border-t border-slate-700/70">
            <span className="flex-1 rounded-full bg-slate-800 border border-slate-700 px-[1.6cqw] py-[0.9cqw] text-slate-500 text-[1.4cqw]">{c.uiMessage}…</span>
            <span className="w-[3cqw] h-[3cqw] rounded-full bg-blue-600 flex items-center justify-center text-white [&_svg]:w-[1.7cqw] [&_svg]:h-[1.7cqw]">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 20l18-8L3 4l4 8-4 8z" /></svg>
            </span>
          </div>
        </div>

        {/* ================= driver phone ================= */}
        <div className="@container relative shrink-0 h-full aspect-[10/19]">
          <div className="absolute inset-0 bg-slate-800 rounded-[13cqw] border-[1cqw] border-slate-600 shadow-2xl" />
          <div className="absolute inset-[3cqw] rounded-[10cqw] bg-slate-950 overflow-hidden flex flex-col">
            {/* status bar */}
            <div className="h-[4.5%] shrink-0 bg-blue-600 flex items-center justify-between px-[6cqw] text-white text-[3.4cqw] font-medium">
              <span>14:32</span>
              <span className="flex items-center gap-[1.4cqw] [&_svg]:h-[3cqw] [&_svg]:w-auto">
                <svg viewBox="0 0 24 14" fill="currentColor"><rect x="0" y="8" width="4" height="6" rx="1"/><rect x="6" y="5" width="4" height="9" rx="1"/><rect x="12" y="2" width="4" height="12" rx="1"/><rect x="18" y="0" width="4" height="14" rx="1" opacity="0.5"/></svg>
                <svg viewBox="0 0 24 18" fill="currentColor"><path d="M12 3C7 3 3 7 3 7l9 9 9-9s-4-4-9-4z" opacity="0.9"/></svg>
                <svg viewBox="0 0 28 14" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="1" width="22" height="12" rx="3"/><rect x="3" y="3" width="15" height="8" rx="1" fill="currentColor"/><rect x="24.5" y="4.5" width="2.5" height="5" rx="1" fill="currentColor"/></svg>
              </span>
            </div>
            {/* chat header */}
            <div className="shrink-0 bg-blue-600 flex items-center gap-[3cqw] px-[4cqw] pb-[3cqw] pt-[1cqw]">
              <svg viewBox="0 0 24 24" className="w-[4cqw] h-[4cqw] text-white shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span className="w-[10cqw] h-[10cqw] rounded-full bg-white flex items-center justify-center text-blue-600 text-[4cqw] font-bold shrink-0">LW</span>
              <span className="flex flex-col leading-tight min-w-0">
                <span className="text-white font-bold text-[4.6cqw] truncate">London Warehouse</span>
                <span className="relative text-[3.4cqw] leading-none h-[3.8cqw]">
                  <span className="ch-phonline text-blue-200">{c.uiOnline}</span>
                  <span className="ch-phtyping absolute left-0 top-0 text-white font-medium">{c.uiTyping}</span>
                </span>
              </span>
            </div>
            {/* thread (driver view: own = right/blue, dispatcher = left/grey) */}
            <div className="flex-1 flex flex-col justify-end gap-[2.6cqw] px-[4cqw] py-[3cqw] min-h-0 overflow-hidden bg-slate-950">
              <div className="ch-d1 self-start max-w-[84%] rounded-[3.5cqw] rounded-bl-[0.8cqw] bg-slate-700 px-[3.6cqw] py-[2.6cqw]">
                <span className="text-white text-[4.6cqw] leading-snug">{c.msgD1}</span>
              </div>
              <div className="ch-u1 self-end max-w-[84%] rounded-[3.5cqw] rounded-br-[0.8cqw] bg-blue-600 px-[3.6cqw] py-[2.6cqw]">
                <span className="text-white text-[4.6cqw] leading-snug flex items-end gap-[1.4cqw]">{c.msgU1}<DoubleTick className="w-[3.4cqw] h-[3.4cqw] text-blue-200 shrink-0 mb-[0.4cqw]" /></span>
              </div>
              <div className="ch-doc self-end w-[56%] rounded-[3.5cqw] bg-blue-600 p-[2cqw]">
                <DocThumb unit="8cqw" />
              </div>
              <div className="ch-d2 self-start max-w-[84%] rounded-[3.5cqw] rounded-bl-[0.8cqw] bg-slate-700 px-[3.6cqw] py-[2.6cqw]">
                <span className="text-white text-[4.6cqw] leading-snug">{c.msgD2}</span>
              </div>
              <div className="ch-u2 self-end rounded-[3.5cqw] rounded-br-[0.8cqw] bg-blue-600 px-[3.6cqw] py-[2.6cqw]">
                <span className="text-white text-[4.6cqw] leading-snug flex items-end gap-[1.4cqw]">{c.msgU2}<DoubleTick className="w-[3.4cqw] h-[3.4cqw] text-blue-200 shrink-0 mb-[0.4cqw]" /></span>
              </div>
            </div>
            {/* input bar */}
            <div className="shrink-0 flex items-center gap-[2.4cqw] px-[4cqw] py-[2.6cqw] bg-slate-900 border-t border-slate-800">
              <span className="flex-1 rounded-full bg-slate-800 px-[4cqw] py-[2.4cqw] text-slate-500 text-[4cqw]">{c.uiMessage}</span>
              <svg viewBox="0 0 24 24" className="w-[6cqw] h-[6cqw] text-slate-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="6" width="18" height="14" rx="2"/><circle cx="12" cy="13" r="3.2"/><path d="M8 6l1.5-2.5h5L16 6"/></svg>
              <span className="w-[9cqw] h-[9cqw] rounded-full bg-blue-600 flex items-center justify-center text-white shrink-0"><svg viewBox="0 0 24 24" className="w-[4.6cqw] h-[4.6cqw]" fill="currentColor"><path d="M3 20l18-8L3 4l4 8-4 8z"/></svg></span>
            </div>
            {/* push banner overlay */}
            <div className="ch-push absolute top-[8cqw] inset-x-[4cqw] rounded-[4cqw] bg-slate-800/95 border border-slate-600 shadow-2xl px-[4cqw] py-[3.4cqw] flex items-center gap-[3cqw] z-30">
              <span className="w-[12cqw] h-[12cqw] rounded-[3cqw] bg-blue-600 flex items-center justify-center text-white text-[6cqw] font-bold shrink-0">Q</span>
              <span className="flex flex-col leading-tight min-w-0">
                <span className="flex items-center gap-[1.6cqw]"><span className="text-white font-semibold text-[4.6cqw] truncate">{c.uiPushTitle}</span><span className="text-slate-500 text-[3.4cqw] ml-auto shrink-0">{c.notifNow}</span></span>
                <span className="text-slate-300 text-[4cqw] leading-tight truncate">{c.uiPushBody}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
