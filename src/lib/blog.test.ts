import { describe, it, expect } from "vitest";
import {
  blogIndexRel,
  blogIndexPath,
  postRel,
  postPath,
  categoryRel,
  categoryPath,
  sanitizeArticleHtml,
  slugify,
} from "@/lib/blog";

describe("blog path helpers", () => {
  it("builds shared /blog segment paths", () => {
    expect(blogIndexRel("ro")).toBe("/blog");
    expect(blogIndexPath("ro")).toBe("/ro/blog");
    expect(postRel("de", "digitaler-check-in")).toBe("/blog/digitaler-check-in");
    expect(postPath("de", "digitaler-check-in")).toBe("/de/blog/digitaler-check-in");
    expect(categoryRel("fr", "guides")).toBe("/blog/category/guides");
    expect(categoryPath("fr", "guides")).toBe("/fr/blog/category/guides");
  });
});

describe("slugify re-export", () => {
  it("reuses features.slugify (diacritics + Cyrillic)", () => {
    expect(slugify("Șase Camioane!")).toBe("sase-camioane");
    expect(slugify("Логистика")).toBe("logistika");
  });
});

describe("sanitizeArticleHtml", () => {
  it("keeps safe rich text", () => {
    const out = sanitizeArticleHtml('<p>Hi <a href="https://x.com">link</a> <strong>bold</strong></p>');
    expect(out).toContain("<strong>bold</strong>");
    expect(out).toContain('href="https://x.com"');
  });
  it("strips scripts and event handlers", () => {
    const out = sanitizeArticleHtml('<p onclick="x()">a</p><script>alert(1)</script>');
    expect(out).not.toContain("<script");
    expect(out).not.toContain("onclick");
  });
  it("drops javascript: and data: URLs and iframes", () => {
    expect(sanitizeArticleHtml('<a href="javascript:alert(1)">x</a>')).not.toContain("javascript:");
    expect(sanitizeArticleHtml('<img src="data:image/svg+xml,evil">')).not.toContain("data:");
    expect(sanitizeArticleHtml('<iframe src="https://evil"></iframe>')).not.toContain("<iframe");
  });
  it("returns empty string for nullish input", () => {
    expect(sanitizeArticleHtml(null)).toBe("");
    expect(sanitizeArticleHtml(undefined)).toBe("");
  });
  it("forces rel=noopener on links", () => {
    expect(sanitizeArticleHtml('<a href="https://x.com">x</a>')).toContain("noopener");
  });
});
