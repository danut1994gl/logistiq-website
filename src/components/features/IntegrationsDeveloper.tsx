import type { ReactNode } from "react";
import type { Translations } from "@/lib/i18n/translations";
import type { Locale } from "@/lib/i18n/config";
import { API_KEYS_URL, OPENAPI_URL, apiDocsUrl } from "@/lib/api-docs";
import { ApiIcon, ArrowRightIcon, ClockIcon, GateIcon, MapPinIcon, QrCodeIcon, UsersIcon } from "@/components/icons";

// The integrations page's two developer sections (owner, 2026-11-28: use cases that help,
// and the API's links and logo on the page):
//   - what you can build: the six use cases of the public documentation's home page, each
//     card opening the calls it uses. The gate one says what is true today: every scan
//     QRGo Access makes, with its outcome (opening the barrier is in progress, so no card
//     says a gate lets a truck through);
//   - start building: the "Logistiq API </>" lockup of api.logistiq.cloud/docs
//     (public/logistiq-api.svg, generated from that page's pinned brand pieces), the quick
//     start in one sentence, and the documentation's pages.
// Server Components; every link leaves the site, so each opens in a new tab.

const ext = { target: "_blank", rel: "noopener noreferrer" } as const;

const CodeIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m18 16 4-4-4-4M6 8l-4 4 4 4m8.5-12-5 16" />
  </svg>
);
const BookIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.25C10.5 5 8.5 4.5 6 4.5c-1 0-2 .1-3 .4v14c1-.3 2-.4 3-.4 2.5 0 4.5.5 6 1.75m0-14c1.5-1.25 3.5-1.75 6-1.75 1 0 2 .1 3 .4v14c-1-.3-2-.4-3-.4-2.5 0-4.5.5-6 1.75m0-14v14" />
  </svg>
);
const BoltIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 3 4 14h7l-1 7 9-11h-7l1-7z" />
  </svg>
);
const FileIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8l-5-5zm0 0v5h5M9 13h6M9 17h4" />
  </svg>
);
const ListIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01" />
  </svg>
);
const KeyIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 0 1 2 2m4 0a6 6 0 0 1-7.74 5.74L11 17H9v2H7v2H3v-3.59l6.26-6.26A6 6 0 1 1 21 9z" />
  </svg>
);

export function ApiUseCasesSection({ t, locale }: { t: Translations; locale: Locale }) {
  const f = t.f16Page;
  const cases: { title: string; desc: string; page: string; icon: ReactNode }[] = [
    { title: f.uc1t, desc: f.uc1d, page: "reference#group-checkins", icon: <QrCodeIcon /> },
    { title: f.uc2t, desc: f.uc2d, page: "reference#group-bookings", icon: <ClockIcon /> },
    { title: f.uc3t, desc: f.uc3d, page: "reference#group-yard", icon: <MapPinIcon /> },
    { title: f.uc4t, desc: f.uc4d, page: "reference#group-gates", icon: <GateIcon /> },
    { title: f.uc5t, desc: f.uc5d, page: "reference#group-users", icon: <UsersIcon /> },
    { title: f.uc6t, desc: f.uc6d, page: "guides/receive-webhooks", icon: <ApiIcon /> },
  ];
  return (
    <section aria-labelledby="in16-uc-title" className="py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 id="in16-uc-title" className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">{f.ucTitle}</h2>
          <p className="text-lg text-slate-600 dark:text-slate-300">{f.ucSub}</p>
        </div>
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cases.map((c, i) => (
            <li key={i}>
              <a
                href={apiDocsUrl(locale, c.page)}
                {...ext}
                className="group flex h-full flex-col bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 card-hover"
              >
                <span className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform" aria-hidden="true">
                  {c.icon}
                </span>
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">{c.title}</h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed flex-1">{c.desc}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--link)]">
                  {f.ucLink}
                  <span className="transition-transform group-hover:translate-x-0.5 [&_svg]:w-4 [&_svg]:h-4" aria-hidden="true"><ArrowRightIcon /></span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function ApiDeveloperSection({ t, locale }: { t: Translations; locale: Locale }) {
  const f = t.f16Page;
  const resources: { label: string; href: string; icon: ReactNode }[] = [
    { label: f.devReference, href: apiDocsUrl(locale, "reference"), icon: <ListIcon /> },
    { label: f.devWebhooks, href: apiDocsUrl(locale, "guides/receive-webhooks"), icon: <BoltIcon /> },
    { label: f.devOpenapi, href: OPENAPI_URL, icon: <FileIcon /> },
    { label: f.devChangelog, href: apiDocsUrl(locale, "changelog"), icon: <BookIcon /> },
  ];
  return (
    <section aria-labelledby="in16-dev-title" className="py-16 lg:py-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-slate-700/60 bg-gradient-to-br from-slate-800 to-slate-900 shadow-2xl">
          <div aria-hidden="true" className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-blue-600/20 blur-3xl" />
          <div className="relative grid gap-10 p-8 sm:p-10 lg:grid-cols-5 lg:gap-12">
            <div className="lg:col-span-3">
              {/* an SVG, as the header's logo: next/image would not optimise it */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logistiq-api.svg" alt="Logistiq API" width={1057} height={170} className="h-9 sm:h-10 w-auto mb-6" />
              <h2 id="in16-dev-title" className="text-2xl sm:text-3xl font-bold text-white mb-3">{f.devTitle}</h2>
              <p className="text-slate-300 leading-relaxed mb-7">{f.devSub}</p>
              <div className="flex flex-wrap gap-3">
                <a href={apiDocsUrl(locale)} {...ext}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-lg shadow-blue-600/25 hover:bg-blue-500 transition-colors">
                  <CodeIcon />
                  {f.devDocs}
                </a>
                <a href={API_KEYS_URL} {...ext}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-600 bg-slate-800/60 px-5 py-3 font-semibold text-slate-100 hover:border-blue-500 hover:bg-slate-800 transition-colors">
                  <KeyIcon />
                  {f.devKey}
                </a>
              </div>
            </div>
            <div className="lg:col-span-2 flex flex-col justify-center">
              <ul className="divide-y divide-slate-700/70 rounded-2xl border border-slate-700/70 bg-slate-900/40">
                {resources.map((r) => (
                  <li key={r.href}>
                    <a href={r.href} {...ext} className="group flex items-center gap-3 px-4 py-3.5 text-slate-200 hover:text-white hover:bg-slate-800/60 first:rounded-t-2xl last:rounded-b-2xl transition-colors">
                      <span className="text-[#7dd3fc]" aria-hidden="true">{r.icon}</span>
                      <span className="flex-1 font-medium">{r.label}</span>
                      <span className="text-slate-500 group-hover:text-[#7dd3fc] group-hover:translate-x-0.5 transition [&_svg]:w-4 [&_svg]:h-4" aria-hidden="true"><ArrowRightIcon /></span>
                    </a>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-sm text-slate-400">{f.devNote}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
