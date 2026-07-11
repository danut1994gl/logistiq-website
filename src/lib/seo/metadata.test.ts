import { describe, it, expect } from "vitest";
import { buildAlternatesFor, SITE_URL } from "@/lib/seo/metadata";

describe("buildAlternatesFor", () => {
  it("emits hreflang only for available locales + x-default", () => {
    const alt = buildAlternatesFor("ro", ["ro", "en"], (l) => `/${l}/blog/post-${l}`);
    expect(Object.keys(alt.languages).sort()).toEqual(["en", "ro", "x-default"]);
    expect(alt.languages.ro).toBe(`${SITE_URL}/ro/blog/post-ro`);
    expect(alt.languages.en).toBe(`${SITE_URL}/en/blog/post-en`);
    expect(alt.canonical).toBe(`${SITE_URL}/ro/blog/post-ro`);
  });

  it("x-default points at the default locale when available", () => {
    const alt = buildAlternatesFor("ro", ["ro", "en"], (l) => `/${l}/blog/x`);
    expect(alt.languages["x-default"]).toBe(`${SITE_URL}/en/blog/x`); // en = defaultLocale
  });

  it("x-default falls back to the first available when default is absent", () => {
    const alt = buildAlternatesFor("de", ["de", "ro"], (l) => `/${l}/blog/y`);
    expect(alt.languages["x-default"]).toBe(`${SITE_URL}/de/blog/y`);
    expect(alt.languages.en).toBeUndefined();
  });
});
