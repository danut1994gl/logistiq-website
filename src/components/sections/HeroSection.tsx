import Link from "next/link";
import { type Translations } from "@/lib/i18n/translations";
import { QrCodeIcon, CheckIcon, ArrowRightIcon, PlayIcon } from "@/components/icons";
import { DashboardMockup } from "@/components/mockups/DashboardMockup";

export function HeroSection({ t }: { t: Translations }) {
  return (
    <section className="relative min-h-screen flex items-start pt-28 overflow-hidden hero-gradient">
      {/* Decorative elements */}
      <div className="absolute inset-0 grid-pattern opacity-50" />
      <div className="blob w-96 h-96 bg-blue-500 -top-48 -right-48 animate-float" />
      <div className="blob w-64 h-64 bg-cyan-500 bottom-20 -left-32 animate-float" style={{ animationDelay: "1s" }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left content */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium mb-6 animate-fade-in-down">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              {t.hero.badge}
            </div>

            {/* Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-6 animate-fade-in-up">
              {t.hero.title}{" "}
              <span className="gradient-text">{t.hero.titleHighlight}</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-xl mx-auto lg:mx-0 animate-fade-in-up stagger-2">
              {t.hero.subtitle}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in-up stagger-3">
              <Link
                href="#contact"
                className="btn-primary text-white px-8 py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2"
              >
                {t.hero.cta1}
                <ArrowRightIcon />
              </Link>
              <Link
                href="#how-it-works"
                className="btn-secondary border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 px-8 py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 hover:border-blue-500"
              >
                <PlayIcon />
                {t.hero.cta2}
              </Link>
            </div>

            {/* Trust badges */}
            <div className="mt-12 animate-fade-in-up stagger-4">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                {t.hero.trustedBy}
              </p>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6">
                {["Kaufland", "Metro", "Carrefour", "Lidl"].map((brand, i) => (
                  <div
                    key={brand}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 font-medium text-sm"
                  >
                    {brand}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right content - Dashboard mockup */}
          <div className="relative animate-fade-in-right">
            <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl overflow-hidden animate-float">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-4 py-3 bg-slate-800 border-b border-slate-700">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="px-4 py-1 bg-slate-700 rounded-lg text-slate-400 text-sm flex items-center gap-2">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    logistiq.cloud
                  </div>
                </div>
              </div>

              {/* Dashboard preview - Realistic UI */}
              <DashboardMockup />
            </div>

            {/* Floating notification */}
            <div className="absolute -bottom-4 -left-4 bg-white dark:bg-slate-800 rounded-xl shadow-xl p-4 animate-bounce-subtle border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <CheckIcon />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    Check-in completed
                  </p>
                  <p className="text-xs text-slate-500">Ramp 3 assigned • 09:15</p>
                </div>
              </div>
            </div>

            {/* Floating QR notification */}
            <div className="absolute -top-2 -right-2 bg-white dark:bg-slate-800 rounded-xl shadow-xl p-3 animate-bounce-subtle border border-slate-200 dark:border-slate-700" style={{ animationDelay: "0.5s" }}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <QrCodeIcon />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-900 dark:text-white">
                    New check-in
                  </p>
                  <p className="text-[10px] text-slate-500">via QR scan</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-slate-400 dark:border-slate-600 flex justify-center pt-2">
          <div className="w-1.5 h-3 rounded-full bg-slate-400 dark:bg-slate-600 animate-pulse" />
        </div>
      </div>
    </section>
  );
}

