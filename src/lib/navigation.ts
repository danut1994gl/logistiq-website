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

// Primary navigation. These point at home-page sections for now, but are
// route-aware (/{locale}#id) so they keep working from any page.
export const primaryNav: NavItem[] = [
  { key: "features", label: (t) => t.nav.features, href: (l) => anchorHref(l, "features") },
  { key: "howItWorks", label: (t) => t.nav.howItWorks, href: (l) => anchorHref(l, "how-it-works") },
  { key: "benefits", label: (t) => t.nav.benefits, href: (l) => anchorHref(l, "benefits") },
  { key: "pricing", label: (t) => t.nav.pricing, href: (l) => anchorHref(l, "pricing") },
  { key: "contact", label: (t) => t.nav.contact, href: (l) => anchorHref(l, "contact") },
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
      { key: "features", label: (t) => t.footer.features, href: (l) => anchorHref(l, "features") },
      { key: "pricing", label: (t) => t.footer.pricing, href: (l) => anchorHref(l, "pricing") },
      { key: "contact", label: (t) => t.nav.contact, href: (l) => anchorHref(l, "contact") },
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
