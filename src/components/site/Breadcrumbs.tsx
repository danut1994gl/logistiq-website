import Link from "next/link";

export type Crumb = { label: string; href?: string };

// Styled breadcrumb, tuned to the dark brand: a home glyph, chevron separators,
// muted text that lifts to the link color on hover, current page in solid text.
export function Breadcrumbs({ items, className = "" }: { items: Crumb[]; className?: string }) {
  return (
    <nav aria-label="breadcrumb" className={className}>
      <ol className="flex items-center flex-wrap gap-x-2 gap-y-1 text-sm">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={i} className="flex items-center gap-2">
              {i > 0 && (
                <svg
                  aria-hidden
                  viewBox="0 0 24 24"
                  className="w-3.5 h-3.5 text-slate-600 dark:text-slate-600 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
              {isLast || !item.href ? (
                <span aria-current="page" className="font-medium text-slate-800 dark:text-slate-200">
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  {i === 0 ? (
                    <span className="inline-flex items-center gap-1.5">
                      <svg aria-hidden viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 12l9-9 9 9M5 10v10a1 1 0 001 1h3v-6h4v6h3a1 1 0 001-1V10"
                        />
                      </svg>
                      {item.label}
                    </span>
                  ) : (
                    item.label
                  )}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
