import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resourcesMenu, blogNavHref, groupSites } from "@/lib/navigation";
import { locales } from "@/lib/i18n/config";

describe("blog navigation", () => {
  it("blogNavHref resolves the shared /blog segment", () => {
    expect(blogNavHref("de")).toBe("/de/blog");
    expect(blogNavHref("ro")).toBe("/ro/blog");
  });

  it("blog is a top-level nav item — not in the Resources menu", () => {
    expect(resourcesMenu.find((m) => m.key === "blog")).toBeUndefined();
    expect(blogNavHref("fr")).toBe("/fr/blog");
  });
});

describe("footer group sites", () => {
  const site = (key: string) => groupSites.find((s) => s.key === key)!;

  it("lists the group's sites in order", () => {
    expect(groupSites.map((s) => s.name)).toEqual(["Logistiq.ro", "Logistiq.be", "Logistiq.cloud", "QRGo"]);
  });

  it("logistiq.ro keeps the visitor's language", () => {
    for (const l of locales) expect(site("logistiq-ro").href(l)).toBe(`https://logistiq.ro/${l}`);
  });

  it("logistiq.be keeps nl/fr/en and sends other languages to its default page", () => {
    expect(site("logistiq-be").href("nl")).toBe("https://logistiq.be/nl");
    expect(site("logistiq-be").href("fr")).toBe("https://logistiq.be/fr");
    expect(site("logistiq-be").href("en")).toBe("https://logistiq.be/en");
    expect(site("logistiq-be").href("ro")).toBe("https://logistiq.be/");
    expect(site("logistiq-be").href("de")).toBe("https://logistiq.be/");
  });

  it("the app and QRGo link to their home pages", () => {
    expect(site("logistiq-cloud").href("de")).toBe("https://logistiq.cloud/");
    expect(site("qrgo").href("bg")).toBe("https://qrgo.ro/");
  });

  // The footer reserves width x height before the SVG loads; a size that disagrees
  // with the file's viewBox would squash the logo once it arrives.
  it.each(groupSites.map((s) => [s.logo.src, s.logo] as const))("%s exists and its size matches its viewBox", (src, logo) => {
    const svg = readFileSync(fileURLToPath(new URL(`../../public${src}`, import.meta.url)), "utf8");
    const [, , w, h] = svg.match(/viewBox="([^"]+)"/)![1].split(" ").map(Number);
    expect(Math.abs(logo.width - (logo.height * w) / h)).toBeLessThan(1);
  });
});
