"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { translations, type Translations } from "@/lib/i18n/translations";
import { locales, localeNames, type Locale } from "@/lib/i18n/config";
import { MenuIcon, CloseIcon, ChevronDownIcon } from "@/components/icons";
import { localeToFlag } from "@/components/icons/flags";
import { primaryNav, featuresNavHref } from "@/lib/navigation";
import { anchorHref, swapLocale } from "@/lib/href";
import { features, featureTitle, featureColorMap } from "@/lib/features";

// Shared site header — data-driven from lib/navigation.ts + lib/features.ts and
// mounted once in the marketing layout. "Funcționalități" is a mega-menu that lists
// the feature registry and links to the per-feature pages.
export default function SiteHeader({ locale }: { locale: Locale }) {
  const t: Translations = translations[locale];
  const pathname = usePathname();

  const [isOpen, setIsOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isFeaturesOpen, setIsFeaturesOpen] = useState(false);
  const [isMobileFeaturesOpen, setIsMobileFeaturesOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const langDropdownRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const cookies = document.cookie.split(";");
    const authCookie = cookies.find((c) => c.trim().startsWith("logistiq_authenticated="));
    if (authCookie && authCookie.split("=")[1] === "true") setIsAuthenticated(true);
  }, []);

  // Close any open dropdown when clicking outside it.
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (langDropdownRef.current && !langDropdownRef.current.contains(target)) setIsLangOpen(false);
      if (featuresRef.current && !featuresRef.current.contains(target)) setIsFeaturesOpen(false);
      if (navRef.current && !navRef.current.contains(target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close everything on route change (nav is global).
  useEffect(() => {
    setIsOpen(false);
    setIsLangOpen(false);
    setIsFeaturesOpen(false);
    setIsMobileFeaturesOpen(false);
  }, [pathname]);

  const linkClass =
    "text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 transition-colors font-medium";

  return (
    <nav
      ref={navRef}
      className="fixed top-0 w-full z-50 transition-all duration-300 glass shadow-lg"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center gap-3 group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/banner-nav.svg" alt="Logistiq" className="h-10 md:h-11 w-auto" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {/* Funcționalități mega-menu */}
            <div ref={featuresRef} className="relative">
              <button
                onClick={() => setIsFeaturesOpen((v) => !v)}
                className={`flex items-center gap-1 ${linkClass}`}
                aria-expanded={isFeaturesOpen}
                aria-haspopup="menu"
              >
                {t.nav.features}
                <span className={`transition-transform ${isFeaturesOpen ? "rotate-180" : ""}`}>
                  <ChevronDownIcon />
                </span>
              </button>
              {isFeaturesOpen && (
                <div
                  role="menu"
                  className="absolute left-1/2 -translate-x-1/2 mt-4 w-[640px] max-w-[92vw] bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-4 animate-fade-in-down"
                >
                  <div className="grid grid-cols-2 gap-1">
                    {features.map((f) => {
                      const c = featureColorMap[f.color];
                      const Icon = f.icon;
                      return (
                        <Link
                          key={f.id}
                          role="menuitem"
                          href={`/${locale}/functionalitati/${f.slug}`}
                          className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors"
                        >
                          <span className={`flex-shrink-0 w-9 h-9 rounded-lg ${c.bg} ${c.darkBg} flex items-center justify-center`}>
                            <span className={`${c.text} ${c.darkText}`}>
                              <Icon />
                            </span>
                          </span>
                          <span className="text-sm font-medium text-slate-800 dark:text-slate-100">
                            {featureTitle(t, f.id)}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                  <div className="mt-2 pt-3 border-t border-slate-200 dark:border-slate-700">
                    <Link
                      href={featuresNavHref(locale)}
                      className="flex items-center justify-center gap-1 text-sm font-medium text-blue-600 dark:text-blue-400 hover:gap-2 transition-all py-1"
                    >
                      {t.nav.features} →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {primaryNav.map((item) => (
              <Link key={item.key} href={item.href(locale)} className={linkClass}>
                {item.label(t)}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {/* Language Switcher */}
            <div ref={langDropdownRef} className="relative">
              <button
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Select language"
                aria-expanded={isLangOpen}
                aria-haspopup="menu"
              >
                {(() => {
                  const FlagComponent = localeToFlag[locale];
                  return <FlagComponent />;
                })()}
                <ChevronDownIcon />
              </button>
              {isLangOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-44 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 animate-fade-in-down"
                >
                  {locales.map((loc) => {
                    const FlagComponent = localeToFlag[loc];
                    return (
                      <Link
                        key={loc}
                        role="menuitem"
                        href={swapLocale(loc, pathname)}
                        aria-current={loc === locale ? "true" : undefined}
                        className={`flex items-center gap-3 px-4 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${
                          loc === locale ? "bg-blue-50 dark:bg-blue-900/20" : ""
                        }`}
                        onClick={() => setIsLangOpen(false)}
                      >
                        <FlagComponent />
                        <span className="text-sm font-medium">{localeNames[loc]}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Login/Dashboard Link */}
            <Link
              href={isAuthenticated ? "https://cloud.logistiq.ro/dashboard" : "https://cloud.logistiq.ro"}
              className="hidden sm:block text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 transition-colors font-medium"
            >
              {isAuthenticated ? t.nav.dashboard : t.nav.login}
            </Link>

            {/* CTA Button */}
            <Link
              href={anchorHref(locale, "contact")}
              className="hidden sm:flex btn-primary text-white px-5 py-2.5 rounded-xl font-medium items-center gap-2"
            >
              {t.nav.requestDemo}
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label={isOpen ? "Close menu" : "Open menu"}
              aria-expanded={isOpen}
              aria-controls="mobile-menu"
            >
              {isOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div id="mobile-menu" className="lg:hidden py-4 border-t border-slate-200 dark:border-slate-700 animate-fade-in">
            <div className="flex flex-col gap-1" role="menu">
              {/* Funcționalități accordion */}
              <button
                onClick={() => setIsMobileFeaturesOpen((v) => !v)}
                aria-expanded={isMobileFeaturesOpen}
                className="px-4 py-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium flex items-center justify-between"
              >
                {t.nav.features}
                <span className={`transition-transform ${isMobileFeaturesOpen ? "rotate-180" : ""}`}>
                  <ChevronDownIcon />
                </span>
              </button>
              {isMobileFeaturesOpen && (
                <div className="pl-4 flex flex-col gap-1">
                  {features.map((f) => (
                    <Link
                      key={f.id}
                      href={`/${locale}/functionalitati/${f.slug}`}
                      onClick={() => setIsOpen(false)}
                      className="px-4 py-2.5 rounded-lg text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300"
                    >
                      {featureTitle(t, f.id)}
                    </Link>
                  ))}
                  <Link
                    href={featuresNavHref(locale)}
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2.5 rounded-lg text-sm font-medium text-blue-600 dark:text-blue-400"
                  >
                    {t.nav.features} →
                  </Link>
                </div>
              )}

              {primaryNav.map((item) => (
                <Link
                  key={item.key}
                  href={item.href(locale)}
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium"
                >
                  {item.label(t)}
                </Link>
              ))}

              <div className="pt-4 mt-2 border-t border-slate-200 dark:border-slate-700">
                <Link
                  href={anchorHref(locale, "contact")}
                  onClick={() => setIsOpen(false)}
                  className="block btn-primary text-white px-4 py-3 rounded-xl font-medium text-center"
                >
                  {t.nav.requestDemo}
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
