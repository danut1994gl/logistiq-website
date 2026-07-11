import { describe, it, expect } from "vitest";
import { translations } from "@/lib/i18n/translations";
import { locales } from "@/lib/i18n/config";

describe("blog translations parity", () => {
  const refKeys = Object.keys((translations.ro as Record<string, unknown>).blog ?? {}).sort();

  it("ro defines the blog namespace", () => {
    expect(refKeys.length).toBeGreaterThan(0);
  });

  for (const loc of locales) {
    it(`${loc} has a structurally identical blog object`, () => {
      const blog = (translations[loc] as Record<string, unknown>).blog as Record<string, unknown> | undefined;
      expect(blog, `${loc}.blog missing`).toBeTruthy();
      expect(Object.keys(blog!).sort()).toEqual(refKeys);
      for (const k of refKeys) {
        expect(typeof blog![k], `${loc}.blog.${k}`).toBe("string");
      }
    });
  }
});
