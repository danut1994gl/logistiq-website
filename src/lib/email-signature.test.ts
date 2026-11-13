import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import nextConfig from "../../next.config";

// The owner's e-mail signature (scripts/email-signature/build.py). Sent e-mails load these
// images from https://logistiq.ro/email/signature/ for good, at the size the signature's HTML
// gives them (drawn at 3x). Moving, renaming or resizing one breaks every e-mail already
// sent; a changed image gets a new file name.
const DIR = new URL("../../public/email/signature/", import.meta.url);
const IMAGES: [string, number, number][] = [
  ["logistiq.png", 428, 102],
  ["qrgo-driver.png", 96, 96],
  ["divider.png", 6, 300],
];

function pngSize(file: string): [number, number] {
  const png = readFileSync(new URL(file, DIR));
  expect(png.subarray(1, 4).toString("ascii")).toBe("PNG");
  return [png.readUInt32BE(16), png.readUInt32BE(20)];
}

describe("e-mail signature", () => {
  it.each(IMAGES)("%s stays in place at %ix%i", (file, width, height) => {
    expect(pngSize(file)).toEqual([width, height]);
  });

  it("/email/signature leads to the page with a temporary redirect", async () => {
    const rules = await nextConfig.redirects!();
    expect(rules).toContainEqual({
      source: "/email/signature",
      destination: "/email/signature/index.html",
      permanent: false,
    });
  });

  it("the page stays out of search engines and its script stays whole", () => {
    const html = readFileSync(new URL("index.html", DIR), "utf8");
    expect(html).toContain('<meta name="robots" content="noindex, nofollow">');
    expect(html.match(/<\/script/gi)).toHaveLength(1);
    expect(html).not.toContain("<!--");
  });

  it("the Apple Mail copy carries its three images inline", () => {
    // Mail's signature editor loads nothing from the internet: linked images stay empty boxes.
    const html = readFileSync(new URL("index.html", DIR), "utf8");
    expect(html.match(/data:image\/png;base64,/g)).toHaveLength(3);
  });
});
