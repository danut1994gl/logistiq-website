import { type Translations } from "@/lib/i18n/translations";
import { PhoneFrame } from "@/components/mockups/PhoneFrame";
import { QRCodeSVG } from "@/components/mockups/QRCodeSVG";

export function DriverMockupWaiting({ t }: { t: Translations }) {
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
                <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center mb-1">
                  <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-[8px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {t.qrgoDriver?.waiting || "În Așteptare"}
                </span>
                <p className="text-[7px] text-slate-400 mt-1 text-center">{t.qrgoDriver?.waitingDesc || "Aștepți confirmarea operatorului"}</p>
              </div>
              {/* QR Code Side - Real QR code to qrgo.ro */}
              <div className="flex-1 flex flex-col items-center justify-center py-2">
                <div className="w-16 h-16 bg-white rounded p-1 mb-1">
                  <QRCodeSVG />
                </div>
                <p className="text-[7px] text-slate-500">fcee6dfd...</p>
              </div>
            </div>
            <div className="border-t border-slate-700 mt-2 pt-2 flex items-center justify-end gap-1 text-[7px] text-slate-400">
              <svg className="w-2.5 h-2.5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <svg className="w-2.5 h-2.5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>{t.qrgoDriver?.sent || "Trimis"} 19:07</span>
            </div>
          </div>

          {/* Action Card */}
          <div className="bg-amber-500/10 rounded-lg p-2 border border-amber-500/30">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-5 h-5 rounded-full bg-amber-500/30 flex items-center justify-center">
                <svg className="w-3 h-3 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-[8px] text-amber-300 font-medium">{t.qrgoDriver?.whatToDo || "Ce trebuie să faci"}</span>
            </div>
            <p className="text-[9px] text-amber-200 font-semibold">{t.qrgoDriver?.pleaseWait || "Te rugăm să aștepți"}</p>
            <p className="text-[7px] text-amber-300/70">{t.qrgoDriver?.willBeNotified || "Vei fi notificat la următoarea acțiune"}</p>
          </div>

          {/* Driver Info Card */}
          <div className="bg-slate-800 rounded-lg p-2 border border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-4 h-4 rounded-full bg-blue-500/30 flex items-center justify-center">
                <svg className="w-2.5 h-2.5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-[8px] text-slate-300 font-medium">{t.qrgoDriver?.driverInfo || "Informații Șofer"}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[7px]">
              <div>
                <p className="text-slate-500">{t.qrgoDriver?.driverNameLabel || "NUME"}</p>
                <p className="text-white">{t.qrgoDriver?.driverName || "Popescu Ion"}</p>
              </div>
              <div>
                <p className="text-slate-500">{t.qrgoDriver?.driverPhoneLabel || "TELEFON"}</p>
                <p className="text-white">{t.qrgoDriver?.driverPhone || "+40 722 345 678"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}

