import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { NextRequest } from "next/server";
import { refusalMessage } from "@/lib/contact/refusal";
import { translations } from "@/lib/i18n/translations";
import { locales } from "@/lib/i18n/config";
import type { ContactErrorCode } from "@/lib/contact/protocol";

// The contact form answers a refusal in the visitor's language (2026-11-19). The route's JSON is
// { error: <a Romanian sentence>, code }, unchanged; until 2026-11-19 the form showed `error` as it came for every
// code but rate_limited and verify_failed, so a German or Bulgarian visitor read Romanian. Here the route gives every
// refusal it can (nothing real is reached: nodemailer, Supabase, BotID, the firewall and Google are mocked), and the
// form's own sentence for each answer is checked in every language.

const sendMail = vi.fn();
vi.mock("nodemailer", () => ({ default: { createTransport: () => ({ sendMail: (...a: unknown[]) => sendMail(...a) }) } }));
vi.mock("@/lib/supabase", () => ({
  createReadClient: () => ({
    rpc: async () => ({ data: null, error: null }),
    from: () => {
      throw new Error("a lead is written through submit_website_lead, never from()");
    },
  }),
}));
vi.mock("botid/server", () => ({ checkBotId: async () => ({ isBot: false, isHuman: true, isVerifiedBot: false, bypassed: false }) }));
const checkRateLimit = vi.fn();
vi.mock("@vercel/firewall", () => ({ checkRateLimit: (...a: unknown[]) => checkRateLimit(...a) }));

import { POST } from "@/app/api/contact/route";

const human = {
  name: "Ion Popescu",
  email: "ion@firma.ro",
  company: "Transport SRL",
  phone: "+40 771 570 577",
  message: "Avem 3 depozite și vrem o ofertă.",
  reference: "",
  elapsedMs: 42_000,
};

interface Refusal {
  status: number;
  body: { error: string; code: ContactErrorCode };
}

async function answer(body: unknown): Promise<Refusal> {
  const res = await POST(
    new NextRequest("https://logistiq.ro/api/contact", {
      method: "POST",
      headers: { "content-type": "application/json", "x-real-ip": "203.0.113.7" },
      body: typeof body === "string" ? body : JSON.stringify(body),
    }),
  );
  return { status: res.status, body: await res.json() };
}

/** Every refusal the route gives, as it gives it. */
const refusals: Record<string, Refusal> = {};

beforeAll(async () => {
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.stubEnv("RECAPTCHA_SECRET_KEY", "");
  vi.stubEnv("NEXT_PUBLIC_RECAPTCHA_SITE_KEY", "");
  sendMail.mockResolvedValue({ messageId: "test" });
  checkRateLimit.mockResolvedValue({ rateLimited: false });

  refusals["not a request"] = await answer("not json");
  refusals["a field the form may not send"] = await answer({ ...human, company: "Transport\tSRL" });
  refusals["a required field left empty"] = await answer({ ...human, name: "   " });
  refusals["an address that is not a plain mailbox"] = await answer({ ...human, email: "ion!x@firma.ro" });

  checkRateLimit.mockResolvedValueOnce({ rateLimited: true });
  refusals["too many messages"] = await answer(human);

  vi.stubEnv("RECAPTCHA_SECRET_KEY", "test-secret");
  vi.stubEnv("NEXT_PUBLIC_RECAPTCHA_SITE_KEY", "test-site-key");
  vi.stubGlobal("fetch", vi.fn(async () => { throw new TypeError("fetch failed"); }));
  refusals["reCAPTCHA unreachable"] = await answer({ ...human, recaptchaToken: "t" });
  vi.unstubAllGlobals();
  vi.stubEnv("RECAPTCHA_SECRET_KEY", "");
  vi.stubEnv("NEXT_PUBLIC_RECAPTCHA_SITE_KEY", "");

  sendMail.mockRejectedValueOnce(new Error("SMTP down"));
  refusals["the e-mail could not be sent"] = await answer(human);
});

