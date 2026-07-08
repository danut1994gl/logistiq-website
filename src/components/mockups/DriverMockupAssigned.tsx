import { type Translations } from "@/lib/i18n/translations";
import { PhoneFrame } from "@/components/mockups/PhoneFrame";
import { QRCodeSVG } from "@/components/mockups/QRCodeSVG";

export function DriverMockupAssigned({ t }: { t: Translations }) {
  return (
    <PhoneFrame>
      <div className="h-full overflow-hidden text-white">
        {/* Status Header */}
        <div className="bg-blue-600 px-3 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-500/50 flex items-center justify-center">
                <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-[9px] font-semibold">{t.qrgoDriver?.statusCheckin || "Status Check-in"}</p>
                <p className="text-[7px] text-blue-200">{t.qrgoDriver?.warehouseName || "Depozit București"}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[7px] bg-emerald-500/20 px-1.5 py-0.5 rounded-full">
              <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-300">LIVE</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-2 space-y-2">
          {/* Status Card */}
          <div className="bg-slate-800 rounded-lg p-2 border border-slate-700">
            <div className="flex gap-2">
              {/* Status Icon Side */}
              <div className="flex-1 flex flex-col items-center justify-center py-2">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center mb-1">
                  <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-[8px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {t.qrgoDriver?.assigned || "Alocat"}
                </span>
                <p className="text-[7px] text-slate-400 mt-1 text-center">{t.qrgoDriver?.assignedDesc || "V-a fost atribuită o rampă"}</p>
              </div>
              {/* QR Code Side - Real QR code to qrgo.ro */}
              <div className="flex-1 flex flex-col items-center justify-center py-2">
                <div className="w-16 h-16 bg-white rounded p-1 mb-1">
                  <QRCodeSVG />
                </div>
                <p className="text-[7px] text-slate-500">562a10b7...</p>
              </div>
            </div>
            <div className="border-t border-slate-700 mt-2 pt-2 flex items-center justify-end gap-1 text-[7px] text-slate-400">
              <svg className="w-2.5 h-2.5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <svg className="w-2.5 h-2.5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <svg className="w-2.5 h-2.5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>{t.qrgoDriver?.seen || "Văzut"} 19:44</span>
            </div>
          </div>

          {/* Action Card - Go to Ramp */}
          <div className="bg-emerald-500/10 rounded-lg p-2 border border-emerald-500/30">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-5 h-5 rounded-full bg-emerald-500/30 flex items-center justify-center">
                <svg className="w-3 h-3 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-[8px] text-emerald-300 font-medium">{t.qrgoDriver?.whatToDo || "Ce trebuie să faci"}</span>
            </div>
            <p className="text-[11px] text-emerald-200 font-bold">{t.qrgoDriver?.goToRamp || "Mergi la Rampa 1"}</p>
          </div>

          {/* Ramp Card */}
          <div className="bg-slate-800 rounded-lg p-2 border border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-4 h-4 rounded-full bg-purple-500/30 flex items-center justify-center">
                <svg className="w-2.5 h-2.5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-[8px] text-slate-300 font-medium">{t.qrgoDriver?.rampAssigned || "Rampă Alocată"}</span>
            </div>
            <p className="text-[11px] text-white font-bold mb-2">{t.qrgoDriver?.ramp1 || "Rampa 1"}</p>
            <div className="w-full h-14 bg-slate-700 rounded flex items-center justify-center">
              <svg className="w-12 h-10 text-slate-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 8h-3V4H1v13h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}

