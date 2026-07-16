import { describe, it, expect, afterEach } from "vitest";
import { articleSchema, softwareApplicationSchema } from "@/lib/seo/jsonld";
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

  // ADR-005: prices must not leak into crawler-visible JSON-LD while self-serve is off.
  it("omits offers/AggregateOffer when self-serve is OFF", () => {
    delete process.env.NEXT_PUBLIC_SELF_SERVE_ENABLED;
    const s = softwareApplicationSchema("desc", ["feature"]);
    expect(s["@type"]).toBe("SoftwareApplication");
    expect(s.offers).toBeUndefined();
    expect(JSON.stringify(s)).not.toMatch(/AggregateOffer|priceCurrency|139|1590/);
  });

  it("restores offers/AggregateOffer when self-serve is ON", () => {
    process.env.NEXT_PUBLIC_SELF_SERVE_ENABLED = "true";
    const s = softwareApplicationSchema("desc", ["feature"]);
    const offers = s.offers as Record<string, unknown>;
    expect(offers["@type"]).toBe("AggregateOffer");
    expect(offers.priceCurrency).toBe("EUR");
    expect(offers.lowPrice).toBe("139");
    expect(offers.highPrice).toBe("1590");
  });
});
