import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// globals.css is unlayered, and Tailwind v4 puts its utilities in @layer utilities,
// so a rule here beats any utility class whatever its specificity. Until 2026-11-08
// two such rules set opacity on img: `img[loading="lazy"]` stayed at 0 for good
// (nothing ever added the `.loaded` class that undid it), so every lazy image,
// next/image's default included, was invisible; and every other img was forced to
// 1, which silently ignored the footer logo's opacity-70.
const css = readFileSync(fileURLToPath(new URL("./globals.css", import.meta.url)), "utf8");

function imgOpacityRules(source: string): string[] {
  const bare = source.replace(/\/\*[\s\S]*?\*\//g, "");
  const found: string[] = [];
  for (const [, selector, body] of bare.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    if (/(^|[\s,>+~(])img(?![-\w])/.test(selector) && /(^|[;\s])opacity\s*:/.test(body)) {
      found.push(selector.trim());
    }
  }
  return found;
}

describe("globals.css", () => {
  it("sets no opacity on img, so lazy images show and opacity utilities apply", () => {
    expect(imgOpacityRules(css)).toEqual([]);
  });

  it("the check itself catches such a rule", () => {
    expect(imgOpacityRules('img[loading="lazy"] { opacity: 0; }')).toEqual(['img[loading="lazy"]']);
    expect(imgOpacityRules(".card img, a { opacity: 1 }")).toHaveLength(1);
    expect(imgOpacityRules("img { transition: opacity 0.3s ease; }")).toEqual([]);
    expect(imgOpacityRules(".img-frame { opacity: 0.5; }")).toEqual([]);
  });
});
