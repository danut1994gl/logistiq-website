import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { company } from "@/lib/company";

// The trade register number is the owner's (2026-11-26): J20/7592/5001. Until then
// company.ts, and so the footer of every page, said another number than the legal pages.
// The old number is built from its parts so this file does not contain it.
const OLD_NUMBER = ["J25", "759", "2025"].join("/");
const SRC = fileURLToPath(new URL("..", import.meta.url));

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? files(path) : [path];
  });
}

describe("company identity", () => {
  it("has the owner's trade register number", () => {
    expect(company.regCom).toBe("J20/7592/5001");
  });

  it("no file under src/ carries the old number", () => {
    const hits = files(SRC).filter((f) => readFileSync(f, "utf8").includes(OLD_NUMBER));
    expect(hits).toEqual([]);
  });
});
