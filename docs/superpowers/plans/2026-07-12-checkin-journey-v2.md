# Check-in Journey v2 Implementation Plan

> **For agentic workers:** Executed INLINE by the session controller (user
> instruction: work directly on main, one commit per change, continue to
> completion). Verification gates (Playwright pass, translation review, final
> whole-branch review) are dispatched to independent subagents as in v1.

**Goal:** Replace the v1 single-scene animation with the 3-scene cinematic
version per `docs/superpowers/specs/2026-07-12-checkin-journey-v2-design.md`.

**Spec is the source of truth** for narrative, timeline, architecture, i18n
copy, a11y, and verification. This plan pins the numbers.

## Global Constraints

- Repo `/Users/danut/Desktop/logistiq/website`, npm, work on `main`, commit per task, `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>` trailer.
- Zero new npm deps. Only client component: `CheckinJourneyController`.
- All `cj2-*` animations: `27s linear infinite`, **NO `animation-delay`**
  (uniform WAAPI `currentTime` seeking must keep everything in sync).
- Base (unanimated) styles = scene-3 end state (reduced-motion frame).
- v1 `cj-*` CSS block in `globals.css` is REPLACED by `cj2-*` (v1 classes
  disappear from the codebase in the same commit that stops using them).

## Timeline constants (27s; 1s = 3.7037%)

| Event | s | % |
|---|---|---|
| Scene 1 visible | 0–8 | 0–29.63 |
| S1: hero truck enters → parks (slot 2) | 0.3–6.5 | 1.1–24.07 |
| S1: brake flash | 6.5–7.3 | 24.07–27.04 |
| Crossfade S1→S2 | 8–9 | 29.63–33.33 |
| Scene 2 visible | 9–18 | 33.33–66.67 |
| Phone: scan view | 9–11 | 33.33–40.74 |
| Phone: form view (rows stagger) | 11–13.5 | 40.74–50.00 |
| Phone: OK check | 13.5–14.5 | 50.00–53.70 |
| Phone: waiting/hourglass | 14.5–16 | 53.70–59.26 |
| Phone: assigned (RAMPA 12) | 16–18 | 59.26–66.67 |
| Crossfade S2→S3 | 18–19 | 66.67–70.37 |
| Scene 3 visible | 19–26 | 70.37–96.30 |
| S3: truck enters → stops at barrier (nose x=700, tx=452) | 19–21.5 | 70.37–79.63 |
| S3: gate scan pulse | 21.5–22.3 | 79.63–82.59 |
| S3: barrier rotates up | 22.3–23 | 82.59–85.19 |
| S3: truck drives to dock 12 (tx=902), door glow + badge | 23–25 | 85.19–92.59 |
| Reset fade (all scenes → S1) | 26–27 | 96.30–100 |

Card glow windows: card1 0→29.6% (fade-in 0–4%, out 29.6–33.3%), card2
33.3→66.7%, card3 70.4→96.3% (fade edges ~4% wide, centered on transitions).

Controller scene starts: `[0, 9000, 19000]` ms.

## Geometry (viewBox `0 0 1200 400`, ground y=344)

- **TruckArt** local coords: trailer x0–160 (ribbed, rear doors at x0, skirt,
  mudflaps, brake light class `cj2-brake` at rear top), chassis+fuel tank,
  cab x178–248 (raked windshield, side window, mirror, door seam+handle,
  grille, headlight, bumper, step, roof deflector), axles cy=331 r=13 at
  cx 34/62 (trailer) + 196/232 (tractor). Nose = x248. Gradient defs for
  trailer/cab volume. Prop `variant?: "hero" | "parked"` (parked → group
  class `cj2-parked`: opacity .45, saturate(.3)).
- **Scene 1:** apron rect(0,318,1200,50); slot lines at x=250/530/810/1090;
  parked trucks at translate(270,0) & (830,0); hero parks at tx=570 (enters
  from −300). Light poles decorative.
