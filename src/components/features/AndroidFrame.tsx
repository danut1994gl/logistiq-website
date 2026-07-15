import type { ReactNode } from "react";

// Android phone frame (Pixel-class), dimensioned like the real device so it
// reads as a genuine Android next to the iPhone:
//   body    162.6 x 76.5 mm          -> aspectRatio 765 / 1626
//   display 6.7", 1344x2992 @489ppi  -> 69.8 x 155.4 mm
//   bezel   (76.5-69.8)/2 = 3.35 mm  -> a uniform 4.38% of body width
//   punch-hole selfie camera centred at the top (no Dynamic Island)
// Squarer corners than the iPhone, matching Android industrial design.
// Presentational Server Component.
export function AndroidFrame({
  children,
  time = "14:32",
  screenClassName = "bg-slate-950",
}: {
  children: ReactNode;
  time?: string;
  screenClassName?: string;
}) {
  return (
    <div className="@container relative isolate h-full" style={{ aspectRatio: "765 / 1626" }}>
      {/* aluminium body */}
      <div className="absolute inset-0 rounded-[12.5cqw] bg-gradient-to-b from-slate-600 via-slate-700 to-slate-800 shadow-2xl" />
      <div className="absolute inset-[0.9cqw] rounded-[11.8cqw] bg-black" />
      {/* display */}
      <div className={`absolute inset-[4.38cqw] rounded-[8.6cqw] overflow-hidden flex flex-col ${screenClassName}`}>
        {/* Android status bar */}
        <div className="relative h-[5.4%] shrink-0 flex items-center justify-between px-[5cqw] text-white text-[3.2cqw] font-medium z-30">
          <span className="tabular-nums">{time}</span>
          <span className="flex items-center gap-[1.5cqw]">
            <svg viewBox="0 0 20 14" className="h-[2.6cqw] w-auto" fill="currentColor"><path d="M19 1 1 13h18z" /></svg>
            <svg viewBox="0 0 20 15" className="h-[2.6cqw] w-auto" fill="currentColor"><path d="M10 3C6 3 2.6 5 1 7l9 8 9-8c-1.6-2-5-4-9-4z" /></svg>
            <svg viewBox="0 0 26 13" className="h-[2.5cqw] w-auto" fill="none">
              <rect x="0.5" y="0.5" width="22" height="12" rx="2" stroke="currentColor" strokeOpacity="0.55" />
              <rect x="2" y="2" width="16" height="9" rx="1" fill="currentColor" />
              <rect x="24" y="4" width="2" height="5" rx="1" fill="currentColor" fillOpacity="0.5" />
            </svg>
          </span>
        </div>
        {/* punch-hole camera */}
        <div className="absolute top-[2.4cqw] left-1/2 -translate-x-1/2 w-[3.4cqw] h-[3.4cqw] rounded-full bg-black ring-1 ring-slate-800 z-40" />
        {/* screen content */}
        <div className="flex-1 min-h-0 flex flex-col">{children}</div>
      </div>
    </div>
  );
}
