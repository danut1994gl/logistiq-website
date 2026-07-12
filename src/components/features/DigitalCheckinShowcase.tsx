import type { Translations } from "@/lib/i18n/translations";
import type { Locale } from "@/lib/i18n/config";
import { UsersIcon, SteeringWheelIcon, ChartIcon, CompassIcon } from "@/components/icons";
import { featureRel } from "@/lib/features";
import { CheckinJourneySection } from "./CheckinJourneySection";
import { FeatureProblemSection } from "./FeatureProblemSection";
import { FeatureBenefitsSection } from "./FeatureBenefitsSection";
import { FeatureFAQSection } from "./FeatureFAQSection";

// Digital Check-in page showcase: animated journey + problem narrative +
// benefits by role + FAQ (with FAQPage JSON-LD). Section backgrounds
// alternate: journey tinted, problem plain, benefits tinted, FAQ plain.
// Server Component.
export function DigitalCheckinShowcase({ t, locale }: { t: Translations; locale: Locale }) {
  const c = t.checkinContent;
  return (
    <>
      <CheckinJourneySection t={t} />
      <FeatureProblemSection
        eyebrow={c.problemEyebrow}
        title={c.problemTitle}
        paragraphs={[c.problemP1, c.problemP2]}
        compare={{
          oldTitle: c.compareOldTitle,
          newTitle: c.compareNewTitle,
          oldRows: [c.compareOld1, c.compareOld2, c.compareOld3, c.compareOld4],
          newRows: [c.compareNew1, c.compareNew2, c.compareNew3, c.compareNew4],
        }}
      />
      <FeatureBenefitsSection
        title={c.benefitsTitle}
        subtitle={c.benefitsSubtitle}
        groups={[
          {
            icon: UsersIcon,
            title: c.benefitOperatorTitle,
            items: [c.benefitOperator1, c.benefitOperator2, c.benefitOperator3],
          },
          {
            icon: SteeringWheelIcon,
            title: c.benefitDriverTitle,
            items: [c.benefitDriver1, c.benefitDriver2, c.benefitDriver3],
          },
          {
            icon: ChartIcon,
            title: c.benefitManagerTitle,
            items: [c.benefitManager1, c.benefitManager2, c.benefitManager3],
          },
          {
            icon: CompassIcon,
            title: c.benefitNewTitle,
            items: [c.benefitNew1, c.benefitNew2, c.benefitNew3],
          },
        ]}
      />
      <FeatureFAQSection
        title={c.faqTitle}
        items={[
          { q: c.faq1Q, a: c.faq1A },
          { q: c.faq2Q, a: c.faq2A },
          { q: c.faq3Q, a: c.faq3A },
          { q: c.faq4Q, a: c.faq4A },
        ]}
        locale={locale}
        path={featureRel(locale, 1)}
      />
    </>
  );
}
