import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { middleware, config } from "@/middleware";
import { siteForHost } from "@/lib/i18n/sites";

const BE_COOKIE = siteForHost("logistiq.be").cookie;
const RO_COOKIE = siteForHost("logistiq.ro").cookie;

function visit(url: string, cookies: Record<string, string> = {}, headers: Record<string, string> = {}) {
  const cookie = Object.entries(cookies)
    .map(([name, value]) => `${name}=${value}`)
    .join("; ");
  return middleware(new NextRequest(url, { headers: cookie ? { ...headers, cookie } : headers }));
}

const ONE_YEAR = 60 * 60 * 24 * 365;

const redirectedTo = (res: Response) => {
  const location = res.headers.get("location");
  return location ? new URL(location).pathname + new URL(location).search : null;
};

describe("middleware on logistiq.be", () => {
  it("lands a new visitor on Dutch", () => {
    const res = visit("https://logistiq.be/");
    expect(res.status).toBe(307);
    expect(redirectedTo(res)).toBe("/nl");
  });

  it("www.logistiq.be lands on Dutch too", () => {
    expect(redirectedTo(visit("https://www.logistiq.be/"))).toBe("/nl");
  });

  it("returns a visitor to the French or English they chose on logistiq.be", () => {
    expect(redirectedTo(visit("https://logistiq.be/", { [BE_COOKIE]: "fr" }))).toBe("/fr");
    expect(redirectedTo(visit("https://logistiq.be/", { [BE_COOKIE]: "en" }))).toBe("/en");
  });

  it("ignores the English that logistiq.be set for every visitor before it had a language set", () => {
    expect(redirectedTo(visit("https://logistiq.be/", { [RO_COOKIE]: "en" }))).toBe("/nl");
  });

  it("never lands on a language logistiq.be doesn't serve, whatever the cookie says", () => {
    expect(redirectedTo(visit("https://logistiq.be/", { [BE_COOKIE]: "de" }))).toBe("/nl");
  });

  it("serves Dutch, French and English pages and remembers the choice", () => {
    for (const path of ["/nl", "/fr/contact", "/en/blog"]) {
      const res = visit(`https://logistiq.be${path}`);
      expect(res.headers.get("location"), path).toBeNull();
      expect(res.headers.get("x-middleware-next"), path).toBe("1");
    }
    expect(visit("https://logistiq.be/fr/contact").cookies.get(BE_COOKIE)?.value).toBe("fr");
  });

  it("moves the other languages' pages to Dutch, keeping the page where it can", () => {
    expect(redirectedTo(visit("https://logistiq.be/ro"))).toBe("/nl");
    expect(redirectedTo(visit("https://logistiq.be/de/contact"))).toBe("/nl/contact");
    expect(redirectedTo(visit("https://logistiq.be/pl/funkcje/odprawa?x=1"))).toBe("/nl/functies?x=1");
    expect(visit("https://logistiq.be/de").cookies.get(BE_COOKIE)).toBeUndefined();
  });

  it("puts a path without a language under the visitor's language", () => {
    expect(redirectedTo(visit("https://logistiq.be/contact"))).toBe("/nl/contact");
  });
});

