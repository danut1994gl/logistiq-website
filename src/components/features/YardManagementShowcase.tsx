import type { Translations } from "@/lib/i18n/translations";
import type { Locale } from "@/lib/i18n/config";
import { MapPinIcon, GateIcon, ClockIcon, UsersIcon, ChartIcon, CompassIcon } from "@/components/icons";
import { featureRel } from "@/lib/features";
import { ShowcaseStage } from "./ShowcaseStage";
import { YardScene } from "./YardScene";
import { FeatureProblemSection } from "./FeatureProblemSection";
import { FeatureBenefitsSection } from "./FeatureBenefitsSection";
import { FeatureFAQSection } from "./FeatureFAQSection";

// Yard Management System (feature 13) rich showcase: top-down live yard map +
// problem narrative + benefits by role + FAQ. Server Component.
export function YardManagementShowcase({ t, locale }: { t: Translations; locale: Locale }) {
  const y = t.ymsPage;
  return (
    <>
      <ShowcaseStage
        title={y.title}
        subtitle={y.subtitle}
        stepLabel={y.stepLabel}
        glowPrefix="ym-"
        sceneStartsMs={[0, 6000, 16000]}
        aspectClass="aspect-[16/9] sm:aspect-[12/5]"
        minHClass="min-h-[300px]"
        steps={[
          { icon: MapPinIcon, title: y.s1t, desc: y.s1d },
          { icon: GateIcon, title: y.s2t, desc: y.s2d },
          { icon: ClockIcon, title: y.s3t, desc: y.s3d },
        ]}
      >
        <YardScene t={t} />
      </ShowcaseStage>

      <FeatureProblemSection
        eyebrow={y.probEyebrow}
        title={y.probTitle}
        paragraphs={[y.probP1, y.probP2]}
        compare={{
          oldTitle: y.oldTitle,
          newTitle: y.newTitle,
          oldRows: [y.old1, y.old2, y.old3, y.old4],
          newRows: [y.new1, y.new2, y.new3, y.new4],
        }}
      />

      <FeatureBenefitsSection
        title={y.benTitle}
        subtitle={y.benSub}
        groups={[
          { icon: UsersIcon, title: y.b1t, items: [y.b1a, y.b1b, y.b1c] },
          { icon: ChartIcon, title: y.b2t, items: [y.b2a, y.b2b, y.b2c] },
          { icon: CompassIcon, title: y.b3t, items: [y.b3a, y.b3b, y.b3c] },
        ]}
      />

      <FeatureFAQSection
        title={y.faqTitle}
        items={[
          { q: y.q1, a: y.a1 },
          { q: y.q2, a: y.a2 },
          { q: y.q3, a: y.a3 },
          { q: y.q4, a: y.a4 },
        ]}
        locale={locale}
        path={featureRel(locale, 13)}
      />
    </>
  );
}
