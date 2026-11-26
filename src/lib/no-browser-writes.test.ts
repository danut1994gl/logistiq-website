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
const COOKIE_WRITE = /\.cookie\s*=|cookies\(\)\.set|\.cookies\.set\(/;

describe("browser writes", () => {
  it("the language menu's click is the only cookie writer; LegacyBrowserData only deletes", () => {
    const writes = sources(SRC).flatMap((f) =>
      readFileSync(f, "utf8")
        .split("\n")
        .filter((line) => COOKIE_WRITE.test(line))
        .map((line) => `${rel(f)}: ${line.trim()}`),
    );
    expect(writes).toEqual([
      "components/site/LegacyBrowserData.tsx: if (present.has(name)) jar.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax`;",
      "components/site/SiteHeader.tsx: document.cookie = localeCookie(site, loc);",
    ]);
  });

  // The cookie banner kept its answer in localStorage (logistiq_cookie_consent); since it
  // went (2026-11-26) no first-party code stores anything in the browser, and
  // LegacyBrowserData is the one file that touches localStorage, to remove that record.
  it("nothing stores data in the browser, and only LegacyBrowserData touches localStorage", () => {
    const files = sources(SRC);
    const stores = files.filter((f) => /(local|session)Storage\.setItem|indexedDB|caches\.open/.test(readFileSync(f, "utf8")));
    expect(stores.map(rel)).toEqual([]);
    const local = files.filter((f) => /localStorage|sessionStorage/.test(readFileSync(f, "utf8")));
    expect(local.map(rel)).toEqual(["components/site/LegacyBrowserData.tsx"]);
  });

  // The header read logistiq_authenticated until 2026-11-26 (SiteHeader.test.tsx). The only
  // code that reads the browser's cookies is LegacyBrowserData, to find what to delete.
  it("nothing reads logistiq_authenticated, and only LegacyBrowserData reads cookies", () => {
    const files = sources(SRC);
    expect(files.filter((f) => readFileSync(f, "utf8").includes("logistiq_authenticated")).map(rel)).toEqual([]);
    const readers = files.filter((f) => /document\.cookie(?!\s*=)|\.cookie\.split/.test(readFileSync(f, "utf8")));
    expect(readers.map(rel)).toEqual(["components/site/LegacyBrowserData.tsx"]);
  });
});
