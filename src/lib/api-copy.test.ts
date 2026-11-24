import { describe, it, expect } from "vitest";
import { translations } from "@/lib/i18n/translations";

// Logistiq has a self-serve REST Integration API at api.logistiq.cloud/v1 (also
// logistiq.cloud/api/v1), documented in the dashboard's API section (Logistiq
// documentation/api/README.md). Until 2026-11-24, in all 8 languages, the integrations page
// (f16Page) said "there is no /api/v1 today" and called the TMS, WMS and ERP API roadmap.
// Its spec table listed the QRGo Box gate device API, which is being redesigned along with
// QRGo Box. The FAQ said the API was "available for Enterprise plans", while keys go by
// role: professional and warehouse_manager accounts can create them too.
const ADDRESS = "api.logistiq.cloud/v1";

// What the integrations page renders: IntegrationsShowcase's stage and spec table, and the
// labels of IntegrationsScene. Since 2026-11-24 f16Page holds nothing else: its problem
// text, callout and FAQ were rendered nowhere, yet shipped in every page's RSC payload.
const F16_RENDERED = [
  "stepLabel", "specTitle", "specSub", "k1", "v1", "k2", "v2", "k3", "v3", "k4", "v4",
  "uiDeviceApi", "uiCarrier", "uiRealtime", "uiTms", "uiWms", "uiErp",
];

describe("Integration API copy", () => {
  it("the integrations page's spec and the FAQ name the API's address in every language", () => {
    for (const [locale, copy] of Object.entries(translations)) {
      for (const text of [copy.f16Page.v1, copy.faq.a12]) {
        expect(text, locale).toContain(ADDRESS);
      }
    }
  });

  it("the integrations page carries only the copy it renders", () => {
    for (const [locale, copy] of Object.entries(translations)) {
      expect(Object.keys(copy.f16Page).sort(), locale).toEqual([...F16_RENDERED].sort());
    }
  });

  it("the FAQ ties the API to no plan", () => {
    for (const [locale, copy] of Object.entries(translations)) {
      expect(copy.faq.a12, locale).not.toMatch(/Enterprise|Professional/);
    }
  });

  // The plans are Professional (one warehouse) and Enterprise 5, 10 and 25 (Logistiq
  // apps/dashboard/lib/stripe.ts, the terms' article 6). Until 2026-11-24 the cloud page's
  // FAQ named a "Warehouse Manager" plan, which is a role, not a plan.
  it("the cloud page names the real plans", () => {
    for (const [locale, copy] of Object.entries(translations)) {
      expect(copy.f9Page.a4, locale).toMatch(/Professional/);
      expect(copy.f9Page.a4, locale).toMatch(/Enterprise 5/);
      expect(copy.f9Page.a4, locale).not.toMatch(/Warehouse Manager|Складов мениджър/);
    }
  });

  it("the integrations page lists no gate device endpoint", () => {
    for (const [locale, copy] of Object.entries(translations)) {
      expect(JSON.stringify(copy.f16Page), locale).not.toMatch(/\/api\/device|\/api\/gate/);
    }
  });
});
