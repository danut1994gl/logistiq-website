import { describe, expect, it } from "vitest";
import { translations } from "@/lib/i18n/translations";
import { locales } from "@/lib/i18n/config";

// `type Translations = typeof translations.ro` makes TypeScript refuse a locale that lacks
// one of Romanian's keys, but not one that keeps a key Romanian dropped, nor an array of
// another length (2026-11-26, website round 8: several keys and lists change at once).
// So every locale has exactly Romanian's key paths, its arrays' lengths and each leaf's type.
function shape(value: unknown, path = ""): string[] {
  if (Array.isArray(value)) {
    return [`${path}[]#${value.length}`, ...value.flatMap((item, i) => shape(item, `${path}[${i}]`))];
  }
  if (value !== null && typeof value === "object") {
    return Object.entries(value as Record<string, unknown>).flatMap(([key, item]) =>
      shape(item, path ? `${path}.${key}` : key),
    );
  }
  return [`${path}:${typeof value}`];
}

describe("translations, structure", () => {
  const ro = shape(translations.ro).sort();

  it("has a Romanian block with keys", () => {
    expect(ro.length).toBeGreaterThan(1000);
  });

  it.each(locales.filter((l) => l !== "ro"))("%s has exactly the Romanian block's keys, list lengths and types", (locale) => {
    const own = shape(translations[locale]);
    const roSet = new Set(ro);
    const ownSet = new Set(own);
    expect(own.filter((p) => !roSet.has(p)), "not in ro").toEqual([]);
    expect(ro.filter((p) => !ownSet.has(p)), "missing").toEqual([]);
  });
});
