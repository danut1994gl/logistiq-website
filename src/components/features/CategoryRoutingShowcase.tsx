import type { Translations } from "@/lib/i18n/translations";
import type { Locale } from "@/lib/i18n/config";
import { UsersIcon, SteeringWheelIcon, ChartIcon } from "@/components/icons";
import { featureRel } from "@/lib/features";
import { ShowcaseStage } from "./ShowcaseStage";
import { CategoryRoutingScene } from "./CategoryRoutingScene";
import { FeatureProblemSection } from "./FeatureProblemSection";
import { FeatureBenefitsSection } from "./FeatureBenefitsSection";
import { FeatureFAQSection } from "./FeatureFAQSection";

// Department & Truck Categories (feature 4) rich showcase: a cargo-routing
// board (trucks auto-sorted into their department by cargo category) + problem
// narrative + benefits by role + FAQ. Server Component.
export function CategoryRoutingShowcase({ t, locale }: { t: Translations; locale: Locale }) {
  const f = t.f4Page;
  return (
    <>
      <ShowcaseStage
        title={f.title}
        subtitle={f.subtitle}
        stepLabel={f.stepLabel}
        glowPrefix="cr-"
        sceneStartsMs={[]}
        aspectClass="aspect-[4/3] sm:aspect-[16/10]"
        minHClass="min-h-[440px]"
        headingId="category-showcase-title"
      >
        <CategoryRoutingScene t={t} locale={locale} />
      </ShowcaseStage>

      <FeatureProblemSection
        idPrefix="cr4"
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
        idPrefix="cr4"
        title={f.benTitle}
        subtitle={f.benSub}
        groups={[
          { icon: UsersIcon, title: f.b1t, items: [f.b1a, f.b1b, f.b1c] },
          { icon: SteeringWheelIcon, title: f.b2t, items: [f.b2a, f.b2b, f.b2c] },
          { icon: ChartIcon, title: f.b3t, items: [f.b3a, f.b3b, f.b3c] },
        ]}
      />

      <FeatureFAQSection
        idPrefix="cr4"
        title={f.faqTitle}
        items={[
          { q: f.q1, a: f.a1 },
          { q: f.q2, a: f.a2 },
          { q: f.q3, a: f.a3 },
          { q: f.q4, a: f.a4 },
        ]}
        locale={locale}
        path={featureRel(locale, 4)}
      />
    </>
  );
}
