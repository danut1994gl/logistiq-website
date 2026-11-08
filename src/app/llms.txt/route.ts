import { translations } from "@/lib/i18n/translations";
import { SITE_URL } from "@/lib/seo/metadata";

// /llms.txt — a curated, machine-readable map of the site for LLM crawlers
// (ChatGPT, Perplexity, Claude, …). English by convention.
export const dynamic = "force-static";

export function GET() {
  const t = translations.en;
  const faq = t.faq as unknown as Record<string, string>;

  const lines: string[] = [
    "# Logistiq",
    "",
    `> ${t.seo.description}`,
    "",
    "Logistiq is a multi-tenant logistics platform for warehouse check-in operations:",
    "digital QR check-in for truck drivers, real-time dock/ramp management, driver",
    "communication, scheduling, analytics, and multi-language support (12 languages).",
    "The manager dashboard is at logistiq.cloud; the public driver check-in is at qrgo.ro.",
    "",
    "## Pages",
    `- [Home](${SITE_URL}/en): product overview, features, contact`,
    `- [Contact](${SITE_URL}/en/contact): request a quote or a demo`,
    `- [Privacy Policy](${SITE_URL}/en/privacy)`,
    `- [Terms & Conditions](${SITE_URL}/en/terms)`,
    `- [Cookie Policy](${SITE_URL}/en/cookies)`,
    "",
    // No prices, anywhere on the site (owner, 2026-11-08).
    "## Pricing",
    "There is no public price list: the price is set by a quote or contract for each customer.",
    "Plans are sized by the number of warehouses: Professional (one warehouse) and Enterprise",
    `(up to 5, 10 or 25 warehouses). Request a quote: ${SITE_URL}/en/contact`,
    "",
    "## Frequently asked questions",
  ];

  for (let i = 1; i <= 20; i++) {
    const q = faq[`q${i}`];
    if (q) lines.push(`- ${q}`);
  }
  lines.push("");
  lines.push(`Full answers: ${SITE_URL}/llms-full.txt`);
  lines.push("");

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
