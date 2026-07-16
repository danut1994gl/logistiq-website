import type { Translations } from "@/lib/i18n/translations";
import type { Locale } from "@/lib/i18n/config";
import { CloudIcon, UsersIcon, ChartIcon } from "@/components/icons";
import { featureRel } from "@/lib/features";
import { ShowcaseStage } from "./ShowcaseStage";
import { CloudScene } from "./CloudScene";
import { FeatureProblemSection } from "./FeatureProblemSection";
import { FeatureBenefitsSection } from "./FeatureBenefitsSection";
import { FeatureFAQSection } from "./FeatureFAQSection";

// Cloud - No Equipment (feature 9) rich showcase: logistiq.cloud in the middle
// with warehouses and a driver phone syncing both ways + narrative + benefits + FAQ.
// Server Component.
export function CloudShowcase({ t, locale }: { t: Translations; locale: Locale }) {
  const f = t.f9Page;
  return (
    <>
      <ShowcaseStage
        title={f.title}
        subtitle={f.subtitle}
        stepLabel={f.stepLabel}
        glowPrefix="cl9-"
        sceneStartsMs={[]}
        aspectClass="aspect-[4/3] sm:aspect-[16/10]"
        minHClass="min-h-[440px]"
        headingId="cloud-showcase-title"
      >
        <CloudScene t={t} />
      </ShowcaseStage>

      <FeatureProblemSection
        idPrefix="cl9"
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
        idPrefix="cl9"
        title={f.benTitle}
        subtitle={f.benSub}
        groups={[
          { icon: CloudIcon, title: f.b1t, items: [f.b1a, f.b1b, f.b1c] },
          { icon: UsersIcon, title: f.b2t, items: [f.b2a, f.b2b, f.b2c] },
          { icon: ChartIcon, title: f.b3t, items: [f.b3a, f.b3b, f.b3c] },
        ]}
      />

      <FeatureFAQSection
        idPrefix="cl9"
        title={f.faqTitle}
        items={[
          { q: f.q1, a: f.a1 },
          { q: f.q2, a: f.a2 },
          { q: f.q3, a: f.a3 },
          { q: f.q4, a: f.a4 },
        ]}
        locale={locale}
        path={featureRel(locale, 9)}
      />
    </>
  );
}
