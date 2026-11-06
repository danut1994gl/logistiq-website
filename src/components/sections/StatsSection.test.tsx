import { describe, it, expect, vi, afterEach } from "vitest";
import { renderToString } from "react-dom/server";
import { StatsSection } from "@/components/sections/StatsSection";
import { translations } from "@/lib/i18n/translations";

// The home page is prerendered once, at build time, but the stats are seeded by
// the visitor's date. So the HTML this section renders on the server must not
// depend on the date: whenever the build day and the visit day disagree, React
// throws the whole server-rendered page away and paints it again on the client
// (error #418) — the "logistiq.ro loads twice" of 2026-11-06, when the page was
// built on a 12% day and visited on an 11% day.
afterEach(() => {
  vi.useRealTimers();
});

function renderOn(day: string): string {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date(`${day}T12:00:00Z`));
  return renderToString(<StatsSection t={translations.en} />);
}

describe("StatsSection server render", () => {
  it("is the same on the day it was built and on the day it is visited", () => {
    expect(renderOn("2026-11-06")).toBe(renderOn("2026-10-24"));
  });

  it("is the same on every day of a quarter", () => {
    const first = renderOn("2026-10-01");
    for (let day = 1; day < 92; day++) {
      const date = new Date(Date.UTC(2026, 9, 1 + day)).toISOString().slice(0, 10);
      expect(renderOn(date), date).toBe(first);
    }
  });
});
