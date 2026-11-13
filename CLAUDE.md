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
7. **No public prices.** No amount, currency or monthly rate anywhere on the site
   (owner, 2026-11-08): the price is set by the offer or contract. The pricing section
   shows the plans, what each includes and "price on request", with a request-a-quote
   CTA (`#contact`); the terms list the plans without amounts; the JSON-LD has no
   `offers`; `company.ts` and `llms.txt` carry no price. Every client component gets a
   whole locale's translations, so a price in `translations.ts` ships in every page's
   RSC payload even where it isn't shown. `no-public-prices.test.ts` guards all of it.

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
  api/contact/route.ts       # contact form → email + lead row, behind the anti-spam layers
src/instrumentation-client.ts  # browser init before hydration: Vercel BotID for POST /api/contact
src/components/{icons,mockups,sections,site}/   # site/ = SiteHeader, SiteFooter, PageHero, Breadcrumbs
src/lib/
  navigation.ts  company.ts  href.ts  features.ts  faq.ts
  i18n/{config,translations,segments,sites}.ts
  seo/{metadata,jsonld}.ts(x)
  contact/{protocol,email,recaptcha,recaptcha-client,smtp}.ts  # contact form anti-spam + email + mail TLS
```

## i18n & URLs (international SEO — critical)

- **A first visit opens in Romanian on logistiq.ro** (and every host but logistiq.be):
  `middleware.ts` sends a bare URL to the visitor's saved language (cookie
  `NEXT_LOCALE`, 1 year), else the domain's `defaultLocale` in `lib/i18n/sites.ts`
  (`ro`; `nl` on logistiq.be). Geo/Accept-Language auto-routing is disabled.
- **The saved choice always wins.** The language switcher writes the cookie itself on
  click (`localeCookie()`: a switch to a prefetched page opens from the router cache
  and never reaches the server), and the middleware writes it whenever a page in a
  language is served (a link, a search result, a reload; also the page a first visit
  lands on, so it ends up saved as `ro`). The default redirect itself writes nothing,
  and a prefetch never does: the language menu prefetches all 8 languages, and until
  2026-11-08 merely opening it overwrote the visitor's choice. Next strips its router
  headers before the middleware runs, so prefetches are kept out by
  `config.matcher`'s `missing`, not by code. A bare visit only renews a saved cookie
  with its own value. Visitors whose cookie the old default stamped `en` (every first
  visit until 2026-11-08) keep English until they pick a language; renaming the cookie
  (as logistiq.be did) would reset them, and is the way to go if the first-visit
  language ever changes again.
- **`config.ts`'s `defaultLocale` = `en` is the international fallback, not the
  first-visit language:** hreflang **`x-default` → `/en`**, the sitemap's x-default,
  RSS, unknown-locale fallbacks. x-default serves searchers whose language we don't
  offer (Italian, Spanish, Czech…), who read English better than Romanian; Romanian
  searchers get the `ro` alternate, and the bare `/` is a redirect, not a page. To
  change where a visit lands, change `sites.ts`, never `config.ts`.
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
  `feature-slugs.test.ts` pins every public feature slug, so a title edit that moves
  one fails until its old slug is in `RENAMED_FEATURE_SLUGS` (next.config.ts).
- **Write each language in its own alphabet, with all its diacritics.** Until
  2026-11-08 the older copy of fr/de/pl/hu had been written accent-stripped and
  Bulgarian in Latin transliteration ("Kompanija", "fur", "entrepot").

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
- **E-mail signature** (the owner's, 2026-11-13): `scripts/email-signature/build.py` writes
  `public/email/signature/{logistiq,qrgo-driver,divider}.png`, the paste-ready
  `scripts/email-signature/signature.html` and the owner's page
  `public/email/signature/index.html` (copy buttons, set-up steps per mail app; noindex,
  linked from nowhere, Romanian only: an owner tool, not a site page).
  `https://logistiq.ro/email/signature` reaches that page through a redirect in
  `next.config.ts`; its dotted path skips the language middleware. Sent e-mails load the
  images from `https://logistiq.ro/email/signature/` for good: **never move, rename or
  delete them**; a changed image gets a new file name. The
  signature reads in light and dark mail apps: no background, the name in the reader's own
  text colour, everything else in mid-tones (~4:1 on white and on near-black) or images.
