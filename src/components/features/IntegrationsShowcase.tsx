import type { Translations } from "@/lib/i18n/translations";
import type { Locale } from "@/lib/i18n/config";
import { featureRel } from "@/lib/features";
import { ShowcaseStage } from "./ShowcaseStage";
import { IntegrationsScene } from "./IntegrationsScene";
import { FeatureFAQSection } from "./FeatureFAQSection";
import { FeatureProblemSection } from "./FeatureProblemSection";
import { FeatureSpecSection, FeatureSplitSection, FeatureCalloutSection } from "./sections";

// Systems Integrations & API (feature 16): deliberately forward-looking — what is
// live today (the keyed gate device API, the carrier portal) vs what is roadmap.
//
// Section order is deliberate and specific to this page:
// problem (the real pain is data entry), then the ONE true endpoint table we can
// show, then the objects that already exist, then a roadmap callout that says
// plainly what is not built. The callout is load-bearing, not decoration.
// Server Component.
export function IntegrationsShowcase({ t, locale }: { t: Translations; locale: Locale }) {
  const f = t.f16Page;
  return (
    <>
      <ShowcaseStage
        title={f.title}
        subtitle={f.subtitle}
        stepLabel={f.stepLabel}
        glowPrefix="in16-"
        sceneStartsMs={[]}
        aspectClass="aspect-[4/3] sm:aspect-[16/9]"
        minHClass="min-h-[440px]"
        headingId="integrations-showcase-title"
      >
        <IntegrationsScene t={t} />
      </ShowcaseStage>

      <FeatureProblemSection
        idPrefix="in16"
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

      <FeatureSpecSection
        idPrefix="in16"
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

      <FeatureSplitSection
        idPrefix="in16"
        title={f.spTitle}
        body={f.spBody}
        side={f.spSide === "left" ? "left" : "right"}
        
      />

      <FeatureCalloutSection
        idPrefix="in16"
        title={f.coTitle}
        body={f.coBody}
        kind={f.coKind === "roadmap" ? "roadmap" : f.coKind === "pilot" ? "pilot" : "note"}
      />

      <FeatureFAQSection
        idPrefix="in16"
        title={f.faqTitle}
        items={[
          { q: f.q1, a: f.a1 },
          { q: f.q2, a: f.a2 },
          { q: f.q3, a: f.a3 },
          { q: f.q4, a: f.a4 },
        ]}
        locale={locale}
        path={featureRel(locale, 16)}
        tinted
      />
    </>
  );
}
