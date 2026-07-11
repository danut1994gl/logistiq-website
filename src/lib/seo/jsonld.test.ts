import { describe, it, expect } from "vitest";
import { articleSchema } from "@/lib/seo/jsonld";
import { SITE_URL } from "@/lib/seo/metadata";

describe("articleSchema", () => {
  const base = {
    locale: "ro" as const,
    url: `${SITE_URL}/ro/blog/ghid-check-in`,
    headline: "Ghid check-in",
    description: "Cum funcționează check-in-ul digital.",
    images: [`${SITE_URL.replace(/^https?:\/\//, "https://cdn.")}/cover.png`],
    datePublished: "2026-07-01T10:00:00.000Z",
    dateModified: "2026-07-05T12:00:00.000Z",
    authorName: "Ana Pop",
    section: "Ghiduri",
    keywords: ["logistica", "check-in"],
  };

  it("is a BlogPosting referencing the site organization + webpage", () => {
    const s = articleSchema(base);
    expect(s["@type"]).toBe("BlogPosting");
    expect((s.publisher as { "@id": string })["@id"]).toBe(`${SITE_URL}/#organization`);
    expect((s.isPartOf as { "@id": string })["@id"]).toBe(`${SITE_URL}/#website`);
    expect((s.mainEntityOfPage as { "@id": string })["@id"]).toBe(`${base.url}/#webpage`);
    expect(s.inLanguage).toBe("ro");
    expect(s.datePublished).toBe(base.datePublished);
    expect(s.dateModified).toBe(base.dateModified);
    expect((s.author as { name: string }).name).toBe("Ana Pop");
    expect(s.articleSection).toBe("Ghiduri");
    expect(s.image).toEqual(base.images);
  });

  it("falls back to the organization as author when no author name", () => {
    const s = articleSchema({ ...base, authorName: null });
    expect((s.author as { "@id": string })["@id"]).toBe(`${SITE_URL}/#organization`);
  });
});
