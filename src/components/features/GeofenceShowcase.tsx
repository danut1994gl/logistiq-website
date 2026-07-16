import type { Translations } from "@/lib/i18n/translations";
import type { Locale } from "@/lib/i18n/config";
import { MapPinIcon, SteeringWheelIcon, ChartIcon } from "@/components/icons";
import { featureRel } from "@/lib/features";
import { ShowcaseStage } from "./ShowcaseStage";
import { GeofenceScene } from "./GeofenceScene";
import { FeatureProblemSection } from "./FeatureProblemSection";
import { FeatureBenefitsSection } from "./FeatureBenefitsSection";
import { FeatureFAQSection } from "./FeatureFAQSection";

// Automatic Location Detection (feature 12) rich showcase: drawing the yard
// geofence + the app detecting it and offering (never auto-submitting) a check-in.
// Server Component.
export function GeofenceShowcase({ t, locale }: { t: Translations; locale: Locale }) {
  const f = t.f12Page;
  return (
    <>
      <ShowcaseStage
        title={f.title}
        subtitle={f.subtitle}
        stepLabel={f.stepLabel}
        glowPrefix="gf12-"
        sceneStartsMs={[]}
        aspectClass="aspect-[4/3] sm:aspect-[16/10]"
        minHClass="min-h-[440px]"
        headingId="geofence-showcase-title"
      >
        <GeofenceScene t={t} locale={locale} />
      </ShowcaseStage>

      <FeatureProblemSection
        idPrefix="gf12"
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
        idPrefix="gf12"
        title={f.benTitle}
        subtitle={f.benSub}
        groups={[
          { icon: MapPinIcon, title: f.b1t, items: [f.b1a, f.b1b, f.b1c] },
          { icon: SteeringWheelIcon, title: f.b2t, items: [f.b2a, f.b2b, f.b2c] },
          { icon: ChartIcon, title: f.b3t, items: [f.b3a, f.b3b, f.b3c] },
        ]}
      />

      <FeatureFAQSection
        idPrefix="gf12"
        title={f.faqTitle}
        items={[
          { q: f.q1, a: f.a1 },
          { q: f.q2, a: f.a2 },
          { q: f.q3, a: f.a3 },
          { q: f.q4, a: f.a4 },
        ]}
        locale={locale}
        path={featureRel(locale, 12)}
      />
    </>
  );
}