afterAll(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const OWN: Record<ContactErrorCode, (t: (typeof translations)["ro"]) => string> = {
  invalid: (t) => t.contact.invalid,
  rate_limited: (t) => t.contact.rateLimited,
  verify_failed: (t) => t.contact.verifyFailed,
  server: (t) => t.contact.error,
};

describe("the route's refusals, as the form shows them", () => {
  it("the route gives each code: invalid (four ways), rate_limited, verify_failed and server, its JSON unchanged", () => {
    expect(Object.fromEntries(Object.entries(refusals).map(([k, r]) => [k, [r.status, r.body.code]]))).toEqual({
      "not a request": [400, "invalid"],
      "a field the form may not send": [400, "invalid"],
      "a required field left empty": [400, "invalid"],
      "an address that is not a plain mailbox": [400, "invalid"],
      "too many messages": [429, "rate_limited"],
      "reCAPTCHA unreachable": [503, "verify_failed"],
      "the e-mail could not be sent": [500, "server"],
    });
    for (const refusal of Object.values(refusals)) expect(Object.keys(refusal.body).sort()).toEqual(["code", "error"]);
    expect(refusals["an address that is not a plain mailbox"].body.error).toBe("Adresa de email nu este validă");
  });

  for (const locale of locales) {
    it(`${locale}: each refusal reads the form's own sentence for its code${locale === "ro" ? "" : ", never the route's Romanian"}`, () => {
      const t = translations[locale];
      for (const [name, refusal] of Object.entries(refusals)) {
        const shown = refusalMessage(t, refusal.body);
        expect(shown, `${locale} ${name}`).toBe(OWN[refusal.body.code](t));
        if (locale !== "ro") {
          expect(shown, `${locale} ${name}`).not.toContain(refusal.body.error);
          for (const other of Object.values(refusals)) expect(shown).not.toContain(other.body.error);
          expect(shown, `${locale} ${name}: Romanian letters`).not.toMatch(/[ăĂșȘțȚşŞţŢ]/);
        }
      }
    });
  }

  it("every language has its own sentence for each code, none of them Romanian outside ro", () => {
    for (const locale of locales) {
      for (const own of Object.values(OWN)) {
        expect(own(translations[locale])?.trim(), locale).toBeTruthy();
        if (locale !== "ro") expect(own(translations[locale]), locale).not.toBe(own(translations.ro));
      }
    }
    expect(translations.bg.contact.invalid).toMatch(/[А-Яа-я]/);
  });

  it("contact.invalid asks for name, company and phone each on its own line, not all three on one", () => {
    expect(translations.ro.contact.invalid).toContain("și scrie numele, compania și telefonul, fiecare pe un singur rând.");
    expect(translations.en.contact.invalid).toContain("and write the name, company and phone number each on a single line.");
    expect(translations.fr.contact.invalid).toContain("et écrivez le nom, l'entreprise et le téléphone, chacun sur une seule ligne.");
    expect(translations.bg.contact.invalid).toContain("и напишете името, компанията и телефона, всяко поле на един ред.");
  });

  it("an unknown code, no code or no JSON object gets the generic error", () => {
    for (const locale of ["ro", "en", "de"] as const) {
      const t = translations[locale];
      for (const data of [{ code: "teapot", error: "Ceva" }, { error: "A apărut o eroare." }, {}, null, "x", { code: "toString" }]) {
        expect(refusalMessage(t, data), `${locale} ${JSON.stringify(data)}`).toBe(t.contact.error);
      }
    }
  });

  it("the form shows only these sentences: it never displays the route's error text", () => {
    const read = (path: string) => readFileSync(fileURLToPath(new URL(path, import.meta.url)), "utf8");
    const form = read("../../components/sections/ContactSection.tsx");
    const submit = read("./submit.ts");
    // The form shows what lib/contact/submit.ts says, which answers a refusal with refusalMessage.
    expect(form).toContain("setErrorMessage(outcome.message)");
    expect(submit).toContain("refusalMessage(t, result.data)");
    // The only `.error` either of them reads is the form's own generic sentence.
    const errorsRead = [...(form.match(/[\w$.]*\.error\b/g) ?? []), ...(submit.match(/[\w$.]*\.error\b/g) ?? [])];
    expect(new Set(errorsRead)).toEqual(new Set(["t.contact.error"]));
  });
});
