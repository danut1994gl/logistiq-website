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

describe("Integration API copy", () => {
  it("the integrations page and the FAQ name the API's address in every language", () => {
    for (const [locale, copy] of Object.entries(translations)) {
      for (const text of [copy.f16Page.subtitle, copy.f16Page.coBody, copy.f16Page.a1, copy.f16Page.v1, copy.faq.a12]) {
        expect(text, locale).toContain(ADDRESS);
      }
    }
  });

  it("the integrations page no longer calls the API roadmap", () => {
    for (const [locale, copy] of Object.entries(translations)) {
      expect(copy.f16Page.coKind, locale).not.toBe("roadmap");
    }
  });

  it("the FAQ ties the API to no plan", () => {
    for (const [locale, copy] of Object.entries(translations)) {
      expect(copy.faq.a12, locale).not.toMatch(/Enterprise|Professional/);
    }
  });

  it("the integrations page lists no gate device endpoint", () => {
    for (const [locale, copy] of Object.entries(translations)) {
      expect(JSON.stringify(copy.f16Page), locale).not.toMatch(/\/api\/device|\/api\/gate/);
    }
  });
});
