"use client";

import Link from "next/link";
import { use } from "react";
import { translations } from "@/lib/i18n/translations";
import { isValidLocale } from "@/lib/i18n/config";

function Article({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <article
      className="mb-10 animate-fade-in"
      style={{ animationDelay: `${delay * 0.05}s` }}
    >
      {children}
    </article>
  );
}

function ArticleTitle({ children }: { children: React.ReactNode }) {
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

function List({ items }: { items: string[] }) {
  return (
    <ul className="list-disc list-inside space-y-1.5 text-slate-600 dark:text-slate-300 ml-2">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

function DefinitionCard({ term, def }: { term: string; def: string }) {
  return (
    <div className="border-l-2 border-blue-500 pl-4 py-1 mb-3">
      <span className="font-medium text-slate-900 dark:text-white">{term}</span>
      <span className="text-slate-600 dark:text-slate-400"> - {def}</span>
    </div>
  );
}

function SubSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4">
      <h3 className="font-medium text-slate-800 dark:text-slate-200 mb-2">
        {title}
      </h3>
      {children}
    </div>
  );
}

function InfoCard({
  title,
  content,
}: {
  title: string;
  content: string;
}) {
  return (
    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 mb-3">
      <h4 className="font-medium text-slate-900 dark:text-white mb-1">
        {title}
      </h4>
      <p className="text-sm text-slate-600 dark:text-slate-400">{content}</p>
    </div>
  );
}

function PlanCard({ plan }: { plan: string }) {
  return (
    <div className="flex items-start gap-3 py-2">
      <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
      <span className="text-slate-600 dark:text-slate-300">{plan}</span>
    </div>
  );
}

export default function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = use(params);
  const locale = isValidLocale(localeParam) ? localeParam : "ro";
  const t = translations[locale].terms;

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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Title */}
        <header className="mb-12 animate-fade-in">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-3">
            {t.title}
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            {t.lastUpdated}: 26 Ianuarie 2026
          </p>
          <p className="text-slate-600 dark:text-slate-300 mt-4 leading-relaxed">
            {t.intro}
          </p>
        </header>

        {/* Article 1: Definitions */}
        <Article delay={1}>
          <ArticleTitle>{t.article1.title}</ArticleTitle>
          <Paragraph>{t.article1.content}</Paragraph>
          <div className="mt-4">
            {t.article1.definitions.map((def, i) => (
              <DefinitionCard key={i} term={def.term} def={def.def} />
            ))}
          </div>
        </Article>

        {/* Article 2: Object */}
        <Article delay={2}>
          <ArticleTitle>{t.article2.title}</ArticleTitle>
          <Paragraph>{t.article2.content}</Paragraph>
          <List items={t.article2.items} />
        </Article>

        {/* Article 3: Acceptance */}
        <Article delay={3}>
          <ArticleTitle>{t.article3.title}</ArticleTitle>
          <Paragraph>{t.article3.content}</Paragraph>
          <List items={t.article3.items} />
          <p className="text-sm text-slate-500 dark:text-slate-400 italic mt-3">
            {t.article3.note}
          </p>
        </Article>

        {/* Article 4: Registration */}
        <Article delay={4}>
          <ArticleTitle>{t.article4.title}</ArticleTitle>
          <List items={t.article4.items} />
        </Article>

        {/* Article 5: Duration */}
        <Article delay={5}>
          <ArticleTitle>{t.article5.title}</ArticleTitle>
          <InfoCard
            title={t.article5.trial.title}
            content={t.article5.trial.content}
          />
          <InfoCard
            title={t.article5.subscription.title}
            content={t.article5.subscription.content}
          />
          <InfoCard
            title={t.article5.cancellation.title}
            content={t.article5.cancellation.content}
          />
        </Article>

        {/* Article 6: Prices */}
        <Article delay={6}>
          <ArticleTitle>{t.article6.title}</ArticleTitle>
          <List items={t.article6.items} />
          <div className="mt-4">
            <SubSection title={t.article6.plans.title}>
              <PlanCard plan={t.article6.plans.professional} />
              <PlanCard plan={t.article6.plans.enterprise5} />
              <PlanCard plan={t.article6.plans.enterprise10} />
              <PlanCard plan={t.article6.plans.enterprise25} />
            </SubSection>
          </div>
        </Article>

        {/* Article 7: Upgrade/Downgrade */}
        <Article delay={7}>
          <ArticleTitle>{t.article7.title}</ArticleTitle>
          <InfoCard
            title={t.article7.upgrade.title}
            content={t.article7.upgrade.content}
          />
          <InfoCard
            title={t.article7.downgrade.title}
            content={t.article7.downgrade.content}
          />
        </Article>

        {/* Article 8: Features */}
        <Article delay={8}>
          <ArticleTitle>{t.article8.title}</ArticleTitle>
          <SubSection title={t.article8.included.title}>
            <List items={t.article8.included.items} />
          </SubSection>
          <SubSection title={t.article8.enterprise.title}>
            <List items={t.article8.enterprise.items} />
          </SubSection>
        </Article>

        {/* Article 9: Availability */}
        <Article delay={9}>
          <ArticleTitle>{t.article9.title}</ArticleTitle>
          <Paragraph>{t.article9.content}</Paragraph>
          <SubSection title={t.article9.exclusions.title}>
            <List items={t.article9.exclusions.items} />
          </SubSection>
        </Article>

        {/* Article 10: Client Obligations */}
        <Article delay={10}>
          <ArticleTitle>{t.article10.title}</ArticleTitle>
          <List items={t.article10.items} />
        </Article>

        {/* Article 11: Provider Obligations */}
        <Article delay={11}>
          <ArticleTitle>{t.article11.title}</ArticleTitle>
          <List items={t.article11.items} />
        </Article>

        {/* Article 12: IP */}
        <Article delay={12}>
          <ArticleTitle>{t.article12.title}</ArticleTitle>
          <InfoCard
            title={t.article12.platform.title}
            content={t.article12.platform.content}
          />
          <InfoCard
            title={t.article12.clientData.title}
            content={t.article12.clientData.content}
          />
          <InfoCard
            title={t.article12.license.title}
            content={t.article12.license.content}
          />
        </Article>

        {/* Article 13: Liability */}
        <Article delay={13}>
          <ArticleTitle>{t.article13.title}</ArticleTitle>
          <List items={t.article13.items} />
        </Article>

        {/* Article 14: Termination */}
        <Article delay={14}>
          <ArticleTitle>{t.article14.title}</ArticleTitle>
          <InfoCard
            title={t.article14.byClient.title}
            content={t.article14.byClient.content}
          />
          <InfoCard
            title={t.article14.byProvider.title}
            content={t.article14.byProvider.content}
          />
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mt-3">
            <h4 className="font-medium text-amber-800 dark:text-amber-200 mb-1">
              {t.article14.effects.title}
            </h4>
            <p className="text-sm text-amber-700 dark:text-amber-300">
              {t.article14.effects.content}
            </p>
          </div>
        </Article>

        {/* Article 15: Final */}
        <Article delay={15}>
          <ArticleTitle>{t.article15.title}</ArticleTitle>
          {t.article15.items.map((item, i) => (
            <InfoCard key={i} title={item.title} content={item.content} />
          ))}
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 mt-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-slate-900 dark:text-white">
                {t.article15.contact.title}
              </h4>
              <p className="text-slate-600 dark:text-slate-300">
                {t.article15.contact.address}
              </p>
              <a
                href={`mailto:${t.article15.contact.email}`}
                className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                {t.article15.contact.email}
              </a>
            </div>
          </div>
        </Article>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            &copy; 2026 Logistiq.{" "}
            {locale === "ro"
              ? "Toate drepturile rezervate."
              : "All rights reserved."}
          </p>
          <Link
            href={`/${locale}`}
            className="text-blue-600 dark:text-blue-400 hover:underline text-sm mt-2 inline-block"
          >
            {locale === "ro" ? "Înapoi la pagina principală" : "Back to home"}
          </Link>
        </div>
      </footer>
    </main>
  );
}
