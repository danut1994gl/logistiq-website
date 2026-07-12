# Check-in Journey Animation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Animated SVG+CSS "how it works" section (truck arrives → QR scan → check-in confirmed, barrier lifts) under the hero of the Digital Check-in feature page, in all 8 locales, mobile-ready.

**Architecture:** A per-feature showcase slot (`featureShowcases` map) rendered by the feature page template. Feature 1 gets `CheckinJourneySection` (Server Component): panoramic SVG scene animated by pure CSS keyframes on one shared 13s loop, plus 3 step cards whose active-glow is synchronized to the same loop — no JavaScript. New `checkinJourney` translations block in all 8 locales.

**Tech Stack:** Next.js 16 App Router (Server Components), Tailwind CSS v4 (CSS-first, `globals.css`), vitest, Playwright MCP for visual verification. **No new dependencies.**

**Spec:** `docs/superpowers/specs/2026-07-12-checkin-journey-animation-design.md`

## Global Constraints

- Repo: `/Users/danut/Desktop/logistiq/website` (standalone git submodule, **npm**, not pnpm).
- Server Components by default; no `"use client"` anywhere in this plan.
- No new npm dependencies (no Lottie, no framer-motion).
- All user-facing text in ALL 8 locales (`ro en de pl hu bg fr nl`) in `src/lib/i18n/translations.ts`; every locale block structurally identical to `ro`.
- Animations must respect `prefers-reduced-motion` (globals.css already has a global block; this plan adds explicit `.cj-*` overrides). Static (no-animation) base state must read as a complete scene.
- Mobile-ready: SVG scales via `viewBox` + `w-full h-auto`; cards stack below `sm`; no horizontal page scroll at 375px.
- Master timeline: **13s loop** — Phase 1 (arrival) 0–30.8%, Phase 2 (QR scan) 30.8–61.5%, Phase 3 (confirmed) 61.5–92.3%, reset 92.3–100%.
- Verify before pushing: `npm run test`, `npm run lint`, `npm run build` all pass; Playwright drive on localized routes.
- Commits end with: `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`

---

### Task 1: `checkinJourney` translations in all 8 locales (TDD)

**Files:**
- Test: `src/lib/i18n/translations.test.ts` (new)
- Modify: `src/lib/i18n/translations.ts` (8 insertions, one per locale block)

**Interfaces:**
- Produces: `t.checkinJourney.{title, subtitle, stepLabel, step1Title, step1Desc, step2Title, step2Desc, step3Title, step3Desc, dockBadge}` — all `string`. Tasks 3 consumes these exact keys via the `Translations` type.

- [ ] **Step 1: Write the failing test**

Create `src/lib/i18n/translations.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { translations } from "@/lib/i18n/translations";
import { locales } from "@/lib/i18n/config";

const CHECKIN_JOURNEY_KEYS = [
  "title",
  "subtitle",
  "stepLabel",
  "step1Title",
  "step1Desc",
  "step2Title",
  "step2Desc",
  "step3Title",
  "step3Desc",
  "dockBadge",
] as const;

describe("checkinJourney translations", () => {
  it("has every key, non-empty, in every locale", () => {
    for (const locale of locales) {
      const block = (translations[locale] as Record<string, unknown>)
        .checkinJourney as Record<string, string> | undefined;
      expect(block, `${locale}: checkinJourney block missing`).toBeTruthy();
      for (const key of CHECKIN_JOURNEY_KEYS) {
        expect(
          block?.[key]?.trim(),
          `${locale}: checkinJourney.${key} missing or empty`,
        ).toBeTruthy();
      }
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/danut/Desktop/logistiq/website && npx vitest run src/lib/i18n/translations.test.ts`
Expected: FAIL — `ro: checkinJourney block missing`

- [ ] **Step 3: Add the translations block to all 8 locales**

