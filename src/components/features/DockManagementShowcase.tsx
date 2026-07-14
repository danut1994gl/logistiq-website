import type { Translations } from "@/lib/i18n/translations";
import type { Locale } from "@/lib/i18n/config";
import { UsersIcon, SteeringWheelIcon, ChartIcon } from "@/components/icons";
import { featureRel } from "@/lib/features";
import { ShowcaseStage } from "./ShowcaseStage";
import { DockBoardPlayer } from "./DockBoardPlayer";
import { FeatureProblemSection } from "./FeatureProblemSection";
import { FeatureBenefitsSection } from "./FeatureBenefitsSection";
import { FeatureFAQSection } from "./FeatureFAQSection";

// Dock Management (feature 2) rich showcase: a live operator dock board that
// loops through 5 real assignment situations (wait -> assign, reassign,
// call-to-office, complete -> next truck, cancel) + problem narrative +
// benefits by role + FAQ. Server Component (the board itself is a client leaf).
export function DockManagementShowcase({ t, locale }: { t: Translations; locale: Locale }) {
  const d = t.dockPage;
  return (
    <>
      <ShowcaseStage
        title={d.title}
        subtitle={d.subtitle}
        stepLabel={d.stepLabel}
        glowPrefix="db-"
        sceneStartsMs={[]}
        aspectClass="aspect-[4/3] sm:aspect-[3/2]"
        minHClass="min-h-[500px]"
        headingId="dock-showcase-title"
      >
        <DockBoardPlayer t={t} />
      </ShowcaseStage>

      <FeatureProblemSection
        eyebrow={d.probEyebrow}
        title={d.probTitle}
        paragraphs={[d.probP1, d.probP2]}
        compare={{
          oldTitle: d.oldTitle,
          newTitle: d.newTitle,
          oldRows: [d.old1, d.old2, d.old3, d.old4],
          newRows: [d.new1, d.new2, d.new3, d.new4],
        }}
      />

      <FeatureBenefitsSection
        title={d.benTitle}
        subtitle={d.benSub}
        groups={[
          { icon: UsersIcon, title: d.b1t, items: [d.b1a, d.b1b, d.b1c] },
          { icon: SteeringWheelIcon, title: d.b2t, items: [d.b2a, d.b2b, d.b2c] },
          { icon: ChartIcon, title: d.b3t, items: [d.b3a, d.b3b, d.b3c] },
        ]}
      />

      <FeatureFAQSection
        title={d.faqTitle}
        items={[
          { q: d.q1, a: d.a1 },
          { q: d.q2, a: d.a2 },
          { q: d.q3, a: d.a3 },
          { q: d.q4, a: d.a4 },
        ]}
        locale={locale}
        path={featureRel(locale, 2)}
      />
    </>
  );
}
