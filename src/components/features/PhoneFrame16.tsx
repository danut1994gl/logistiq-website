import type { ReactNode } from "react";

// Shared iPhone 16 Pro Max frame, dimensionally 1:1 with the real device:
//   body    163.0 x 77.6 mm            -> aspectRatio 776 / 1630
//   display 6.9", 2868x1320 @ 460ppi   -> 440 x 956 pt viewport (72.9 x 158.4 mm)
//   bezel   (77.6-72.9)/2 = 2.34 mm    -> a uniform 3.02% of body width (3.02cqw)
//   radius  62 pt display corner       -> 13.24cqw screen / +bezel = 16.26cqw body
//   Dynamic Island 125 x 36.67 pt      -> 26.7 x 7.83cqw, 11 pt (2.35cqw) from the top
// Because cqw is width-relative, a uniform cqw inset is a uniform physical bezel,
// which makes the inner screen land on exactly 440:956. Its own @container so screen
// content sizes in cqw relative to the phone. Presentational Server Component.
export function PhoneFrame16({
  children,
  time = "14:32",
  screenClassName = "bg-slate-950",
  statusDark = false,
}: {
  children: ReactNode;
  time?: string;
  screenClassName?: string;
  // dark status-bar glyphs for light-themed app screens
  statusDark?: boolean;
}) {
  return (
    <div className="@container relative h-full" style={{ aspectRatio: "776 / 1630" }}>
      {/* titanium body */}
      <div className="absolute inset-0 rounded-[16.26cqw] bg-gradient-to-b from-slate-600 via-slate-700 to-slate-800 shadow-2xl" />
      {/* black bezel under the glass */}
      <div className="absolute inset-[0.9cqw] rounded-[15.4cqw] bg-black" />
      {/* display — 440 x 956 pt */}
      <div className={`absolute inset-[3.02cqw] rounded-[13.24cqw] overflow-hidden flex flex-col ${screenClassName}`}>
        {/* status bar (62 pt safe-area top) */}
        <div className={`relative h-[6.2%] shrink-0 flex items-center justify-between px-[7cqw] text-[3.5cqw] font-semibold z-30 ${statusDark ? "text-slate-900" : "text-white"}`}>
          <span className="tabular-nums">{time}</span>
          <span className="flex items-center gap-[1.6cqw]">
            {/* signal */}
            <svg viewBox="0 0 20 14" className="h-[2.8cqw] w-auto" fill="currentColor">
              <rect x="0" y="9" width="3" height="5" rx="1" />
              <rect x="5" y="6" width="3" height="8" rx="1" />
              <rect x="10" y="3" width="3" height="11" rx="1" />
              <rect x="15" y="0" width="3" height="14" rx="1" />
            </svg>
            {/* wifi */}
            <svg viewBox="0 0 20 15" className="h-[2.8cqw] w-auto" fill="currentColor">
              <path d="M10 3C6 3 2.6 5 1 7l9 8 9-8c-1.6-2-5-4-9-4z" />
            </svg>
            {/* battery */}
            <svg viewBox="0 0 26 13" className="h-[2.6cqw] w-auto" fill="none">
              <rect x="0.5" y="0.5" width="22" height="12" rx="3" stroke="currentColor" strokeOpacity="0.5" />
              <rect x="2" y="2" width="17" height="9" rx="1.5" fill="currentColor" />
              <rect x="24" y="4" width="2" height="5" rx="1" fill="currentColor" fillOpacity="0.5" />
            </svg>
          </span>
        </div>
        {/* Dynamic Island — 125 x 36.67 pt, 11 pt from the top */}
        <div className="absolute top-[2.35cqw] left-1/2 -translate-x-1/2 w-[26.7cqw] h-[7.83cqw] bg-black rounded-full z-40" />
        {/* screen content */}
        <div className="flex-1 min-h-0 flex flex-col">{children}</div>
      </div>
    </div>
  );
}
