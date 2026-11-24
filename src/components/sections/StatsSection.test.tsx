import { describe, it, expect, vi, afterEach } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { renderToString } from "react-dom/server";
import { StatsSection, type StatsFigures } from "@/components/sections/StatsSection";
import { translations } from "@/lib/i18n/translations";

// A prerendered page is built on one day and visited on others, so the HTML this section
// renders on the server must not depend on the date: whenever the build day and the visit
// day disagree, React throws the whole server-rendered page away and paints it again on the
// client (error #418), the "logistiq.ro loads twice" of 2026-11-06, when the figures were
// seeded by the date and the page was built on a 12% day and visited on an 11% day.
// Since 2026-11-24 the section draws only the figures it is given (it generated them from
// the date until then, and no page renders it while Logistiq has none to show).
const FIGURES: StatsFigures = { drivers: 120, warehouses: 3, checkinsPerMonth: 4500, waitReductionPercent: 9 };
const SOURCE = fileURLToPath(new URL("./StatsSection.tsx", import.meta.url));

afterEach(() => {
  vi.useRealTimers();
});

function renderOn(day: string): string {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date(`${day}T12:00:00Z`));
  return renderToString(<StatsSection t={translations.en} figures={FIGURES} />);
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

  it("generates no figure: it reads no date, no random number and no seed", () => {
    const code = readFileSync(SOURCE, "utf8").replace(/^\s*\/\/.*$/gm, "");
    expect(code).not.toMatch(/new Date|Date\.now|Math\.random|seededRandom|getPlatformStats/);
  });
});
