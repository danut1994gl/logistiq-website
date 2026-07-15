# Pending feature-page work (queued 2026-07-15)

The user's task list, captured verbatim-in-substance so any session can resume it.
Work **A → B → C, in order**. Same rules as always: ground every illustration in the
real app (read the code / drive the live app), all copy in **all 8 locales**, gate
with tsc + lint + `npm test` + `npm run build`, verify on a production build with
Playwright, then push submodule → bump parent.

## A. Fixes to the pages that are already live

1. **f6 layering bug** — the back device's (AndroidFrame) signal/battery status
   glyphs render *over* the iPhone. Fix the stacking so the back phone sits
   strictly behind the iPhone (z-index / overflow).
2. **Mockup proportions** — content inside every phone mockup must be correctly
   scaled relative to the phone (things are too large/small vs. the device).
3. **Check-in status screen** — re-verify against the real app and include **all**
   the information that actually appears there (not just status + dock + Maps).
   Real mapping already confirmed: waiting = yellow hourglass (spins),
   confirmed = blue check, assigned = **purple map-pin**, in_progress = indigo truck,
   completed = green flag. Card = blue-gradient header + Live pill; sections use
   `w-10 h-10 rounded-full bg-theme-100` icon circles; "what to do", ramp card with
   photo carousel + "Open in Maps", timeline, check-in info, timestamps, Cancel.
4. **Left column icons (f6 feature strip)** — vertically centre the icons at the top.
5. **Language screen** — add a top-to-bottom highlight/sweep animation over the
   12 language rows.
6. **Audit the f6 screens** for anything else that can better reflect reality.
7. **Feature pages** — add a bit more spacing under the hero section (currently too
   tight after the `compact` PageHero change).
8. **f4 Department & Truck Categories** — only **refrigerated** trailers may route to
   **Cold Storage**; and fix the cold-storage icon (the snowflake looks unreal).
9. **f13 YMS** — during drag-and-drop the drop target (ramp / parking spot) must NOT
   disappear: **highlight** the target ramp/spot as the truck approaches, only right
   before the drop. Also: when the site's **Features menu** is open, the
   illustration's cursor arrow renders *over* the menu — it must render under it.
10. **f13 YMS sidebar** — the text in the right-hand detail sidebar is too small
    relative to the rest; increase it.

## B. Build the remaining feature showcases (same model as f1–f6, f13)

- **f7 Multi-language** — illustration idea from the user: several drivers speaking
  different languages (12 languages).
- **f9 Cloud – No Equipment** — a cloud in the middle labelled **Logistiq.cloud**,
  warehouses connected to it, communicating **bidirectionally**.
- **f8 White-Label & API**, **f10 Driver Instructions & Guidance**,
  **f11 Early Check-in & Scheduling**, **f12 Automatic Location Detection** —
  brainstorm, and **read the app** first to learn how each really works so the page
  reflects real functionality.

## C. NEW feature: "Driver Self Check" (QRGO Self kiosk)

Add a **new feature/menu entry**. Functionality to be implemented later; the page
markets it now.

- Warehouses get a **tablet + printer** at the office — the driver checks himself in
  at the **"QRGO Self" counter/kiosk**.
- Flow: driver does the check-in on the kiosk (**identical form to the app**) →
  enters his **phone number** → **confirms it via SMS** → gets a **printed ticket** →
  is **notified by SMS** what to do next.
- Purpose: drivers **without a smartphone**, or where the app can't be used.
- The system works exactly the same — only the driver is notified via **SMS**
  instead of push.
- **Illustration**: like the Digital Check-in journey, but modified — the driver does
  NOT check in in the app; he walks to the **counter/kiosk**, checks in there, gets a
  **ticket**, receives an **SMS**, and enters the site to **ramp 12**.

## Context pointers
- Showcase registry: `src/components/features/showcases.tsx` (ids → component).
- Shared: `PhoneFrame16.tsx` (1:1 iPhone 16 Pro Max: body 776/1630, bezel 3.02cqw,
  radius 13.24/16.26cqw, DI 26.7×7.83cqw), `AndroidFrame.tsx`, `ShowcaseStage`,
  `FeatureProblemSection`, `FeatureBenefitsSection`, `FeatureFAQSection`, `flags.tsx`
  (12 flags incl. IT/ES/CZ/SK, all accept `className`).
- Real driver web = `qrgo.ro/[slug]` (DARK). Real orgs: `bucuresti-logistic`, `tecuci`.
- Real store links: App Store `apps.apple.com/app/qrgo-driver/id6756977629`,
  Play `play.google.com/store/apps/details?id=ro.qrgo.driver`.
- i18n: one block per page (`f4Page`/`f5Page`/`f6Page`…) in every locale; the `ro`
  block is the type contract and **all 8 locales must have every key** or tsc fails.
