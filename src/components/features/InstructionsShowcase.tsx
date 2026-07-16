import type { Translations } from "@/lib/i18n/translations";
import type { Locale } from "@/lib/i18n/config";
import { SteeringWheelIcon, UsersIcon, ChartIcon } from "@/components/icons";
import { featureRel } from "@/lib/features";
import { ShowcaseStage } from "./ShowcaseStage";
import { InstructionsScene } from "./InstructionsScene";
import { FeatureProblemSection } from "./FeatureProblemSection";
import { FeatureSpecSection } from "./sections";
import { FeatureBenefitsSection } from "./FeatureBenefitsSection";
import { FeatureFAQSection } from "./FeatureFAQSection";

// Driver Instructions & Guidance (feature 10) rich showcase: the dispatcher's
// Actions menu driving the driver's "What to do" card + narrative + benefits + FAQ.
// Server Component.
export function InstructionsShowcase({ t, locale }: { t: Translations; locale: Locale }) {
  const f = t.f10Page;
  return (
    <>
      <ShowcaseStage
        title={f.title}
        subtitle={f.subtitle}
        stepLabel={f.stepLabel}
        glowPrefix="in10-"
        sceneStartsMs={[]}
        aspectClass="aspect-[4/3] sm:aspect-[16/10]"
        minHClass="min-h-[440px]"
        headingId="instructions-showcase-title"
      >
        <InstructionsScene t={t} locale={locale} />
      </ShowcaseStage>

      <FeatureSpecSection
        idPrefix="in10"
        title={f.specTitle}
        subtitle={f.specSub}
        rows={[
          { k: f.k1, v: f.v1 },
          { k: f.k2, v: f.v2 },
          { k: f.k3, v: f.v3 },
          { k: f.k4, v: f.v4 },
          { k: f.k5, v: f.v5 },
          { k: f.k6, v: f.v6 },
        ]}
        tinted
      />
      <FeatureProblemSection
        idPrefix="in10"
        reverse
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
        idPrefix="in10"
        title={f.benTitle}
        subtitle={f.benSub}
        groups={[
          { icon: SteeringWheelIcon, title: f.b1t, items: [f.b1a, f.b1b, f.b1c] },
          { icon: UsersIcon, title: f.b2t, items: [f.b2a, f.b2b, f.b2c] },
          { icon: ChartIcon, title: f.b3t, items: [f.b3a, f.b3b, f.b3c] },
        ]}
      />

      <FeatureFAQSection
        idPrefix="in10"
        title={f.faqTitle}
        items={[
          { q: f.q1, a: f.a1 },
          { q: f.q2, a: f.a2 },
          { q: f.q3, a: f.a3 },
          { q: f.q4, a: f.a4 },
        ]}
        locale={locale}
        path={featureRel(locale, 10)}
      />
    </>
  );
}
