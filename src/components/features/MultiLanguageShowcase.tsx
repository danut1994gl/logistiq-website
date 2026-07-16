import type { Translations } from "@/lib/i18n/translations";
import type { Locale } from "@/lib/i18n/config";
import { SteeringWheelIcon, UsersIcon, ChartIcon } from "@/components/icons";
import { featureRel } from "@/lib/features";
import { ShowcaseStage } from "./ShowcaseStage";
import { MultiLanguageScene } from "./MultiLanguageScene";
import { FeatureProblemSection } from "./FeatureProblemSection";
import { FeatureBenefitsSection } from "./FeatureBenefitsSection";
import { FeatureFAQSection } from "./FeatureFAQSection";

// Multi-language (feature 7) rich showcase: drivers speaking different
// languages funnelling into one dispatcher view + problem narrative + benefits + FAQ.
// Server Component.
export function MultiLanguageShowcase({ t, locale }: { t: Translations; locale: Locale }) {
  const f = t.f7Page;
  return (
    <>
      <ShowcaseStage
        title={f.title}
        subtitle={f.subtitle}
        stepLabel={f.stepLabel}
        glowPrefix="ml7-"
        sceneStartsMs={[]}
        aspectClass="aspect-[4/3] sm:aspect-[16/10]"
        minHClass="min-h-[440px]"
        headingId="multilang-showcase-title"
      >
        <MultiLanguageScene t={t} />
      </ShowcaseStage>

      <FeatureProblemSection
        idPrefix="ml7"
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
        idPrefix="ml7"
        title={f.benTitle}
        subtitle={f.benSub}
        groups={[
          { icon: SteeringWheelIcon, title: f.b1t, items: [f.b1a, f.b1b, f.b1c] },
          { icon: UsersIcon, title: f.b2t, items: [f.b2a, f.b2b, f.b2c] },
          { icon: ChartIcon, title: f.b3t, items: [f.b3a, f.b3b, f.b3c] },
        ]}
      />

      <FeatureFAQSection
        idPrefix="ml7"
        title={f.faqTitle}
        items={[
          { q: f.q1, a: f.a1 },
          { q: f.q2, a: f.a2 },
          { q: f.q3, a: f.a3 },
          { q: f.q4, a: f.a4 },
        ]}
        locale={locale}
        path={featureRel(locale, 7)}
      />
    </>
  );
}
