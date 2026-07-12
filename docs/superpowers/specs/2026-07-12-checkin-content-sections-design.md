# Digital Check-in Page — Rich Content Sections

**Date:** 2026-07-12
**Status:** Approved (user selected sections), implementation continues immediately per user instruction
**Page:** `/{locale}/features/<digital-check-in slug>` (feature id 1), all 8 locales

## Goal

Enrich the Digital Check-in feature page with narrative content between the
animated journey (v2, live) and the related-features grid. User-selected
sections, in order: **Problem narrative → Benefits by role → Mini-FAQ**.
Seed (user, RO): "Logistiq a pornit de la ideea de a construi o alternativă
digitală la clasicele pagere" — develop from there.

## Architecture

Generic, reusable Server Components (props = localized strings/data only) so
the other 11 feature pages can adopt them later with their own copy:

| Component | Props (shape) | Renders |
|---|---|---|
| `FeatureProblemSection` | `{ eyebrow, title, paragraphs: string[], compare: { oldTitle, newTitle, oldRows: string[], newRows: string[] } }` | Two columns: prose left; right a comparison card (old column with ✗ rows, new column with ✓ rows, blue/emerald accents). |
| `FeatureBenefitsSection` | `{ title, subtitle, groups: { icon, title, items: string[] }[] }` | 3 persona cards in the existing card style. |
| `FeatureFAQSection` | `{ title, items: { q, a }[], locale, path }` | Accordion (existing FAQ pattern/ARIA) + `<JsonLd data={faqPageSchema(...)}>` — rendered only on pages that use it (never leaks site-wide). |

Composition: new `DigitalCheckinShowcase` (Server Component) renders
`CheckinJourneySection` + the three content sections and replaces it as the
`featureShowcases[1]` entry — the page template is untouched.

New files under `src/components/features/`: `FeatureProblemSection.tsx`,
`FeatureBenefitsSection.tsx`, `FeatureFAQSection.tsx`,
`DigitalCheckinShowcase.tsx`. `showcases.tsx` swaps its entry.

Section backgrounds alternate with the existing rhythm (journey section uses
`bg-slate-50 dark:bg-slate-900/50`): problem = plain, benefits = tinted, FAQ
= plain.

## Copy (RO source — translated natively to the other 7 locales)

New i18n block `checkinContent` in ALL 8 locales:

- `problemEyebrow`: "De ce Logistiq"
- `problemTitle`: "Ce problemă rezolvăm?"
- `problemP1`: "Logistiq a pornit de la o idee simplă: să construim o alternativă digitală la clasicele pagere. Ani la rând, depozitele au înmânat șoferilor dispozitive fizice la poartă — pagere care se pierd, se defectează, au rază limitată și trebuie recuperate, încărcate și igienizate după fiecare tură."
- `problemP2`: "Cu Logistiq, pagerul devine telefonul șoferului. Check-in cu o simplă scanare a codului QR, statusuri și notificări în limba lui, direcționare clară către rampă — fără niciun echipament de cumpărat sau întreținut."
- `compareOldTitle`: "Pagerul clasic" · `compareOld1..4`: "Se pierde și se defectează" / "Cost per dispozitiv, plus mentenanță" / "Rază de acoperire limitată" / "Trebuie recuperat și igienizat"
- `compareNewTitle`: "QRGO, pe telefonul șoferului" · `compareNew1..4`: "Mereu în buzunarul șoferului" / "Zero hardware, zero mentenanță" / "Funcționează oriunde, pe date mobile" / "Nimic de recuperat — doar un cod QR"
- `benefitsTitle`: "Beneficii pentru toată echipa" · `benefitsSubtitle`: "De la poartă până la birou, fiecare rol câștigă timp."
- `benefitOperatorTitle`: "Pentru operatorul din depozit" · items: "Vede în timp real toți șoferii sosiți și statusul lor" / "Alocă rampa cu un singur click, fără stație radio" / "Zero hârtii și zero drumuri până la poartă"
- `benefitDriverTitle`: "Pentru șofer" · items: "Check-in în limba lui, în mai puțin de un minut" / "Notificări push când primește rampa — fără așteptare la ghișeu" / "Instrucțiuni clare: unde parchează, când intră, la ce rampă"
- `benefitManagerTitle`: "Pentru manager" · items: "Timpi de așteptare și de operare, măsurați automat" / "Rapoarte și statistici pe departamente și rampe" / "Istoric complet, auditabil, pentru fiecare check-in"
- `faqTitle`: "Întrebări frecvente despre check-in-ul digital"
- `faq1Q`: "Ce se întâmplă dacă șoferul nu are smartphone?" · `faq1A`: "Operatorul poate face check-in manual din dashboard în câteva secunde, deci niciun camion nu rămâne blocat la poartă. În practică, aproape toți șoferii folosesc propriul telefon."
- `faq2Q`: "Șoferul trebuie să instaleze o aplicație?" · `faq2A`: "Nu. Scanarea codului QR deschide check-in-ul direct în browser. Aplicația mobilă QRGO Driver există pentru șoferii frecvenți, dar este opțională."
- `faq3Q`: "În ce limbi pot face check-in șoferii?" · `faq3A`: "În 12 limbi europene — șoferul își alege limba, iar operatorul vede totul în limba lui."
- `faq4Q`: "Ce echipamente trebuie să cumpărăm?" · `faq4A`: "Niciunul. Tipăriți codul QR pentru poartă, iar dashboard-ul rulează în browser. Logistiq este 100% cloud — fără servere, fără pagere, fără mentenanță."

Only truthful product claims (manual check-in exists in the dashboard;
browser check-in via QR is real; 12 driver languages is real; no hardware is
real). No invented statistics.

## Icons

Reuse existing: `UsersIcon` (operator), `SteeringWheelIcon` (driver),
`ChartIcon` (manager); ✗/✓ drawn inline (CloseIcon/CheckIcon exist).

## A11y & SEO

- FAQ accordion: proper `aria-expanded`/`aria-controls` + focus states
  (follow the existing homepage FAQSection implementation).
- `faqPageSchema` JSON-LD emitted only on this page, via the FAQ section.
- All copy is server-rendered localized text (indexable).

## Verification & delivery

Same gates as before: tsc/lint/vitest/build; Playwright visual pass (desktop
+ 375px, EN/RO) incl. accordion toggling; 6-locale native translation review
(workflow) before push; final review of the diff; commit per task on `main`;
push submodule → bump parent → verify live.
