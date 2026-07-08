import { type Translations } from "@/lib/i18n/translations";
import { PhoneFrame } from "@/components/mockups/PhoneFrame";

export function DriverMockupInfo({ t }: { t: Translations }) {
  return (
    <PhoneFrame>
      <div className="h-full overflow-hidden text-white">
        {/* Info Header */}
        <div className="bg-slate-800 px-3 py-2 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-blue-500/30 flex items-center justify-center">
              <svg className="w-2.5 h-2.5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-[9px] font-semibold">{t.qrgoDriver?.checkinInfo || "Informații Check-in"}</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-2 space-y-2 overflow-y-auto" style={{ maxHeight: 'calc(100% - 36px)' }}>
          {/* Operation Type Badge */}
          <div className="flex justify-center">
            <span className="text-[8px] px-2 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
              <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              {t.qrgoDriver?.unloadAndLoad || "Descărcare & Încărcare"}
            </span>
          </div>

          {/* Reference Cards */}
          <div className="bg-emerald-500/10 rounded-lg p-2 border border-emerald-500/30">
            <p className="text-[7px] text-emerald-400 mb-0.5 flex items-center gap-1">
              <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              {t.qrgoDriver?.unloadRef || "REF. DESCĂRCARE"}
            </p>
            <p className="text-[10px] text-emerald-300 font-bold">{t.qrgoDriver?.unloadRefValue || "PO-2024-0847"}</p>
          </div>

          <div className="bg-red-500/10 rounded-lg p-2 border border-red-500/30">
            <p className="text-[7px] text-red-400 mb-0.5 flex items-center gap-1">
              <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              {t.qrgoDriver?.loadRef || "REF. ÎNCĂRCARE"}
            </p>
            <p className="text-[10px] text-red-300 font-bold">{t.qrgoDriver?.loadRefValue || "DEL-RO-12458"}</p>
          </div>

          {/* Details */}
          <div className="bg-slate-800 rounded-lg p-2 border border-slate-700 space-y-2">
            <div className="flex items-center gap-2">
              <svg className="w-3 h-3 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-[6px] text-slate-500">{t.qrgoDriver?.scheduledTime || "ORĂ PROGRAMATĂ"}</p>
                <p className="text-[9px] text-orange-400 font-semibold">09:00</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-3 h-3 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
              </svg>
              <div>
                <p className="text-[6px] text-slate-500">{t.qrgoDriver?.cargoType || "TIP MARFĂ"}</p>
                <p className="text-[9px] text-white">{t.qrgoDriver?.cargoValue || "Legume"}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-3 h-3 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-[6px] text-slate-500">{t.qrgoDriver?.department || "DEPARTAMENT"}</p>
                <p className="text-[9px] text-white">{t.qrgoDriver?.departmentValue || "Office"}</p>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-slate-800 rounded-lg p-2 border border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-3 h-3 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6z" />
              </svg>
              <span className="text-[8px] font-semibold">{t.qrgoDriver?.timeline || "Cronologie"}</span>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[7px] text-white font-medium">{t.qrgoDriver?.rampAllocated || "Rampă Alocată"}</span>
                    <span className="text-[6px] text-slate-500">19:44</span>
                  </div>
                  <p className="text-[6px] text-slate-400">{t.qrgoDriver?.rampAllocatedDesc || "Rampa 1 alocată"}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[7px] text-white font-medium">{t.qrgoDriver?.checkinConfirmed || "Check-in confirmat"}</span>
                    <span className="text-[6px] text-slate-500">19:44</span>
                  </div>
                  <p className="text-[6px] text-slate-400">{t.qrgoDriver?.confirmedBy || "Confirmat de Daniel"}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-500 mt-1" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[7px] text-white font-medium">{t.qrgoDriver?.checkinCreated || "Check-in creat"}</span>
                    <span className="text-[6px] text-slate-500">19:43</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}

