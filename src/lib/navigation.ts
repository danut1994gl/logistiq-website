import { type Locale } from "@/lib/i18n/config";
import { type Translations } from "@/lib/i18n/translations";
import { anchorHref, routeHref } from "@/lib/href";

// ---------------------------------------------------------------------------
// Single source of truth for site navigation + footer.
// Header order (see SiteHeader): Home · Funcționalități (mega) · Prețuri ·
// Resurse (dropdown) · Contact. Labels are typed functions of the translations
// object (compile-time checked); hrefs are functions of the locale.
// ---------------------------------------------------------------------------

export type NavItem = {
  key: string;
  label: (t: Translations) => string;
  href: (locale: Locale) => string;
};

// Top-level destinations.
export const homeHref = (l: Locale) => routeHref(l, "/");
export const featuresNavHref = (l: Locale) => routeHref(l, "/features");
export const pricingHref = (l: Locale) => anchorHref(l, "pricing");
export const contactHref = (l: Locale) => routeHref(l, "/contact");
export const resourcesNavHref = (l: Locale) => routeHref(l, "/resurse");

// Dropdown item.
export type MenuItem = {
  key: string;
  label: (t: Translations) => string;
  desc?: (t: Translations) => string;
  href: (l: Locale) => string;
};

// Resurse dropdown — only FAQ for now; Blog joins here later.
export const resourcesMenu: MenuItem[] = [
  { key: "faq", label: () => "FAQ", desc: (t) => t.faq.title, href: (l) => routeHref(l, "/resurse") },
];

export type FooterColumn = {
  key: string;
  title: (t: Translations) => string;
  links: NavItem[];
};

export const footerColumns: FooterColumn[] = [
  {
    key: "product",
    title: (t) => t.footer.product,
    links: [
      { key: "features", label: (t) => t.footer.features, href: (l) => routeHref(l, "/features") },
      { key: "pricing", label: (t) => t.footer.pricing, href: (l) => anchorHref(l, "pricing") },
      { key: "resources", label: (t) => t.nav.resources, href: (l) => routeHref(l, "/resurse") },
      { key: "contact", label: (t) => t.nav.contact, href: (l) => routeHref(l, "/contact") },
    ],
  },
  {
    key: "legal",
    title: (t) => t.footer.legal,
    links: [
      { key: "privacy", label: (t) => t.footer.privacy, href: (l) => routeHref(l, "/privacy") },
      { key: "terms", label: (t) => t.footer.terms, href: (l) => routeHref(l, "/terms") },
      { key: "cookies", label: (t) => t.footer.cookies, href: (l) => routeHref(l, "/cookies") },
    ],
  },
];
