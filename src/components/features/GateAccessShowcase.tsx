import type { Translations } from "@/lib/i18n/translations";
import type { Locale } from "@/lib/i18n/config";
import { featureRel } from "@/lib/features";
import { ShowcaseStage } from "./ShowcaseStage";
import { GateAccessScene } from "./GateAccessScene";
import { FeatureFAQSection } from "./FeatureFAQSection";
import { FeatureFlowSection, FeatureSpecSection, FeatureCalloutSection } from "./sections";

// Yard Access Control / QRGoBox (feature 15): in progress (owner, 2026-11-24; the client deck
// says „În lucru” / "In progress"). Built today: the driver's QR, the gate scanner device and
// the platform's check of the check-in, with every scan in the gate log. In progress: the
// command to the barrier, which will go out only over a secure (TLS) connection, and QRGoBox
// itself, whose hardware and software are in beta. Until then every valid scan answers 503.
//
// Section order: the flow first (built steps, then the two in progress), what QRGoBox will
// be, the in-progress callout, the FAQ. The network diagram of the old box design (outbound
// MQTT, a 30 s heartbeat, a LAN admin page as fallback) is gone with that design.
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
        ]}
        tinted
      />

      <FeatureCalloutSection
        idPrefix="ga15"
        title={f.coTitle}
        body={f.coBody}
        kind={f.coKind === "roadmap" ? "roadmap" : f.coKind === "pilot" ? "pilot" : "note"}
        labels={t.features.callout}
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