describe("middleware on logistiq.ro", () => {
  it("opens a first visit in Romanian", () => {
    const res = visit("https://logistiq.ro/");
    expect(res.status).toBe(307);
    expect(redirectedTo(res)).toBe("/ro");
  });

  it("opens in Romanian on every host but logistiq.be: www, previews, localhost", () => {
    for (const origin of ["https://www.logistiq.ro", "https://logistiq-website.vercel.app", "http://localhost:3000"]) {
      expect(redirectedTo(visit(`${origin}/`)), origin).toBe("/ro");
    }
  });

  it("does not save the default as if the visitor had chosen it", () => {
    expect(visit("https://logistiq.ro/").cookies.get(RO_COOKIE)).toBeUndefined();
  });

  it("returns a visitor to the language they saved, English included", () => {
    expect(redirectedTo(visit("https://logistiq.ro/", { [RO_COOKIE]: "de" }))).toBe("/de");
    expect(redirectedTo(visit("https://logistiq.ro/", { [RO_COOKIE]: "en" }))).toBe("/en");
    expect(redirectedTo(visit("https://logistiq.ro/", { [RO_COOKIE]: "ro" }))).toBe("/ro");
  });

  it("never overwrites a saved language with the default on a later bare visit", () => {
    const cookie = visit("https://logistiq.ro/", { [RO_COOKIE]: "de" }).cookies.get(RO_COOKIE);
    expect(cookie?.value).toBe("de");
    expect(cookie?.maxAge).toBe(ONE_YEAR);
  });

  it("ignores a cookie that holds no language", () => {
    expect(redirectedTo(visit("https://logistiq.ro/", { [RO_COOKIE]: "xx" }))).toBe("/ro");
  });

  it("ignores logistiq.be's cookie", () => {
    expect(redirectedTo(visit("https://logistiq.ro/", { [BE_COOKIE]: "fr" }))).toBe("/ro");
  });

  it("puts a path without a language under the saved language, else Romanian", () => {
    expect(redirectedTo(visit("https://logistiq.ro/contact"))).toBe("/ro/contact");
    expect(redirectedTo(visit("https://logistiq.ro/contact?x=1", { [RO_COOKIE]: "fr" }))).toBe("/fr/contact?x=1");
  });

  it("saves the language of a visited page for a year", () => {
    const res = visit("https://logistiq.ro/fr/contact");
    expect(res.headers.get("location")).toBeNull();
    const cookie = res.cookies.get(RO_COOKIE);
    expect(cookie?.value).toBe("fr");
    expect(cookie?.maxAge).toBe(ONE_YEAR);
    expect(cookie?.path).toBe("/");
  });

  it("a visited page replaces the saved language (the language switcher)", () => {
    expect(visit("https://logistiq.ro/pl", { [RO_COOKIE]: "de" }).cookies.get(RO_COOKIE)?.value).toBe("pl");
  });

  it("a prefetch serves the page but saves nothing (opening the language menu is not a choice)", () => {
    const prefetches: Record<string, string>[] = [
      { "next-router-prefetch": "1", rsc: "1" },
      { "next-router-segment-prefetch": "/_tree", "next-router-prefetch": "1", rsc: "1" },
      { "sec-purpose": "prefetch" },
      { purpose: "prefetch" },
    ];
    for (const headers of prefetches) {
      const res = visit("https://logistiq.ro/nl", { [RO_COOKIE]: "de" }, headers);
      expect(res.headers.get("x-middleware-next"), JSON.stringify(headers)).toBe("1");
      expect(res.cookies.get(RO_COOKIE), JSON.stringify(headers)).toBeUndefined();
    }
    // A real client-side navigation (RSC request, no prefetch header) is a choice.
    expect(visit("https://logistiq.ro/nl", { [RO_COOKIE]: "de" }, { rsc: "1" }).cookies.get(RO_COOKIE)?.value).toBe("nl");
  });

  it("serves all eight languages", () => {
    for (const loc of ["ro", "en", "de", "pl", "hu", "bg", "fr", "nl"]) {
      expect(visit(`https://logistiq.ro/${loc}`).headers.get("location"), loc).toBeNull();
    }
  });

  it("leaves Vercel BotID's challenge and proxy paths alone", () => {
    for (const path of [
      "/149e9513-01fa-4fb0-aad4-566afd725d1b/2d206a39-8ed7-437e-a3be-862e0f06eea3/a-4-a/c.js",
      "/149e9513-01fa-4fb0-aad4-566afd725d1b/2d206a39-8ed7-437e-a3be-862e0f06eea3/tl",
    ]) {
      const res = visit(`https://logistiq.ro${path}`);
      expect(res.headers.get("location"), path).toBeNull();
      expect(res.headers.get("x-middleware-next"), path).toBe("1");
      expect(res.cookies.get(RO_COOKIE), path).toBeUndefined();
    }
  });
});

describe("middleware matcher", () => {
  const [matcher] = config.matcher;
  // Next compiles `config.matcher` itself; this mirrors its negative lookahead so a
  // path the middleware must skip (BotID, files, API) can't silently be redirected.
  const pattern = new RegExp(`^${matcher.source}$`);

  it("never runs for a router prefetch, so opening the language menu saves nothing", () => {
    // Next strips its router headers before the middleware runs: only the matcher
    // can tell a prefetch from a visit (verified against `next start`, 2026-11-08).
    expect(matcher.missing).toContainEqual({ type: "header", key: "next-router-prefetch" });
    expect(matcher.missing).toContainEqual({ type: "header", key: "purpose", value: "prefetch" });
  });

  it("runs for pages, with or without a language", () => {
    for (const path of ["/", "/ro", "/contact", "/de/funktionen/digitaler-check-in"]) {
      expect(pattern.test(path), path).toBe(true);
    }
  });

  it("skips API routes, files and BotID's paths", () => {
    for (const path of [
      "/api/contact",
      "/_next/static/chunk.js",
      "/favicon.ico",
      "/llms.txt",
      "/149e9513-01fa-4fb0-aad4-566afd725d1b/2d206a39-8ed7-437e-a3be-862e0f06eea3/tl",
    ]) {
      expect(pattern.test(path), path).toBe(false);
    }
  });
});
