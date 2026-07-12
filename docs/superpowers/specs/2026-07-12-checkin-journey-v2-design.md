# Check-in Journey v2 — 3-Scene Cinematic Redesign

**Date:** 2026-07-12
**Status:** Approved (design), pending implementation
**Supersedes:** the single-scene animation from `2026-07-12-checkin-journey-animation-design.md` (v1, shipped earlier today). v1 stays live until v2 replaces it in place.
**Page:** `/{locale}/features/<digital-check-in slug>` (feature id 1), all 8 locales

## Goal

Rebuild the animated section as a 3-scene story with a more realistic art
style, matching the real product flow: (1) truck arrives at a truck parking
lot; (2) close-up of the driver completing check-in on a large, realistic
phone (scan → form → OK → waiting → ramp assigned); (3) truck at the gate:
scan, barrier lifts, truck docks at the assigned ramp. User decisions:
auto-loop **plus click-a-step-card to jump to its scene**; new card copy
(approved RO source below); "doc" → "rampă" in RO (badge `RAMPA 12`).

## Master timeline (27s, all animations `27s linear infinite`)

| Segment | Time | % window |
|---|---|---|
| Scene 1 — Parking | 0–8s | 0–29.6% |
| crossfade | 8–9s | 29.6–33.3% |
| Scene 2 — Phone close-up | 9–18s | 33.3–66.7% |
| crossfade | 18–19s | 66.7–70.4% |
| Scene 3 — Gate & ramp | 19–26s | 70.4–96.3% |
| reset fade | 26–27s | 96.3–100% |

Step cards glow in sync: card 1 ≙ scene 1 window, card 2 ≙ scene 2, card 3 ≙ scene 3 (crossfade edges centered on the transitions, same approach as v1).

### Scene 1 — Parking (0–8s)
Asphalt parking band with white slot markings; two parked trucks (dimmed
silhouette variants of the shared truck art) with an empty middle slot. The
hero truck enters from the left, decelerates, parks in the empty slot; brief
brake-light flash on stop.

### Scene 2 — Phone close-up (9–18s)
SVG backdrop: dimmed parking silhouette + flat-vector driver (hi-vis vest
with reflective stripes, cap) holding the phone. Foreground: a LARGE
realistic phone as an **HTML overlay** (PhoneFrame visual language: slate-800
frame, notch, rounded screen, blue app header with `t.qrgoDriver.warehouseName`).
Screen states (sequential, crossfading within the screen):

1. **Scan** (9–11s): camera viewfinder, corner brackets, QR (reuse `QRCodeSVG`), scan line sweep, brackets flash green.
2. **Form** (11–13.5s): rows appear sequentially — `driverNameLabel: driverName`, `driverPhoneLabel: driverPhone`, one skeleton row (truck plate), then a primary button fills/presses.
3. **OK** (13.5–14.5s): green check pops over the form.
4. **Waiting** (14.5–16s): hourglass icon (subtle flip/pulse) + `t.qrgoDriver.waiting` + animated ellipsis.
5. **Assigned** (16–18s): assignment card slides up — green check, `t.qrgoDriver.assigned`, `t.qrgoDriver.assignedDesc`, big `t.checkinJourney.dockBadge` (e.g. RAMPA 12).

All phone copy uses EXISTING localized keys (`t.qrgoDriver.*` — present in
all 8 locales) + `checkinJourney.dockBadge`. No new phone i18n keys.

### Scene 3 — Gate & ramp (19–26s)
Refined v1 set: gate booth + barrier + warehouse with canopy and three
numbered dock doors (10 / 11 / 12 — digits only, locale-neutral). Truck
arrives, brief scan pulse at the gate QR post, barrier rotates up around its
left pivot, truck drives in and STOPS at dock 12 (door glows, `dockBadge`
badge above). End state: truck docked — this is also the reduced-motion
static frame.

## Realism upgrades

