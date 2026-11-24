import { describe, it, expect } from "vitest";
import { renderToString } from "react-dom/server";
import { IntegrationsScene } from "@/components/features/IntegrationsScene";
import { GateAccessScene } from "@/components/features/GateAccessScene";
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

describe("QRGoBox scene (f15)", () => {
  // Until 2026-11-24 the scene's first frame, which the server renders and reduced motion
  // keeps, was ACCESS GRANTED with the barrier lifted, a ramp box on the terminal and the
  // driver's "Entry" row lit; its loop sent the command on, pulsed a relay and lifted the
  // barrier. Today a valid scan is answered 503 and logged as refused ("Gate did not
  // respond"): the scene stops at the validated check-in and marks the rest in progress.
  it.each(locales)("first draws a validated check-in at a closed barrier, the rest in progress, in %s", (locale) => {
    const f = translations[locale].f15Page;
    const html = renderToString(<GateAccessScene t={translations[locale]} locale={locale} />);
    expect(html).toContain(escape(f.uiValidated));
    expect(html).not.toContain(escape(f.uiDenied));
    expect(html).not.toMatch(/rotate\(/);
    expect(html).not.toContain("#7B1FA2"); // the purple ramp box of a granted answer
    expect(html).toContain(escape(f.uiRelay)); // "QRGoBox · in progress"
    const marks = html.split(escape(f.uiRelay)).join("").split(escape(f.uiInProgress)).length - 1;
    expect(marks).toBeGreaterThanOrEqual(2); // the timeline row and the barrier, besides the box
    expect(html).toContain(escape(f.uiTimeline));
  });
});
