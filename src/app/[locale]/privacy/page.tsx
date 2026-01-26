"use client";

import Link from "next/link";
import { use } from "react";
import { translations } from "@/lib/i18n/translations";
import { isValidLocale } from "@/lib/i18n/config";

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

function List({ items }: { items: string[] }) {
  return (
    <ul className="list-disc list-inside space-y-1.5 text-slate-600 dark:text-slate-300 ml-2">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
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

function LegalBasisCard({
  title,
  desc,
}: {
  title: string;
  desc: string;
}) {
  return (
    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 mb-3">
      <h4 className="font-medium text-slate-900 dark:text-white mb-1">
        {title}
      </h4>
      <p className="text-sm text-slate-600 dark:text-slate-400">{desc}</p>
    </div>
  );
}

function PartnerCard({ name, purpose }: { name: string; purpose: string }) {
  return (
    <div className="flex items-start gap-3 py-2">
      <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
      <div>
        <span className="font-medium text-slate-900 dark:text-white">
          {name}
        </span>
        <span className="text-slate-600 dark:text-slate-400"> - {purpose}</span>
      </div>
    </div>
  );
}

function RetentionTable({
  periods,
}: {
  periods: { type: string; duration: string }[];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-700">
            <th className="text-left py-2 pr-4 font-medium text-slate-900 dark:text-white">
              Tip date
            </th>
            <th className="text-left py-2 font-medium text-slate-900 dark:text-white">
              Durată
            </th>
          </tr>
        </thead>
        <tbody>
          {periods.map((period, i) => (
            <tr
              key={i}
              className="border-b border-slate-100 dark:border-slate-800"
            >
              <td className="py-2 pr-4 text-slate-600 dark:text-slate-300">
                {period.type}
              </td>
              <td className="py-2 text-slate-600 dark:text-slate-300">
                {period.duration}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RightCard({ name, desc }: { name: string; desc: string }) {
  return (
    <div className="border-l-2 border-blue-500 pl-4 py-1 mb-3">
      <h4 className="font-medium text-slate-900 dark:text-white">{name}</h4>
      <p className="text-sm text-slate-600 dark:text-slate-400">{desc}</p>
    </div>
  );
}

export default function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = use(params);
  const locale = isValidLocale(localeParam) ? localeParam : "ro";
  const t = translations[locale].privacy;

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
            {t.lastUpdated}: 26 Ianuarie 2026
          </p>
        </header>

        {/* Section 1: Introduction */}
        <Section delay={1}>
          <SectionTitle>{t.intro.title}</SectionTitle>
          <Paragraph>{t.intro.p1}</Paragraph>
          <Paragraph>{t.intro.p2}</Paragraph>
        </Section>

        {/* Section 2: Data Collected */}
        <Section delay={2}>
          <SectionTitle>{t.dataCollected.title}</SectionTitle>
          <SubSection title={t.dataCollected.identification.title}>
            <List items={t.dataCollected.identification.items} />
          </SubSection>
          <SubSection title={t.dataCollected.contact.title}>
            <List items={t.dataCollected.contact.items} />
          </SubSection>
          <SubSection title={t.dataCollected.billing.title}>
            <List items={t.dataCollected.billing.items} />
          </SubSection>
          <SubSection title={t.dataCollected.technical.title}>
            <List items={t.dataCollected.technical.items} />
          </SubSection>
          <SubSection title={t.dataCollected.activity.title}>
            <List items={t.dataCollected.activity.items} />
          </SubSection>
        </Section>

        {/* Section 3: Purposes */}
        <Section delay={3}>
          <SectionTitle>{t.purposes.title}</SectionTitle>
          <List items={t.purposes.list} />
        </Section>

        {/* Section 4: Legal Basis */}
        <Section delay={4}>
          <SectionTitle>{t.legalBasis.title}</SectionTitle>
          <LegalBasisCard
            title={t.legalBasis.contract.title}
            desc={t.legalBasis.contract.desc}
          />
          <LegalBasisCard
            title={t.legalBasis.legal.title}
            desc={t.legalBasis.legal.desc}
          />
          <LegalBasisCard
            title={t.legalBasis.legitimate.title}
            desc={t.legalBasis.legitimate.desc}
          />
          <LegalBasisCard
            title={t.legalBasis.consent.title}
            desc={t.legalBasis.consent.desc}
          />
        </Section>

        {/* Section 5: Third Parties */}
        <Section delay={5}>
          <SectionTitle>{t.thirdParties.title}</SectionTitle>
          <Paragraph>{t.thirdParties.intro}</Paragraph>
          <div className="my-4">
            {t.thirdParties.partners.map((partner, i) => (
              <PartnerCard
                key={i}
                name={partner.name}
                purpose={partner.purpose}
              />
            ))}
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 italic">
            {t.thirdParties.note}
          </p>
        </Section>

        {/* Section 6: International Transfers */}
        <Section delay={6}>
          <SectionTitle>{t.internationalTransfers.title}</SectionTitle>
          <Paragraph>{t.internationalTransfers.content}</Paragraph>
        </Section>

        {/* Section 7: Retention */}
        <Section delay={7}>
          <SectionTitle>{t.retention.title}</SectionTitle>
          <RetentionTable periods={t.retention.periods} />
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-3 italic">
            {t.retention.note}
          </p>
        </Section>

        {/* Section 8: Rights */}
        <Section delay={8}>
          <SectionTitle>{t.rights.title}</SectionTitle>
          <Paragraph>{t.rights.intro}</Paragraph>
          <div className="mt-4">
            {t.rights.list.map((right, i) => (
              <RightCard key={i} name={right.name} desc={right.desc} />
            ))}
          </div>
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mt-4">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              {t.rights.complaint}
            </p>
          </div>
        </Section>

        {/* Section 9: Security */}
        <Section delay={9}>
          <SectionTitle>{t.security.title}</SectionTitle>
          <Paragraph>{t.security.intro}</Paragraph>
          <List items={t.security.measures} />
        </Section>

        {/* Section 10: Cookies */}
        <Section delay={10}>
          <SectionTitle>{t.cookies.title}</SectionTitle>
          <Paragraph>{t.cookies.content}</Paragraph>
        </Section>

        {/* Section 11: Children */}
        <Section delay={11}>
          <SectionTitle>{t.children.title}</SectionTitle>
          <Paragraph>{t.children.content}</Paragraph>
        </Section>

        {/* Section 12: Changes */}
        <Section delay={12}>
          <SectionTitle>{t.changes.title}</SectionTitle>
          <Paragraph>{t.changes.content}</Paragraph>
        </Section>

        {/* Section 13: Contact */}
        <Section delay={13}>
          <SectionTitle>{t.contact.title}</SectionTitle>
          <Paragraph>{t.contact.intro}</Paragraph>
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 mt-4">
            <div className="space-y-2">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {t.contact.operator}
              </p>
              <p className="font-semibold text-slate-900 dark:text-white text-lg">
                {t.contact.operatorName}
              </p>
              <p className="text-slate-600 dark:text-slate-300">
                {t.contact.cui}
              </p>
              <p className="text-slate-600 dark:text-slate-300">
                {t.contact.regNo}
              </p>
              <p className="text-slate-600 dark:text-slate-300">
                {t.contact.address}
              </p>
              <div className="pt-3 border-t border-slate-200 dark:border-slate-700 mt-3">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {t.contact.email}
                </p>
                <a
                  href={`mailto:${t.contact.emailAddress}`}
                  className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                >
                  {t.contact.emailAddress}
                </a>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 pt-2">
                {t.contact.responseTime}
              </p>
            </div>
          </div>
        </Section>
      </article>

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
