import type { Translations } from "@/lib/i18n/translations";
import type { Locale } from "@/lib/i18n/config";
import { featureRel } from "@/lib/features";
import { ShowcaseStage } from "./ShowcaseStage";
import { WhiteLabelScene } from "./WhiteLabelScene";
import { FeatureFAQSection } from "./FeatureFAQSection";
import { FeatureProblemSection } from "./FeatureProblemSection";
import { FeatureFlowSection, FeatureSpecSection, FeatureCalloutSection } from "./sections";

// White-Label (feature 8): branding the driver check-in page. QRGOBox and the API
// were split out to their own pages (15 and 16) — nothing here touches either.
//
// Section order is deliberate and specific to this page:
// problem (recognition at the gate is queue time), then the DNS flow that is the
// real achievement, then the hard limits, then the callout that states there is
// no per-org theme colour before a buyer can feel misled.
// Server Component.
export function WhiteLabelShowcase({ t, locale }: { t: Translations; locale: Locale }) {
  const f = t.f8Page;
  return (
    <>
      <ShowcaseStage
        title={f.title}
        subtitle={f.subtitle}
        stepLabel={f.stepLabel}
        glowPrefix="wl8-"
        sceneStartsMs={[]}
        aspectClass="aspect-[4/3] sm:aspect-[16/10]"
        minHClass="min-h-[440px]"
        headingId="whitelabel-showcase-title"
      >
        <WhiteLabelScene t={t} locale={locale} />
      </ShowcaseStage>

      <FeatureProblemSection
        idPrefix="wl8"
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

      <FeatureFlowSection
        idPrefix="wl8"
        title={f.flowTitle}
        subtitle={f.flowSub}
        steps={[
          { title: f.s1t, desc: f.s1d },
          { title: f.s2t, desc: f.s2d },
          { title: f.s3t, desc: f.s3d },
          { title: f.s4t, desc: f.s4d },
          { title: f.s5t, desc: f.s5d },
        ]}
        tinted
        seo={{ locale, path: featureRel(locale, 8) }}
      />

      <FeatureSpecSection
        idPrefix="wl8"
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
        
      />

      <FeatureCalloutSection
        idPrefix="wl8"
        title={f.coTitle}
        body={f.coBody}
        kind={f.coKind === "roadmap" ? "roadmap" : f.coKind === "pilot" ? "pilot" : "note"}
      />

      <FeatureFAQSection
        idPrefix="wl8"
        title={f.faqTitle}
        items={[
          { q: f.q1, a: f.a1 },
          { q: f.q2, a: f.a2 },
          { q: f.q3, a: f.a3 },
          { q: f.q4, a: f.a4 },
        ]}
        locale={locale}
        path={featureRel(locale, 8)}
        tinted
      />
    </>
  );
}
