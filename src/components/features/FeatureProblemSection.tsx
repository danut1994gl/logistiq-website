import { CheckIcon, CloseIcon } from "@/components/icons";

// Generic "what problem do we solve" narrative: prose left, old-vs-new
// comparison card right. Reusable across feature pages (props = localized
// strings only). Server Component.
export function FeatureProblemSection({
  idPrefix = "feature",
  eyebrow,
  title,
  paragraphs,
  compare,
  reverse = false,
  tinted = false,
}: {
  // pages compose sections in different orders and may repeat a type — a
  // hard-coded heading id would collide and break aria-labelledby
  idPrefix?: string;
  eyebrow: string;
  title: string;
  paragraphs: string[];
  compare: { oldTitle: string; newTitle: string; oldRows: string[]; newRows: string[] };
  /** put the compare cards on the LEFT and the narrative on the right */
  reverse?: boolean;
  tinted?: boolean;
}) {
  const hid = `${idPrefix}-problem-title`;
  return (
    <section aria-labelledby={hid} className={`py-16 lg:py-24 ${tinted ? "bg-slate-50 dark:bg-slate-900/50" : ""}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
        <div className={reverse ? "lg:order-2" : ""}>
          <div className="text-sm font-semibold tracking-widest uppercase text-blue-600 dark:text-blue-400 mb-3">
            {eyebrow}
          </div>
          <h2 id={hid} className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-6">
            {title}
          </h2>
          {paragraphs.map((p, i) => (
            <p key={i} className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
              {p}
            </p>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
            <h3 className="font-bold text-slate-500 dark:text-slate-400 mb-4">{compare.oldTitle}</h3>
            <ul className="space-y-3">
              {compare.oldRows.map((row, i) => (
                <li key={i} className="flex gap-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  <span className="mt-0.5 w-5 h-5 shrink-0 rounded-full bg-red-100 dark:bg-red-900/30 text-red-500 flex items-center justify-center [&_svg]:w-3 [&_svg]:h-3">
                    <CloseIcon />
                  </span>
                  {row}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border-2 border-blue-500/60 bg-white dark:bg-slate-800 p-6 shadow-lg shadow-blue-500/10">
            <h3 className="font-bold text-blue-600 dark:text-blue-400 mb-4">{compare.newTitle}</h3>
            <ul className="space-y-3">
              {compare.newRows.map((row, i) => (
                <li key={i} className="flex gap-3 text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                  <span className="mt-0.5 w-5 h-5 shrink-0 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500 flex items-center justify-center [&_svg]:w-3 [&_svg]:h-3">
                    <CheckIcon />
                  </span>
                  {row}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
