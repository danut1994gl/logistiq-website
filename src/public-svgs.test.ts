import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

// An SVG loaded through <img> is parsed as strict XML, so one malformed tag makes
// the browser draw the broken-image icon instead of the picture. Inline SVG in
// HTML forgives the same mistake, so nothing else catches it: the footer logo
// (banner-white.svg) shipped on 2026-01-31 with four duplicated fill-opacity
// attributes and never rendered until 2026-11-06.
const PUBLIC_DIR = fileURLToPath(new URL("../public", import.meta.url));

// Opening tags, with quoted values kept whole so a ">" inside one doesn't end the tag.
const TAG = /<[A-Za-z](?:"[^"]*"|'[^']*'|[^'">])*>/g;
const ATTRIBUTE_NAME = /\s([A-Za-z_:][-\w.:]*)\s*=/g;

function duplicatedAttributes(svg: string): string[] {
  const found: string[] = [];
  for (const tag of svg.match(TAG) ?? []) {
    const bare = tag.replace(/"[^"]*"|'[^']*'/g, '""');
    const names = [...bare.matchAll(ATTRIBUTE_NAME)].map((m) => m[1]);
    const repeated = [...new Set(names.filter((name, i) => names.indexOf(name) !== i))];
    if (repeated.length) found.push(`${repeated.join(", ")} repeated in ${tag.slice(0, 70)}…`);
  }
  return found;
}

describe("public SVGs", () => {
  const svgs = readdirSync(PUBLIC_DIR).filter((file) => file.endsWith(".svg"));

  it("finds the SVGs to check", () => {
    expect(svgs).toContain("banner-white.svg");
  });

  it.each(svgs)("%s repeats no attribute on any tag", (file) => {
    expect(duplicatedAttributes(readFileSync(join(PUBLIC_DIR, file), "utf8"))).toEqual([]);
  });

  it("the check itself catches a repeated attribute", () => {
    expect(duplicatedAttributes('<svg><path fill="#fff" fill-opacity="0.5" d="M0 0" fill-opacity="1"/></svg>')).toHaveLength(1);
    expect(duplicatedAttributes('<svg><path title="a > b" fill="#fff"/></svg>')).toEqual([]);
  });
});
