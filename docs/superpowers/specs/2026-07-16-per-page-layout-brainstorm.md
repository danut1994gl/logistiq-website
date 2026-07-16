# Per-page layout diversity — brainstorm + build plan

The complaint: *"toate paginile au exact acelasi layout... vreau ca fiecare pagina in
functie de particularitati, continut, ilustratii sa aiba diferite layouturile, nu trase
la indigo... si ordinea sa fie in ordinea importantei"*.

The kit already exists (`src/components/features/sections.tsx`): `flow`, `spec`,
`matrix`, `callout`, `facts`, `split`, plus `idPrefix` / `reverse` / `tinted` on the
three original sections. **f8, f15, f16, f17 already compose it.** The other twelve
still render the identical `stage → problem → benefits → faq`.

## The principle

Do NOT alternate `reverse` flags and call it diversity — that is wallpaper. The order
must follow **what the page is trying to prove**, and the extra section must exist
**only where the page has material the others do not**. A page with nothing to put in a
spec table should not get a spec table.

Three questions per page:
1. What is the single most convincing thing we can say? → that section goes FIRST.
2. What does this page have that no other page has? → that earns a non-standard section.
3. What is the honest limit a buyer will hit? → if it is sharp, it earns a `callout`.

## Per page

Ordered by how much the change buys. Every proposed fact is already established in the
audits (`scratchpad/audit2/*.json`, `scratchpad/audit/*.json`) — nothing new to invent.

### f1 Digital Check-in — `stage → flow → problem → benefits → faq`
Its stage already has 3 step-cards; the journey IS the product. Promote it to a real
`flow` (5 steps: QR/app → form in his language → rules gate → status live → dock +
directions). This is the flagship page; the flow doing the explaining lets `problem`
stop carrying it.
Keys: flowTitle/flowSub + s1t..s5d.

### f13 YMS — `stage → facts → problem(reverse) → benefits → faq`
The only page with honest headline numbers: **amber after 1h, red after 2h** idle
badges, one truck per dock. `facts` (3 numbers) directly above the problem makes the
detention argument before the prose does.
Keys: f1n/f1l..f3n/f3l.

### f11 Scheduling — `stage → flow → problem → callout → faq`
The booking lifecycle is literally a state machine (`scheduled → confirmed →
checked_in`, `no_show` via a 15-min cron). That is a `flow`, not prose. And it NEEDS a
`callout`: the feature is named "Early Check-in" but **there is no early-arrival logic
at all** — say it out loud or a buyer finds out. Drop `benefits` (three personas pad a
carrier-only story).
Keys: flow* + coTitle/coBody/coKind="note".

### f12 Location Detection — `stage → problem → callout → benefits → faq`
The limits ARE the story: mobile-only, one GPS fix, no background location, detects but
never submits. A `callout` right after the problem, before benefits, is what stops the
page over-promising.
Keys: co*.

### f6 Android & iOS App — `stage → facts → problem → benefits → faq`
Real numbers: **12 languages, 476 strings each, 2 platforms**. Facts strip under the
app tour, before the narrative.
Keys: f1n/f1l..f3n/f3l.

### f7 Multi-language — `stage → spec → problem → benefits → faq`
The one page where a `spec` table is unarguable: the 12 locales, their order, what IS
localized (UI / SMS / push templates) vs what is NOT (the dispatcher's own words —
there is no machine translation). The table doubles as the honesty.
Keys: specTitle/specSub + k1/v1..k6/v6.

### f10 Driver Instructions — `stage → spec → problem → benefits → faq`
A spec of the four action types × their real driver strings × colour. The scene shows
them; the table pins them down.
Keys: spec*.

### f2 Dock Management — `stage → problem(reverse) → benefits → faq`
No extra material that is honest. Just `reverse` + tint rhythm so it stops mirroring f1.

### f3 Chat & Notifications — `stage → problem → benefits(untinted) → faq`
Two stages already (chat + push). Leave the order; vary tint only.

### f4 Category Routing — `stage → problem(reverse) → benefits → faq`
Cargo→department mapping could be a `spec`, but it is org-configurable, so a fixed
table would imply a fixed taxonomy. Reverse + tint only.

### f5 Reports & Analytics — `stage → problem → benefits → faq`
Deliberately unchanged: **no honest numbers exist** (the KPI values in the scene are
illustrative). A `facts` strip here would be an invented statistic — exactly the failure
we keep guarding against.

### f9 Cloud — `stage → facts → problem → benefits → faq`
Facts: **0 servers, 0 installs, ~1 min to a live check-in link**. Verify the third
against the real onboarding before shipping it; if it cannot be verified, use 2 facts
or drop the strip.

## Mandatory for ALL twelve

Pass `idPrefix` (e.g. `dc1`, `dm2`, `ch3`…). Not cosmetic: the sections hard-code
`feature-faq-btn-N` / `feature-problem-title`, so any page composing a type twice gets
**duplicate DOM ids and broken `aria-labelledby`**. The kit already accepts it; the old
twelve simply do not pass it.

## Cost

~9 pages × ~10 new keys × 8 locales ≈ **700 strings**. This is the blocker — it needs
the parallel translation workflow (4 pages × 7 locales took ~28 agents and ~4 min).
**Blocked while the account is at its monthly spend limit**; hand-writing 700 strings is
not a sensible use of a session.

## Order to execute

1. `idPrefix` on all twelve (no new content — ship immediately, it is a correctness fix).
2. f1 flow, f11 flow+callout, f12 callout — the three with the biggest payoff.
3. f13/f6/f9 facts, f7/f10 spec.
4. f2/f3/f4 tint+reverse variation.
5. Second illustrations for the f15/f16/f17 `split` sections (`visual` prop is already
   optional; they render as prose today, which is honest but flat).
