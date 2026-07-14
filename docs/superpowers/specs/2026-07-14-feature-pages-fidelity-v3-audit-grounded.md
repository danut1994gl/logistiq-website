# Feature Pages Fidelity v3 — Audit-Grounded Redesign

**Date:** 2026-07-14
**Status:** Approved (scope: all 3 pages, full fidelity; yard bay count at implementer discretion with balanced proportions)
**Supersedes/extends:** `2026-07-14-feature-pages-fidelity-v2.md`

## Source of truth

A 3-agent audit (`fidelity-audit-v2`, run `wf_9421cf34-427`) read the real product code + the customer's saved `yard_layouts.elements` JSONB and captured the exact UI, behavior, and palette for chat, the yard canvas, and the dock dashboard. This spec encodes those findings. Key real files:

- Chat: `apps/driver/components/chat/{ChatModal,ChatMessage,ChatInput,TypingIndicator}.tsx`, `apps/dashboard/components/checkins/chat/ChatTab.tsx`, `apps/driver-mobile/lib/features/chat/chat_modal.dart`
- Yard: `apps/dashboard/components/yard/constants.ts` + `elements/*.tsx` (`TruckElement`, `DockRowElement`, `ParkingGroupElement`, `WarehouseElement`, `FenceElement`, `YardLegend`)
- Dock: `apps/dashboard/components/dashboard/DashboardRampsOverview.tsx`, `components/checkins/{CheckinsTable,CheckinDetailModal}.tsx`, `lib/actions/checkin-actions.ts`

## Global constraints

- Server Components by default; only interactive/animated leaves are `"use client"`.
- All user-facing copy in **all 8 locales** (`ro en de pl hu bg fr nl`); `translations.test.ts` derives keys from the `ro` block.
- All phone mockups render inside the shared **`PhoneFrame16`** (iPhone 16 Pro Max).
- Dark-only site; use the dashboard **dark-theme** palette values for the yard.
- Verify each page on a **production build** (`npm run build && npm run start`) — the dev server serves stale CSS chunks for keyframe scenes; client players render fine in dev.
- Respect `prefers-reduced-motion` (static faithful frame) and pause when off-screen (IntersectionObserver).

---

## Page 1 — Chat & Notifications (`ChatPlayer.tsx` fidelity pass)

**Real UI to match:**
- **Driver phone header:** gradient `theme-600→700` bar; left close-X, a round `bg-white/20` badge with a comments icon, title **"Chat"** (generic — never the warehouse name), and under it a `text-theme-100 animate-pulse` "{name} is typing…" line (shows the *other* party typing).
- **Message row:** 32px avatar on the outer side — **dispatcher = blue-initials circle** (`bg-blue-100 text-blue-600`), **driver(own) = amber circle with truck icon** (`bg-amber-100 text-amber-600`). A `text-xs text-gray-400` **"{sender} ({role})"** caption above the bubble. Bubble `rounded-2xl max-w-[75%]`: **own = theme-600 white, tail `rounded-br-md`; other = gray-100 / dark gray-800, tail `rounded-bl-md`**. Timestamp `HH:mm` below; **own driver messages** get a `faCheckDouble` tick, **blue when read** else gray.
- **Image message:** thumbnail `rounded-xl max-h-64 object-cover` nearly filling a `p-1` bubble.
- **Typing (in-list):** 3 bouncing dots (`animate-bounce`, staggered 0/150/300ms) **+ "{name} is typing"** text, as the last row on the other side.
- **Input bar:** round emoji · camera · gallery buttons, auto-grow textarea, round `theme-600` send button.
- **Dashboard side:** embedded in the check-in detail (driver name · truck · status pill framing, no separate chat header); **own(dispatcher) bubbles = hardcoded blue-600**, driver bubbles gray.

**Render:** left dispatcher panel (check-in framing + chat), right `PhoneFrame16` with the exact gradient "Chat" header + thread. **5 looping bilingual field scenarios**, localized to the page language, with typing appearing on the opposite side each turn and auto-scroll to newest:
1. Arrived without a booking → dispatcher helps.
2. Dock assigned → "send me the CMR" → **driver replies with a photo message** → dispatcher confirms.
3. Wrong entrance → redirect to the correct gate.
4. Running late heads-up → dispatcher acknowledges.
5. "Come to the office for the documents."

**Deltas from live:** add sender-(role) captions; correct bubble tail corners; gradient "Chat" header + header typing line; one photo-message beat; dots+**text** typing style; blue-600 dispatcher bubbles.

---

## Page 2 — YMS / Yard (`YardScene.tsx` full rewrite)

**Real saved layout** (`yard_layouts.elements`): one **warehouse rectangle across the top**; directly beneath it a single `dock_row` with `dockStyle='angled-reverse'` (╱ sawtooth) of **13 docks** (28w×68deep parallelogram bays, 45° white dividers); a **parking_group card on the right** (`spotsPerRow=10`, 46w×166h portrait stalls, straight style, header + utilization strip); a **fence along the bottom**; open maneuvering yard between, holding floating unassigned-truck badges.