In `src/lib/i18n/translations.ts`, insert the locale-appropriate block below **immediately after the closing `},` of the `howItWorks` block inside each locale** (ro starts at ~line 2, en ~717, de ~1415, pl ~1898, hu ~2381, bg ~2864, fr ~3347, nl ~3907 — re-grep before editing: `grep -n "howItWorks: {" src/lib/i18n/translations.ts`).

`ro`:

```ts
    checkinJourney: {
      title: "Cum funcționează check-in-ul digital",
      subtitle:
        "De la sosirea camionului până la ridicarea barierei — tot procesul durează sub un minut.",
      stepLabel: "PAS",
      step1Title: "Sosire la depozit",
      step1Desc: "Camionul ajunge la poartă și oprește în parcare.",
      step2Title: "Scanare cod QR",
      step2Desc: "Șoferul scanează codul de la poartă cu telefonul.",
      step3Title: "Check-in digital",
      step3Desc: "Check-in confirmat, doc alocat, bariera se ridică.",
      dockBadge: "DOC 12",
    },
```

`en`:

```ts
    checkinJourney: {
      title: "How digital check-in works",
      subtitle:
        "From truck arrival to barrier lift — the whole process takes under a minute.",
      stepLabel: "STEP",
      step1Title: "Arrival at the warehouse",
      step1Desc: "The truck arrives at the gate and stops in the parking area.",
      step2Title: "Scan the QR code",
      step2Desc: "The driver scans the gate code with their phone.",
      step3Title: "Digital check-in",
      step3Desc: "Check-in confirmed, dock assigned, the barrier lifts.",
      dockBadge: "DOCK 12",
    },
```

`de`:

```ts
    checkinJourney: {
      title: "So funktioniert der digitale Check-in",
      subtitle:
        "Von der Ankunft des Lkw bis zum Öffnen der Schranke – der gesamte Prozess dauert weniger als eine Minute.",
      stepLabel: "SCHRITT",
      step1Title: "Ankunft am Lager",
      step1Desc: "Der Lkw erreicht das Tor und hält auf dem Parkplatz.",
      step2Title: "QR-Code scannen",
      step2Desc: "Der Fahrer scannt den Code am Tor mit dem Smartphone.",
      step3Title: "Digitaler Check-in",
      step3Desc: "Check-in bestätigt, Rampe zugewiesen, die Schranke öffnet sich.",
      dockBadge: "RAMPE 12",
    },
```

`pl`:

```ts
    checkinJourney: {
      title: "Jak działa cyfrowa rejestracja",
      subtitle:
        "Od przyjazdu ciężarówki do podniesienia szlabanu — cały proces trwa niecałą minutę.",
      stepLabel: "KROK",
      step1Title: "Przyjazd do magazynu",
      step1Desc: "Ciężarówka podjeżdża pod bramę i zatrzymuje się na parkingu.",
      step2Title: "Skanowanie kodu QR",
      step2Desc: "Kierowca skanuje telefonem kod przy bramie.",
      step3Title: "Cyfrowa rejestracja",
      step3Desc: "Rejestracja potwierdzona, dok przydzielony, szlaban się podnosi.",
      dockBadge: "DOK 12",
    },
```

`hu`:

```ts
    checkinJourney: {
      title: "Így működik a digitális bejelentkezés",
      subtitle:
        "A kamion érkezésétől a sorompó felnyílásáig — a teljes folyamat kevesebb mint egy perc.",
      stepLabel: "LÉPÉS",
      step1Title: "Érkezés a raktárhoz",
      step1Desc: "A kamion a kapuhoz ér, és megáll a parkolóban.",
      step2Title: "QR-kód beolvasása",
      step2Desc: "A sofőr a telefonjával beolvassa a kapunál lévő kódot.",
      step3Title: "Digitális bejelentkezés",
      step3Desc: "Bejelentkezés megerősítve, dokk kijelölve, a sorompó felnyílik.",
      dockBadge: "DOKK 12",
    },
```

`bg`:

