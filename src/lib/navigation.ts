import { type Locale } from "@/lib/i18n/config";
import { type Translations } from "@/lib/i18n/translations";
import { anchorHref, routeHref } from "@/lib/href";

// ---------------------------------------------------------------------------
// Single source of truth for site navigation + footer.
// Edit links here — SiteHeader and SiteFooter both read from this file, so the
// nav/footer are changed in exactly one place. Labels are typed functions of the
// translations object (compile-time checked); hrefs are functions of the locale.
// ---------------------------------------------------------------------------

export type NavItem = {
  key: string;
  label: (t: Translations) => string;
  href: (locale: Locale) => string;
};

// Primary navigation. "Funcționalități" is rendered separately in SiteHeader as a
// mega-menu (it reads the feature registry), so it is not in this list. The rest are
// simple links — "Prețuri" is still a route-aware anchor to the home pricing section.
export const primaryNav: NavItem[] = [
  { key: "pricing", label: (t) => t.nav.pricing, href: (l) => anchorHref(l, "pricing") },
  { key: "resources", label: (t) => t.nav.resources, href: (l) => routeHref(l, "/resurse") },
  { key: "contact", label: (t) => t.nav.contact, href: (l) => routeHref(l, "/contact") },
];

// The "Funcționalități" entry (mega-menu). Its dropdown lists the feature registry.
export const featuresNavHref = (l: Locale) => routeHref(l, "/functionalitati");

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
      { key: "features", label: (t) => t.footer.features, href: (l) => anchorHref(l, "features") },
      { key: "pricing", label: (t) => t.footer.pricing, href: (l) => anchorHref(l, "pricing") },
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
