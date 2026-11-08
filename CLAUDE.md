# CLAUDE.md — logistiq.ro marketing website

Instructions for working on the Logistiq marketing website. **Every future change
must follow the structure and conventions below** — they exist so the site stays
scalable, consistent, and correct for a pan-European, multi-language launch.

This is a **standalone git submodule** (`github.com/danut1994gl/logistiq-website`),
**not** part of the parent pnpm monorepo. It uses **npm**. Next.js 16 (App Router),
React 19, TypeScript, Tailwind CSS v4 (CSS-first config in `src/app/globals.css`,
no `tailwind.config`). Deploys to Vercel project `logistiq-website` → logistiq.ro.

## Golden rules (do not break these)

1. **Server Components by default.** Add `"use client"` only to genuinely
   interactive leaves (dropdowns, forms, scroll/count animations). Never make a
   whole page/section client just for convenience.
2. **Edit nav & footer in ONE place:** `src/lib/navigation.ts`. `SiteHeader` and
   `SiteFooter` are data-driven from it and mounted once in the marketing layout.
   Never hard-code nav/footer links in a page.
3. **All user-facing text is translated in ALL 8 locales.** Add keys to every
   locale block in `src/lib/i18n/translations.ts` (`ro en de pl hu bg fr nl`).
   `type Translations = typeof translations.ro` is the load-bearing contract —
   keep every locale structurally identical to `ro`.
4. **Every page ships SEO metadata + JSON-LD.** Use the shared helpers (below).
   Never inline canonical/hreflang/JSON-LD by hand.
5. **Verify before pushing:** `npm run build` must pass; drive the change (curl or
   Playwright on a localized route) and confirm behaviour before committing.
