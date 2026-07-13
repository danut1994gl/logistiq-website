import type { Translations } from "@/lib/i18n/translations";

// Product-faithful operator "dock board" mockup (HTML overlay, scales via @container units). A live waiting queue on the left; two department dock
// grids on the right. One shared dm-* CSS timeline (28s) animates the real
// assignment flow: operator opens a waiting truck -> picks a free dock ->
// the dock flips available->assigned->loading and the driver is notified.
// Decorative (aria-hidden); the step cards carry the story as text. Server
// Component. NO animation-delay anywhere (the step controller seeks by
// currentTime); base styles compose the "after" state for reduced motion.
export function DockManagementScene({ t }: { t: Translations }) {
  const d = t.dockPage;
  const waiting = [
    { plate: "B 218 QRG", type: d.uiLoading },
    { plate: "CJ 07 LGX", type: d.uiUnloading },
    { plate: "TM 44 DEL", type: d.uiLoading },
  ];
  const loadingDocks = ["01", "02", "03", "04"];
  const unloadingDocks = ["05", "06", "07", "08"];

  return (
    <div className="@container absolute inset-0 p-[2.5cqw] text-slate-200" aria-hidden="true">
      <div className="w-full h-full rounded-[1.5cqw] bg-slate-900/70 border border-slate-700/70 flex flex-col overflow-hidden">
        {/* header bar */}
        <div className="flex items-center gap-[1.5cqw] px-[2cqw] py-[1.4cqw] border-b border-slate-700/70 bg-slate-800/60">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="" className="w-[3.4cqw] h-[3.4cqw] rounded-[0.8cqw]" />
          <span className="font-bold text-white text-[2.4cqw]">{d.uiBoard}</span>
          <span className="ml-auto inline-flex items-center gap-[0.8cqw] text-[1.7cqw] font-semibold text-emerald-400 bg-emerald-500/15 rounded-full px-[1.6cqw] py-[0.5cqw]">
            <span className="w-[1.1cqw] h-[1.1cqw] rounded-full bg-emerald-400 dm-livedot" />
            {d.uiLive}
          </span>
        </div>

        <div className="flex-1 flex gap-[2cqw] p-[2cqw] min-h-0">
          {/* waiting queue */}
          <div className="w-[34%] flex flex-col">
            <div className="flex items-center gap-[1cqw] mb-[1.4cqw] text-[1.8cqw] font-semibold text-slate-400 uppercase tracking-wide">
              <span className="w-[1.4cqw] h-[1.4cqw] rounded-full bg-amber-400" />
              {d.uiWaiting}
              <span className="dm-count ml-auto text-slate-500 normal-case tracking-normal">3</span>
            </div>
            <div className="relative flex-1 flex flex-col gap-[1.2cqw]">
              {waiting.map((w, i) => (
                <div
                  key={i}
                  className={`dm-qcard-${i + 1} rounded-[1cqw] border border-slate-700 bg-slate-800/80 px-[1.6cqw] py-[1.3cqw] flex items-center gap-[1.2cqw]`}
                >
                  <span className="w-[0.8cqw] self-stretch rounded-full bg-amber-400 shrink-0" />
                  <span className="flex flex-col leading-tight min-w-0">
                    <span className="font-semibold text-white text-[1.9cqw]">{w.plate}</span>
                    <span className="text-slate-400 text-[1.4cqw] truncate">{w.type}</span>
                  </span>
                  {i === 0 && (
                    <span className="dm-assignbtn ml-auto shrink-0 text-[1.4cqw] font-semibold text-white bg-blue-600 rounded-[0.8cqw] px-[1.3cqw] py-[0.7cqw]">
                      {d.uiAssign}
                    </span>
                  )}
                </div>
              ))}
              {/* dock dropdown that opens over the first card */}
              <div className="dm-dropdown absolute left-[6%] top-[24%] w-[86%] rounded-[1cqw] bg-slate-800 border border-slate-600 shadow-2xl p-[0.8cqw] z-20">
                {["01", "04", "07"].map((n) => (
                  <div
                    key={n}
                    className={`text-[1.6cqw] rounded-[0.6cqw] px-[1.3cqw] py-[0.8cqw] ${n === "04" ? "bg-blue-600 text-white font-semibold" : "text-slate-300"}`}
                  >
                    {d.uiLoading} · {n}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* department dock grids */}
          <div className="flex-1 flex flex-col gap-[1.6cqw] min-w-0">
            <DockGroup label={d.uiLoading} docks={loadingDocks} highlight="04" plate="B 218 QRG" />
            <DockGroup label={d.uiUnloading} docks={unloadingDocks} highlight={null} plate="" />
          </div>
        </div>
      </div>

      {/* assignment toast */}
      <div className="dm-toast absolute right-[3cqw] top-[10cqw] flex items-center gap-[1.2cqw] rounded-[1cqw] bg-slate-800 border border-emerald-500/50 shadow-2xl px-[1.8cqw] py-[1.3cqw]">
        <span className="w-[2.6cqw] h-[2.6cqw] rounded-full bg-emerald-500 flex items-center justify-center [&_svg]:w-[1.6cqw] [&_svg]:h-[1.6cqw] text-white">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <span className="text-[1.8cqw] font-semibold text-white">{d.uiToast}</span>
      </div>

      {/* driver push (phone chip) */}
      <div className="dm-phone absolute left-[3cqw] bottom-[3cqw] w-[30%] rounded-[1.2cqw] bg-slate-800 border border-slate-600 shadow-2xl px-[1.6cqw] py-[1.3cqw] flex items-center gap-[1.2cqw]">
        <span className="w-[3cqw] h-[3cqw] rounded-[0.8cqw] bg-blue-600 flex items-center justify-center text-white text-[1.6cqw] font-bold shrink-0">Q</span>
        <span className="flex flex-col leading-tight min-w-0">
          <span className="text-[1.6cqw] font-semibold text-white">{d.uiToast}</span>
          <span className="text-[1.4cqw] text-slate-400 truncate">{d.uiNotified}</span>
        </span>
      </div>
    </div>
  );
}

function DockGroup({
  label,
  docks,
  highlight,
  plate,
}: {
  label: string;
  docks: string[];
  highlight: string | null;
  plate: string;
}) {
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="text-[1.6cqw] font-semibold text-slate-400 uppercase tracking-wide mb-[1cqw]">{label}</div>
      <div className="grid grid-cols-4 gap-[1.2cqw] flex-1">
        {docks.map((n) => {
          const isTarget = n === highlight;
          return (
            <div
              key={n}
              className={`relative rounded-[1cqw] border flex flex-col items-center justify-center overflow-hidden ${
                isTarget
                  ? "dm-dock border-slate-600 bg-slate-800/60"
                  : "border-slate-700/70 bg-slate-800/40"
              }`}
            >
              <span className="text-[2.2cqw] font-bold text-slate-500">{n}</span>
              {isTarget && (
                <span className="dm-dockplate absolute inset-x-[0.8cqw] bottom-[0.8cqw] rounded-[0.6cqw] bg-slate-900/80 px-[0.8cqw] py-[0.5cqw] text-[1.3cqw] font-semibold text-white text-center truncate">
                  {plate}
                </span>
              )}
              {isTarget && <span className="dm-dockbar absolute inset-x-0 bottom-0 h-[0.9cqw] bg-emerald-500" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
