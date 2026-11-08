import { describe, it, expect, afterEach } from "vitest";
import { articleSchema, siteGraph, softwareApplicationSchema } from "@/lib/seo/jsonld";
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

describe("softwareApplicationSchema", () => {
  const orig = process.env.NEXT_PUBLIC_SELF_SERVE_ENABLED;
  afterEach(() => {
    process.env.NEXT_PUBLIC_SELF_SERVE_ENABLED = orig;
  });

  const PRICE = /offers|Offer|price|Price|EUR|139|500|800|1590/;

  // Logistiq publishes no prices (2026-11-08): the price is set by offer or contract.
  it("is a SoftwareApplication with no offers or prices, self-serve off", () => {
    delete process.env.NEXT_PUBLIC_SELF_SERVE_ENABLED;
    const s = softwareApplicationSchema("desc", ["feature"]);
    expect(s["@type"]).toBe("SoftwareApplication");
    expect(s.name).toBe("Logistiq");
    expect(s.offers).toBeUndefined();
    expect(JSON.stringify(s)).not.toMatch(PRICE);
  });

  it("states no prices with self-serve on either", () => {
    process.env.NEXT_PUBLIC_SELF_SERVE_ENABLED = "true";
    const s = softwareApplicationSchema("desc", ["feature"]);
    expect(s.offers).toBeUndefined();
    expect(JSON.stringify(s)).not.toMatch(PRICE);
  });

  it("the whole site graph carries no price", () => {
    process.env.NEXT_PUBLIC_SELF_SERVE_ENABLED = "true";
    expect(JSON.stringify(siteGraph("desc", ["feature"]))).not.toMatch(/Offer|price|EUR|1590/);
  });
});
