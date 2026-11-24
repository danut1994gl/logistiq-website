import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

// splitArt.tsx holds the second illustrations of the feature pages' split sections. Until
// 2026-11-24 it also kept SchemaArt (f16), which no page rendered, and GateNetworkArt
// (f15), the network diagram of the redesigned QRGoBox: art that no page shows only keeps
// stale copy alive in the translations it reads.
const FEATURES = fileURLToPath(new URL(".", import.meta.url));
const SPLIT_ART = join(FEATURES, "splitArt.tsx");
const SRC = fileURLToPath(new URL("../..", import.meta.url));

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    return /\.tsx?$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name) && path !== SPLIT_ART ? [path] : [];
  });
}

describe("splitArt", () => {
  it("exports only illustrations some page imports", () => {
    const exported = [...readFileSync(SPLIT_ART, "utf8").matchAll(/^export function (\w+)/gm)].map((m) => m[1]);
    expect(exported.length).toBeGreaterThan(0);
    const sources = sourceFiles(SRC).map((file) => readFileSync(file, "utf8"));
    for (const name of exported) {
      expect(sources.some((text) => new RegExp(`import \\{[^}]*\\b${name}\\b[^}]*\\} from "\\./splitArt"`).test(text)), name).toBe(true);
    }
  });
});
