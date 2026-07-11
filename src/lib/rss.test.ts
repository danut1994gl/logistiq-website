import { describe, it, expect } from "vitest";
import { buildRssXml, escapeXml } from "@/lib/rss";

describe("escapeXml", () => {
  it("escapes XML-significant characters", () => {
    expect(escapeXml(`a & b < c > "d" 'e'`)).toBe("a &amp; b &lt; c &gt; &quot;d&quot; &apos;e&apos;");
  });
});

describe("buildRssXml", () => {
  const xml = buildRssXml({
    title: "Logistiq Blog",
    description: "News & guides",
    feedUrl: "https://logistiq.ro/rss.xml",
    siteUrl: "https://logistiq.ro",
    items: [
      {
        title: "Ghid <b>check-in</b>",
        link: "https://logistiq.ro/ro/blog/ghid-check-in",
        description: "Cum & de ce",
        pubDate: "2026-07-01T10:00:00.000Z",
        guid: "https://logistiq.ro/ro/blog/ghid-check-in",
      },
    ],
  });

  it("is a well-formed RSS 2.0 channel", () => {
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(xml).toContain('<rss version="2.0"');
    expect(xml).toContain("<channel>");
    expect(xml).toContain("<link>https://logistiq.ro</link>");
  });
  it("escapes item content and emits RFC-822 pubDate", () => {
    expect(xml).toContain("Ghid &lt;b&gt;check-in&lt;/b&gt;");
    expect(xml).toContain("Cum &amp; de ce");
    expect(xml).toContain("<pubDate>Wed, 01 Jul 2026 10:00:00 GMT</pubDate>");
    expect(xml).toContain("<guid isPermaLink=\"true\">https://logistiq.ro/ro/blog/ghid-check-in</guid>");
  });
});