**Composition (top-down SVG, taller frame, dark palette):**
1. **Warehouse** rect spanning the top width — `#4b5563` fill, diagonal hatch (opacity 0.3), bold "WAREHOUSE" label.
2. **Angled dock apron** directly below: angled-reverse (╱) narrow parallelogram bays with 45° white dividers (opacity 0.8), numbered D1…Dn when empty. Bay **count and width chosen for balanced proportions and legibility** (target the real 13, enlarged only as needed so numbers/trucks read). Occupied bays draw an **angled trailer+cab silhouette rotated +45°** (rounded trailer with ~7 corrugation lines, `#4b5563` coupling bar, `#374151` cab + windshield band), colored by operation.
3. **Parking card, right:** `theme.surface` card, header "Parking 4/10" + utilization strip (green>85% purple / 60–85% amber / else), a column of tall portrait stalls (dashed empty; occupied = straight backed-in truck, **cab anchored to the bottom**).
4. **Fence** along the bottom: two thin rails + short posts every ~24px (`#6b7280` rails / `#9ca3af` posts).
5. **Open yard** (canvas `#1f2937`) holds 2–3 **floating truck badges** — 24px rounded token, plate (monospace) + department caption + a small idle badge ("45m").
6. **Legend** bottom-right: 5 tiny truck-glyph entries — Waiting `#eab308`, Confirmed `#3b82f6`, Loading `#c07070`, Unloading `#6a9e7e`, Both `#8e7ab8`.

**Exact palette (dark theme):** loading `#c07070`, unloading `#6a9e7e`, both `#8e7ab8`, statusWaiting `#eab308`, statusConfirmed `#3b82f6`, floating/unassigned `#94a3b8`, warehouse `#4b5563`, canvas `#1f2937`, border `#374151`, gate/amber `#f59e0b`, cab `#374151`, coupling `#4b5563`.

**Animation (one shared loop, taller frame):** a truck enters through a gap in the bottom fence → parks in the yard as a **yellow "waiting" badge** → drives up and **rotates to back into an angled dock bay** (color shifts loading/unloading) → resets. Reduced-motion = a populated static yard.

---

## Page 3 — Dock Management (`DockBoardPlayer.tsx` fidelity pass, taller)

**Real UI to match** (`DashboardRampsOverview`): tiles **grouped by department** — header = building icon + department name + "occupied/total". A **legend**: arrow-down = unloading (blue), arrow-up = loading (orange), dual-arrow = both (purple), gray dot = available. **Occupied tile** = gradient by type (orange/blue/purple) + **type-arrow icon top-right** + dock name + **driver name** + type label + truck number; **empty** = dashed "Available". Waiting is the one status the board **pulses**. Status set: waiting (yellow/hourglass) → confirmed (blue/check-circle) → assigned (purple/warehouse) → in_progress (indigo/spinning) → completed (green/flag) / cancelled (gray/ban).

**Render — taller board + a right-hand live activity strip** logging each action (timeline of "Assigned to Dock 4", "Wait 30 min", "Called to office", "Unloading complete", "Cancelled") to fill the height. **5 looping situations = the real dashboard flows** (from the audit's `dock-flow.realScenarios`):
1. Arrives (pulsing waiting) → **Confirm** → **Wait** (duration "30 min", "All docks busy" note) → **Assign** (tile flips purple).
2. Assign **Dock 4** → **reassign Dock 2** (Dock 4 frees to "Available", Dock 2 lights up).
3. **Call to Office** — blue banner overlays; **dock + status unchanged**.
4. `in_progress` on a dock → **Complete** ("Finish Unloading") → dock frees → **next waiting truck assigned to it** (loop).
5. **Cancel / sent away** → gray ban badge, row fades off the board.

**Deltas from live:** department headers with occupied/total + building icon; arrow-type legend; driver name + type-arrow icon on occupied tiles; real status icons; right-hand activity strip; taller frame. Use the **ramps-overview** type mapping (loading=orange, unloading=blue, both=purple) consistently (audit flags that the table uses red/green — do not use that pair).

---

## i18n
New keys go in the existing page blocks (`chatPage`, `ymsPage`, `dockPage`) across all 8 locales: chat sender-role labels + scenario lines; yard legend already present (reuse); dock activity-strip verbs + "occupied/total"/"Parking" style labels. Author EN+RO, translate the other 6 via a parallel workflow, keep `translations.test.ts` green.

## Verification & rollout
Per page: production build → Playwright screenshot on `localhost` → fix → repeat. Then `tsc`/`eslint`/`vitest`/`build` gate, push the submodule, bump the parent pointer, and confirm on the live domain.
