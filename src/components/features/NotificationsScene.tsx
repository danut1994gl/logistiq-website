import type { Translations } from "@/lib/i18n/translations";
import { GateIcon, ChatIcon, UsersIcon, ChartIcon } from "@/components/icons";
import { PhoneFrame16 } from "./PhoneFrame16";

// Driver-notifications scene: an iPhone 16 Pro Max lock screen where every
// dispatcher action (dock assigned, custom instruction, come-to-office, status
// update) arrives as a push notification, with a trigger list on the left
// lighting up in sync. One shared 16s nt-* loop. Decorative (aria-hidden).
// Server Component. Base styles = all notifications shown (reduced motion).
export function NotificationsScene({ t }: { t: Translations }) {
  const c = t.chatPage;
  const items = [
    { icon: GateIcon, title: c.notif1T, body: c.notif1B },
    { icon: ChatIcon, title: c.notif2T, body: c.notif2B },
    { icon: UsersIcon, title: c.notif3T, body: c.notif3B },
    { icon: ChartIcon, title: c.notif4T, body: c.notif4B },
  ];
  return (
    <div className="@container absolute inset-0 p-[2.5cqw] flex items-center justify-center gap-[5cqw]" aria-hidden="true">
      {/* trigger list (dispatcher actions) */}
      <div className="hidden sm:flex flex-col gap-[1.8cqw] w-[34%] max-w-[46cqw]">
        {items.map((it, i) => (
          <div
            key={i}
            className={`nt-t${i + 1} flex items-center gap-[1.8cqw] rounded-[1.4cqw] border border-slate-700/70 bg-slate-800/50 px-[2cqw] py-[1.6cqw]`}
          >
            <span className="w-[4.4cqw] h-[4.4cqw] rounded-[1cqw] bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center [&_svg]:w-[2.6cqw] [&_svg]:h-[2.6cqw] shrink-0">
              <it.icon />
            </span>
            <span className="text-slate-200 text-[2cqw] font-medium leading-tight truncate">{it.title}</span>
            <svg viewBox="0 0 24 24" className="nt-arrow ml-auto w-[2.4cqw] h-[2.4cqw] text-slate-500 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
        ))}
      </div>

      {/* iPhone 16 Pro Max lock screen */}
      <div className="h-[96%] shrink-0">
        <PhoneFrame16 time="14:32" screenClassName="bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950">
          <div className="flex-1 min-h-0 flex flex-col px-[5cqw]">
            {/* clock */}
            <div className="pt-[8cqw] text-center text-white">
              <div className="text-[4.4cqw] text-slate-300 font-medium">{c.notifDate}</div>
              <div className="text-[19cqw] font-light leading-none tracking-tight mt-[1cqw]">14:32</div>
            </div>
            {/* notification stack */}
            <div className="mt-[7cqw] flex flex-col gap-[2.6cqw]">
              {items.map((it, i) => (
                <div
                  key={i}
                  className={`nt-n${i + 1} rounded-[4cqw] bg-slate-100/95 backdrop-blur px-[3.4cqw] py-[3cqw] flex items-center gap-[3cqw] shadow-lg`}
                >
                  <span className="w-[9cqw] h-[9cqw] rounded-[2.4cqw] bg-blue-600 flex items-center justify-center text-white text-[4.6cqw] font-bold shrink-0">Q</span>
                  <span className="flex flex-col leading-tight min-w-0">
                    <span className="flex items-center gap-[1.4cqw]">
                      <span className="text-slate-900 font-semibold text-[4cqw] truncate">{it.title}</span>
                      <span className="text-slate-500 text-[3cqw] ml-auto shrink-0">{c.notifNow}</span>
                    </span>
                    <span className="text-slate-600 text-[3.4cqw] leading-tight line-clamp-2">{it.body}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </PhoneFrame16>
      </div>
    </div>
  );
}
