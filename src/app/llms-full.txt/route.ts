import { translations } from "@/lib/i18n/translations";
import { SITE_URL } from "@/lib/seo/metadata";

// /llms-full.txt — the full plain-text corpus for LLM ingestion (description +
// complete FAQ Q&A). English by convention.
export const dynamic = "force-static";

export function GET() {
  const t = translations.en;
  const faq = t.faq as unknown as Record<string, string>;

  const lines: string[] = [
    "# Logistiq — full reference",
    "",
    `> ${t.seo.description}`,
    "",
    "## About",
    "Logistiq is a multi-tenant logistics management platform for warehouse check-in",
    "operations. Truck drivers check in digitally via QR codes; warehouse managers get",
    "real-time dock/ramp management, driver communication, early check-in & scheduling,",
    "automatic location detection, analytics & reports, API integrations, and support for",
    "12 languages. The manager dashboard is at cloud.logistiq.ro and the public driver",
    "check-in experience is at qrgo.ro. Operated by HOSTLIFE DIGITAL SRL (Romania).",
    "",
    "## Pages",
    `- Home: ${SITE_URL}/en`,
    `- Privacy Policy: ${SITE_URL}/en/privacy`,
    `- Terms & Conditions: ${SITE_URL}/en/terms`,
    `- Cookie Policy: ${SITE_URL}/en/cookies`,
    "",
    "## Frequently asked questions",
    "",
  ];

  for (let i = 1; i <= 20; i++) {
    const q = faq[`q${i}`];
    const a = faq[`a${i}`];
    if (q && a) {
      lines.push(`### ${q}`);
      lines.push(a);
      lines.push("");
    }
  }

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
