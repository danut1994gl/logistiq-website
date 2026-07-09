"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { translations, type Translations } from "@/lib/i18n/translations";
import { locales, localeNames, type Locale } from "@/lib/i18n/config";
import { MenuIcon, CloseIcon, ChevronDownIcon } from "@/components/icons";
import { localeToFlag } from "@/components/icons/flags";
import { homeHref, featuresNavHref, pricingHref, contactHref, resourcesMenu } from "@/lib/navigation";
import { anchorHref, swapLocale } from "@/lib/href";
import { features, featureTitle, featureColorMap, featurePath } from "@/lib/features";

type Menu = null | "features" | "resources" | "lang";

// Shared site header — data-driven, mounted once in the marketing layout.
// Order: Home · Funcționalități (mega) · Prețuri · Resurse (dropdown) · Contact.
export default function SiteHeader({ locale }: { locale: Locale }) {
  const t: Translations = translations[locale];
  const pathname = usePathname();

  const [open, setOpen] = useState<Menu>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [mobileSub, setMobileSub] = useState<Menu>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const featuresRef = useRef<HTMLDivElement>(null);
  const resourcesRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const cookies = document.cookie.split(";");
    const authCookie = cookies.find((c) => c.trim().startsWith("logistiq_authenticated="));
    if (authCookie && authCookie.split("=")[1] === "true") setIsAuthenticated(true);
  }, []);

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      const target = e.target as Node;
      const refs = { features: featuresRef, resources: resourcesRef, lang: langRef };
      if (open && refs[open]?.current && !refs[open].current!.contains(target)) setOpen(null);
      if (navRef.current && !navRef.current.contains(target)) setIsMobileOpen(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Close everything on route change (nav is global).
  useEffect(() => {
    setOpen(null);
    setIsMobileOpen(false);
    setMobileSub(null);
  }, [pathname]);

  const link = "text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 transition-colors font-medium";
  const toggle = (m: Menu) => setOpen((cur) => (cur === m ? null : m));

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
          <Link href={homeHref(locale)} className="flex items-center gap-3 group shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/banner-nav.svg" alt="Logistiq" className="h-10 md:h-11 w-auto" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-7">
            <Link href={homeHref(locale)} className={link}>
              {t.nav.home}
            </Link>

            {/* Funcționalități mega-menu */}
            <div ref={featuresRef} className="relative">
              <button
                onClick={() => toggle("features")}
                className={`flex items-center gap-1 ${link}`}
                aria-expanded={open === "features"}
                aria-haspopup="menu"
              >
                {t.nav.features}
                <span className={`transition-transform ${open === "features" ? "rotate-180" : ""}`}>
                  <ChevronDownIcon />
                </span>
              </button>
              {open === "features" && (
                <div
                  role="menu"
                  className="absolute left-0 mt-4 w-[640px] max-w-[92vw] bg-white dark:bg-slate-800 rounded-2xl shadow-2xl ring-1 ring-black/5 border border-slate-200 dark:border-slate-700 p-4 animate-fade-in-down"
                >
                  <div className="grid grid-cols-2 gap-1">
                    {features.map((f) => {
                      const c = featureColorMap[f.color];
                      const Icon = f.icon;
                      return (
                        <Link
                          key={f.id}
                          role="menuitem"
                          href={featurePath(locale, f.id)}
                          className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors"
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

            <Link href={pricingHref(locale)} className={link}>
              {t.nav.pricing}
            </Link>

            {/* Resurse dropdown */}
            <div ref={resourcesRef} className="relative">
              <button
                onClick={() => toggle("resources")}
                className={`flex items-center gap-1 ${link}`}
                aria-expanded={open === "resources"}
                aria-haspopup="menu"
              >
                {t.nav.resources}
                <span className={`transition-transform ${open === "resources" ? "rotate-180" : ""}`}>
                  <ChevronDownIcon />
                </span>
              </button>
              {open === "resources" && (
                <div
                  role="menu"
                  className="absolute left-0 mt-4 w-72 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl ring-1 ring-black/5 border border-slate-200 dark:border-slate-700 p-2 animate-fade-in-down"
                >
                  {resourcesMenu.map((item) => (
                    <Link
                      key={item.key}
                      role="menuitem"
                      href={item.href(locale)}
                      className="flex flex-col gap-0.5 p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors"
                    >
                      <span className="text-sm font-medium text-slate-800 dark:text-slate-100">{item.label(t)}</span>
                      {item.desc && <span className="text-xs text-slate-500 dark:text-slate-400">{item.desc(t)}</span>}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link href={contactHref(locale)} className={link}>
              {t.nav.contact}
            </Link>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3 md:gap-4">
            {/* Language Switcher */}
            <div ref={langRef} className="relative">
              <button
                onClick={() => toggle("lang")}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Select language"
                aria-expanded={open === "lang"}
                aria-haspopup="menu"
              >
                {(() => {
                  const FlagComponent = localeToFlag[locale];
                  return <FlagComponent />;
                })()}
                <ChevronDownIcon />
              </button>
              {open === "lang" && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-44 bg-white dark:bg-slate-800 rounded-xl shadow-2xl ring-1 ring-black/5 border border-slate-200 dark:border-slate-700 py-2 animate-fade-in-down"
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
                        onClick={() => setOpen(null)}
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
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label={isMobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMobileOpen}
              aria-controls="mobile-menu"
            >
              {isMobileOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileOpen && (
          <div id="mobile-menu" className="lg:hidden py-4 border-t border-slate-200 dark:border-slate-700 animate-fade-in">
            <div className="flex flex-col gap-1" role="menu">
              <Link href={homeHref(locale)} onClick={() => setIsMobileOpen(false)} className="px-4 py-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium">
                {t.nav.home}
              </Link>

              {/* Funcționalități accordion */}
              <button
                onClick={() => setMobileSub((s) => (s === "features" ? null : "features"))}
                aria-expanded={mobileSub === "features"}
                className="px-4 py-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium flex items-center justify-between"
              >
                {t.nav.features}
                <span className={`transition-transform ${mobileSub === "features" ? "rotate-180" : ""}`}>
                  <ChevronDownIcon />
                </span>
              </button>
              {mobileSub === "features" && (
                <div className="pl-4 flex flex-col gap-1">
                  {features.map((f) => (
                    <Link
                      key={f.id}
                      href={featurePath(locale, f.id)}
                      onClick={() => setIsMobileOpen(false)}
                      className="px-4 py-2.5 rounded-lg text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300"
                    >
                      {featureTitle(t, f.id)}
                    </Link>
                  ))}
                  <Link href={featuresNavHref(locale)} onClick={() => setIsMobileOpen(false)} className="px-4 py-2.5 rounded-lg text-sm font-medium text-blue-600 dark:text-blue-400">
                    {t.nav.features} →
                  </Link>
                </div>
              )}

              <Link href={pricingHref(locale)} onClick={() => setIsMobileOpen(false)} className="px-4 py-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium">
                {t.nav.pricing}
              </Link>

              {/* Resurse accordion */}
              <button
                onClick={() => setMobileSub((s) => (s === "resources" ? null : "resources"))}
                aria-expanded={mobileSub === "resources"}
                className="px-4 py-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium flex items-center justify-between"
              >
                {t.nav.resources}
                <span className={`transition-transform ${mobileSub === "resources" ? "rotate-180" : ""}`}>
                  <ChevronDownIcon />
                </span>
              </button>
              {mobileSub === "resources" && (
                <div className="pl-4 flex flex-col gap-1">
                  {resourcesMenu.map((item) => (
                    <Link
                      key={item.key}
                      href={item.href(locale)}
                      onClick={() => setIsMobileOpen(false)}
                      className="px-4 py-2.5 rounded-lg text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300"
                    >
                      {item.label(t)}
                    </Link>
                  ))}
                </div>
              )}

              <Link href={contactHref(locale)} onClick={() => setIsMobileOpen(false)} className="px-4 py-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium">
                {t.nav.contact}
              </Link>

              <div className="pt-4 mt-2 border-t border-slate-200 dark:border-slate-700">
                <Link
                  href={anchorHref(locale, "contact")}
                  onClick={() => setIsMobileOpen(false)}
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
