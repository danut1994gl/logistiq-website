import type { FC, ReactNode } from "react";
import { CheckIcon } from "@/components/icons";
import type { Locale } from "@/lib/i18n/config";
import { JsonLd, howToSchema } from "@/lib/seo/jsonld";

// Layout kit for feature pages.
//
// Every feature page used to be the same four blocks in the same order
// (stage → problem → benefits → FAQ), which made 14 pages read as one page with
// the nouns swapped. These are the extra section types a page can compose from,
// so each page's shape follows ITS material: a gate scan wants a numbered flow,
// hardware wants a spec table, permissions want a role matrix, a roadmap claim
// wants a callout that says so out loud.
//
// Two rules for anything added here:
//   1. `idPrefix` is REQUIRED where a heading gets an id. Pages compose these in
//      different orders and may use a type twice; hard-coded ids would collide
//      and break aria-labelledby (the FAQ accordion already had this bug).
//   2. Server Components only — no state. Presentational.

// Shared section shell: consistent vertical rhythm + optional alternating tint,
// so a page that stacks 6 blocks still reads as one rhythm rather than a pile.
function Section({
  id,
  labelledBy,
  tinted,
  children,
}: {
  id?: string;
  labelledBy?: string;
  tinted?: boolean;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={`py-16 lg:py-24 ${tinted ? "bg-slate-50 dark:bg-slate-900/50" : ""}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">{children}</div>
    </section>
  );
}

function Heading({ id, title, sub, align = "center" }: { id: string; title: string; sub?: string; align?: "center" | "left" }) {
  const c = align === "center" ? "text-center max-w-3xl mx-auto" : "max-w-3xl";
  return (
    <div className={`${c} mb-12`}>
      <h2 id={id} className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">{title}</h2>
      {sub && <p className="text-lg text-slate-600 dark:text-slate-300">{sub}</p>}
    </div>
  );
}

/* ── flow ────────────────────────────────────────────────────────────────────
   A numbered step sequence. For anything genuinely linear: a gate scan, the
   kiosk journey, a validation ladder. Vertical on mobile, horizontal on wide. */
export function FeatureFlowSection({
  idPrefix,
  title,
  subtitle,
  steps,
  tinted,
  seo,
}: {
  idPrefix: string;
  title: string;
  subtitle?: string;
  steps: { title: string; desc: string }[];
  tinted?: boolean;
  /** Opt in to HowTo structured data. Only pass this for a flow that is a
   *  genuine "how to accomplish X" sequence — the visible steps below become
   *  the HowToSteps, so the schema always matches what the page renders. */
  seo?: { locale: Locale; path: string };
}) {
  const hid = `${idPrefix}-flow-title`;
  const howTo =
    seo &&
    howToSchema({
      locale: seo.locale,
      path: seo.path,
      name: title,
      description: subtitle,
      idPrefix,
      steps: steps.map((s) => ({ name: s.title, text: s.desc })),
    });
  return (
    <Section labelledBy={hid} tinted={tinted}>
      {howTo ? <JsonLd data={howTo} /> : null}
      <Heading id={hid} title={title} sub={subtitle} />
      <ol className="grid gap-6 md:grid-cols-2 lg:grid-cols-5 lg:gap-4">
        {steps.map((s, i) => (
          <li key={i} id={`${idPrefix}-flow-step-${i + 1}`} className="relative flex lg:flex-col gap-4 lg:gap-3 scroll-mt-24">
            {/* the rail: only between cards, and only once they sit in a row */}
            {i < steps.length - 1 && (
              <span aria-hidden="true" className="hidden lg:block absolute top-5 left-[calc(50%+1.75rem)] right-[calc(-50%+1.75rem)] h-px bg-slate-300 dark:bg-slate-700" />
            )}
            <span className="relative z-10 shrink-0 w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shadow-lg shadow-blue-600/20 lg:mx-auto">
              {i + 1}
            </span>
            <div className="lg:text-center">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">{s.title}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{s.desc}</p>
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}

/* ── spec ────────────────────────────────────────────────────────────────────
   Hard facts as a table. On a hardware or endpoint page the boring table IS the
   differentiator — nobody bluffing can fill it in. */
export function FeatureSpecSection({
  idPrefix,
  title,
  subtitle,
  rows,
  tinted,
}: {
  idPrefix: string;
  title: string;
  subtitle?: string;
  rows: { k: string; v: string }[];
  tinted?: boolean;
}) {
  const hid = `${idPrefix}-spec-title`;
  return (
    <Section labelledBy={hid} tinted={tinted}>
      <Heading id={hid} title={title} sub={subtitle} />
      <div className="max-w-4xl mx-auto rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <dl className="divide-y divide-slate-200 dark:divide-slate-700">
          {rows.map((r, i) => (
            <div key={i} className={`grid sm:grid-cols-3 gap-1 sm:gap-4 px-5 py-4 ${i % 2 ? "bg-slate-50 dark:bg-slate-900/40" : "bg-white dark:bg-slate-800/40"}`}>
              <dt className="text-sm font-semibold text-slate-500 dark:text-slate-400">{r.k}</dt>
              <dd className="sm:col-span-2 text-slate-900 dark:text-slate-100">{r.v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </Section>
  );
}

/* ── matrix ──────────────────────────────────────────────────────────────────
   Role × capability grid. Only honest where the product really has distinct
   roles — cells are Y (yes) / N (no) / P (partial, e.g. scoped to a department). */
export function FeatureMatrixSection({
  idPrefix,
  title,
  subtitle,
  roles,
  caps,
  cells,
  tinted,
}: {
  idPrefix: string;
  title: string;
  subtitle?: string;
  roles: string[];
  caps: string[];
  /** cells[role][cap] — "Y" | "N" | "P" */
  cells: string[][];
  tinted?: boolean;
}) {
  const hid = `${idPrefix}-matrix-title`;
  const mark = (c: string) =>
    c === "Y" ? <span className="inline-flex w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-500 items-center justify-center [&_svg]:w-3 [&_svg]:h-3"><CheckIcon /></span>
    : c === "P" ? <span className="inline-block w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 text-xs font-bold leading-5">~</span>
    : <span className="inline-block w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-700/50 text-slate-400 text-xs font-bold leading-5">–</span>;
  return (
    <Section labelledBy={hid} tinted={tinted}>
      <Heading id={hid} title={title} sub={subtitle} />
      {/* wide tables scroll in their own box — the page body must never scroll sideways */}
      <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
        <table className="w-full min-w-[560px] border-separate border-spacing-0 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
          <thead>
            <tr className="bg-slate-100 dark:bg-slate-800">
              <th scope="col" className="text-left text-sm font-semibold text-slate-500 dark:text-slate-400 px-5 py-3">&nbsp;</th>
              {roles.map((r, i) => (
                <th key={i} scope="col" className="text-sm font-semibold text-slate-900 dark:text-white px-4 py-3 text-center">{r}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {caps.map((cap, ci) => (
              <tr key={ci} className={ci % 2 ? "bg-slate-50 dark:bg-slate-900/40" : "bg-white dark:bg-slate-800/40"}>
                <th scope="row" className="text-left font-medium text-slate-700 dark:text-slate-200 px-5 py-3 border-t border-slate-200 dark:border-slate-700">{cap}</th>
                {roles.map((_, ri) => (
                  <td key={ri} className="text-center px-4 py-3 border-t border-slate-200 dark:border-slate-700">{mark(cells[ri]?.[ci] ?? "N")}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  );
}

/* ── callout ─────────────────────────────────────────────────────────────────
   One emphasised statement. Its real job is honesty: saying "this is on the
   roadmap" / "this is pilot hardware" out loud, in a box the reader cannot miss,
   is what keeps the rest of the page credible. */
export function FeatureCalloutSection({
  idPrefix,
  title,
  body,
  kind = "note",
}: {
  idPrefix: string;
  title: string;
  body: string;
  kind?: "roadmap" | "pilot" | "note";
}) {
  const hid = `${idPrefix}-callout-title`;
  const tone =
    kind === "roadmap" ? { ring: "ring-indigo-500/30", bg: "bg-indigo-50 dark:bg-indigo-950/30", dot: "bg-indigo-500", label: "text-indigo-600 dark:text-indigo-400" }
    : kind === "pilot" ? { ring: "ring-amber-500/30", bg: "bg-amber-50 dark:bg-amber-950/30", dot: "bg-amber-500", label: "text-amber-600 dark:text-amber-400" }
    : { ring: "ring-slate-500/20", bg: "bg-slate-50 dark:bg-slate-900/50", dot: "bg-slate-400", label: "text-slate-500 dark:text-slate-400" };
  return (
    <section aria-labelledby={hid} className="py-10 lg:py-14">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`rounded-2xl ring-1 ${tone.ring} ${tone.bg} p-6 sm:p-8`}>
          <p className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-3 ${tone.label}`}>
            <span className={`w-2 h-2 rounded-full ${tone.dot}`} />
            {kind}
          </p>
          <h2 id={hid} className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-3">{title}</h2>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{body}</p>
        </div>
      </div>
    </section>
  );
}

