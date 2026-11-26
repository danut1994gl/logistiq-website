"use client";

import Link from "next/link";
import { use } from "react";
import { translations } from "@/lib/i18n/translations";
import { isValidLocale } from "@/lib/i18n/config";
import { cookieKind, type CookieKind } from "@/lib/cookie-kinds";
import { company } from "@/lib/company";
import { registeredOffice } from "@/lib/legal-identity";

function Section({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <section
      className="mb-10 animate-fade-in"
      style={{ animationDelay: `${delay * 0.05}s` }}
    >
      {children}
    </section>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
      {children}
    </h2>
  );
}

function Paragraph({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-slate-600 dark:text-slate-300 mb-3 leading-relaxed">
      {children}
    </p>
  );
}

function CookieTypeCard({
  name,
  desc,
}: {
  name: string;
  desc: string;
}) {
  return (
    <div className="border-l-2 border-blue-500 pl-4 py-1 mb-3">
      <span className="font-medium text-slate-900 dark:text-white">{name}</span>
      <span className="text-slate-600 dark:text-slate-400"> - {desc}</span>
    </div>
  );
}

type CookieHeaders = {
  name: string;
  duration: string;
  purpose: string;
  kind: string;
  setWhen: string;
  site: string;
  item: string;
  kept: string;
};

type SiteCookies = {
  site: string;
  desc: string;
  cookies: { name: string; purpose: string; duration: string; setWhen: string }[];
};

const th = "text-left py-2 pr-4 font-medium text-slate-900 dark:text-white align-bottom";
const td = "py-2 pr-4 align-top";

