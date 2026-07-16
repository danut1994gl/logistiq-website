import type { Translations } from "@/lib/i18n/translations";
import type { Locale } from "@/lib/i18n/config";
import { ShowcaseStage } from "./ShowcaseStage";
import { IntegrationsScene } from "./IntegrationsScene";
import { FeatureSpecSection } from "./sections";

// Systems Integrations & API (feature 16): kept lean and forward-looking. The hero
// carries the intro, the interconnection map does the explaining, and a single
// concise spec grounds it in the real keyed device API. No problem/schema/roadmap
// detail — the page is about the API + interconnection, nothing more.
// The `locale` prop is retained for the page contract even though no per-section
// JSON-LD is emitted here.
export function IntegrationsShowcase({ t, locale: _locale }: { t: Translations; locale: Locale }) {
  const f = t.f16Page;
  return (
    <>
      <ShowcaseStage
        title=""
        subtitle=""
        stepLabel={f.stepLabel}
        glowPrefix="in16-"
        sceneStartsMs={[]}
        aspectClass="aspect-[4/3] sm:aspect-[16/9]"
        minHClass="min-h-[440px]"
        headingId="integrations-showcase-title"
      >
        <IntegrationsScene t={t} />
      </ShowcaseStage>

      <FeatureSpecSection
        idPrefix="in16"
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
    </>
  );
}