- **Scene 2:** dim parked silhouettes (opacity .15); driver figure ~(700–790,
  180–344) facing left: cap+head, amber hi-vis vest with 2 reflective
  stripes, extended arm toward phone, legs+shoes. Phone overlay (HTML)
  centered ~42% left, width `clamp(150px, 24%, 240px)`.
- **Scene 3:** gate QR post at x=620 (small 24×24 QR panel); booth 640–710;
  barrier post at 712, pivot translate(720,300), arm length 168 (rect x=4
  y=−6 w=168 h=12, stripes, `transform-box: fill-box; transform-origin: 0% 50%`,
  base rotate(−55deg)); warehouse 780–1180 with canopy rect(770,180,420,14)
  + supports, docks w=90 h=120 y=224 at x=800/930/1060 with digit labels
  10/11/12 (y=216); truck stops: barrier tx=452, dock tx=902; dock-12 glow
  + `dockBadge` pill above dock 12 (appear ≥92.59%; base visible).

## Tasks (commit each)

1. **i18n v2 copy** — update `checkinJourney` step1/2/3 Title+Desc in all 8
   locales per spec (RO source; native-quality drafts for the rest) +
   RO `dockBadge: "RAMPA 12"`. Gate: vitest i18n test + tsc.
   Commit: `feat(i18n): checkinJourney v2 step copy (3-scene flow) in all 8 locales`
2. **Scene v2 + CSS** — rewrite `CheckinJourneyScene.tsx` (TruckArt + 3 scene
   groups), replace `cj-*` CSS with `cj2-*` in `globals.css` (scene
   visibility, truck runs, brake flash, scan pulses, barrier, dock glow,
   badge, card glows, reduced-motion override). Gate: tsc + lint.
   Commit: `feat(features): 3-scene check-in journey — realistic truck art + cj2 timeline`
3. **Phone overlay** — new `CheckinJourneyPhone.tsx` (5 screen states,
   `t.qrgoDriver.*` + `dockBadge`, PhoneFrame visual language) + its `cj2-ph*`
   CSS. Gate: tsc + lint.
   Commit: `feat(features): realistic phone check-in overlay (scene 2)`
4. **Controller + section** — new `CheckinJourneyController.tsx` (client,
   cards-as-buttons, WAAPI seek to `[0,9000,19000]`), update
   `CheckinJourneySection.tsx` (stage container `relative aspect-[3/1]
   min-h-[240px]`, phone overlay mount, controller-wrapped cards). Gate:
   tsc + lint + test + build + curl (EN title renders; other feature pages
   still clean of `cj2-`).
   Commit: `feat(features): scene-jump controller + v2 section assembly`
5. **Visual + interaction pass (subagent, Playwright)** — desktop/mobile
   375px/reduced-motion/DE + NEW: click card 2 → assert an animation's
   `currentTime` ≈ 9000ms and phone visible; screenshots to scratchpad;
   minimal tuning authority (coordinates/timing only). Commit tweaks if any.
6. **Translation review (workflow)** — 6 native reviewers (de/pl/hu/bg/fr/nl)
   over the NEW step copy; apply corrections; vitest + tsc.
   Commit: `fix(i18n): native-review corrections for checkinJourney v2 copy`
7. **Final whole-branch review (fable subagent)** — base = commit before
   Task 1; apply Critical/Important (+cheap Minor) findings. Commit fixes.
8. **Ship** — push submodule, bump parent, push, verify live EN/RO
   (cache-busted) incl. `cj2-` marker.

## Interfaces

- `CheckinJourneyScene({ dockLabel }: { dockLabel: string })` — unchanged signature.
- `CheckinJourneyPhone({ t }: { t: Translations })`.
- `CheckinJourneyController({ cards, labels }: { cards: ReactNode[]; labels: string[] })` — renders `<ol role="list">` of `<li><button aria-label={labels[i]} onClick=seek>{cards[i]}</button></li>`; seek = `section.getAnimations({subtree:true}).forEach(a => a.currentTime = SCENE_STARTS_MS[i])`; section found via `closest("section")`.
- Section passes cards as server-rendered nodes (icons stay server-side).
