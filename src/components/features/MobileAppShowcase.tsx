import type { Translations } from "@/lib/i18n/translations";
import type { Locale } from "@/lib/i18n/config";
import { SteeringWheelIcon, UsersIcon, ChartIcon } from "@/components/icons";
import { featureRel } from "@/lib/features";
import { ShowcaseStage } from "./ShowcaseStage";
import { AppTourScene } from "./AppTourScene";
import { FeatureProblemSection } from "./FeatureProblemSection";
import { FeatureBenefitsSection } from "./FeatureBenefitsSection";
import { FeatureFAQSection } from "./FeatureFAQSection";

const APP_STORE = "https://apps.apple.com/app/qrgo-driver/id6756977629";
const GOOGLE_PLAY = "https://play.google.com/store/apps/details?id=ro.qrgo.driver";

function StoreBadges() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4">
      <a href={APP_STORE} target="_blank" rel="noopener noreferrer" aria-label="Download QRGO Driver on the App Store" className="group inline-flex items-center gap-3 rounded-xl bg-black px-5 py-3 border border-white/15 hover:border-white/30 transition-colors">
        <svg viewBox="0 0 24 24" className="w-8 h-8 text-white shrink-0" fill="currentColor"><path d="M17.05 12.7c-.03-2.5 2.04-3.7 2.13-3.76-1.16-1.7-2.97-1.93-3.61-1.96-1.54-.16-3 .9-3.78.9-.78 0-1.98-.88-3.25-.86-1.67.03-3.21.97-4.07 2.47-1.73 3-.44 7.45 1.25 9.88.82 1.19 1.8 2.53 3.08 2.48 1.24-.05 1.71-.8 3.21-.8 1.49 0 1.92.8 3.23.77 1.33-.02 2.18-1.21 3-2.41.94-1.38 1.33-2.72 1.35-2.79-.03-.01-2.59-1-2.62-3.94M14.6 4.98c.68-.83 1.14-1.98 1.02-3.13-.98.04-2.18.65-2.89 1.48-.63.73-1.19 1.9-1.04 3.02 1.1.08 2.22-.55 2.91-1.37" /></svg>
        <span className="flex flex-col leading-tight text-left"><span className="text-white/70 text-[11px]">Download on the</span><span className="text-white font-semibold text-lg -mt-0.5">App Store</span></span>
      </a>
      <a href={GOOGLE_PLAY} target="_blank" rel="noopener noreferrer" aria-label="Get QRGO Driver on Google Play" className="group inline-flex items-center gap-3 rounded-xl bg-black px-5 py-3 border border-white/15 hover:border-white/30 transition-colors">
        <svg viewBox="0 0 48 48" className="w-8 h-8 shrink-0"><path fill="#00d2ff" d="M6.5 4.3 26 24 6.5 43.7A2 2 0 0 1 5 41.9V6.1a2 2 0 0 1 1.5-1.8z" /><path fill="#00e676" d="M6.5 4.3 32.4 18.3l-6.4 5.7z" /><path fill="#ffd600" d="M39.6 21.7c1.5.8 1.5 2.9 0 3.8l-6.5 3.6-6.4-5.8 6.4-5.7z" /><path fill="#ff3d47" d="M6.5 43.7 26 24l6.4 5.7-25.9 14z" /></svg>
        <span className="flex flex-col leading-tight text-left"><span className="text-white/70 text-[11px] uppercase tracking-wide">Get it on</span><span className="text-white font-semibold text-lg -mt-0.5">Google Play</span></span>
      </a>
    </div>
  );
}

// Android & iOS App (feature 6) rich showcase: an iPhone product tour of the
// real QRGO Driver app + store badges + problem narrative + benefits + FAQ.
// Server Component.
export function MobileAppShowcase({ t, locale }: { t: Translations; locale: Locale }) {
  const f = t.f6Page;
  return (
    <>
      <ShowcaseStage
        title={f.title}
        subtitle={f.subtitle}
        stepLabel={f.stepLabel}
        glowPrefix="app-"
        sceneStartsMs={[]}
        aspectClass="aspect-[4/3] sm:aspect-[16/10]"
        minHClass="min-h-[440px]"
        headingId="app-showcase-title"
      >
        <AppTourScene t={t} />
      </ShowcaseStage>

      <div className="pb-4 flex flex-col items-center gap-5 bg-slate-50 dark:bg-slate-900/50">
        <span className="text-lg font-semibold text-slate-700 dark:text-slate-200">{f.uiGetApp}</span>
        <StoreBadges />
      </div>

      <FeatureProblemSection
        eyebrow={f.probEyebrow}
        title={f.probTitle}
        paragraphs={[f.probP1, f.probP2]}
        compare={{
          oldTitle: f.oldTitle,
          newTitle: f.newTitle,
          oldRows: [f.old1, f.old2, f.old3, f.old4],
          newRows: [f.new1, f.new2, f.new3, f.new4],
        }}
      />

      <FeatureBenefitsSection
        title={f.benTitle}
        subtitle={f.benSub}
        groups={[
          { icon: SteeringWheelIcon, title: f.b1t, items: [f.b1a, f.b1b, f.b1c] },
          { icon: UsersIcon, title: f.b2t, items: [f.b2a, f.b2b, f.b2c] },
          { icon: ChartIcon, title: f.b3t, items: [f.b3a, f.b3b, f.b3c] },
        ]}
      />

      <FeatureFAQSection
        title={f.faqTitle}
        items={[
          { q: f.q1, a: f.a1 },
          { q: f.q2, a: f.a2 },
          { q: f.q3, a: f.a3 },
          { q: f.q4, a: f.a4 },
        ]}
        locale={locale}
        path={featureRel(locale, 6)}
      />
    </>
  );
}
