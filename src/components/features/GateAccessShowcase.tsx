import type { Translations } from "@/lib/i18n/translations";
import type { Locale } from "@/lib/i18n/config";
import { featureRel } from "@/lib/features";
import { ShowcaseStage } from "./ShowcaseStage";
import { GateAccessScene } from "./GateAccessScene";
import { FeatureFAQSection } from "./FeatureFAQSection";
import { GateNetworkArt } from "./splitArt";
import { FeatureFlowSection, FeatureSpecSection, FeatureSplitSection, FeatureCalloutSection } from "./sections";

// Yard Access Control / QRGOBox (feature 15): the real chain — the driver's QR,
// a gate terminal, eight checks, an MQTT open command, a one-second relay pulse.
//
// Section order is deliberate and specific to this page:
// flow first (the chain IS the story), then the hardware spec (the boring table
// is the differentiator here), then the IT objection, then a pilot callout. No
// problem/benefits: there is no adoption to quote and the hard material is strong.
// Server Component.
export function GateAccessShowcase({ t, locale }: { t: Translations; locale: Locale }) {
  const f = t.f15Page;
  return (
    <>
      <ShowcaseStage
        title={f.title}
        subtitle={f.subtitle}
        stepLabel={f.stepLabel}
        glowPrefix="ga15-"
        sceneStartsMs={[]}
        aspectClass="aspect-[4/3] sm:aspect-[16/10]"
        minHClass="min-h-[440px]"
        headingId="gate-access-showcase-title"
      >
        <GateAccessScene t={t} locale={locale} />
      </ShowcaseStage>

      <FeatureFlowSection
        idPrefix="ga15"
        title={f.flowTitle}
        subtitle={f.flowSub}
        steps={[
          { title: f.s1t, desc: f.s1d },
          { title: f.s2t, desc: f.s2d },
          { title: f.s3t, desc: f.s3d },
          { title: f.s4t, desc: f.s4d },
          { title: f.s5t, desc: f.s5d },
        ]}
        seo={{ locale, path: featureRel(locale, 15) }}
      />

      <FeatureSpecSection
        idPrefix="ga15"
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
        idPrefix="ga15"
        title={f.spTitle}
        body={f.spBody}
        side={f.spSide === "left" ? "left" : "right"}
        visual={<GateNetworkArt t={t} />}
        
      />

      <FeatureCalloutSection
        idPrefix="ga15"
        title={f.coTitle}
        body={f.coBody}
        kind={f.coKind === "roadmap" ? "roadmap" : f.coKind === "pilot" ? "pilot" : "note"}
      />

      <FeatureFAQSection
        idPrefix="ga15"
        title={f.faqTitle}
        items={[
          { q: f.q1, a: f.a1 },
          { q: f.q2, a: f.a2 },
          { q: f.q3, a: f.a3 },
          { q: f.q4, a: f.a4 },
        ]}
        locale={locale}
        path={featureRel(locale, 15)}
        tinted
      />
    </>
  );
}
