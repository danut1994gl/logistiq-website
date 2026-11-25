import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { renderToString } from "react-dom/server";
import { IntegrationsScene } from "@/components/features/IntegrationsScene";
import { GateAccessScene } from "@/components/features/GateAccessScene";
import { CheckinJourneyScene } from "@/components/features/CheckinJourneyScene";
import { MultiLanguageScene } from "@/components/features/MultiLanguageScene";
import { AccessControlScene } from "@/components/features/AccessControlScene";
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

describe("digital check-in journey scene", () => {
  // Step 3 says the scanner validates the check-in and opening the barrier on that scan is
  // in progress (checkinJourney.step3Desc). Until 2026-11-24 the scene's barrier lifted as
  // the truck left the scanner, and its base state, the reduced-motion frame, was lifted;
  // later that day it stayed down and the hero truck drove across it on its way to dock 12.
  // Scene 3 now draws no barrier: the scanner and the booth tell the story.
  const CSS = readFileSync(fileURLToPath(new URL("../../app/globals.css", import.meta.url)), "utf8");

  it("has no rule or animation for a barrier", () => {
    expect(CSS).not.toMatch(/\.cj2-barrier|@keyframes cj2-barrier/);
  });

  it("draws no barrier, post or arm, in scene 3", () => {
    const html = renderToString(<CheckinJourneyScene dockLabel="DOCK 12" scanLine1="Scan" scanLine2="to check in" />);
    expect(html).not.toContain('<g transform="translate(720 300)">'); // the arm
    expect(html).not.toContain('x="714"'); // its post
    expect(html).not.toMatch(/rotate\(/);
    expect(html).toContain('class="cj2-truck3"');
    expect(html).toContain('class="cj2-gatephone"'); // the scanner's tap stays
  });
});

describe("multi-language scene (f7)", () => {
  // The dashboard has the same twelve languages as the driver web. Until 2026-11-24 the
  // dispatcher panel drew a two-state RO/EN toggle, from when it had only those two.
  it.each(locales)("gives the dispatcher panel a Romanian chip among twelve, not an RO/EN toggle, in %s", (locale) => {
    const html = renderToString(<MultiLanguageScene t={translations[locale]} />);
    expect(html).toContain(">RO</span>");
    expect(html).toContain(">+11</span>");
    expect(html).not.toContain(">EN</span>");
  });
});

describe("access-control scene (f17)", () => {
  // The scene's three capability rows light up with the departments ticked. Until
  // 2026-11-24 they were labelled with unrelated strings: "Warehouse manager", "Office ·
  // department flag" and "One warehouse".
  it.each(locales)("labels its capability rows by what they unlock in %s", (locale) => {
    const f = translations[locale].f17Page;
    const html = renderToString(<AccessControlScene t={translations[locale]} locale={locale} />);
    for (const label of [f.mxCap4, f.uiBookings, f.uiGates]) {
      expect(html).toContain(`>${escape(label)}</span>`);
    }
    expect(html).not.toContain(`>${escape(f.mxRole1)}</span>`);
  });
});

describe("scene CSS", () => {
  // The white-label page's scene drew a QRGoBox gate call (a POST up the wire, the 200 down,
  // then "the barrier lifts") and a controller LED that "heartbeats to
  // /api/device/heartbeat", the old box design. The scene stopped drawing it, and until
  // 2026-11-25 its rules (.wl8-up, .wl8-down, .wl8-led) stayed in globals.css.
  const CSS = readFileSync(fileURLToPath(new URL("../../app/globals.css", import.meta.url)), "utf8");

  it("keeps no rule of the white-label scene's old gate call", () => {
    expect(CSS).not.toMatch(/\.wl8-|@keyframes wl8-|heartbeat/);
  });
});
