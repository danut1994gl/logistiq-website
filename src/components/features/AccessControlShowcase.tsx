import type { Translations } from "@/lib/i18n/translations";
import type { Locale } from "@/lib/i18n/config";
import { featureRel } from "@/lib/features";
import { ShowcaseStage } from "./ShowcaseStage";
import { AccessControlScene } from "./AccessControlScene";
import { FeatureFAQSection } from "./FeatureFAQSection";
import { FeatureMatrixSection, FeatureFlowSection, FeatureSplitSection, FeatureCalloutSection } from "./sections";

// Access Control (feature 17): staff roles, department assignment and what each
// role can actually do — taken from the rules the product really enforces.
//
// Section order is deliberate and specific to this page:
// the matrix first — this is the one page where a role x capability grid earns its
// place and it is the core proof. Then the admin's real path, then the two
// department flags, then the honesty callout (fixed roles, warehouse-wide reads).
// Server Component.
export function AccessControlShowcase({ t, locale }: { t: Translations; locale: Locale }) {
  const f = t.f17Page;
  return (
    <>
      <ShowcaseStage
        title={f.title}
        subtitle={f.subtitle}
        stepLabel={f.stepLabel}
        glowPrefix="ac17-"
        sceneStartsMs={[]}
        aspectClass="aspect-[4/3] sm:aspect-[16/10]"
        minHClass="min-h-[440px]"
        headingId="access-control-showcase-title"
      >
        <AccessControlScene t={t} locale={locale} />
      </ShowcaseStage>

      <FeatureMatrixSection
        idPrefix="ac17"
        title={f.mxTitle}
        subtitle={f.mxSub}
        roles={[f.mxRole1, f.mxRole2, f.mxRole3, f.mxRole4]}
        caps={[f.mxCap1, f.mxCap2, f.mxCap3, f.mxCap4]}
        // mxCell is a 16-char Y/N/P string, row-major (role1cap1..role4cap4) —
        // kept as one token so it survives translation without drifting.
        cells={[0, 1, 2, 3].map((r) => [0, 1, 2, 3].map((c) => f.mxCell[r * 4 + c]))}
        
      />

      <FeatureFlowSection
        idPrefix="ac17"
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
      />

      <FeatureSplitSection
        idPrefix="ac17"
        title={f.spTitle}
        body={f.spBody}
        side={f.spSide === "left" ? "left" : "right"}
        
      />

      <FeatureCalloutSection
        idPrefix="ac17"
        title={f.coTitle}
        body={f.coBody}
        kind={f.coKind === "roadmap" ? "roadmap" : f.coKind === "pilot" ? "pilot" : "note"}
      />

      <FeatureFAQSection
        idPrefix="ac17"
        title={f.faqTitle}
        items={[
          { q: f.q1, a: f.a1 },
          { q: f.q2, a: f.a2 },
          { q: f.q3, a: f.a3 },
          { q: f.q4, a: f.a4 },
        ]}
        locale={locale}
        path={featureRel(locale, 17)}
        tinted
      />
    </>
  );
}
