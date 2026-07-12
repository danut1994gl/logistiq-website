# Check-in Journey Animation — Feature Page Showcase

**Date:** 2026-07-12
**Status:** Approved (design), pending implementation
**Page:** `/{locale}/features/<digital-check-in slug>` (feature id 1), all 8 locales

## Goal

Add an animated, self-explanatory illustration of the 3-step driver check-in
process directly under the hero on the Digital Check-in feature page. Audience
is large-warehouse decision makers: the section must look professional
(enterprise, not cartoonish) and be instantly understandable. Visual design
must be fully consistent with the existing logistiq.ro design system.

## Approach (decided)

Hand-built **SVG + CSS keyframe animation** — no Lottie, no framer-motion, no
new dependencies. Matches the site's golden rules: Server Components + pure
CSS animation, existing tokens/keyframes, `prefers-reduced-motion` support.

Layout (decided): **panoramic scene on top, 3 step cards below**, active card
highlighted in sync with the scene. Truck journey reads left → right.

## Architecture

### Per-feature showcase slot

- `src/components/features/showcases.tsx` exports
  `featureShowcases: Record<number, FC<{ t: Translations }>>` — the map from
  `feature.id` to its showcase component. Only feature 1 (Digital Check-in)
  has one today; the other 11 pages render unchanged. Future feature scenes
  plug into the same map without touching the template. (Kept out of
  `lib/features.ts` so the data registry stays free of component imports.)
- Rendered in `src/app/[locale]/(marketing)/features/[slug]/page.tsx` between
  `PageHero` and the "Related features" section.

### Components (new, under `src/components/features/`)

| Component | Type | Purpose |
|---|---|---|
| `CheckinJourneySection` | Server | Section shell: `h2` heading, scene, step cards. Receives `t` (Translations). |
| `CheckinJourneyScene` | Server | Panoramic SVG scene (decorative, `aria-hidden`), all motion via CSS keyframes. |
| Step cards | inline in section | Same visual style as homepage `HowItWorksSection` cards (number badge, icon, title, description). |

Optional micro-enhancement (only if trivial): a tiny `"use client"` wrapper
that toggles `animation-play-state` when the section enters the viewport
(IntersectionObserver). Not required for v1; the loop is fine starting at load.

## Animation spec

One master loop of **~13s** (12s of phases + ~1s settle/reset fade). All scene
elements and the three step cards share the same `animation-duration` and
phase-offset keyframes, so the active card highlight is synchronized with the
scene **without JavaScript**.

| Phase | Time | Scene | Active card |
|---|---|---|---|
| 1 — Arrival | 0–4s | Truck enters from left, decelerates, stops at the gate booth. | Step 01 ring+glow |
| 2 — QR scan | 4–8s | Driver's phone (miniature `PhoneFrame` style) appears by the gate panel; scan line sweeps the QR (`QRCodeSVG` reuse); cyan pulse rings. | Step 02 ring+glow |
| 3 — Confirmed | 8–12s | Green check pops, dock badge appears (localized label, e.g. "DOC 12"), barrier arm rotates up, truck drives through. | Step 03 ring+glow |
| reset | 12–13s | Short fade, loop restarts. | none |

Scene contents: warehouse silhouette with dock doors, gate booth with QR
panel, barrier, road line. Style: slate-800/900 surfaces, `--primary #2563eb`,
`--accent #06b6d4` (cyan) for scan effects, green only for the confirmation,
subtle `pulse-glow`. Both light and dark classes, matching existing mockups.

`prefers-reduced-motion`: the globals.css block already freezes animations;
keyframes must be authored so the frozen frame reads as a complete static
scene (truck at gate, QR visible, check + barrier up). Add explicit
reduced-motion overrides if the frozen first frame is not meaningful.

## Copy & i18n

New translations block `checkinJourney` added to **all 8 locales**
(`ro en de pl hu bg fr nl`) in `src/lib/i18n/translations.ts` (the
`Translations` type contract enforces completeness at compile time):

| Key | RO (source, user-provided) | EN |
|---|---|---|
| `title` | Cum funcționează check-in-ul digital | How digital check-in works |
| `step1Title` | Sosire la depozit | Arrival at the warehouse |
| `step1Desc` | Camionul ajunge la poartă și oprește în parcare. | The truck arrives at the gate and stops in the parking area. |
| `step2Title` | Scanare cod QR | Scan the QR code |
| `step2Desc` | Șoferul scanează codul de la poartă cu telefonul. | The driver scans the gate code with their phone. |
| `step3Title` | Check-in digital | Digital check-in |
| `step3Desc` | Check-in confirmat, doc alocat, bariera se ridică. | Check-in confirmed, dock assigned, the barrier lifts. |
| `stepLabel` | PAS | STEP |
| `dockBadge` | DOC 12 | DOCK 12 |

de/pl/hu/bg/fr/nl: native-quality translations produced during implementation
(multi-agent translation + review pass), same keys.

In-scene text is limited to the dock badge (localized via `dockBadge`); the
green confirmation is icon-only. Everything else is real HTML text in the
cards (translatable, indexable).

## Accessibility & SEO

- SVG scene: `aria-hidden="true"`, decorative only. No information exists
  solely in the animation — the three cards carry the full story as text.
- Section: semantic `<h2>` (localized `title`), cards as an ordered list
  (`<ol>`), step numbers visible.
- No metadata/JSON-LD changes needed (content enriches the existing WebPage).

## Out of scope

- Scenes for the other 11 feature pages (slot makes them possible later).
- Scrollytelling / scroll-driven animation; Lottie; new runtime deps.
- Any change to hero, related-features, or CTA sections.

## Verification

1. `npm run build` passes (type contract catches missing locale keys).
2. Playwright: load `/en/features/digital-check-in` and
   `/ro/features/check-in-digital`, screenshot the section, verify scene +
   cards render and highlight cycles; spot-check one more locale (de).
3. Reduced-motion check (emulate `prefers-reduced-motion`): static scene reads
   complete.
4. Multi-agent code review of the diff before commit.
5. Commit in the website submodule, then bump the submodule pointer in the
   parent repo (push order: submodule → parent).