```ts
    checkinJourney: {
      title: "Как работи дигиталната регистрация",
      subtitle:
        "От пристигането на камиона до вдигането на бариерата — целият процес отнема под минута.",
      stepLabel: "СТЪПКА",
      step1Title: "Пристигане в склада",
      step1Desc: "Камионът пристига на портала и спира на паркинга.",
      step2Title: "Сканиране на QR код",
      step2Desc: "Шофьорът сканира кода на портала с телефона си.",
      step3Title: "Дигитална регистрация",
      step3Desc: "Регистрацията е потвърдена, докът е разпределен, бариерата се вдига.",
      dockBadge: "ДОК 12",
    },
```

`fr`:

```ts
    checkinJourney: {
      title: "Comment fonctionne le check-in numérique",
      subtitle:
        "De l'arrivée du camion à la levée de la barrière — l'ensemble du processus prend moins d'une minute.",
      stepLabel: "ÉTAPE",
      step1Title: "Arrivée à l'entrepôt",
      step1Desc: "Le camion arrive au portail et s'arrête sur le parking.",
      step2Title: "Scan du code QR",
      step2Desc: "Le chauffeur scanne le code du portail avec son téléphone.",
      step3Title: "Check-in numérique",
      step3Desc: "Check-in confirmé, quai attribué, la barrière se lève.",
      dockBadge: "QUAI 12",
    },
```

`nl`:

```ts
    checkinJourney: {
      title: "Zo werkt digitale check-in",
      subtitle:
        "Van de aankomst van de vrachtwagen tot het openen van de slagboom — het hele proces duurt minder dan een minuut.",
      stepLabel: "STAP",
      step1Title: "Aankomst bij het magazijn",
      step1Desc: "De vrachtwagen komt aan bij de poort en stopt op de parkeerplaats.",
      step2Title: "QR-code scannen",
      step2Desc: "De chauffeur scant de code bij de poort met zijn telefoon.",
      step3Title: "Digitale check-in",
      step3Desc: "Check-in bevestigd, dok toegewezen, de slagboom gaat omhoog.",
      dockBadge: "DOK 12",
    },
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/lib/i18n/translations.test.ts`
Expected: PASS (1 test)

Run: `npx tsc --noEmit` — Expected: no errors (locale blocks stay structurally identical).

- [ ] **Step 5: Commit**

```bash
git add src/lib/i18n/translations.ts src/lib/i18n/translations.test.ts
git commit -m "feat(i18n): checkinJourney block in all 8 locales

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 2: Animated SVG scene + CSS keyframes

**Files:**
- Create: `src/components/features/CheckinJourneyScene.tsx`
- Modify: `src/app/globals.css` (append one commented block after the existing keyframes/stagger section, ~line 285)

**Interfaces:**
- Consumes: `QRCodeSVG` from `@/components/mockups/QRCodeSVG` (existing, renders `<svg viewBox="0 0 29 29" class="w-full h-full">`).
- Produces: `CheckinJourneyScene({ dockLabel }: { dockLabel: string })` — Server Component, decorative panoramic SVG. Task 3 imports it.

**Design notes (read before coding):**
- One dark panel scene (like the hero dashboard mockup) — identical in light/dark themes.
- All `.cj-*` animations share `13s linear infinite` so everything stays in sync.
- **Base styles (no animation) = complete static scene**: truck stopped at the gate, phone + QR visible, green check shown, barrier up. Keyframes override during playback; reduced-motion shows the base state.
- Truck stop position: nose at x=540 (barrier pivot at x=660). Truck group local width 218 → stop offset `translateX(322px)`; enters from `-280px`; exits at `1320px`.

- [ ] **Step 1: Append the scene CSS to `globals.css`**

```css
/* ---- Check-in journey scene (Digital Check-in feature page) ----
   One shared 13s loop. Phases: arrival 0–30.8%, QR scan 30.8–61.5%,
   confirmed 61.5–92.3%, reset 92.3–100%. Base (unanimated) styles form a
   complete static scene for prefers-reduced-motion. */

