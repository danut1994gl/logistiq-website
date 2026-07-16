import { type Locale, localeToHreflang } from "@/lib/i18n/config";
import { SITE_URL } from "@/lib/seo/metadata";
import { company } from "@/lib/company";
import { isSelfServeEnabled } from "@/lib/self-serve";

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
  const sameAs = Object.values(company.socials).filter(Boolean);
  return {
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: "Logistiq",
    legalName: company.legalName,
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: `${SITE_URL}/logo.png`,
      width: 512,
      height: 512,
    },
    email: company.email,
    telephone: company.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: company.address.street,
      addressLocality: company.address.city,
      addressRegion: company.address.region,
      postalCode: company.address.postalCode,
      addressCountry: company.address.country,
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: company.phone,
      email: company.email,
      contactType: "customer support",
      availableLanguage: ["ro", "en", "de", "fr", "pl", "hu", "bg", "nl"],
    },
    ...(sameAs.length ? { sameAs } : {}),
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
    // ADR-005: public prices hidden while self-serve is off (reversible — see
    // isSelfServeEnabled). Crawlers/rich-snippets must not see prices we don't
    // publish on the page itself.
    ...(isSelfServeEnabled()
      ? {
          offers: {
            "@type": "AggregateOffer",
            priceCurrency: company.priceCurrency,
            lowPrice: company.priceLow,
            highPrice: company.priceHigh,
            offerCount: company.offerCount,
            availability: "https://schema.org/InStock",
          },
        }
      : {}),
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

// Emitted ONLY on a page that visibly renders the numbered steps (Google
// requires the how-to steps to be present on the page — our flow section shows
// them). Needs at least two steps to be a meaningful "how to"; returns null
// otherwise. `name`/`description` come from the section's own visible heading.
export function howToSchema(opts: {
  locale: Locale;
  path: string;
  name: string;
  description?: string;
  /** matches the step <li> ids the flow section renders: `${idPrefix}-flow-step-N` */
  idPrefix: string;
  steps: { name: string; text: string }[];
}): Json | null {
  if (opts.steps.length < 2) return null;
  const url = `${SITE_URL}/${opts.locale}${opts.path === "/" ? "" : opts.path}`;
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "@id": `${url}/#howto`,
    name: opts.name,
    ...(opts.description ? { description: opts.description } : {}),
    inLanguage: localeToHreflang[opts.locale],
    step: opts.steps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.name,
      text: s.text,
      url: `${url}#${opts.idPrefix}-flow-step-${i + 1}`,
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

// BlogPosting for an individual article. Organization/WebSite/Software stay
// site-wide in [locale]/layout.tsx — do NOT re-emit them here. Images must be
// absolute Supabase URLs. mainEntityOfPage matches the page's webPageSchema @id.
export function articleSchema(opts: {
  locale: Locale;
  url: string;
  headline: string;
  description: string;
  images: string[];
  datePublished: string;
  dateModified: string;
  authorName?: string | null;
  section?: string | null;
  keywords?: string[];
}): Json {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${opts.url}/#article`,
    mainEntityOfPage: { "@id": `${opts.url}/#webpage` },
    headline: opts.headline,
    description: opts.description,
    ...(opts.images.length ? { image: opts.images } : {}),
    datePublished: opts.datePublished,
    dateModified: opts.dateModified,
    inLanguage: localeToHreflang[opts.locale],
    isPartOf: { "@id": `${SITE_URL}/#website` },
    author: opts.authorName
      ? { "@type": "Person", name: opts.authorName }
      : { "@id": `${SITE_URL}/#organization` },
    publisher: { "@id": `${SITE_URL}/#organization` },
    ...(opts.section ? { articleSection: opts.section } : {}),
    ...(opts.keywords && opts.keywords.length ? { keywords: opts.keywords.join(", ") } : {}),
  };
}
