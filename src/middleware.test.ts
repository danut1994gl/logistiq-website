import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { middleware } from "@/middleware";
import { siteForHost } from "@/lib/i18n/sites";

const BE_COOKIE = siteForHost("logistiq.be").cookie;
const RO_COOKIE = siteForHost("logistiq.ro").cookie;

function visit(url: string, cookies: Record<string, string> = {}) {
  const cookie = Object.entries(cookies)
    .map(([name, value]) => `${name}=${value}`)
    .join("; ");
  return middleware(new NextRequest(url, { headers: cookie ? { cookie } : {} }));
}

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

describe("middleware on logistiq.ro (unchanged)", () => {
  it("lands a new visitor on English", () => {
    expect(redirectedTo(visit("https://logistiq.ro/"))).toBe("/en");
  });

  it("returns a visitor to the language they chose", () => {
    expect(redirectedTo(visit("https://logistiq.ro/", { [RO_COOKIE]: "ro" }))).toBe("/ro");
  });

  it("serves all eight languages", () => {
    for (const loc of ["ro", "en", "de", "pl", "hu", "bg", "fr", "nl"]) {
      expect(visit(`https://logistiq.ro/${loc}`).headers.get("location"), loc).toBeNull();
    }
  });
});