6. **A Client Component's first render must not depend on the day, the host,
   `Math.random` or browser storage.** Pages are prerendered once per build and served
   to every domain on every day; read such values after hydration (`useEffect`,
   `useSyncExternalStore` with a fixed server snapshot). A mismatch makes React throw
   the whole server-rendered page away and paint it again (error #418) — the home
   page "loaded twice" for this reason until 2026-11-06 (`StatsSection.test.tsx`).

## Structure

```
src/app/
  layout.tsx                 # root: returns children + globals.css (no <html>)
  [locale]/
    layout.tsx               # <html>/<body>, fonts, site-wide JSON-LD, generateMetadata
    not-found.tsx            # localized 404 boundary (content only)
    (marketing)/
      layout.tsx             # mounts SiteHeader + <main id="main"> + SiteFooter + CookieConsent
      page.tsx               # home (composes sections/*)
      features/{page,[slug]/page}.tsx
      resurse/page.tsx  contact/page.tsx
    privacy/ terms/ cookies/ # legal pages (own <main>, outside the marketing group)
  not-found.tsx              # root 404 (own <html>, for non-locale unmatched)
  sitemap.ts  robots.ts  llms.txt/  llms-full.txt/
src/components/{icons,mockups,sections,site}/   # site/ = SiteHeader, SiteFooter, PageHero, Breadcrumbs
src/lib/
  navigation.ts  company.ts  href.ts  features.ts  faq.ts
  i18n/{config,translations,segments}.ts
  seo/{metadata,jsonld}.ts(x)
```

## i18n & URLs (international SEO — critical)

- **Default locale = `en`** (`config.ts`); geo/Accept-Language auto-routing is
  disabled — `middleware.ts` sends a bare URL to the visitor's saved choice (cookie)
  or the default. `x-default` → `/en`.
- **Per-domain language sets** live in `lib/i18n/sites.ts`: **logistiq.be** serves
  only `nl` (default), `fr`, `en` — `middleware.ts` moves every other locale's URL to
  the same page in Dutch and remembers the choice in its own `NEXT_LOCALE_BE` cookie;
  `SiteHeader`'s switcher lists only the domain's set. Every other host serves all 8.
- **hreflang is language-level** (`de`, `fr`, …), not country (`de-DE`). Only switch
  to language-region when content is actually differentiated per country.
- **`SITE_URL` is env-driven** (`NEXT_PUBLIC_SITE_URL`, falls back to logistiq.ro).
  Never hard-code the domain — moving to a global TLD must stay a one-env change.
- **Localized path segments + slugs per language.** Segments live in
  `lib/i18n/segments.ts` (mirrored in `next.config.ts` `SEG` — keep both in sync);
  slugs are derived from the native titles via `slugify()` (handles diacritics +
  Cyrillic). e.g. `/de/funktionen/digitaler-check-in`, `/fr/fonctionnalites/...`.
  A localized segment is rewritten to its internal folder in `next.config`; the raw
  folder segment is deduped via **canonical** (a redirect there forms a rewrite loop
  — don't add one). When a public URL changes, add a redirect in `next.config`.

## SEO helpers (always use these)

- `buildAlternates(locale, (l) => pathFor(l))` from `lib/seo/metadata` → canonical +
  hreflang (all 8 + x-default). `pathFor` is a function so localized slugs map right.
- `lib/seo/jsonld.tsx`: `<JsonLd>` (escapes `<`), `siteGraph()` (Organization +
  WebSite + SoftwareApplication — **layout only**), and page builders
  `webPageSchema` / `faqPageSchema` / `breadcrumbSchema` / `article`.
  **Site-wide entities go in `[locale]/layout.tsx` only; page entities in the page.**
  Never let WebPage/FAQPage leak onto every route.
- Keep `sitemap.ts` in step with new routes (shared-path routes vs localized
  feature routes are handled separately). robots already allow-lists AI crawlers.

## New-page checklist

1. Route folder under `[locale]/(marketing)/…` with `page.tsx` (Server Component,
   `await params`, fallback `: "en"`).
2. `generateMetadata` → `buildAlternates`; render `PageHero` + `Breadcrumbs` and
   `<JsonLd>` for `webPageSchema` + `breadcrumbSchema`.
3. Add the route to `sitemap.ts` and, if in the nav/footer, to `navigation.ts`.
4. Add every new translation key to **all 8 locales** in `translations.ts`.
5. If it's a key content page, reference it from `/llms.txt`.

## Design & motion

- Dark-only brand. Tokens in `globals.css` (`--primary #2563eb`, `--accent #06b6d4`,
  `--surface-*`, `--section-y`, `--nav-h`, `--fg-muted`, `--link`). Interactive text
  on dark uses `--link` (blue-400), **never `--primary`** (fails WCAG AA).
- Reuse existing keyframes. Entrance animations use `both` fill + ease-out-expo (so
  no flash during stagger). Always respect `prefers-reduced-motion` (global block in
  `globals.css`). Accordions/menus need proper ARIA + focus states.
- **Group logos** (footer "Logistiq Group" column, `groupSites` in `navigation.ts`):
  `public/logistiq-{ro,be,cloud}.svg` + `public/qrgo.svg`, all one frame height, built by
  `scripts/group-logos.py` from `public/logistiq-banner-dark.svg` and
  `scripts/og/qrgo-logo.svg`. The wordmark's typeface is not available, so the r, b and e
  of `.ro`/`.be` are rebuilt from the export's own letters; prefer official Canva exports
  once they exist. Regenerating changes the widths in `groupSites` (a test compares them).
- `globals.css` keeps `img[loading="lazy"]` at opacity 0 until a `loaded` class is added,
  and nothing adds it: a loaded `<img loading="lazy">` stays invisible (checked
  2026-11-08). `next/image` renders `loading="lazy"` by default, so the blog index's
  cover thumbnails will hit this once a post has a cover image.

## Security

- Sanitize any `dangerouslySetInnerHTML` server-side (allowlist) — applies to future
  blog/rich content. The `<JsonLd>` helper already escapes `<`.
- The website is **anon-only** to Supabase: it may hold `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  and read via `SECURITY DEFINER` RPCs. **Never** ship the service-role key here.
- Any anonymous write path (contact → ticket) must verify reCAPTCHA server-side +
  rate-limit before hitting the DB.

## Deploy / git

- Commit in this submodule, then **bump the submodule pointer in the parent repo**.
  Push order: submodule first (`git push origin main`), then the parent. End commit
  messages with the standard Co-Authored-By trailer.
- Vercel auto-deploys `main`. The live domain edge-caches — hard-refresh / cache-bust
  when verifying. Prefer confirming on the deployment/domain, not just locally.
