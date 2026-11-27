import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { renderToString } from "react-dom/server";
import LegacyBrowserData, { clearLegacyBrowserData, LEGACY_STORAGE_KEY } from "@/components/site/LegacyBrowserData";

// A fake document.cookie: reading gives "a=1; b=2", each write is recorded.
function jar(initial: string) {
  const writes: string[] = [];
  return {
    writes,
    get cookie() {
      return initial;
    },
    set cookie(value: string) {
      writes.push(value);
    },
  };
}
function store(items: Record<string, string>) {
  return {
    items,
    getItem: (k: string) => (k in items ? items[k] : null),
    removeItem: (k: string) => void delete items[k],
  };
}

describe("LegacyBrowserData", () => {
  it("removes the old banner record and nothing else from storage", () => {
    const s = store({ [LEGACY_STORAGE_KEY]: '{"essential":true}', other: "x" });
    clearLegacyBrowserData(jar(""), s);
    expect(s.items).toEqual({ other: "x" });
  });

  it("deletes the old language cookies a browser still holds, and only those", () => {
    const j = jar("NEXT_LOCALE=ro; LOGISTIQ_LANG=de; NEXT_LOCALE_BE=nl");
    clearLegacyBrowserData(j, store({}));
    expect(j.writes).toEqual([
      "NEXT_LOCALE=; Path=/; Max-Age=0; SameSite=Lax",
      "NEXT_LOCALE_BE=; Path=/; Max-Age=0; SameSite=Lax",
    ]);
  });

  // The dashboard's old sign-in marker was written for Domain=.logistiq.ro: it is deleted with
  // that Domain, and only on a logistiq.ro host (another host may not write that Domain).
  it("deletes logistiq_authenticated with its Domain, on logistiq.ro hosts only", () => {
    for (const host of ["logistiq.ro", "www.logistiq.ro"]) {
      const j = jar("logistiq_authenticated=true; LOGISTIQ_LANG=de");
      clearLegacyBrowserData(j, store({}), host);
      expect(j.writes, host).toEqual(["logistiq_authenticated=; Domain=.logistiq.ro; Path=/; Max-Age=0; SameSite=Lax"]);
    }
    for (const host of ["logistiq.be", "localhost", "notlogistiq.ro", ""]) {
      const j = jar("logistiq_authenticated=true");
      clearLegacyBrowserData(j, store({}), host);
      expect(j.writes, host).toEqual([]);
    }
    const none = jar("LOGISTIQ_LANG=de");
    clearLegacyBrowserData(none, store({}), "logistiq.ro");
    expect(none.writes).toEqual([]);
  });

  it("writes nothing when there is nothing old", () => {
    const j = jar("LOGISTIQ_LANG=de");
    const s = store({});
    const removeItem = s.removeItem;
    let removed = 0;
    s.removeItem = (k) => (removed++, removeItem(k));
    clearLegacyBrowserData(j, s);
    expect(j.writes).toEqual([]);
    expect(removed).toBe(0);
  });

  it("swallows blocked storage and blocked cookies", () => {
    const throwing = {
      getItem: () => {
        throw new Error("blocked");
      },
      removeItem: () => {
        throw new Error("blocked");
      },
    };
    const blockedJar = {
      get cookie(): string {
        throw new Error("blocked");
      },
      set cookie(_v: string) {
        throw new Error("blocked");
      },
    };
    expect(() => clearLegacyBrowserData(blockedJar, throwing)).not.toThrow();
    expect(() => clearLegacyBrowserData(jar(""), null)).not.toThrow();
  });

  it("renders nothing, and the locale layout mounts it on every page", () => {
    expect(renderToString(<LegacyBrowserData />)).toBe("");
    const layout = readFileSync(fileURLToPath(new URL("../../app/[locale]/layout.tsx", import.meta.url)), "utf8");
    expect(layout).toContain("<LegacyBrowserData />");
  });
});
