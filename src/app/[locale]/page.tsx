"use client";

import Link from "next/link";
import { useState, useEffect, useRef, use } from "react";
import { translations, type Translations } from "@/lib/i18n/translations";
import { locales, localeNames, isValidLocale, type Locale } from "@/lib/i18n/config";
import CookieConsent, { CookiePreferencesButton } from "@/components/CookieConsent";
import { MenuIcon, CloseIcon, ChevronDownIcon } from "@/components/icons";
import { localeToFlag } from "@/components/icons/flags";
import { HeroSection } from "@/components/sections/HeroSection";
import { StatsSection } from "@/components/sections/StatsSection";
import { HowItWorksSection } from "@/components/sections/HowItWorksSection";
import { FeaturesSection } from "@/components/sections/FeaturesSection";
import { BenefitsSection } from "@/components/sections/BenefitsSection";
import { QRGODriverSection } from "@/components/sections/QRGODriverSection";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { PricingSection } from "@/components/sections/PricingSection";
import { CTASection } from "@/components/sections/CTASection";
import { ContactSection } from "@/components/sections/ContactSection";

// Navigation Component
function Navbar({ t, locale }: { t: Translations; locale: Locale }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const langDropdownRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);

  // Check for authentication cookie from cloud.logistiq.ro
  useEffect(() => {
    const cookies = document.cookie.split(';');
    const authCookie = cookies.find(c => c.trim().startsWith('logistiq_authenticated='));
    if (authCookie && authCookie.split('=')[1] === 'true') {
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
            <img
              src="/banner-nav.svg"
              alt="Logistiq"
              className="h-10 md:h-11 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            <Link
              href="#features"
              className="text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 transition-colors font-medium"
            >
              {t.nav.features}
            </Link>
            <Link
              href="#how-it-works"
              className="text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 transition-colors font-medium"
            >
              {t.nav.howItWorks}
            </Link>
            <Link
              href="#benefits"
              className="text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 transition-colors font-medium"
            >
              {t.nav.benefits}
            </Link>
            <Link
              href="#pricing"
              className="text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 transition-colors font-medium"
            >
              {t.nav.pricing}
            </Link>
            <Link
              href="#contact"
              className="text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 transition-colors font-medium"
            >
              {t.nav.contact}
            </Link>
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
                aria-haspopup="listbox"
              >
                {(() => {
                  const FlagComponent = localeToFlag[locale];
                  return <FlagComponent />;
                })()}
                <ChevronDownIcon />
              </button>
              {isLangOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 animate-fade-in-down">
                  {locales.map((loc) => {
                    const FlagComponent = localeToFlag[loc];
                    return (
                      <Link
                        key={loc}
                        href={`/${loc}`}
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
              href="#contact"
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
              <Link
                href="#features"
                onClick={() => setIsOpen(false)}
                className="px-4 py-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium"
              >
                {t.nav.features}
              </Link>
              <Link
                href="#how-it-works"
                onClick={() => setIsOpen(false)}
                className="px-4 py-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium"
              >
                {t.nav.howItWorks}
              </Link>
              <Link
                href="#benefits"
                onClick={() => setIsOpen(false)}
                className="px-4 py-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium"
              >
                {t.nav.benefits}
              </Link>
              <Link
                href="#pricing"
                onClick={() => setIsOpen(false)}
                className="px-4 py-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium"
              >
                {t.nav.pricing}
              </Link>
              <Link
                href="#contact"
                onClick={() => setIsOpen(false)}
                className="px-4 py-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium"
              >
                {t.nav.contact}
              </Link>
              <div className="pt-4 mt-2 border-t border-slate-200 dark:border-slate-700">
                <Link
                  href="#contact"
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

// Footer Component
function Footer({ t, locale }: { t: Translations; locale: Locale }) {
  return (
    <footer className="bg-slate-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href={`/${locale}`} className="flex items-center gap-2 mb-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/banner-white.svg"
                alt="Logistiq"
                className="h-10 w-auto opacity-70"
              />
            </Link>
            <p className="text-slate-400 mb-6 max-w-sm">
              {t.footer.description}
            </p>
            <div className="flex gap-4">
              {["linkedin", "twitter", "facebook"].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-slate-700 transition-colors"
                >
                  <span className="sr-only">{social}</span>
                  <div className="w-5 h-5 bg-slate-400 rounded" />
                </a>
              ))}
            </div>
          </div>

          {/* Company Info */}
          <div>
            <h3 className="font-semibold mb-4">{t.footer.company}</h3>
            <ul className="space-y-2 text-slate-400 text-sm">
              <li className="font-medium text-slate-300">HOSTLIFE DIGITAL SRL</li>
              <li>CUI: 52638053</li>
              <li>Nr. Reg. Com.: J25/759/2025</li>
              <li>Str. Vidin 37, Tecuci</li>
              <li>Jud. Galați, 805300</li>
            </ul>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-semibold mb-4">{t.footer.product}</h3>
            <ul className="space-y-3">
              <li>
                <Link href="#features" className="text-slate-400 hover:text-white transition-colors">
                  {t.footer.features}
                </Link>
              </li>
              <li>
                <Link href="#pricing" className="text-slate-400 hover:text-white transition-colors">
                  {t.footer.pricing}
                </Link>
              </li>
              <li>
                <Link href="#contact" className="text-slate-400 hover:text-white transition-colors">
                  {t.nav.contact}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-4">{t.footer.legal}</h3>
            <ul className="space-y-3">
              <li>
                <Link href={`/${locale}/privacy`} className="text-slate-400 hover:text-white transition-colors">
                  {t.footer.privacy}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/terms`} className="text-slate-400 hover:text-white transition-colors">
                  {t.footer.terms}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/cookies`} className="text-slate-400 hover:text-white transition-colors">
                  {t.footer.cookies}
                </Link>
              </li>
              <li>
                <CookiePreferencesButton
                  label={t.cookieConsent.managePreferences}
                />
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-400 text-sm">
            2025 Logistiq. {t.footer.allRights}
          </p>
          <p className="text-slate-400 text-sm flex items-center gap-1">
            {t.footer.madeWith}{" "}
            <span className="text-red-500">&#10084;</span>{" "}
            {t.footer.inRomania}
          </p>
        </div>
      </div>
    </footer>
  );
}

// Main Page Component
export default function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = use(params);
  const locale = isValidLocale(localeParam) ? localeParam : "ro";
  const t = translations[locale];

  return (
    <main className="min-h-screen">
      <Navbar t={t} locale={locale} />
      <HeroSection t={t} />
      <StatsSection t={t} />
      <HowItWorksSection t={t} />
      <FeaturesSection t={t} />
      <BenefitsSection t={t} />
      <QRGODriverSection t={t} />
      <TestimonialsSection t={t} />
      <PricingSection t={t} />
      {/* <FAQSection t={t} /> */}
      <CTASection t={t} />
      <ContactSection t={t} />
      <Footer t={t} locale={locale} />
      <CookieConsent locale={locale} t={t.cookieConsent} />
    </main>
  );
}