- **The driver brand is written QRGo** (QRGo Driver, QRGo Self, QRGoBox), never in capitals
  (owner, 2026-11-09). `brand-casing.test.ts` guards the copy and every file under `src/`.
  The artwork still draws capitals until a new Canva export exists: the QRGo logo
  (`scripts/og/qrgo-logo.svg` → `public/qrgo.svg`) and the social image `public/og-image.png`
  (its source `scripts/og/og-image.html` still says it too).
- Plain rules in `globals.css` are unlayered, so they beat every Tailwind utility
  (v4 keeps utilities in `@layer utilities`). Don't style bare elements there with a
  property utilities also set: until 2026-11-08 an `img` opacity rule hid every lazy
  image and silently cancelled `opacity-*` on images (`globals-css.test.ts`).

## Security

- Sanitize any `dangerouslySetInnerHTML` server-side (allowlist) — applies to future
  blog/rich content. The `<JsonLd>` helper already escapes `<`.
- The website is **anon-only** to Supabase: it may hold `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  and read via `SECURITY DEFINER` RPCs. **Never** ship the service-role key here.
- **Every anonymous write path keeps its anti-spam layers.** The contact form's
  (`app/api/contact/route.ts`, shared protocol in `lib/contact/protocol.ts`), cheapest
  first, all in place since 2026-11-08:
  1. **honeypot** field `reference` (off-screen, `tabIndex -1`, `aria-hidden`);
  2. **fill time** `elapsedMs`, measured by the form on the monotonic clock: under 3 s
     or over a day is dropped;
  3. **Vercel BotID**, basic level (free on Hobby): `src/instrumentation-client.ts`
     protects `POST /api/contact`, the route calls `checkBotId` at the same level;
     `withBotId` in `next.config.ts`; `middleware.ts` skips BotID's paths;
  4. **Vercel WAF rate limit per IP**: `checkRateLimit('contact')` from
     `@vercel/firewall` against a Firewall rule (condition `@vercel/firewall`, Rate
     limit ID `contact`), answered **429**. Fails open while the rule is missing;
  5. **reCAPTCHA v3, built in but off** until both `RECAPTCHA_SECRET_KEY` (server) and
     `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` (inlined at build: redeploy) are set. Score ≥ 0.5,
     action `contact`, fail closed; Google's script loads only once a visitor uses the
     form. Before setting the keys, the privacy and cookie policies must name
     reCAPTCHA (Google).

  A request layers 1, 2, 3 or 5 catch gets the same 200 as a delivered message and
  nothing is sent or stored, so the answer teaches a bot nothing. BotID and the rate
  limit fail open (logged), so an outage can't take the form down.
- **Escape user input in emails.** The notification email escapes every field
  (`lib/contact/email.ts`, tested); until 2026-11-08 they were interpolated raw.
- **The mail server's TLS certificate is always verified** (`lib/contact/smtp.ts`,
  tested). Until 2026-11-12 the route set `rejectUnauthorized: false`, so any certificate
  passed and whoever sat on the network path could read every message and the mailbox
  password. The transport reads `SMTP_HOST` (default `cloud342.c-f.ro`), `SMTP_PORT`
  (465, TLS from the first byte), `SMTP_USER`, `SMTP_PASS`. A server that doesn't verify
  as it is gets the setting it needs, never verification turned off:
  - `SMTP_TLS_SERVERNAME`: the name its certificate carries, when `SMTP_HOST` is an IP or
    an alias the certificate doesn't list;
  - `SMTP_TLS_CA`: the PEM of its private CA (or its self-signed certificate). Set, it
    replaces the public CAs for this connection; line breaks may be written `\n`.

  No switch turns verification off: not the dashboard's `SMTP_REJECT_UNAUTHORIZED`, not
  even `NODE_TLS_REJECT_UNAUTHORIZED=0` (`rejectUnauthorized: true` is explicit).
- **Never send a real email or insert a real lead when testing**: the route test mocks
  SMTP, Supabase, BotID, the firewall and Google; a local `npm start` points `SMTP_HOST`
  at a test server on 127.0.0.1, whose certificate `SMTP_TLS_CA` and
  `SMTP_TLS_SERVERNAME` must then trust.

## Deploy / git

- Commit in this submodule, then **bump the submodule pointer in the parent repo**.
  Push order: submodule first (`git push origin main`), then the parent. End commit
  messages with the standard Co-Authored-By trailer.
- Vercel auto-deploys `main`. The live domain edge-caches — hard-refresh / cache-bust
  when verifying. Prefer confirming on the deployment/domain, not just locally.
