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

**Goal (per user):** NOT a literal reproduction of the saved layout — an **intuitive top-down illustration** that makes a first-time website visitor instantly understand the YMS: *"Logistiq shows my whole yard live from above — every truck colour-coded by status — and I route trucks to docks with a click; the driver is directed automatically."* Comprehension and clean proportions win over exact geometry. Keep the **real palette and status semantics**; borrow the real layout's *ingredients* (warehouse, docks, parking, gate/entry, fence, colour-coded trucks) but size and arrange them for clarity.

**Composition (top-down SVG, taller frame, dark palette):**
1. **Warehouse** building clearly labelled "WAREHOUSE" with subtle hatch texture.
2. **A clean, readable row of loading docks** (≈6–7, numbered) along the warehouse edge — large enough that a backed-in truck, the dock number, and the occupied/empty state all read at a glance. A few docks occupied (backed-in trailer+cab tokens colour-coded by operation), the rest empty and numbered. Legibility over literal 13-bay density.
3. **Parking / waiting area** clearly labelled, with a few stalls (some occupied, some empty) — the "trucks waiting for a dock" zone.
4. **Gate / entrance** where trucks enter the yard (amber boom).
5. **Colour-coded trucks** with plate labels + small idle badges, placed so the status colours are obvious.
6. **Fence** suggesting the yard perimeter; **legend** naming the 5 status colours with truck glyphs.

**Exact palette (dark theme):** loading `#c07070`, unloading `#6a9e7e`, both `#8e7ab8`, statusWaiting `#eab308`, statusConfirmed `#3b82f6`, floating/unassigned `#94a3b8`, warehouse `#4b5563`, canvas `#1f2937`, border `#374151`, gate/amber `#f59e0b`, cab `#374151`, coupling `#4b5563`.

**Animation — the "aha" that teaches the feature (one shared loop, taller frame):** a truck **enters the gate** → **waits in the yard as a yellow badge** → **is assigned and drives to an open dock, backing in** (colour shifts to loading/unloading, the dock reads occupied) → resets. The viewer sees the live yard + the routing in one loop. Reduced-motion = a populated static yard.

---

## Page 3 — Dock Management (`DockBoardPlayer.tsx` fidelity pass, taller)

**Real UI to match** (`DashboardRampsOverview`): tiles **grouped by department** — header = building icon + department name + "occupied/total". A **legend**: arrow-down = unloading (blue), arrow-up = loading (orange), dual-arrow = both (purple), gray dot = available. **Occupied tile** = gradient by type (orange/blue/purple) + **type-arrow icon top-right** + dock name + **driver name** + type label + truck number; **empty** = dashed "Available". Waiting is the one status the board **pulses**. Status set: waiting (yellow/hourglass) → confirmed (blue/check-circle) → assigned (purple/warehouse) → in_progress (indigo/spinning) → completed (green/flag) / cancelled (gray/ban).

**Render — a taller "live operator" simulation (per user direction 2026-07-14):** the point is that a visitor watches an operator *work the board* and understands the whole flow. A **longer waiting queue** (5) of rich check-in cards (image-2 style: avatar, name, plate · company, type badge with op arrow, wait time, optional Parking badge, an "Actions ▾" button) sits beside the **ramps overview** (Loading 1-4 / Unloading 5-8, dept headers with building icon + occupied/total). A **simulated cursor** moves to a **random** card, clicks, and the real **Actions menu** opens (image-3: Assign to ramp, Wait, Call to office, Send to parking, Cancel check-in — each with its coloured icon); a **random valid action** highlights and fires:
- **Assign** → the card fades out and a free dock in its department lights up (assigned → later in-progress); toast "Dock N assigned".
- **Wait** → wait time bumps; "all docks busy" toast.
- **Send to parking** → teal Parking badge, then the card leaves.
- **Call to office** → blue banner overlay; dock/status unchanged.
- **Cancel** → card fades off the board.
Docks cycle on their own (assigned → in-progress → complete frees the dock, "Unloading complete" toast). Everything enters/leaves with **fade + slide** so it reads as fluid and live. Trucks are drawn from a 16-plate pool with **no duplicate plate** ever on the board.

**Deltas from live:** the cursor-driven Actions-menu simulation; longer rich queue; department headers with occupied/total + building icon; type-arrow icons + op-coloured tiles; fade in/out. Use the **ramps-overview** type mapping (loading=orange ↑, unloading=blue ↓, both=purple ⇅) consistently (audit flags that the table uses red/green — do not use that pair).

---

## i18n
New keys go in the existing page blocks (`chatPage`, `ymsPage`, `dockPage`) across all 8 locales: chat sender-role labels + scenario lines; yard legend already present (reuse); dock activity-strip verbs + "occupied/total"/"Parking" style labels. Author EN+RO, translate the other 6 via a parallel workflow, keep `translations.test.ts` green.

## Verification & rollout
Per page: production build → Playwright screenshot on `localhost` → fix → repeat. Then `tsc`/`eslint`/`vitest`/`build` gate, push the submodule, bump the parent pointer, and confirm on the live domain.