/* ── facts ───────────────────────────────────────────────────────────────────
   Three headline numbers. Only ever real ones — no invented metrics. */
export function FeatureFactsSection({
  facts,
  tinted,
}: {
  facts: { n: string; l: string }[];
  tinted?: boolean;
}) {
  return (
    <section className={`py-12 lg:py-16 ${tinted ? "bg-slate-50 dark:bg-slate-900/50" : ""}`}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <dl className="grid gap-6 sm:grid-cols-3">
          {facts.map((f, i) => (
            <div key={i} className="text-center">
              <dt className="sr-only">{f.l}</dt>
              <dd>
                <span className="block text-4xl sm:text-5xl font-bold tracking-tight text-blue-600 dark:text-blue-400 tabular-nums">{f.n}</span>
                <span className="mt-2 block text-sm text-slate-600 dark:text-slate-300">{f.l}</span>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

/* ── split ───────────────────────────────────────────────────────────────────
   A SECOND illustration beside explanatory text, mid-page — for pages with more
   than one thing worth showing (e.g. the gate terminal AND the box's dashboard). */
export function FeatureSplitSection({
  idPrefix,
  title,
  body,
  side = "right",
  visual,
  tinted,
}: {
  idPrefix: string;
  title: string;
  body: string;
  /** which side the visual sits on at lg+ */
  side?: "left" | "right";
  /** a SECOND illustration. Omit it and the block becomes a wide lead-in +
   *  prose — still a distinct shape from `problem`, and honest: an empty
   *  decorative panel would be worse than no panel. */
  visual?: ReactNode;
  tinted?: boolean;
}) {
  const hid = `${idPrefix}-split-title`;
  if (!visual) {
    return (
      <Section labelledBy={hid} tinted={tinted}>
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
          <h2 id={hid} className="lg:col-span-5 text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white text-balance">{title}</h2>
          <p className="lg:col-span-7 text-lg text-slate-600 dark:text-slate-300 leading-relaxed">{body}</p>
        </div>
      </Section>
    );
  }
  return (
    <Section labelledBy={hid} tinted={tinted}>
      <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
        <div className={side === "left" ? "lg:order-2" : ""}>
          <h2 id={hid} className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-5">{title}</h2>
          <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">{body}</p>
        </div>
        <div className={side === "left" ? "lg:order-1" : ""}>
          <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden isolate border border-slate-700/60 bg-gradient-to-br from-slate-800 to-slate-900 shadow-2xl">
            {visual}
          </div>
        </div>
      </div>
    </Section>
  );
}

export type SectionIcon = FC;