.cj-truck {
  transform: translateX(322px);
  animation: cj-truck 13s linear infinite;
  will-change: transform;
}
@keyframes cj-truck {
  0%   { transform: translateX(-280px); animation-timing-function: cubic-bezier(0.25, 0.1, 0.25, 1); }
  24%  { transform: translateX(322px); }
  68%  { transform: translateX(322px); animation-timing-function: cubic-bezier(0.55, 0, 0.85, 0.45); }
  90%  { transform: translateX(1320px); }
  100% { transform: translateX(1320px); }
}

.cj-phone { animation: cj-phone 13s linear infinite; }
@keyframes cj-phone {
  0%, 30%   { opacity: 0; transform: translateY(10px); }
  34%       { opacity: 1; transform: translateY(0); }
  62%       { opacity: 1; }
  66%, 100% { opacity: 0; }
}

.cj-scan { opacity: 0; animation: cj-scan 13s linear infinite; }
@keyframes cj-scan {
  0%, 34%   { opacity: 0; transform: translateY(0); }
  37%       { opacity: 1; }
  46%       { transform: translateY(40px); }
  55%       { opacity: 1; transform: translateY(4px); }
  59%, 100% { opacity: 0; }
}

.cj-pulse {
  opacity: 0;
  transform-box: fill-box;
  transform-origin: center;
  animation: cj-pulse 13s linear infinite;
}
.cj-pulse-2 { animation-delay: 1s; }
@keyframes cj-pulse {
  0%, 40%   { transform: scale(0.3); opacity: 0; }
  45%       { opacity: 0.7; }
  58%       { transform: scale(2.6); opacity: 0; }
  100%      { transform: scale(2.6); opacity: 0; }
}

.cj-check {
  transform-box: fill-box;
  transform-origin: center;
  animation: cj-check 13s linear infinite;
}
@keyframes cj-check {
  0%, 61%   { opacity: 0; transform: scale(0.4); }
  65%       { opacity: 1; transform: scale(1.12); }
  68%       { transform: scale(1); }
  91%       { opacity: 1; }
  95%, 100% { opacity: 0; }
}

.cj-dock-badge { animation: cj-dock-badge 13s linear infinite; }
@keyframes cj-dock-badge {
  0%, 64%   { opacity: 0; transform: translateY(8px); }
  68%       { opacity: 1; transform: translateY(0); }
  91%       { opacity: 1; }
  95%, 100% { opacity: 0; }
}

.cj-barrier-arm {
  transform: rotate(-55deg);
  transform-box: fill-box;
  transform-origin: 0% 50%;
  animation: cj-barrier 13s linear infinite;
}
@keyframes cj-barrier {
  0%, 63%   { transform: rotate(0deg); }
  69%       { transform: rotate(-55deg); }
  91%       { transform: rotate(-55deg); }
  96%, 100% { transform: rotate(0deg); }
}

/* Step-card active glow, synced to the same loop (crossfades at phase edges) */
.cj-glow-1 { animation: cj-active-1 13s linear infinite; }
.cj-glow-2 { animation: cj-active-2 13s linear infinite; }
.cj-glow-3 { animation: cj-active-3 13s linear infinite; }
@keyframes cj-active-1 {
  0%        { opacity: 1; }
  28%       { opacity: 1; }
  33%, 100% { opacity: 0; }
}
@keyframes cj-active-2 {
  0%, 28%   { opacity: 0; }
  33%       { opacity: 1; }
  59%       { opacity: 1; }
  64%, 100% { opacity: 0; }
}
@keyframes cj-active-3 {
  0%, 59%   { opacity: 0; }
  64%       { opacity: 1; }
  90%       { opacity: 1; }
  95%, 100% { opacity: 0; }
}

