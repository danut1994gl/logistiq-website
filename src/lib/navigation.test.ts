import { describe, it, expect } from "vitest";
import { resourcesMenu, blogNavHref } from "@/lib/navigation";
import { translations } from "@/lib/i18n/translations";

describe("blog navigation", () => {
  it("blogNavHref resolves the shared /blog segment", () => {
    expect(blogNavHref("de")).toBe("/de/blog");
    expect(blogNavHref("ro")).toBe("/ro/blog");
  });

  it("resourcesMenu includes a blog item pointing at /{l}/blog", () => {
    const blog = resourcesMenu.find((m) => m.key === "blog");
    expect(blog, "blog menu item").toBeTruthy();
    expect(blog!.href("fr")).toBe("/fr/blog");
    expect(blog!.label(translations.ro)).toBe("Blog");
  });
});
