import { type Translations } from "@/lib/i18n/translations";
import { MobileIcon, GlobeIcon, ArrowRightIcon } from "@/components/icons";
import { DriverMockupWaiting } from "@/components/mockups/DriverMockupWaiting";
import { DriverMockupAssigned } from "@/components/mockups/DriverMockupAssigned";
import { DriverMockupInfo } from "@/components/mockups/DriverMockupInfo";

export function QRGODriverSection({ t }: { t: Translations }) {
  return (
    <section id="qrgo-driver" className="py-20 bg-gradient-to-b from-slate-900 to-slate-800 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full filter blur-[100px]" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-500 rounded-full filter blur-[100px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/20 text-blue-300 text-sm font-medium mb-4">
            <MobileIcon />
            {t.qrgoDriver?.badge || "Mobile App"}
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            {t.qrgoDriver?.title || "QRGO Driver"}
          </h2>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            {t.qrgoDriver?.subtitle || "Aplicația mobilă pentru șoferi - check-in rapid, notificări în timp real și instrucțiuni clare pentru fiecare operațiune."}
          </p>
        </div>

        {/* Phone Mockups */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-4 mb-12">
          <div className="transform lg:-rotate-6 lg:translate-y-4 hover:rotate-0 hover:translate-y-0 transition-transform duration-300">
            <DriverMockupWaiting t={t} />
            <p className="text-center text-sm text-slate-400 mt-4">{t.qrgoDriver?.mockup1Title || "Status în așteptare"}</p>
          </div>
          <div className="transform lg:scale-110 lg:z-10 hover:scale-115 transition-transform duration-300">
            <DriverMockupAssigned t={t} />
            <p className="text-center text-sm text-slate-400 mt-4">{t.qrgoDriver?.mockup2Title || "Rampă alocată"}</p>
          </div>
          <div className="transform lg:rotate-6 lg:translate-y-4 hover:rotate-0 hover:translate-y-0 transition-transform duration-300">
            <DriverMockupInfo t={t} />
            <p className="text-center text-sm text-slate-400 mt-4">{t.qrgoDriver?.mockup3Title || "Detalii check-in"}</p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="https://apps.apple.com/app/qrgo-driver"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-6 py-3 bg-white text-slate-900 rounded-xl font-medium hover:bg-slate-100 transition-colors"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
            <div className="text-left">
              <p className="text-[10px] opacity-70">{t.qrgoDriver?.downloadFrom || "Descarcă din"}</p>
              <p className="text-sm font-semibold">App Store</p>
            </div>
          </a>
          <a
            href="https://play.google.com/store/apps/details?id=ro.qrgo.driver"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-6 py-3 bg-white text-slate-900 rounded-xl font-medium hover:bg-slate-100 transition-colors"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.5,12.92 20.16,13.19L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
            </svg>
            <div className="text-left">
              <p className="text-[10px] opacity-70">{t.qrgoDriver?.downloadFrom || "Descarcă din"}</p>
              <p className="text-sm font-semibold">Google Play</p>
            </div>
          </a>
          <a
            href="https://qrgo.ro"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 text-blue-400 hover:text-blue-300 transition-colors"
          >
            <GlobeIcon />
            <span>{t.qrgoDriver?.visitWebsite || "Vizitează qrgo.ro"}</span>
            <ArrowRightIcon />
          </a>
        </div>
      </div>
    </section>
  );
}

