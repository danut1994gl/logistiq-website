// Phone frame wrapper for the driver-app mockups. Presentational (Server Component).
export function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mx-auto w-[220px] h-[450px]">
      {/* Phone outer frame */}
      <div className="absolute inset-0 bg-slate-800 rounded-[2.5rem] shadow-2xl border-4 border-slate-700">
        {/* Notch */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-5 bg-slate-900 rounded-full" />
        {/* Screen */}
        <div className="absolute top-8 left-2 right-2 bottom-8 bg-slate-900 rounded-[1.5rem] overflow-hidden">
          {children}
        </div>
        {/* Home indicator */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-24 h-1 bg-slate-600 rounded-full" />
      </div>
    </div>
  );
}

