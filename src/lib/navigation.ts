import { type Locale } from "@/lib/i18n/config";
import { siteForHost } from "@/lib/i18n/sites";
import { type Translations } from "@/lib/i18n/translations";
import { anchorHref, routeHref } from "@/lib/href";
import { isSelfServeEnabled } from "@/lib/self-serve";

// ---------------------------------------------------------------------------
// Single source of truth for site navigation + footer.
// Header order (see SiteHeader): Home · Funcționalități (mega) · Prețuri (shown only
// when isSelfServeEnabled(), ADR-005) · Resurse (dropdown) · Contact. Labels are typed
// functions of the translations object (compile-time checked); hrefs are functions of
// the locale.
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
export const blogNavHref = (l: Locale) => routeHref(l, "/blog");

// Dropdown item.
export type MenuItem = {
  key: string;
  label: (t: Translations) => string;
  desc?: (t: Translations) => string;
  href: (l: Locale) => string;
};

// Resurse dropdown — FAQ. Blog is a top-level nav item (between Resurse and Contact),
// wired directly in SiteHeader via blogNavHref. SiteHeader is data-driven from this list.
export const resourcesMenu: MenuItem[] = [
  { key: "faq", label: () => "FAQ", desc: (t) => t.faq.title, href: (l) => routeHref(l, "/resurse") },
];

export type FooterColumn = {
  key: string;
  title: (t: Translations) => string;
  links: NavItem[];
};

// ADR-005: self-serve pricing hidden while self-serve is off (reversible — see isSelfServeEnabled).
const pricingFooterLink: NavItem = {
  key: "pricing",
  label: (t) => t.footer.pricing,
  href: (l) => anchorHref(l, "pricing"),
};

// Footer "Logistiq Group" column: the group's sites, each shown by its logo.
// The logos come from scripts/group-logos.py and share one frame height, so at h-6
// they render at `width` x 24 px. The marketing domains keep the visitor's language
// when the target serves it; logistiq.be serves only nl/fr/en (see i18n/sites.ts),
// so other languages land on its default page.
export type GroupSite = {
  key: string;
  name: string; // the logo's alt text, which is also the link's accessible name
  href: (locale: Locale) => string;
  logo: { src: string; width: number; height: number };
};

const belgium = siteForHost("logistiq.be");

export const groupSites: GroupSite[] = [
  {
    key: "logistiq-ro",
    name: "Logistiq.ro",
    href: (l) => `https://logistiq.ro/${l}`,
    logo: { src: "/logistiq-ro.svg", width: 125, height: 24 },
  },
  {
    key: "logistiq-be",
    name: "Logistiq.be",
    href: (l) => (belgium.locales.includes(l) ? `https://logistiq.be/${l}` : "https://logistiq.be/"),
    logo: { src: "/logistiq-be.svg", width: 129, height: 24 },
  },
  {
    key: "logistiq-cloud",
    name: "Logistiq.cloud",
    href: () => "https://logistiq.cloud/",
    logo: { src: "/logistiq-cloud.svg", width: 153, height: 24 },
  },
  {
    key: "qrgo",
    name: "QRGo",
    href: () => "https://qrgo.ro/",
    logo: { src: "/qrgo.svg", width: 84, height: 24 },
  },
];

export const footerColumns: FooterColumn[] = [
  {
    key: "product",
    title: (t) => t.footer.product,
    links: [
      { key: "features", label: (t) => t.footer.features, href: (l) => routeHref(l, "/features") },
      ...(isSelfServeEnabled() ? [pricingFooterLink] : []),
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
