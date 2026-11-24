import { describe, it, expect } from "vitest";
import { renderToString } from "react-dom/server";
import { IntegrationsScene } from "@/components/features/IntegrationsScene";
import { translations } from "@/lib/i18n/translations";
import { locales } from "@/lib/i18n/config";

// The feature scenes draw only what works today. Opening the barrier on a valid scan, with
// QRGoBox, is in progress (owner, 2026-11-24; qrgobox-copy.test.ts), so no scene lifts a
// barrier as if it were live.

// React escapes text the same way in every scene; compare against the escaped label.
const escape = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;");

describe("integrations scene (f16)", () => {
  // Until 2026-11-24 the gate node, a barrier and a reader box, was labelled "Integration API"
  // in every language and its barrier was drawn lifted. The Integration API is the edge to the
  // warehouse's TMS, WMS and ERP on the right, which the API tag marks.
  it.each(locales)("labels the gate node as the gate scanner and draws its barrier down in %s", (locale) => {
    const f = translations[locale].f16Page;
    const html = renderToString(<IntegrationsScene t={translations[locale]} />);
    expect(html).toContain(`>${escape(f.uiGateScanner)}</text>`);
    expect(html).not.toMatch(/rotate\(/);
    expect(html).toContain(">API</text>");
  });
});
