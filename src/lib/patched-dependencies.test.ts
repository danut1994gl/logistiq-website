import { describe, it, expect } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// The site's dependencies are at or past the releases that close their known advisories, as npm actually installed
// them (2026-11-19, the contact form's nodemailer 6 to 10; the monorepo's twin is
// apps/dashboard/__tests__/patched-dependencies.test.ts).
//
// Each floor is the first release that closes every advisory found reachable. The test reads what npm installed, not
// package.json, so a lockfile that slides back (a merge that keeps an old package-lock.json, a range narrowed by hand)
// fails here instead of shipping. Raising a floor is fine; lowering one needs the advisory that makes it safe.

const ROOT = fileURLToPath(new URL("../../", import.meta.url));

/** The version of `pkg` the site loads: resolved like its own `require`, then up to the package's own manifest. */
function installed(pkg: string): string {
  const entry = createRequire(join(ROOT, "package.json")).resolve(pkg);
  for (let dir = dirname(entry); dir !== dirname(dir); dir = dirname(dir)) {
    const manifest = join(dir, "package.json");
    if (!existsSync(manifest)) continue;
    const json = JSON.parse(readFileSync(manifest, "utf8")) as { name?: string; version?: string };
    if (json.name === pkg && json.version) return json.version;
  }
  throw new Error(`${pkg}: no package.json above ${entry}`);
}

/** a >= b for plain x.y.z versions (a prerelease counts as below its release). */
function atLeast(a: string, b: string): boolean {
  const [main, pre = ""] = a.split("-");
  const x = main.split(".").map(Number);
  const y = b.split(".").map(Number);
  for (let i = 0; i < 3; i++) if ((x[i] ?? 0) !== (y[i] ?? 0)) return (x[i] ?? 0) > (y[i] ?? 0);
  return pre === "";
}

describe("atLeast", () => {
  it("compares x.y.z numerically, a prerelease below its release", () => {
    expect(atLeast("10.5.0", "10.1.4")).toBe(true);
    expect(atLeast("10.10.0", "10.9.9")).toBe(true);
    expect(atLeast("10.1.4", "10.1.4")).toBe(true);
    expect(atLeast("10.1.3", "10.1.4")).toBe(false);
    expect(atLeast("6.10.1", "10.1.4")).toBe(false);
    expect(atLeast("10.1.4-beta.1", "10.1.4")).toBe(false);
  });
});

// nodemailer sends the contact form's notification (app/api/contact/route.ts), whose Reply-To is the address a
// stranger typed. 10.1.4 is the first release `npm audit` reports clean: it closes the address-parser series that
// smuggles a recipient out of quotes, comments and groups (GHSA-8c8m-p3m8-cjg8, GHSA-m943-m63m-w62w,
// GHSA-85x2-q946-cp5h, GHSA-g73g-hqqh-jr95, GHSA-cc9r-2j5m-2m83); the last high, the quadratic free-text fallback
// (GHSA-v53p-9fqp-m79j), is fixed from 10.0.6, and no 9.x fixes it. The floor is 10.5.0 all the same: the route bounds
// each send with nodemailer's per-send AbortSignal (SMTP_SEND_DEADLINE_MS, lib/contact/smtp.ts), which arrived in
// 10.5.0, and 10.1.4 to 10.4.1 ignore `signal` without a word while the audit reports them clean. 10.x ships its own
// declarations, so @types/nodemailer (written for 6 and 7) must not come back and shadow them.
describe("nodemailer", () => {
  it("sends with 10.5.0 or later: 10.1.4 closes the advisories, 10.5.0 brings the per-send AbortSignal", () => {
    expect(atLeast(installed("nodemailer"), "10.5.0"), installed("nodemailer")).toBe(true);
  });

  it("cancels a send whose signal has aborted, with EABORT, as the route's deadline needs (no network: jsonTransport)", async () => {
    const { default: nodemailer } = await import("nodemailer");
    const transport = nodemailer.createTransport({ jsonTransport: true });
    await expect(
      transport.sendMail({ from: "a@b.ro", to: "c@d.ro", text: "x", signal: AbortSignal.abort() }),
    ).rejects.toMatchObject({ code: "EABORT" });
  });

  it("is typed by nodemailer itself: @types/nodemailer is no dependency", () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as Record<string, Record<string, string>>;
    expect({ ...pkg.dependencies, ...pkg.devDependencies }).not.toHaveProperty("@types/nodemailer");
  });
});
