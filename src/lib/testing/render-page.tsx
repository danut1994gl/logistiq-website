import { prerender } from "react-dom/static";
import type { Locale } from "@/lib/i18n/config";

// Test-only: a legal page (a client component that reads `use(params)`) rendered to HTML for
// one locale, with React's text separators removed and the entities tests compare decoded.
type Page = (props: { params: Promise<{ locale: string }> }) => React.ReactNode;

export async function renderPage(Page: Page, locale: Locale): Promise<string> {
  const { prelude } = await prerender(<Page params={Promise.resolve({ locale })} />);
  const html = await new Response(prelude).text();
  return decodeHtml(html);
}

export function decodeHtml(html: string): string {
  return html
    .replace(/<!-- -->/g, "")
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&");
}
