import { describe, it, expect } from "vitest";
import { resourcesMenu, blogNavHref } from "@/lib/navigation";

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
