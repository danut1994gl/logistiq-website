import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { translations } from "@/lib/i18n/translations";

// The driver brand is written QRGo (QRGo Driver, QRGo Self, QRGoBox), never in capitals
// (owner, 2026-11-09). Until then 400 strings in translations.ts and the text drawn inside
// the feature scenes used the capitalised form. The logo artwork (public/qrgo.svg,
// public/og-image.png) is outlines and pixels, not text, so this test cannot see it.
// QRGODriverSection is a component name, not copy.
const CAPS = /QRGO(?!DriverSection)/;

const SRC = fileURLToPath(new URL("..", import.meta.url));

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    return /\.(tsx?|css)$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name) ? [path] : [];
  });
}

describe("brand casing", () => {
  it("no language's copy writes the brand in capitals", () => {
    for (const [locale, copy] of Object.entries(translations)) {
      expect(JSON.stringify(copy).match(CAPS)?.[0], locale).toBeUndefined();
    }
  });

  it("no source file under src/ writes the brand in capitals", () => {
    const offenders = sourceFiles(SRC).filter((file) => CAPS.test(readFileSync(file, "utf8")));
    expect(offenders).toEqual([]);
  });
});