- **`TruckArt`** (shared SVG subcomponent, drawn once, used for hero + parked
  silhouettes): cab with raked windshield + pillar, side window, mirror, door
  seam + handle, grille slats, headlight, bumper, entry step, fuel tank, roof
  deflector; ribbed trailer (vertical panel lines), rear door hinges, side
  skirt, mudflaps, 3 detailed axles (rims + hubs); subtle `linearGradient`
  for volume. Flat-modern, slate/blue palette — realistic but on-brand.
- **Driver figure** (scene 2 only): flat-vector, hi-vis vest with stripes, cap, holding the phone.
- Warehouse with canopy + numbered docks; parking with slot markings.

## Architecture

| Unit | Type | Responsibility |
|---|---|---|
| `CheckinJourneyScene.tsx` | Server | Rewritten: 3 `<g class="cj2-s1/s2/s3">` scene groups on one 27s timeline; contains `TruckArt`. Decorative (`aria-hidden`). |
| `CheckinJourneyPhone.tsx` | Server | HTML phone overlay (PhoneFrame language), 5 screen states, receives `t`; visibility follows the scene-2 window via `cj2-*` classes. Sized with `clamp()` so it stays legible on mobile independent of the SVG scale. |
| `CheckinJourneyController.tsx` | Client (leaf) | The ONLY client code: renders the three step cards as `<button>`s (aria-label = step title) and on click seeks every animation under the section to the scene's start via `element.getAnimations({subtree:true})` → `currentTime = ms`. No-op when animations are disabled (reduced motion). |
| `CheckinJourneySection.tsx` | Server | Updated shell: heading, stage container (SVG + phone overlay, `relative`), controller-wrapped cards. |
| `globals.css` | — | v1 `cj-*` block REPLACED by the `cj2-*` block (keyframes + reduced-motion override). |

Stage container: `aspect-[3/1]` with a `min-h` floor on small screens; the
SVG letterboxes invisibly (`meet`, dark panel bg) while the phone overlay
uses the full container height — mobile readability without duplicating the
scene.

## i18n (all 8 locales)

Updated `checkinJourney` step copy — RO source (user-approved):

| Key | RO |
|---|---|
| `step1Title` | Sosire în parcare |
| `step1Desc` | Camionul ajunge la depozit și parchează în zona de așteptare, alături de celelalte camioane. |
| `step2Title` | Check-in de pe telefon |
| `step2Desc` | Șoferul scanează codul QR, completează datele și primește confirmarea — apoi rampa alocată: Rampa 12. |
| `step3Title` | Acces la rampă |
| `step3Desc` | La poartă, scanarea deschide bariera, iar camionul merge direct la rampa alocată. |
| `dockBadge` | RAMPA 12 (RO changes from DOC 12; other locales keep their reviewed terms) |

`title`, `subtitle`, `stepLabel` unchanged. en/de/pl/hu/bg/fr/nl translated
natively at implementation; the same 6-locale native-review workflow as v1
runs before ship. The structural vitest test continues to pass unchanged.

## A11y, reduced motion, mobile

- SVG + phone overlay `aria-hidden`; the full story remains as real text in
  the cards (`<ol role="list">`, `h2` + `aria-labelledby`).
- Cards are real `<button>`s (keyboard focusable, `aria-label` = localized step title).
- Reduced motion: `cj2-*` explicit `animation: none` override; base
  (unanimated) styles compose the scene-3 end state (truck docked, barrier
  up, badge visible); phone overlay hidden at rest; controller no-ops.
- Mobile (375px): no horizontal scroll; cards stack; phone overlay `clamp()`
  keeps scene 2 readable; verified in the Playwright pass.

## Out of scope

Scenes for other features; sound; scroll-driven animation; new deps
(zero new npm packages — the controller uses the native Web Animations API).

## Verification & delivery

Work directly on `main`, one commit per change (user instruction). Gates:
1. `npx tsc --noEmit`, `npm run lint`, `npm run test`, `npm run build` after each task.
2. Playwright: desktop + 375px + reduced-motion + DE locale; NEW: click each
   card and assert the timeline jumps to that scene (read `currentTime` of an
   animation after click).
3. 6-locale native translation review (workflow) for the new step copy.
4. Final whole-branch review before push.
5. Push submodule → bump parent → verify live on logistiq.ro.
