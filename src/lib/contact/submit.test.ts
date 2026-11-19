import { describe, it, expect, vi, afterEach } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { CONTACT_SUBMIT_TIMEOUT_MS, submitContactForm } from "@/lib/contact/submit";
import { translations } from "@/lib/i18n/translations";
import { locales } from "@/lib/i18n/config";

// How the contact form sends and what the visitor reads when nothing comes back (2026-11-19). Vercel BotID's client
// wraps fetch and waits for its challenge with no timeout: a blocked challenge script made the fetch reject, one that
// never answers left the form spinning for good. BotID still gates the POST; the form stops waiting after its bound and
// names contact@logistiq.ro. Each `fetch` below stands in for the browser's (BotID's wrapper included).

const body = { name: "Ion Popescu", email: "ion@firma.ro", company: "", phone: "+40 771 570 577", message: "Bună ziua", reference: "", elapsedMs: 42_000 };
const never = () => new Promise<Response>(() => {});
const json = (status: number, data: unknown) =>
  new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json" } });

afterEach(() => {
  vi.useRealTimers();
});

describe("submitContactForm: a failure with no answer", () => {
  it("waits 30 s, longer than the route's 25 s deadline on the send", () => {
    expect(CONTACT_SUBMIT_TIMEOUT_MS).toBe(30_000);
  });

  for (const locale of ["ro", "en", "de"] as const) {
    it(`${locale}: a fetch that never settles reads contact.unreachable after the bound, and its signal is aborted`, async () => {
      vi.useFakeTimers();
      const fetch = vi.fn((_input: RequestInfo | URL, _init?: RequestInit) => never());
      let outcome: unknown;
      void submitContactForm(body, translations[locale], { fetch }).then((o) => (outcome = o));
      await vi.advanceTimersByTimeAsync(CONTACT_SUBMIT_TIMEOUT_MS - 1);
      expect(outcome).toBeUndefined();
      await vi.advanceTimersByTimeAsync(1);
      expect(outcome).toEqual({ ok: false, message: translations[locale].contact.unreachable });
      expect(fetch.mock.calls[0][1]?.signal?.aborted).toBe(true);
    });
  }

  it("a fetch that throws reads it at once: the network, or BotID's client failing its challenge script", async () => {
    for (const failure of [new TypeError("Failed to fetch"), new Event("error"), new DOMException("aborted", "AbortError")]) {
      const outcome = await submitContactForm(body, translations.en, { fetch: async () => Promise.reject(failure) });
      expect(outcome).toEqual({ ok: false, message: translations.en.contact.unreachable });
    }
  });

  it("a body that never finishes arriving counts as no answer too", async () => {
    vi.useFakeTimers();
    let outcome: unknown;
    const stalled = new Response(new ReadableStream({ start: () => {} }), { status: 400 });
    void submitContactForm(body, translations.de, { fetch: async () => stalled }).then((o) => (outcome = o));
    await vi.advanceTimersByTimeAsync(CONTACT_SUBMIT_TIMEOUT_MS);
    expect(outcome).toEqual({ ok: false, message: translations.de.contact.unreachable });
  });

  it("a fetch BotID's wrapper only starts after the bound starts already aborted, so nothing leaves late", async () => {
    vi.useFakeTimers();
    const sent = vi.fn((_input: RequestInfo | URL, init?: RequestInit) =>
      init?.signal?.aborted ? Promise.reject(new DOMException("aborted", "AbortError")) : Promise.resolve(json(200, { success: true })),
    );
    // Like BotID's wrapper: wait for the challenge, then pass the caller's options on to the real fetch.
    const wrapper = async (input: RequestInfo | URL, init?: RequestInit) => {
      await new Promise((resolve) => setTimeout(resolve, CONTACT_SUBMIT_TIMEOUT_MS + 5_000));
      return sent(input, init);
    };
    let outcome: unknown;
    void submitContactForm(body, translations.en, { fetch: wrapper }).then((o) => (outcome = o));
    await vi.advanceTimersByTimeAsync(CONTACT_SUBMIT_TIMEOUT_MS);
    expect(outcome).toEqual({ ok: false, message: translations.en.contact.unreachable });
    await vi.advanceTimersByTimeAsync(5_000);
    expect(sent).toHaveBeenCalledTimes(1);
    expect((sent.mock.calls[0][1] as RequestInit).signal?.aborted).toBe(true);
    await expect(sent.mock.results[0].value).rejects.toThrow("aborted");
  });
});

describe("submitContactForm: an answer", () => {
  it("posts the body as JSON to /api/contact, with a signal", async () => {
    const fetch = vi.fn(async () => json(200, { success: true }));
    await submitContactForm(body, translations.en, { fetch });
    const [input, init] = fetch.mock.calls[0] as unknown as [string, RequestInit];
    expect(input).toBe("/api/contact");
    expect(init).toMatchObject({ method: "POST", headers: { "Content-Type": "application/json" } });
    expect(JSON.parse(String(init.body))).toEqual(body);
    expect(init.signal).toBeInstanceOf(AbortSignal);
  });

  it("a 200 is a success, and no timer is left behind", async () => {
    vi.useFakeTimers();
    const outcome = await submitContactForm(body, translations.en, { fetch: async () => json(200, { success: true }) });
    expect(outcome).toEqual({ ok: true });
    expect(vi.getTimerCount()).toBe(0);
  });

  it("a refusal reads the form's sentence for its code, a refusal without JSON the generic error", async () => {
    const refused = await submitContactForm(body, translations.bg, {
      fetch: async () => json(400, { error: "Adresa de email nu este validă", code: "invalid" }),
    });
    expect(refused).toEqual({ ok: false, message: translations.bg.contact.invalid });
    const broken = await submitContactForm(body, translations.bg, { fetch: async () => new Response("<html>502</html>", { status: 502 }) });
    expect(broken).toEqual({ ok: false, message: translations.bg.contact.error });
  });
});

describe("contact.unreachable", () => {
  it("is in every language, names contact@logistiq.ro, and is Romanian only in ro", () => {
    for (const locale of locales) {
      const text = translations[locale].contact.unreachable;
      expect(text?.trim(), locale).toBeTruthy();
      expect(text, locale).toContain("contact@logistiq.ro");
      if (locale !== "ro") {
        expect(text, locale).not.toBe(translations.ro.contact.unreachable);
        expect(text, locale).not.toMatch(/[ăĂșȘțȚşŞţŢ]/);
      }
    }
    expect(translations.en.contact.unreachable).toBe(
      "We couldn't send your message from this browser. Please email us at contact@logistiq.ro.",
    );
  });

  it("the form sends through submitContactForm and never calls fetch itself", () => {
    const form = readFileSync(fileURLToPath(new URL("../../components/sections/ContactSection.tsx", import.meta.url)), "utf8");
    expect(form).toContain("await submitContactForm(");
    expect(form).not.toMatch(/\bfetch\s*\(/);
  });
});
