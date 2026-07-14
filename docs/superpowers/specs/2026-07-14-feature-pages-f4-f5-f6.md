# Feature Showcases — f4 Departments & Categories, f5 Reports & Analytics, f6 Android & iOS App

**Date:** 2026-07-14
**Status:** Approved (build all 3; f4 = Cargo-Routing auto framing; f6 = real store links)
**Pattern:** same as f1/f2/f3/f13 — a `<XyzShowcase>` Server Component registered in `showcases.tsx`, composed of `ShowcaseStage` (animated illustration) + `FeatureProblemSection` + `FeatureBenefitsSection` + `FeatureFAQSection`. New i18n block per page (`f4Page`/`f5Page`/`f6Page`) in **all 8 locales**. Grounded in a 3-agent codebase audit (2026-07-14).

## Global constraints
- Server Components by default; only animated leaves are `"use client"`.
- All copy in 8 locales; `translations.test.ts` derives keys from `ro`.
- Dark-only site; match the product's real palettes (below).
- Verify on a production build; respect `prefers-reduced-motion` + pause off-screen.
- No new npm deps — charts are hand-rolled SVG (no Recharts on the marketing site).

---

## f4 — Department & Truck Categories (orange, id 4)
**Real product:** `departments` (per-org: name + monochrome line-icon, one `is_entry_point`, ramps grouped many-to-many via `ramp_department_assignments`). `cargo_categories` + 9 `truck_type`s (truck, truck_trailer, truck_semi/TIR, tanker, platform, tipper, tarp, refrigerated, van). **"Cargo Routing"** config maps cargo→department (`cargo_category_departments`) — approved framing: **show it as auto-routing** ("set the rule once → trucks go to the right department"). Example dept names (from the product's own placeholder): Dry Goods, Frozen, Fruits, Vegetables.

**Illustration (`CategoryRoutingScene`, client):** a top-down board. Trucks arrive at a single **Entry gate**, each carrying a **cargo-category badge** (❄️ Frozen / 🥬 Vegetables / 📦 Dry Goods / 🍎 Fruits) + a **truck-type glyph**. A small "routing rules" chip (Frozen→Cold, Vegetables→Fresh, …) drives each truck into its matching **department lane** (3–4 lanes, each with its own ramps). Truck animates gate → correct lane → backs into a ramp. Palette: cargo accent **orange**, department selection **brand-blue**, type badges loading/unloading **blue** / both **purple**, real line-icon shapes (snowflake, leaf…). Reduced-motion = a populated static board.

**Content:** problem (every truck piles at one entrance; frozen + dry mixed; wrong docks) → benefits (operator: organise the yard into departments each with its own ramps + team; driver: routed to the exact zone for the cargo; manager: per-department dispatchers, ramps shareable across departments) → FAQ (many-to-many ramps? how many departments? does cargo route automatically? truck types?).

---

## f5 — Reports & Analytics (cyan, id 5)
**Real product (lots exists):** live status counters; **avg wait** (`assigned_at−checked_in_at`) & **avg completion** (`completed_at−assigned_at`); **utilisation %** gauge thresholds **>85 red / >60 amber / else emerald**; **loading/unloading/both** donut; per-department KPI cards; carrier **6-month trend bars + completion-rate ring + status-breakdown bars**. Recharts palette (canonical): loading `#3b82f6`, unloading `#f97316`, both `#8b5cf6`, available `#22c55e`, critical `#ef4444`, warning `#f59e0b`. Presets Today/7d/30d. NOTE: skip the fabricated `PlatformStatsSection` numbers — every KPI must map to a real `check_ins` field.

**Illustration (`AnalyticsPanel`, client):** a faithful analytics dashboard that animates in — a header with a period toggle (Today / 7d / 30d), **4 KPI tiles counting up** (Check-ins today, Avg wait, Avg completion, Dock utilisation % with the threshold gauge), a **throughput bar chart** (check-ins/day drawing in), a **type-distribution donut** (blue/orange/purple), and a **status funnel** (waiting→confirmed→assigned→in-progress→completed) as horizontal % bars. Hand-rolled SVG; `dataviz` skill for palette/labels/a11y. Reduced-motion = final static state.

**Content:** problem (no visibility into wait times / bottlenecks / utilisation; decisions by gut) → benefits (manager: KPIs + trends; owner: throughput + utilisation ROI; operator: live board) → FAQ (what's measured? real-time? date ranges? per-department?).

---

## f6 — Android & iOS App (pink, id 6)
**Real product:** **QRGO Driver** v2.12.0, theme `#2563EB`, blue-gradient "Q" mark. Screens: 12-language picker → **QR scan** (mobile_scanner) → rich **check-in form** → live **status** (generated QR of the check-in + ramp photos + "Open in Maps") → **chat** (typing, read-ticks, photos) → **push** (OneSignal+Firebase) → **geofence auto-check-in**. NOT present: biometrics, offline queue. Real store links: Google Play `https://play.google.com/store/apps/details?id=ro.qrgo.driver`; App Store `https://apps.apple.com/app/qrgo-driver/id6756977629` (via qrgo.ro `/android-app` `/ios-app`).

**Illustration (`AppTourScene`, client):** the shared **`PhoneFrame16`** running a cycling product tour through faithful re-creations of the real screens — (1) language picker, (2) QR scanner (black, blue corner-brackets + scan-line), (3) check-in form, (4) live status (status ring + generated QR + ramp card), (5) chat. Screens crossfade/slide on a loop. Beside it a **feature strip** (12 languages · QR scan · live status · chat & push · directions · auto-detect). Real **App Store + Google Play badges** (SVG, linking to the store URLs). App palette bg `#F8FAFC` / primary `#2563EB`.

**Content:** problem (drivers stuck at the gate; language barriers; no live info) → benefits (driver: native app in their language, scan-&-go, live status, chat, push; operator: reliable check-ins, fewer calls; manager: adoption) → FAQ (platforms, 12 languages, free for drivers, no account needed, how to get it).

---

## i18n & rollout
Author EN+RO for each page block; translate the other 6 via a parallel workflow; keep `translations.test.ts` green. Register f4/f5/f6 in `featureShowcases`. Verify each on a production build (Playwright), gate (tsc/lint/test/build), push submodule + parent, confirm live.
