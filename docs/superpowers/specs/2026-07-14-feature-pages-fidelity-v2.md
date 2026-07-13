# Feature Pages — Fidelity Rework v2

**Date:** 2026-07-14 · **Status:** Approved, building
**Pages:** Dock Management (feature 2), Chat & Notifications (feature 3), YMS (feature 13)

Grounded in a codebase+DB audit of the REAL product (`apps/dashboard` chat/yard/checkins, `apps/driver` ChatModal, `apps/driver-mobile`, live `yard_layouts`/`check_in_messages`).

## Shared: iPhone 16 Pro Max frame
`PhoneFrame16.tsx` (Server, presentational, own `@container`): titanium frame, ~19.5:9, big corner radius, **Dynamic Island** pill (centered), status bar (time + signal/wifi/battery). `children` = screen. Used by Chat + Notifications. Replaces the ad-hoc phone frames for consistency.

## 1. Chat & Notifications — realistic, scrollable, 5 looping scenarios
`ChatPlayer.tsx` (**client** interactive leaf; reduced-motion → static full thread; IntersectionObserver pauses off-screen). Faithful to the real UI:
- **Phone (driver):** blue gradient header ("Chat" + "…is typing"), 32px avatars (dispatcher blue initials / driver amber truck), name+role line, bubbles (driver filled blue `rounded-br`, dispatcher grey `rounded-bl`), timestamps, double-check ticks grey→blue on driver messages, image messages (CMR thumbnail max-h), input bar (emoji/camera/gallery + field + send). Auto-scroll to bottom; typing-dots row on the other side.
- **Dashboard (dispatcher):** embedded panel, no header, dispatcher bubbles right/blue, typing-dots row.
- **5 scenarios** (localized per page locale) loop in sequence: (S1) arrival no appointment → "wait, we'll notify in the app" → dock assigned; (S2) CMR photo request → driver sends photo; (S3) driver waiting → "~15 min"; (S4) come to the office; (S5) damaged pallets → 2 photos. i18n keys `s{n}m{k}` (text only; from/type/image in component).
- **Notifications scene:** unchanged content; swap to `PhoneFrame16`.

## 2. YMS — professional top-down yard, warehouse-centered (TALLER frame)
New `YardScene`, an iconic dispatch-office yard view (per user: warehouse in the MIDDLE, ramps around it, a parking area, a gate; make the frame TALLER to fit it all). Composition:
- **Central warehouse building** (rounded rect, gray #6b7280, roof-hatch texture, "WAREHOUSE" label).
- **Dock doors around it** — a row of numbered docks along the warehouse's top edge and another along the bottom edge, each with a bay notch; several occupied by backed-in trailer+cab truck silhouettes coloured by operation (loading #c07070 / unloading #6a9e7e / both #8e7ab8).
- **Parking lot** to one side (e.g. left): a titled card ("Parking N/10" + utilization bar) with a grid of dashed stalls, some occupied by cab-at-bottom trucks.
- **Gate + boom barrier** at the yard entrance (amber #f59e0b), road leading in; **fence** around the perimeter.
- **Open maneuvering yard** (canvas tone) with a floating waiting-truck token, plus the moving truck: **gate → parking stall → backs into a dock**, changing status colour; idle badge amber→red.
- **Legend panel** bottom-right (5 status truck glyphs), like the real app.
- **Taller frame**: stage `aspect-[3/2]` desktop (was 12/5) so warehouse + surrounding docks + parking + gate all fit and read professionally.
Real palette: loading #c07070, unloading #6a9e7e, both #8e7ab8, waiting #eab308, confirmed #3b82f6, available #22c55e, idle #f59e0b/#ef4444, gate #f59e0b, warehouse #6b7280, canvas #0f172a/#1f2937. Truck silhouette = trailer (rounded top + panel lines) + coupling bar + dark cab (#374151) + windshield band. CSS `ym2-*` (verify via production build — dev CSS chunk can go stale).

## 3. Dock Management — taller, 5 looping situations
`DockBoardPlayer.tsx` (**client**), taller frame, faithful to the dashboard: a **check-ins queue** (status badges: waiting yellow pulsing, confirmed blue, assigned purple, in_progress indigo, completed green, cancelled grey) + a **ramps overview** (department groups; occupied tiles gradient by type loading-orange/unloading-blue/both-purple, empty = dashed "Available"). Cursor + action menu drive **5 real situations** looping: (1) wait → assign; (2) assign Dock 4 → reassign Dock 2 (frees + lights); (3) call to office (banner, dock unchanged); (4) complete → dock freed → next waiting truck assigned; (5) cancel/reject (row greys, leaves board). i18n dock labels (statuses, actions, toasts).

## i18n & delivery
New keys: `chatPage.s*m*` (+ typing/labels), `dockPage` action/status labels; YMS reuses existing legend keys. Author EN+RO, translate 6 locales via the per-locale Workflow, native-review. Regression tests updated. Gate tsc/lint/vitest/build; verify each page (production build for CSS scenes, dev for client players); push submodule → bump parent → live verify. Client players keep the "no new globals.css animation" path so dev-server renders them correctly.
