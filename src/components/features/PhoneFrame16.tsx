import type { ReactNode } from "react";

// Shared iPhone 16 Pro Max frame — titanium body, thin uniform bezels, large
// corner radius, centered Dynamic Island, and an iOS status bar (time +
// signal / wifi / battery). Its own @container so screen content sizes in cqw
// relative to the phone, not the page. Presentational Server Component.
// Aspect ratio ~ 440:956 (≈ 19.5:9). Pass the screen as children.
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
    <div className="@container relative h-full" style={{ aspectRatio: "440 / 956" }}>
      {/* titanium body */}
      <div className="absolute inset-0 rounded-[16cqw] bg-gradient-to-b from-slate-700 to-slate-800 shadow-2xl" />
      <div className="absolute inset-[0.7cqw] rounded-[15cqw] bg-slate-950" />
      {/* screen */}
      <div className={`absolute inset-[2.4cqw] rounded-[13cqw] overflow-hidden flex flex-col ${screenClassName}`}>
        {/* status bar */}
        <div className={`relative h-[4.6%] shrink-0 flex items-center justify-between px-[7cqw] text-[3.6cqw] font-semibold z-30 ${statusDark ? "text-slate-900" : "text-white"}`}>
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
        {/* Dynamic Island */}
        <div className="absolute top-[2.4cqw] left-1/2 -translate-x-1/2 w-[30%] h-[5cqw] bg-black rounded-full z-40" />
        {/* screen content */}
        <div className="flex-1 min-h-0 flex flex-col">{children}</div>
      </div>
    </div>
  );
}