@media (prefers-reduced-motion: reduce) {
  .cj-truck, .cj-phone, .cj-scan, .cj-pulse, .cj-check,
  .cj-dock-badge, .cj-barrier-arm, .cj-glow-1, .cj-glow-2, .cj-glow-3 {
    animation: none !important;
  }
}
```

- [ ] **Step 2: Create `src/components/features/CheckinJourneyScene.tsx`**

```tsx
import { QRCodeSVG } from "@/components/mockups/QRCodeSVG";

// Panoramic animated check-in scene (truck → QR scan → barrier). Decorative:
// the step cards below carry the full story as text. Pure CSS animation via
// .cj-* classes in globals.css; the unanimated base state is a complete
// static scene for prefers-reduced-motion. Server Component.
export function CheckinJourneyScene({ dockLabel }: { dockLabel: string }) {
  return (
    <svg viewBox="0 0 1200 400" className="w-full h-auto block" aria-hidden="true">
      {/* ambient glows */}
      <circle cx="180" cy="90" r="100" className="fill-blue-600" opacity="0.08" />
      <circle cx="1020" cy="70" r="80" className="fill-cyan-500" opacity="0.07" />

      {/* road */}
      <rect x="0" y="344" width="1200" height="24" className="fill-slate-800" />
      <line x1="0" y1="356" x2="1200" y2="356" className="stroke-slate-600" strokeWidth="3" strokeDasharray="24 18" />

      {/* warehouse */}
      <rect x="760" y="110" width="400" height="234" rx="4" className="fill-slate-800 stroke-slate-700" strokeWidth="2" />
      <rect x="760" y="110" width="400" height="10" className="fill-blue-600" />
      <text x="960" y="152" textAnchor="middle" className="fill-slate-500" style={{ fontSize: 20, fontWeight: 700, letterSpacing: 6 }}>
        LOGISTIQ
      </text>
      {[800, 900, 1000].map((x) => (
        <g key={x}>
          <rect x={x} y="214" width="72" height="130" className="fill-slate-700 stroke-slate-600" strokeWidth="2" />
          {[240, 266, 292, 318].map((y) => (
            <line key={y} x1={x + 4} y1={y} x2={x + 68} y2={y} className="stroke-slate-600" strokeWidth="2" />
          ))}
        </g>
      ))}

      {/* dock badge (phase 3) */}
      <g className="cj-dock-badge">
        <line x1="936" y1="192" x2="936" y2="212" className="stroke-blue-500" strokeWidth="2" strokeDasharray="3 3" />
        <rect x="888" y="158" width="96" height="32" rx="16" className="fill-blue-600" />
        <text x="936" y="179" textAnchor="middle" className="fill-white" style={{ fontSize: 15, fontWeight: 700, letterSpacing: 1 }}>
          {dockLabel}
        </text>
      </g>

      {/* gate booth */}
      <rect x="690" y="252" width="72" height="92" rx="4" className="fill-slate-800 stroke-slate-700" strokeWidth="2" />
      <rect x="684" y="246" width="84" height="8" rx="3" className="fill-slate-600" />
      <rect x="704" y="266" width="44" height="26" rx="3" className="fill-cyan-900" opacity="0.55" />

      {/* QR panel on a pole, roadside */}
      <rect x="566" y="306" width="6" height="38" className="fill-slate-600" />
      <rect x="540" y="246" width="58" height="58" rx="8" className="fill-slate-900 stroke-cyan-500" strokeWidth="2" opacity="0.95" />
      <svg x="547" y="253" width="44" height="44">
        <QRCodeSVG />
      </svg>
      {/* scan line (phase 2) */}
      <rect x="547" y="255" width="44" height="3" rx="1.5" className="cj-scan fill-cyan-400" />
      {/* pulse rings (phase 2) */}
      <circle cx="569" cy="275" r="16" className="cj-pulse stroke-cyan-400 fill-none" strokeWidth="2" />
      <circle cx="569" cy="275" r="16" className="cj-pulse cj-pulse-2 stroke-cyan-400 fill-none" strokeWidth="2" />

      {/* truck (local nose at x=218; base = stopped at gate) */}
      <g className="cj-truck">
        <rect x="0" y="248" width="142" height="70" rx="6" className="fill-slate-600 stroke-slate-500" strokeWidth="2" />
        <rect x="12" y="262" width="52" height="8" rx="4" className="fill-blue-500" />
        <rect x="142" y="306" width="14" height="10" className="fill-slate-700" />
        <path
          d="M156 344 L156 272 Q156 264 164 264 L192 264 Q199 264 203 269 L214 287 Q218 292 218 298 L218 344 Z"
          className="fill-blue-600"
        />
        <path d="M166 272 L190 272 L200 287 L166 287 Z" className="fill-cyan-200" opacity="0.75" />
        {[28, 58, 190].map((cx) => (
          <g key={cx}>
            <circle cx={cx} cy="331" r="13" className="fill-slate-900 stroke-slate-500" strokeWidth="3" />
            <circle cx={cx} cy="331" r="4" className="fill-slate-500" />
          </g>
        ))}
      </g>

      {/* driver's phone, in front of the cab window (phase 2) */}
      <g className="cj-phone">
        <rect x="496" y="258" width="30" height="54" rx="7" className="fill-slate-800 stroke-slate-500" strokeWidth="2" />
        <rect x="501" y="266" width="20" height="34" rx="2" className="fill-cyan-950" />
        <rect x="504" y="272" width="14" height="14" rx="2" className="fill-cyan-400" opacity="0.85" />
      </g>

      {/* barrier (post + arm; base = up) */}
      <rect x="654" y="294" width="12" height="50" rx="2" className="fill-slate-600" />
      <g transform="translate(660 300)">
        <g className="cj-barrier-arm">
          <rect x="4" y="-6" width="168" height="12" rx="6" className="fill-slate-200" />
          {[24, 64, 104, 144].map((x) => (
            <rect key={x} x={x} y="-6" width="20" height="12" className="fill-blue-600" />
          ))}
          <circle cx="166" cy="0" r="4" className="fill-emerald-400" />
        </g>
      </g>

      {/* confirmation check (phase 3) */}
      <g className="cj-check">
        <circle cx="600" cy="190" r="24" className="fill-emerald-500" />
        <path d="M588 190 l9 9 l17 -19" className="stroke-white fill-none" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
}
```

- [ ] **Step 3: Verify it compiles**

Run: `npx tsc --noEmit && npm run lint`
Expected: no errors. (The component isn't rendered anywhere yet — visual verification happens in Tasks 3–4.)

- [ ] **Step 4: Commit**

```bash
git add src/components/features/CheckinJourneyScene.tsx src/app/globals.css
git commit -m "feat(features): animated check-in journey SVG scene + cj-* keyframes

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 3: Section component, showcase slot, page integration

**Files:**
- Create: `src/components/features/CheckinJourneySection.tsx`
- Create: `src/components/features/showcases.tsx`
- Modify: `src/app/[locale]/(marketing)/features/[slug]/page.tsx` (insert between `<PageHero …/>` and the "Related features" section, ~line 118)

**Interfaces:**
- Consumes: `CheckinJourneyScene({ dockLabel })` (Task 2); `t.checkinJourney.*` keys (Task 1); icons `TruckIcon, QrCodeIcon, GateIcon` from `@/components/icons`; `Translations` type from `@/lib/i18n/translations`.
- Produces: `featureShowcases: Record<number, FC<{ t: Translations }>>` from `@/components/features/showcases`.

- [ ] **Step 1: Create `src/components/features/CheckinJourneySection.tsx`**

```tsx
import type { Translations } from "@/lib/i18n/translations";
import { TruckIcon, QrCodeIcon, GateIcon } from "@/components/icons";
import { CheckinJourneyScene } from "./CheckinJourneyScene";

// "How digital check-in works" — animated scene + 3 step cards, active card
// glow synced to the scene via the shared 13s cj-* CSS loop. Server Component.
export function CheckinJourneySection({ t }: { t: Translations }) {
  const c = t.checkinJourney;
  const steps = [
    { icon: TruckIcon, title: c.step1Title, desc: c.step1Desc },
    { icon: QrCodeIcon, title: c.step2Title, desc: c.step2Desc },
    { icon: GateIcon, title: c.step3Title, desc: c.step3Desc },
  ];

  return (
    <section aria-labelledby="cj-title" className="py-16 lg:py-24 bg-slate-50 dark:bg-slate-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 id="cj-title" className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            {c.title}
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300">{c.subtitle}</p>
        </div>

        <div className="rounded-3xl overflow-hidden border border-slate-700/60 bg-gradient-to-br from-slate-800 to-slate-900 shadow-2xl">
          <CheckinJourneyScene dockLabel={c.dockBadge} />
        </div>

        <ol className="grid gap-6 sm:grid-cols-3 mt-10 list-none">
          {steps.map((step, i) => {
            const n = `0${i + 1}`;
            return (
              <li key={i} className="relative">
                <div className="relative h-full bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
                  <span
                    aria-hidden="true"
                    className={`cj-glow-${i + 1} pointer-events-none absolute inset-0 rounded-2xl ring-2 ring-blue-500/80 shadow-[0_0_28px_rgba(37,99,235,0.35)] opacity-0`}
                  />
                  <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold">{n}</span>
                  </div>
                  <div className="w-14 h-14 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-5 mt-4 text-blue-600 dark:text-blue-400">
                    <step.icon />
                  </div>
                  <div className="text-xs font-semibold tracking-widest uppercase text-blue-600 dark:text-blue-400 mb-2">
                    {c.stepLabel} {n}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{step.title}</h3>
                  <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
```

Note: `cj-glow-1/2/3` are dynamic-looking but statically listed in globals.css — Tailwind does not need to see them (they are plain CSS classes, not utilities). The template literal is fine.

- [ ] **Step 2: Create `src/components/features/showcases.tsx`**

```tsx
import type { FC } from "react";
import type { Translations } from "@/lib/i18n/translations";
import { CheckinJourneySection } from "./CheckinJourneySection";

// Per-feature showcase slot: feature id -> rich section rendered under the
// hero on that feature's page. Kept out of lib/features.ts so the data
// registry stays free of component imports.
export const featureShowcases: Record<number, FC<{ t: Translations }>> = {
  1: CheckinJourneySection,
};
```

- [ ] **Step 3: Integrate into the feature page template**

In `src/app/[locale]/(marketing)/features/[slug]/page.tsx`:

Add import (with the other component imports):

```tsx
import { featureShowcases } from "@/components/features/showcases";
```

After `const related = features.filter((f) => f.id !== feature.id).slice(0, 3);` add:

```tsx
  const Showcase = featureShowcases[feature.id];
```

Immediately after the closing `/>` of `<PageHero … />` (before the `{/* Related features */}` comment) add:

```tsx
      {Showcase ? <Showcase t={t} /> : null}
```

- [ ] **Step 4: Verify with build + rendered HTML**

```bash
npx tsc --noEmit && npm run lint && npm run test
npm run build
```
Expected: all pass; build succeeds for all locales.

Then drive it:

```bash
npm run dev &   # wait for "Ready"
curl -s http://localhost:3000/en/features/digital-check-in | grep -o "How digital check-in works" | head -1
curl -s http://localhost:3000/ro/features/check-in-digital | grep -o "Cum funcționează check-in-ul digital" | head -1
curl -s http://localhost:3000/en/features/dock-management | grep -c "cj-truck"
```
Expected: first two greps print the titles; third prints `0` (other feature pages unchanged).

- [ ] **Step 5: Commit**

```bash
git add src/components/features/CheckinJourneySection.tsx src/components/features/showcases.tsx "src/app/[locale]/(marketing)/features/[slug]/page.tsx"
git commit -m "feat(features): check-in journey section on Digital Check-in page via showcase slot

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 4: Visual verification + tuning (Playwright)

**Files:**
- Possibly modify: `src/components/features/CheckinJourneyScene.tsx`, `src/app/globals.css` (coordinate/timing tweaks only)

**Interfaces:**
- Consumes: running dev server from Task 3.

- [ ] **Step 1: Desktop pass** — with Playwright MCP, navigate to `http://localhost:3000/en/features/digital-check-in`, scroll to the section, take screenshots ~1s, ~6s, ~10s into the loop. Verify: truck stops before the barrier; scan line sweeps the QR; check + dock badge appear; barrier rotates up around its left pivot (not around the SVG corner — if it orbits wrongly, the `transform-box: fill-box; transform-origin: 0% 50%` on `.cj-barrier-arm` needs adjusting); truck exits right; cards 1→2→3 glow in order matching the scene.

- [ ] **Step 2: Mobile pass** — `browser_resize` to 375×812, re-screenshot. Verify: no horizontal scroll, scene legible, cards stacked vertically, glow sync still correct.

- [ ] **Step 3: Reduced-motion pass** — emulate reduced motion via `browser_run_code_unsafe` (CDP `Emulation.setEmulatedMedia` with `prefers-reduced-motion: reduce`) or a context with `reducedMotion: "reduce"`; screenshot. Verify the static frame reads complete: truck at gate, QR panel visible, green check shown, barrier up.

- [ ] **Step 4: Locale spot-check** — `http://localhost:3000/de/features/digitaler-check-in`: section renders with German copy, `RAMPE 12` badge.

- [ ] **Step 5: Fix anything found, re-verify, commit tweaks**

```bash
git add -A src/components/features src/app/globals.css
git commit -m "fix(features): visual tuning of check-in journey scene

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```
(Skip the commit if no changes were needed.)

- [ ] **Step 6: Show the user** — attach/describe the desktop + mobile screenshots so the user sees the result before review/push.

---

### Task 5: Multi-agent review (translations + code)

**Files:** none new; fixes applied to files from Tasks 1–4.

- [ ] **Step 1: Translation review** — dispatch parallel review agents (Workflow tool, one per locale: de, pl, hu, bg, fr, nl) with the exact `checkinJourney` block and its RO/EN source, asking each: is this native-quality, professional B2B logistics copy? Return corrections. Apply agreed corrections; re-run `npx vitest run src/lib/i18n/translations.test.ts`.

- [ ] **Step 2: Code review** — run the code-review flow on the full diff (`git diff main` scope: translations, scene, section, page template, globals.css) targeting correctness (keyframe percentages consistent with the 13s phases, SVG transform-origin correctness, RSC boundaries, a11y) and spec adherence. Apply confirmed findings.

- [ ] **Step 3: Full gate**

```bash
npm run test && npm run lint && npm run build
```
Expected: all pass.

- [ ] **Step 4: Commit any review fixes**

```bash
git add -A
git commit -m "fix(features): review fixes for check-in journey section

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 6: Ship (submodule push + parent bump) — **requires explicit user OK (deploys to production via Vercel)**

- [ ] **Step 1: Confirm with the user** that screenshots look right and they want to deploy.

- [ ] **Step 2: Push the submodule**

```bash
cd /Users/danut/Desktop/logistiq/website && git push origin main
```

- [ ] **Step 3: Bump the parent repo pointer**

```bash
cd /Users/danut/Desktop/logistiq && git add website && git commit -m "chore(website): bump submodule — check-in journey animation on digital check-in feature page

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>" && git push origin main
```

- [ ] **Step 4: Verify live** — after Vercel deploys, hard-refresh `https://logistiq.ro/en/features/digital-check-in` and `/ro/features/check-in-digital`; confirm the section renders and animates on the live domain (edge cache may need a cache-busting query).
