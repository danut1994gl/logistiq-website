import Link from "next/link";
import { translations, type Translations } from "@/lib/i18n/translations";
import { type Locale } from "@/lib/i18n/config";
import { CookiePreferencesButton } from "@/components/CookieConsent";
import { footerColumns } from "@/lib/navigation";
import { company } from "@/lib/company";

// Shared site footer — data-driven from lib/navigation.ts + lib/company.ts and
// mounted once in the marketing layout. Server Component (no client state).
export default function SiteFooter({ locale }: { locale: Locale }) {
  const t: Translations = translations[locale];
  const year = new Date().getFullYear();
  const socials = Object.entries(company.socials).filter(([, url]) => url);

  return (
    <footer className="bg-slate-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href={`/${locale}`} className="flex items-center gap-2 mb-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/banner-white.svg" alt="Logistiq" className="h-10 w-auto opacity-70" />
            </Link>
            <p className="text-slate-400 mb-6 max-w-sm">{t.footer.description}</p>
            {socials.length > 0 && (
              <div className="flex gap-4">
                {socials.map(([name, url]) => (
                  <a
                    key={name}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-slate-700 transition-colors"
                  >
                    <span className="sr-only">{name}</span>
                    <div className="w-5 h-5 bg-slate-400 rounded" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Company Info */}
          <div>
            <h3 className="font-semibold mb-4">{t.footer.company}</h3>
            <ul className="space-y-2 text-slate-400 text-sm">
              <li className="font-medium text-slate-300">{company.legalName}</li>
              <li>CUI: {company.cui}</li>
              <li>Nr. Reg. Com.: {company.regCom}</li>
              {company.addressLines.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>

          {/* Data-driven columns (Product, Legal) */}
          {footerColumns.map((col) => (
            <div key={col.key}>
              <h3 className="font-semibold mb-4">{col.title(t)}</h3>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.key}>
                    <Link href={link.href(locale)} className="text-slate-400 hover:text-white transition-colors">
                      {link.label(t)}
                    </Link>
                  </li>
                ))}
                {col.key === "legal" && (
                  <li>
                    <CookiePreferencesButton label={t.cookieConsent.managePreferences} />
                  </li>
                )}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-400 text-sm">
            {year} Logistiq. {t.footer.allRights}
          </p>
          <p className="text-slate-400 text-sm flex items-center gap-1">
            {t.footer.madeWith} <span className="text-red-500">&#10084;</span> {t.footer.inRomania}
          </p>
        </div>
      </div>
    </footer>
  );
}
