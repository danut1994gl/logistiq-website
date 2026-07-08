# SEO Audit + OG Image — Design Spec

**Date:** 2026-07-07
**Scope:** `website/` (marketing site, Next.js 16 App Router, 8 locales, domain `logistiq.ro`)
**Status:** Approved — implementing

## Context

The Logistiq marketing site already has a solid SEO foundation: `metadataBase`,
canonical + hreflang (8 locales), JSON-LD `@graph`
(Organization / WebSite / SoftwareApplication / WebPage), `robots`, `sitemap`,
`manifest`, viewport, apple-web-app metadata, per-locale keywords.

This round fixes the real gaps found in the audit and adds the missing social
share image.

## Audit findings

| # | Issue | Location | Severity |
|---|-------|----------|----------|
| 1 | `og-image.png` referenced but file **missing** from `public/` | `app/[locale]/layout.tsx` openGraph/twitter | 🔴 no social preview |
| 2 | Google verification placeholder `"your-google-verification-code"` emits bogus meta | `app/[locale]/layout.tsx` verification | 🔴 |
| 3 | Fabricated `aggregateRating` (4.8 / 150) hardcoded in SoftwareApplication | `app/[locale]/layout.tsx` JSON-LD | 🟠 against Google guidelines |
| 4 | Placeholder phone `+40-xxx-xxx-xxx` in contactPoint | `app/[locale]/layout.tsx` JSON-LD | 🟠 invalid |
| 5 | `SearchAction` targets non-existent `/search?q=` | `app/[locale]/layout.tsx` JSON-LD | 🟠 invalid potentialAction |
| 6 | No `FAQPage` schema despite 14 real Q&A in translations | `translations.ts` `faq.*` | 🟡 missed rich result |
| 7 | Static `public/robots.txt` **and** dynamic `app/robots.ts` coexist, rules differ | both | 🟡 conflict |
| 8 | `sameAs` / `@twitter` handles possibly non-existent | JSON-LD / twitter meta | 🟡 broken signals |
| 9 | Theme color mismatch: viewport `#1e40af` vs manifest `#2563eb` | layout / manifest | 🟢 minor |

## Approved design

### OG image (`public/og-image.png`, 1200×630) — Direction A

Bird's-eye truck yard + foreground phone.

- **Background:** brand gradient (deep blue → indigo, aligned to `#1e40af`/`#2563eb`).
- **Isometric top-down yard:** warehouse edge with 3–4 numbered loading-dock bays,
  trailers docked into bays, painted parking-lot lines, 1–2 trucks queued, QR ground markers.
- **Foreground:** tilted phone showing the QR check-in screen (QR code + "Check-in" +
  truck-number field + green confirm check) — the Logistiq / QRGO app.
- **Branding:** Logistiq logo + wordmark top-left; `logistiq.ro` bottom-right.
- **Text:** minimal, mostly language-neutral so one image serves all 8 locales.
  Short neutral EN tagline "Digital check-in for drivers" (localized title/description
  still come from per-locale meta tags).
- **Style:** clean flat/isometric, brand blues + one accent (green/amber on the check),
  subtle depth shadows.

**Build method:** design as a self-contained 1200×630 HTML file → render with
Playwright → export `public/og-image.png`. Show rendered PNG to user, iterate, then save.

**Final implementation (evolved during iteration):**
- The yard illustration became a **real 3D scene rendered with Three.js** (WebGL) —
  warehouse + numbered dock doors (1 / 2 / 3, dock 2 = assigned/orange), three semi-trucks
  reversing into docks, real directional light + soft shadow maps, centered camera (keeps
  left-right symmetry). Modern/minimalist per user direction.
- 2D overlays (HTML/CSS/SVG): headline, real **Logistiq** + **QRGO** logos, hand-built
  **iPhone 16 Pro Max** mockup, generated QR, orange routing beam, and a **QRGO Driver**
  app promo (Web / Android / iOS badges).
- Branding on the image uses **logistiq.cloud** (user choice) — note this differs from the
  site's SEO base URL, still `logistiq.ro`.
- Rendered via Playwright + html2canvas → `public/og-image.png` (2400×1260, 2×).
- Source kept re-editable at `scripts/og/og-image.html`.

### Fixes (all approved; placeholders removed, not faked)

1. **OG image** created → existing `/og-image.png` reference activates automatically.
2. **Google verification** → remove hardcoded placeholder; make env-driven
   (`process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`), omit meta when unset.
3. **aggregateRating** → remove from SoftwareApplication (no genuine collected reviews).
4. **contactPoint.telephone** → remove placeholder until a real number exists.
5. **SearchAction** → remove `potentialAction` (no `/search` page).
6. **FAQPage schema** → add a new node to `@graph`, built from the 14 per-locale `faq.*`
   translation pairs.
7. **robots** → delete static `public/robots.txt`, keep dynamic `app/robots.ts` as the
   single source; align disallow rules.
8. **Theme color** → unify viewport `themeColor` and manifest `theme_color` to one value.
9. **sameAs / @twitter** → removed unless real accounts confirmed (user opted to remove
   placeholders this round).

## Out of scope / follow-ups

- Real phone number, LinkedIn/Twitter handles, Google verification code (user supplies later).
- Per-locale OG images (YAGNI — single neutral image chosen).
- `BreadcrumbList` schema on legal pages (privacy/terms/cookies).
- `Product`/`Offer` schema from real pricing (`price5/10/25`) replacing `offerCount:2`.

## Verification

- `pnpm type-check` / build passes.
- OG PNG renders at exactly 1200×630.
- JSON-LD parses (valid `@graph`, FAQPage present, no fake rating / placeholders).
