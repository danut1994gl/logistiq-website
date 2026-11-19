import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

// The contact form's lead row is written only through submit_website_lead, a database function that refuses
// unless it is given the key only this site's server holds (CONTACT_LEAD_KEY; the database keeps its SHA-256 alone,
// monorepo migration 330). Until then the route inserted the row into the leads table with the anon key, which
// anyone holding that public key could do too, past every anti-spam layer. Nothing real is reached: the Supabase
// client is mocked, and its from() throws, because a lead never goes through it.
const rpc = vi.fn();
const from = vi.fn((..._args: unknown[]): never => {
  throw new Error("a lead is written through submit_website_lead, never from()");
});
const readClient = vi.fn(() => ({ rpc: (...a: unknown[]) => rpc(...a), from: (...a: unknown[]) => from(...a) }));
vi.mock("@/lib/supabase", () => ({ createReadClient: () => readClient() }));

import { storeLead, type Lead } from "@/lib/contact/lead";

// A made-up key for these tests; the real one exists only on the site's Vercel project.
const KEY = "lead-test-key-0123456789abcdef0123456789abcdef";
const lead: Lead = {
  name: "Ion Popescu",
  email: "ion@firma.ro",
  phone: "+40 771 570 577",
  company: "Transport SRL",
  message: "Avem 3 depozite și vrem o ofertă.",
};

beforeEach(() => {
  rpc.mockReset().mockResolvedValue({ data: null, error: null });
  from.mockClear();
  readClient.mockClear();
  vi.stubEnv("CONTACT_LEAD_KEY", KEY);
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("storeLead", () => {
  it("calls submit_website_lead once, with the key and the six parameters, and never from()", async () => {
    await expect(storeLead(lead)).resolves.toEqual({ error: null });
    expect(rpc).toHaveBeenCalledTimes(1);
    expect(rpc).toHaveBeenCalledWith("submit_website_lead", {
      p_key: KEY,
      p_name: "Ion Popescu",
      p_email: "ion@firma.ro",
      p_phone: "+40 771 570 577",
      p_company: "Transport SRL",
      p_message: "Avem 3 depozite și vrem o ofertă.",
    });
    expect(from).not.toHaveBeenCalled();
  });

  it("sends an empty company as null, as the old insert stored it", async () => {
    await storeLead({ ...lead, company: "" });
    expect(rpc.mock.calls[0][1]).toMatchObject({ p_company: null });
  });

  it("returns the function's error as it came, for the route to log", async () => {
    const error = { code: "42501", message: "submit_website_lead: the key is missing or not valid", details: null, hint: null };
    rpc.mockResolvedValue({ data: null, error });
    await expect(storeLead(lead)).resolves.toEqual({ error });
  });

  it("throws Missing CONTACT_LEAD_KEY when the key is unset or empty, and calls nothing", async () => {
    for (const value of [undefined, ""]) {
      vi.stubEnv("CONTACT_LEAD_KEY", value);
      await expect(storeLead(lead), String(value)).rejects.toThrow("Missing CONTACT_LEAD_KEY");
    }
    expect(rpc).not.toHaveBeenCalled();
  });

  it("builds the client before it reads the key: without either, the missing Supabase URL is what fails", async () => {
    vi.stubEnv("CONTACT_LEAD_KEY", undefined);
    readClient.mockImplementationOnce(() => {
      throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY");
    });
    await expect(storeLead(lead)).rejects.toThrow("Missing NEXT_PUBLIC_SUPABASE_URL");
    expect(rpc).not.toHaveBeenCalled();
  });
});

describe("lib/contact/lead.ts stays on the server", () => {
  const SRC = fileURLToPath(new URL("../..", import.meta.url));
  const walk = (dir: string): string[] =>
    readdirSync(dir).flatMap((name) => {
      const path = join(dir, name);
      return statSync(path).isDirectory() ? walk(path) : [path];
    });
  // Any import of this module, by its alias or a relative path.
  const IMPORTS_LEAD = /["'](?:@\/lib\/contact|(?:\.{1,2}\/)+(?:lib\/)?contact|\.)\/lead(?:\.ts)?["']/;

  it("is imported by the contact route alone (tests aside), so no page or client component can bundle it", () => {
    const importers = walk(SRC)
      .filter((file) => /\.(ts|tsx|js|jsx|mjs)$/.test(file) && !/\.test\.(ts|tsx)$/.test(file))
      .filter((file) => IMPORTS_LEAD.test(readFileSync(file, "utf8")))
      .map((file) => relative(SRC, file));
    expect(importers).toEqual(["app/api/contact/route.ts"]);
  });

  it("is no client module, and reads the key under its server-only name", () => {
    const code = readFileSync(join(SRC, "lib/contact/lead.ts"), "utf8");
    expect(code).not.toMatch(/["']use client["']/);
    expect(code).toContain("process.env.CONTACT_LEAD_KEY");
    expect(code).not.toMatch(/NEXT_PUBLIC_CONTACT/);
  });
});
