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

- **Default locale = `en`** (`config.ts`); geo/Accept-Language in `middleware.ts`
  still routes RO/DE/… visitors to their language. `x-default` → `/en`.
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
