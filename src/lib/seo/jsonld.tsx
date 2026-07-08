import { type Locale, localeToHreflang } from "@/lib/i18n/config";
import { SITE_URL } from "@/lib/seo/metadata";

type Json = Record<string, unknown>;

// Renders a JSON-LD <script>. Server Component; safe to place in <head> or body.
// `data` is always built from our own trusted schema helpers (never user input);
// we still escape "<" to < so a stray "</script>" in any string can't break out.
export function JsonLd({ data }: { data: Json }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}

// --- Site-wide entities (emitted once, in the locale layout, on every page) -----

export function organizationSchema(): Json {
  return {
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: "Logistiq",
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: `${SITE_URL}/logo.png`,
      width: 512,
      height: 512,
    },
  };
}

export function webSiteSchema(): Json {
  return {
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: "Logistiq",
    publisher: { "@id": `${SITE_URL}/#organization` },
  };
}

export function softwareApplicationSchema(description: string, featureList: string[]): Json {
  return {
    "@type": "SoftwareApplication",
    "@id": `${SITE_URL}/#software`,
    name: "Logistiq",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web, iOS, Android",
    description,
    featureList,
  };
}

// The full site-wide @graph. Placed in the locale layout so it appears on every
// route, but WITHOUT page-specific entities (WebPage/FAQPage/Article) which each
// page emits for itself.
export function siteGraph(description: string, featureList: string[]): Json {
  return {
    "@context": "https://schema.org",
    "@graph": [organizationSchema(), webSiteSchema(), softwareApplicationSchema(description, featureList)],
  };
}

// --- Page-specific entities (emitted by the owning page) ------------------------

export function webPageSchema(opts: {
  locale: Locale;
  path: string; // e.g. "/" or "/functionalitati"
  title: string;
  description: string;
}): Json {
  const url = `${SITE_URL}/${opts.locale}${opts.path === "/" ? "" : opts.path}`;
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${url}/#webpage`,
    url,
    name: opts.title,
    description: opts.description,
    isPartOf: { "@id": `${SITE_URL}/#website` },
    about: { "@id": `${SITE_URL}/#software` },
    inLanguage: localeToHreflang[opts.locale],
  };
}

// Emitted ONLY on a page that visibly renders the Q&A (Google requires the
// content to be present on the page). Returns null when there are no entries.
export function faqPageSchema(opts: {
  locale: Locale;
  path: string;
  entries: { q: string; a: string }[];
}): Json | null {
  if (!opts.entries.length) return null;
  const url = `${SITE_URL}/${opts.locale}${opts.path === "/" ? "" : opts.path}`;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${url}/#faq`,
    inLanguage: localeToHreflang[opts.locale],
    mainEntity: opts.entries.map((e) => ({
      "@type": "Question",
      name: e.q,
      acceptedAnswer: { "@type": "Answer", text: e.a },
    })),
  };
}

export function breadcrumbSchema(items: { name: string; url: string }[]): Json {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
