import sanitizeHtml from "sanitize-html";
import { type Locale } from "@/lib/i18n/config";
export { slugify } from "@/lib/features";

// /blog is a SHARED segment across all 8 locales (like /resurse). Slugs are
// localized (stored per-locale in the DB). "Rel" variants return the path AFTER
// /{locale} (for JSON-LD path fields); the others return the full path.
const BLOG_SEGMENT = "blog";

export function blogIndexRel(_l: Locale): string {
  return `/${BLOG_SEGMENT}`;
}
export function blogIndexPath(l: Locale): string {
  return `/${l}/${BLOG_SEGMENT}`;
}
export function postRel(_l: Locale, slug: string): string {
  return `/${BLOG_SEGMENT}/${slug}`;
}
export function postPath(l: Locale, slug: string): string {
  return `/${l}/${BLOG_SEGMENT}/${slug}`;
}
export function categoryRel(_l: Locale, slug: string): string {
  return `/${BLOG_SEGMENT}/category/${slug}`;
}
export function categoryPath(l: Locale, slug: string): string {
  return `/${l}/${BLOG_SEGMENT}/category/${slug}`;
}

// Render-side sanitizer (defense in depth — the dashboard already sanitizes on
// write). Strict allowlist: no <script>, no on* handlers, no javascript:/data:
// URLs, no <iframe>, no arbitrary style. Links are forced to rel=noopener nofollow.
const BLOG_HTML_OPTS: sanitizeHtml.IOptions = {
  allowedTags: [
    "p", "br", "strong", "b", "em", "i", "u", "s", "a",
    "h2", "h3", "h4", "ul", "ol", "li", "blockquote", "code", "pre",
    "img", "figure", "figcaption", "hr",
    "table", "thead", "tbody", "tr", "th", "td",
  ],
  allowedAttributes: {
    a: ["href", "title", "target", "rel"],
    img: ["src", "alt", "title", "width", "height", "loading"],
  },
  allowedSchemes: ["http", "https", "mailto"],
  allowedSchemesByTag: { img: ["http", "https"], a: ["http", "https", "mailto"] },
  disallowedTagsMode: "discard",
  transformTags: {
    a: sanitizeHtml.simpleTransform("a", { rel: "noopener nofollow ugc", target: "_blank" }, true),
  },
};

export function sanitizeArticleHtml(html: string | null | undefined): string {
  if (!html) return "";
  return sanitizeHtml(html, BLOG_HTML_OPTS);
}
