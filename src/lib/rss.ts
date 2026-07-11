export function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export type RssItem = {
  title: string;
  link: string;
  description: string;
  pubDate: string; // ISO
  guid: string;
};

export function buildRssXml(opts: {
  title: string;
  description: string;
  feedUrl: string;
  siteUrl: string;
  items: RssItem[];
}): string {
  const items = opts.items
    .map((it) =>
      [
        "    <item>",
        `      <title>${escapeXml(it.title)}</title>`,
        `      <link>${escapeXml(it.link)}</link>`,
        `      <description>${escapeXml(it.description)}</description>`,
        `      <pubDate>${new Date(it.pubDate).toUTCString()}</pubDate>`,
        `      <guid isPermaLink="true">${escapeXml(it.guid)}</guid>`,
        "    </item>",
      ].join("\n")
    )
    .join("\n");

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    "  <channel>",
    `    <title>${escapeXml(opts.title)}</title>`,
    `    <link>${escapeXml(opts.siteUrl)}</link>`,
    `    <description>${escapeXml(opts.description)}</description>`,
    `    <atom:link href="${escapeXml(opts.feedUrl)}" rel="self" type="application/rss+xml" />`,
    items,
    "  </channel>",
    "</rss>",
    "",
  ].join("\n");
}
