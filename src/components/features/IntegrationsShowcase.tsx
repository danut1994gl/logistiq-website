import type { Translations } from "@/lib/i18n/translations";
import type { Locale } from "@/lib/i18n/config";
import { ShowcaseStage } from "./ShowcaseStage";
import { IntegrationsScene } from "./IntegrationsScene";
import { FeatureSpecSection } from "./sections";
import { ApiDeveloperSection, ApiUseCasesSection } from "./IntegrationsDeveloper";

// Systems Integrations & API (feature 16). The interconnection map does the explaining
// (an info button on each card says what it does); six use cases show what a warehouse
// builds with the Integration API (/api/v1), each opening its calls in the public
// documentation; a concise spec grounds it (address, keys, coverage, events); and the
// developer panel carries the Logistiq API lockup, the quick start and the documentation's
// pages (owner, 2026-11-28). No problem/schema/roadmap detail. `locale` picks the
// documentation's language (Romanian for ro, English otherwise).
export function IntegrationsShowcase({ t, locale }: { t: Translations; locale: Locale }) {
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

      <ApiUseCasesSection t={t} locale={locale} />

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

      <ApiDeveloperSection t={t} locale={locale} />
    </>
  );
}
