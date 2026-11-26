import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

// logistiq.ro stores nothing in a visitor's browser unless the visitor picks a language
// (owner, 2026-11-26, D2: no cookie banner, because a visit sets no cookie). The cookie
// policy says exactly this. So first-party code writes a cookie in one place only: the
// language menu's click (SiteHeader, localeCookie). A new writer must come with the
// cookie policy's row and the owner's word on consent.
const SRC = fileURLToPath(new URL("..", import.meta.url));

function sources(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return name === "testing" ? [] : sources(path);
    return /\.(ts|tsx)$/.test(name) && !/\.test\.tsx?$/.test(name) ? [path] : [];
  });
}

const rel = (f: string) => f.slice(SRC.length);
const COOKIE_WRITE = /document\.cookie\s*=|cookies\(\)\.set|\.cookies\.set\(/;

describe("browser writes", () => {
  it("the language menu's click is the only cookie writer", () => {
    const writes = sources(SRC).flatMap((f) =>
      readFileSync(f, "utf8")
        .split("\n")
        .filter((line) => COOKIE_WRITE.test(line))
        .map((line) => `${rel(f)}: ${line.trim()}`),
    );
    expect(writes).toEqual(["components/site/SiteHeader.tsx: document.cookie = localeCookie(site, loc);"]);
  });
});