// One site's cookies: the domain as the card's heading, its description, then the table.
// Long names and durations wrap (break-all on the name), so the table fits a phone inside
// its scrolling wrapper instead of pushing the page sideways.
function SiteCookiesCard({
  site,
  headers,
  kinds,
}: {
  site: SiteCookies;
  headers: CookieHeaders;
  kinds: Record<CookieKind, string>;
}) {
  return (
    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-5 mb-4">
      <h3 className="font-semibold text-slate-900 dark:text-white mb-2 font-mono">{site.site}</h3>
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{site.desc}</p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700">
              <th className={th}>{headers.name}</th>
              <th className={th}>{headers.kind}</th>
              <th className={th}>{headers.purpose}</th>
              <th className={th}>{headers.duration}</th>
              <th className={`${th} pr-0`}>{headers.setWhen}</th>
            </tr>
          </thead>
          <tbody>
            {site.cookies.map((cookie) => (
              <tr key={cookie.name} className="border-b border-slate-100 dark:border-slate-800">
                <td className={`${td} font-mono text-blue-600 dark:text-blue-400 break-all min-w-[8rem]`}>{cookie.name}</td>
                <td className={`${td} text-slate-500 dark:text-slate-400 min-w-[6rem]`}>{kinds[cookieKind(cookie.name)]}</td>
                <td className={`${td} text-slate-600 dark:text-slate-300 min-w-[12rem]`}>{cookie.purpose}</td>
                <td className={`${td} text-slate-500 dark:text-slate-400 min-w-[7rem]`}>{cookie.duration}</td>
                <td className={`${td} pr-0 text-slate-600 dark:text-slate-300 min-w-[9rem]`}>{cookie.setWhen}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Local and session storage, which the policy lists apart as similar technologies.
function StorageCard({
  storage,
  headers,
}: {
  storage: { title: string; intro: string; items: { site: string; name: string; purpose: string; kept: string }[] };
  headers: CookieHeaders;
}) {
  return (
    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-5 mb-4">
      <h3 className="font-semibold text-slate-900 dark:text-white mb-2">{storage.title}</h3>
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{storage.intro}</p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700">
              <th className={th}>{headers.site}</th>
              <th className={th}>{headers.item}</th>
              <th className={th}>{headers.purpose}</th>
              <th className={`${th} pr-0`}>{headers.kept}</th>
            </tr>
          </thead>
          <tbody>
            {storage.items.map((item) => (
              <tr key={`${item.site} ${item.name}`} className="border-b border-slate-100 dark:border-slate-800">
                <td className={`${td} font-mono text-slate-500 dark:text-slate-400`}>{item.site}</td>
                <td className={`${td} font-mono text-blue-600 dark:text-blue-400 break-all min-w-[8rem]`}>{item.name}</td>
                <td className={`${td} text-slate-600 dark:text-slate-300 min-w-[12rem]`}>{item.purpose}</td>
                <td className={`${td} pr-0 text-slate-500 dark:text-slate-400 min-w-[7rem]`}>{item.kept}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ThirdPartyCard({
  name,
  purpose,
  url,
}: {
  name: string;
  purpose: string;
  url: string;
}) {
  return (
    <div className="flex items-start gap-3 py-2">
      <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
      <div className="min-w-0">
        <span className="font-medium text-slate-900 dark:text-white">
          {name}
        </span>
        <span className="text-slate-600 dark:text-slate-400"> - {purpose}</span>
        <a
          href={`https://${url}`}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-2 text-sm text-blue-600 dark:text-blue-400 hover:underline break-all"
        >
          ({url})
        </a>
      </div>
    </div>
  );
}

function BrowserCard({
  name,
  steps,
}: {
  name: string;
  steps: string;
}) {
  return (
    <div className="border-l-2 border-slate-300 dark:border-slate-600 pl-4 py-2 mb-3">
      <h4 className="font-medium text-slate-900 dark:text-white">{name}</h4>
      <p className="text-sm text-slate-600 dark:text-slate-400">{steps}</p>
    </div>
  );
}

export default function CookiesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = use(params);
  const locale = isValidLocale(localeParam) ? localeParam : "en";
  const t = translations[locale].cookies;
  const legal = translations[locale].legal;

  return (
    <main className="min-h-screen bg-white dark:bg-slate-950">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 sticky top-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href={`/${locale}`}
            className="flex items-center gap-2 text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">L</span>
            </div>
            <span className="font-semibold">Logistiq</span>
          </Link>
        </div>
      </header>

      {/* Content */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Title */}
        <header className="mb-12 animate-fade-in">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-3">
            {t.title}
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            {t.lastUpdated}
            {locale === "fr" ? "\u00a0: " : ": "}
            {legal.updatedOn}
          </p>
        </header>

        {/* Section 1: Introduction */}
        <Section delay={1}>
          <SectionTitle>{t.intro.title}</SectionTitle>
          <Paragraph>{t.intro.p1}</Paragraph>
          <Paragraph>{t.intro.p2}</Paragraph>
        </Section>

        {/* Section 2: What are Cookies */}
        <Section delay={2}>
          <SectionTitle>{t.whatAreCookies.title}</SectionTitle>
          <Paragraph>{t.whatAreCookies.content}</Paragraph>
          <div className="mt-4">
            <h3 className="font-medium text-slate-800 dark:text-slate-200 mb-3">
              {t.whatAreCookies.types.title}
            </h3>
            <CookieTypeCard
              name={t.whatAreCookies.types.session.name}
              desc={t.whatAreCookies.types.session.desc}
            />
            <CookieTypeCard
              name={t.whatAreCookies.types.persistent.name}
              desc={t.whatAreCookies.types.persistent.desc}
            />
            <CookieTypeCard
              name={t.whatAreCookies.types.firstParty.name}
              desc={t.whatAreCookies.types.firstParty.desc}
            />
            <CookieTypeCard
              name={t.whatAreCookies.types.thirdParty.name}
              desc={t.whatAreCookies.types.thirdParty.desc}
            />
          </div>
        </Section>

        {/* Section 3: Cookies We Use */}
        <Section delay={3}>
          <SectionTitle>{t.cookiesWeUse.title}</SectionTitle>
          <Paragraph>{t.cookiesWeUse.intro}</Paragraph>
          {t.cookiesWeUse.sites.map((site) => (
            <SiteCookiesCard key={site.site} site={site} headers={legal.cookieHeaders} kinds={t.cookiesWeUse.kinds} />
          ))}
          <StorageCard storage={t.cookiesWeUse.storage} headers={legal.cookieHeaders} />
        </Section>

        {/* Section 4: Third Party */}
        <Section delay={4}>
          <SectionTitle>{t.thirdParty.title}</SectionTitle>
          <Paragraph>{t.thirdParty.intro}</Paragraph>
          <div className="my-4">
            {t.thirdParty.services.map((service, i) => (
              <ThirdPartyCard
                key={i}
                name={service.name}
                purpose={service.purpose}
                url={service.url}
              />
            ))}
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 italic">
            {t.thirdParty.note}
          </p>
        </Section>

        {/* Section 5: Manage Cookies */}
        <Section delay={5}>
          <SectionTitle>{t.manageCookies.title}</SectionTitle>
          <Paragraph>{t.manageCookies.intro}</Paragraph>
          <div className="mt-4">
            {t.manageCookies.browsers.map((browser, i) => (
              <BrowserCard key={i} name={browser.name} steps={browser.steps} />
            ))}
          </div>
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mt-4">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              {t.manageCookies.warning}
            </p>
          </div>
        </Section>

        {/* Section 6: Changes */}
        <Section delay={6}>
          <SectionTitle>{t.changes.title}</SectionTitle>
          <Paragraph>{t.changes.content}</Paragraph>
        </Section>

        {/* Section 7: Contact */}
        <Section delay={7}>
          <SectionTitle>{t.contact.title}</SectionTitle>
          <Paragraph>{t.contact.intro}</Paragraph>
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 mt-4">
            <div className="space-y-2">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {t.contact.operator}
              </p>
              <p className="font-semibold text-slate-900 dark:text-white text-lg">
                {company.legalName}
              </p>
              <p className="text-slate-600 dark:text-slate-300">
                {legal.identity.taxId} {company.cui}
              </p>
              <p className="text-slate-600 dark:text-slate-300">
                {legal.identity.regNo} {company.regCom}
              </p>
              <p className="text-slate-600 dark:text-slate-300">
                {registeredOffice(translations[locale])}
              </p>
              <div className="pt-3 border-t border-slate-200 dark:border-slate-700 mt-3">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {t.contact.email}
                </p>
                <a
                  href={`mailto:${company.email}`}
                  className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                >
                  {company.email}
                </a>
              </div>
            </div>
          </div>
        </Section>
      </article>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            &copy; 2026 Logistiq.{" "}
            {translations[locale].footer.allRights}
          </p>
          <Link
            href={`/${locale}`}
            className="text-blue-600 dark:text-blue-400 hover:underline text-sm mt-2 inline-block"
          >
            {legal.backHome}
          </Link>
        </div>
      </footer>
    </main>
  );
}
