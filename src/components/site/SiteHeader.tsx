"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { translations, type Translations } from "@/lib/i18n/translations";
import { locales, localeNames, type Locale } from "@/lib/i18n/config";
import { MenuIcon, CloseIcon, ChevronDownIcon } from "@/components/icons";
import { localeToFlag } from "@/components/icons/flags";
import { primaryNav } from "@/lib/navigation";
import { anchorHref, swapLocale } from "@/lib/href";

// Shared site header — data-driven from lib/navigation.ts and mounted once in the
// marketing layout, so it appears on every marketing page and is edited in one place.
export default function SiteHeader({ locale }: { locale: Locale }) {
  const t: Translations = translations[locale];
  const pathname = usePathname();

  const [isOpen, setIsOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const langDropdownRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);

  // Check for authentication cookie from cloud.logistiq.ro
  useEffect(() => {
    const cookies = document.cookie.split(";");
    const authCookie = cookies.find((c) => c.trim().startsWith("logistiq_authenticated="));
    if (authCookie && authCookie.split("=")[1] === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  // Close language dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target as Node)) {
        setIsLangOpen(false);
      }
    };
    if (isLangOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isLangOpen]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Close the mobile menu whenever the route changes (nav is now global).
  useEffect(() => {
    setIsOpen(false);
    setIsLangOpen(false);
  }, [pathname]);

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
            {primaryNav.map((item) => (
              <Link
                key={item.key}
                href={item.href(locale)}
                className="text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 transition-colors font-medium"
              >
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
            <div className="flex flex-col gap-2" role="menu">
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
