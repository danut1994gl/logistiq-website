"use client";

import Link from "next/link";
import { useState, useEffect, use } from "react";
import { translations, type Translations } from "@/lib/i18n/translations";
import { locales, localeNames, isValidLocale, type Locale } from "@/lib/i18n/config";

// Icons
const QrCodeIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
  </svg>
);

const TruckIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m-8 6H4m0 0l4 4m-4-4l4-4" />
  </svg>
);

const ChatIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

const UsersIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const ChartIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const MobileIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
  </svg>
);

const GlobeIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
  </svg>
);

const ApiIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const CloudIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
  </svg>
);

const MapPinIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CompassIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
  </svg>
);

const PlayIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M8 5v14l11-7z" />
  </svg>
);

const MenuIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const CloseIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const StarIcon = () => (
  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

// Flag Icons - SVG country flags
const FlagRO = () => (
  <svg className="w-5 h-4 rounded-sm overflow-hidden" viewBox="0 0 640 480">
    <g fillRule="evenodd" strokeWidth="1pt">
      <path fill="#00319c" d="M0 0h213.3v480H0z"/>
      <path fill="#ffde00" d="M213.3 0h213.4v480H213.3z"/>
      <path fill="#de2110" d="M426.7 0H640v480H426.7z"/>
    </g>
  </svg>
);

const FlagGB = () => (
  <svg className="w-5 h-4 rounded-sm overflow-hidden" viewBox="0 0 640 480">
    <path fill="#012169" d="M0 0h640v480H0z"/>
    <path fill="#FFF" d="m75 0 244 181L562 0h78v62L400 241l240 178v61h-80L320 301 81 480H0v-60l239-178L0 64V0h75z"/>
    <path fill="#C8102E" d="m424 281 216 159v40L369 281h55zm-184 20 6 35L54 480H0l240-179zM640 0v3L391 191l2-44L590 0h50zM0 0l239 176h-60L0 42V0z"/>
    <path fill="#FFF" d="M241 0v480h160V0H241zM0 160v160h640V160H0z"/>
    <path fill="#C8102E" d="M0 193v96h640v-96H0zM273 0v480h96V0h-96z"/>
  </svg>
);

const FlagDE = () => (
  <svg className="w-5 h-4 rounded-sm overflow-hidden" viewBox="0 0 640 480">
    <path fill="#ffce00" d="M0 320h640v160H0z"/>
    <path d="M0 0h640v160H0z"/>
    <path fill="#d00" d="M0 160h640v160H0z"/>
  </svg>
);

const FlagPL = () => (
  <svg className="w-5 h-4 rounded-sm overflow-hidden" viewBox="0 0 640 480">
    <g fillRule="evenodd">
      <path fill="#fff" d="M640 480H0V0h640z"/>
      <path fill="#dc143c" d="M640 480H0V240h640z"/>
    </g>
  </svg>
);

const FlagHU = () => (
  <svg className="w-5 h-4 rounded-sm overflow-hidden" viewBox="0 0 640 480">
    <g fillRule="evenodd">
      <path fill="#fff" d="M640 480H0V0h640z"/>
      <path fill="#388d00" d="M640 480H0V320h640z"/>
      <path fill="#d43516" d="M640 160.1H0V.1h640z"/>
    </g>
  </svg>
);

const FlagBG = () => (
  <svg className="w-5 h-4 rounded-sm overflow-hidden" viewBox="0 0 640 480">
    <g fillRule="evenodd" strokeWidth="1pt">
      <path fill="#d62612" d="M0 320h640v160H0z"/>
      <path fill="#00966e" d="M0 160h640v160H0z"/>
      <path fill="#fff" d="M0 0h640v160H0z"/>
    </g>
  </svg>
);

const FlagFR = () => (
  <svg className="w-5 h-4 rounded-sm overflow-hidden" viewBox="0 0 640 480">
    <g fillRule="evenodd" strokeWidth="1pt">
      <path fill="#fff" d="M0 0h640v480H0z"/>
      <path fill="#002654" d="M0 0h213.3v480H0z"/>
      <path fill="#ce1126" d="M426.7 0H640v480H426.7z"/>
    </g>
  </svg>
);

const FlagNL = () => (
  <svg className="w-5 h-4 rounded-sm overflow-hidden" viewBox="0 0 640 480">
    <g fillRule="evenodd" strokeWidth="1pt">
      <path fill="#21468b" d="M0 320h640v160H0z"/>
      <path fill="#fff" d="M0 160h640v160H0z"/>
      <path fill="#ae1c28" d="M0 0h640v160H0z"/>
    </g>
  </svg>
);

// Map locale to flag component
const localeToFlag: Record<Locale, () => JSX.Element> = {
  ro: FlagRO,
  en: FlagGB,
  de: FlagDE,
  pl: FlagPL,
  hu: FlagHU,
  bg: FlagBG,
  fr: FlagFR,
  nl: FlagNL,
};

// Counter animation hook
function useCountUp(end: number, duration: number = 2000, startOnView: boolean = true) {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(!startOnView);

  useEffect(() => {
    if (!hasStarted) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration, hasStarted]);

  return { count, startCounting: () => setHasStarted(true) };
}

// Intersection Observer hook
function useInView(threshold: number = 0.1) {
  const [ref, setRef] = useState<HTMLElement | null>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    if (!ref) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(ref);
    return () => observer.disconnect();
  }, [ref, threshold]);

  return { ref: setRef, isInView };
}

// Navigation Component
function Navbar({ t, locale }: { t: Translations; locale: Locale }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? "glass shadow-lg"
          : "bg-transparent"
      }`}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-blue-500/25 transition-shadow">
              <span className="text-white font-bold text-xl">L</span>
            </div>
            <span className="text-xl font-bold text-slate-900 dark:text-white">
              Logistiq
            </span>
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
            <div className="relative">
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

            {/* Login Link */}
            <Link
              href="https://cloud.logistiq.ro"
              className="hidden sm:block text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 transition-colors font-medium"
            >
              {t.nav.login}
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

// Dashboard Mockup Component - Realistic UI based on actual screenshots
function DashboardMockup() {
  const checkIns = [
    { name: "Ion Popescu", phone: "0722***456", truck: "B-123-ABC", type: "Unloading", ref: "REF-2024-001", status: "completed", ramp: "Ramp 3", time: "09:15" },
    { name: "Gheorghe Ionescu", phone: "0745***789", truck: "CJ-456-DEF", type: "Unloading", ref: "REF-2024-002", status: "in_progress", ramp: "Ramp 1", time: "09:42" },
    { name: "Andrei Marin", phone: "0733***123", truck: "TM-789-GHI", type: "Loading", ref: "REF-2024-003", status: "waiting", ramp: "-", time: "10:05" },
  ];

  return (
    <div className="bg-slate-900 rounded-b-xl p-4 min-h-[380px] text-white overflow-hidden">
      {/* Live Statistics Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-slate-300">Live Statistics</h3>
        <div className="flex items-center gap-1 text-xs text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Live
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        <div className="bg-amber-500/20 border border-amber-500/30 rounded-lg p-2">
          <p className="text-[10px] text-amber-300 mb-0.5">Waiting</p>
          <p className="text-xl font-bold text-amber-400">3</p>
        </div>
        <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-2">
          <p className="text-[10px] text-blue-300 mb-0.5">Confirmed</p>
          <p className="text-xl font-bold text-blue-400">5</p>
        </div>
        <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-2">
          <p className="text-[10px] text-purple-300 mb-0.5">Assigned</p>
          <p className="text-xl font-bold text-purple-400">2</p>
        </div>
        <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-lg p-2">
          <p className="text-[10px] text-emerald-300 mb-0.5">In Progress</p>
          <p className="text-xl font-bold text-emerald-400">4</p>
        </div>
      </div>

      {/* Period Statistics */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        <div className="bg-slate-800 rounded-lg p-2">
          <p className="text-[10px] text-slate-400 mb-0.5">Completed</p>
          <p className="text-lg font-bold text-emerald-400">127</p>
        </div>
        <div className="bg-slate-800 rounded-lg p-2">
          <p className="text-[10px] text-slate-400 mb-0.5">Cancelled</p>
          <p className="text-lg font-bold text-red-400">8</p>
        </div>
        <div className="bg-slate-800 rounded-lg p-2">
          <p className="text-[10px] text-slate-400 mb-0.5">Avg Wait</p>
          <p className="text-lg font-bold text-white">12m</p>
        </div>
        <div className="bg-slate-800 rounded-lg p-2">
          <p className="text-[10px] text-slate-400 mb-0.5">Avg Complete</p>
          <p className="text-lg font-bold text-white">45m</p>
        </div>
      </div>

      {/* Check-ins Table */}
      <div className="bg-slate-800 rounded-lg overflow-hidden">
        <div className="grid grid-cols-6 gap-1 px-2 py-1.5 bg-slate-700/50 text-[9px] text-slate-400 font-medium">
          <span>Driver</span>
          <span>Truck</span>
          <span>Type</span>
          <span>Reference</span>
          <span>Status</span>
          <span>Ramp</span>
        </div>
        {checkIns.map((item, i) => (
          <div key={i} className="grid grid-cols-6 gap-1 px-2 py-1.5 text-[9px] border-t border-slate-700/50 items-center">
            <div className="truncate">
              <p className="text-white font-medium truncate">{item.name}</p>
              <p className="text-slate-500 text-[8px]">{item.phone}</p>
            </div>
            <span className="text-slate-300 truncate">{item.truck}</span>
            <span className="text-slate-300">{item.type}</span>
            <span className="text-slate-400 truncate">{item.ref}</span>
            <span className={`px-1.5 py-0.5 rounded text-[8px] font-medium w-fit ${
              item.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
              item.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' :
              'bg-amber-500/20 text-amber-400'
            }`}>
              {item.status === 'completed' ? 'Completed' : item.status === 'in_progress' ? 'In Progress' : 'Waiting'}
            </span>
            <span className="text-slate-300">{item.ramp}</span>
          </div>
        ))}
      </div>

      {/* Ramps Section */}
      <div className="mt-3">
        <p className="text-[10px] text-slate-400 mb-1.5">Ramps & Docks</p>
        <div className="flex gap-1.5">
          {[1, 2, 3, 4, 5, 6].map((ramp) => (
            <div
              key={ramp}
              className={`flex-1 rounded py-1 text-center text-[9px] font-medium ${
                ramp === 1 || ramp === 3 ? 'bg-blue-500/30 text-blue-300 border border-blue-500/50' :
                ramp === 5 ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}
            >
              R{ramp}
            </div>
          ))}
        </div>
        <div className="flex gap-3 mt-1.5 text-[8px]">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-emerald-500/30 border border-emerald-500/50" /> Available</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-blue-500/30 border border-blue-500/50" /> Occupied</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-red-500/20 border border-red-500/30" /> Maintenance</span>
        </div>
      </div>
    </div>
  );
}

// Hero Section
function HeroSection({ t }: { t: Translations }) {
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden hero-gradient">
      {/* Decorative elements */}
      <div className="absolute inset-0 grid-pattern opacity-50" />
      <div className="blob w-96 h-96 bg-blue-500 -top-48 -right-48 animate-float" />
      <div className="blob w-64 h-64 bg-cyan-500 bottom-20 -left-32 animate-float" style={{ animationDelay: "1s" }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left content */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium mb-6 animate-fade-in-down">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              {t.hero.badge}
            </div>

            {/* Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-6 animate-fade-in-up">
              {t.hero.title}{" "}
              <span className="gradient-text">{t.hero.titleHighlight}</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-xl mx-auto lg:mx-0 animate-fade-in-up stagger-2">
              {t.hero.subtitle}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in-up stagger-3">
              <Link
                href="#contact"
                className="btn-primary text-white px-8 py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2"
              >
                {t.hero.cta1}
                <ArrowRightIcon />
              </Link>
              <Link
                href="#how-it-works"
                className="btn-secondary border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 px-8 py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 hover:border-blue-500"
              >
                <PlayIcon />
                {t.hero.cta2}
              </Link>
            </div>

            {/* Trust badges */}
            <div className="mt-12 animate-fade-in-up stagger-4">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                {t.hero.trustedBy}
              </p>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6">
                {["Kaufland", "Metro", "Carrefour", "Lidl"].map((brand, i) => (
                  <div
                    key={brand}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 font-medium text-sm"
                  >
                    {brand}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right content - Dashboard mockup */}
          <div className="relative animate-fade-in-right">
            <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl overflow-hidden animate-float">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-4 py-3 bg-slate-800 border-b border-slate-700">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="px-4 py-1 bg-slate-700 rounded-lg text-slate-400 text-sm flex items-center gap-2">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    cloud.logistiq.ro
                  </div>
                </div>
              </div>

              {/* Dashboard preview - Realistic UI */}
              <DashboardMockup />
            </div>

            {/* Floating notification */}
            <div className="absolute -bottom-4 -left-4 bg-white dark:bg-slate-800 rounded-xl shadow-xl p-4 animate-bounce-subtle border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <CheckIcon />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    Check-in completed
                  </p>
                  <p className="text-xs text-slate-500">Ramp 3 assigned • 09:15</p>
                </div>
              </div>
            </div>

            {/* Floating QR notification */}
            <div className="absolute -top-2 -right-2 bg-white dark:bg-slate-800 rounded-xl shadow-xl p-3 animate-bounce-subtle border border-slate-200 dark:border-slate-700" style={{ animationDelay: "0.5s" }}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <QrCodeIcon />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-900 dark:text-white">
                    New check-in
                  </p>
                  <p className="text-[10px] text-slate-500">via QR scan</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-slate-400 dark:border-slate-600 flex justify-center pt-2">
          <div className="w-1.5 h-3 rounded-full bg-slate-400 dark:bg-slate-600 animate-pulse" />
        </div>
      </div>
    </section>
  );
}

// Stats Section
function StatsSection({ t }: { t: Translations }) {
  const { ref, isInView } = useInView(0.3);
  const drivers = useCountUp(5000, 2000, false);
  const warehouses = useCountUp(150, 2000, false);
  const checkins = useCountUp(100000, 2500, false);

  useEffect(() => {
    if (isInView) {
      drivers.startCounting();
      warehouses.startCounting();
      checkins.startCounting();
    }
  }, [isInView]);

  const stats = [
    { value: `${drivers.count.toLocaleString()}+`, label: t.stats.drivers, icon: TruckIcon },
    { value: `${warehouses.count}+`, label: t.stats.warehouses, icon: UsersIcon },
    { value: `${(checkins.count / 1000).toFixed(0)}K+`, label: t.stats.checkins, icon: QrCodeIcon },
    { value: "50%", label: t.stats.timeReduction, icon: ChartIcon },
  ];

  return (
    <section ref={ref} className="py-16 bg-gradient-to-r from-blue-600 to-blue-700 relative overflow-hidden">
      <div className="absolute inset-0 dots-pattern opacity-10" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <div key={i} className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/10 mb-4">
                <stat.icon />
              </div>
              <div className="text-3xl sm:text-4xl font-bold text-white mb-2 counter">
                {stat.value}
              </div>
              <p className="text-blue-100 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// How it Works Section
function HowItWorksSection({ t }: { t: Translations }) {
  const steps = [
    {
      number: "01",
      title: t.howItWorks.step1Title,
      description: t.howItWorks.step1Desc,
      icon: QrCodeIcon,
    },
    {
      number: "02",
      title: t.howItWorks.step2Title,
      description: t.howItWorks.step2Desc,
      icon: TruckIcon,
    },
    {
      number: "03",
      title: t.howItWorks.step3Title,
      description: t.howItWorks.step3Desc,
      icon: ChatIcon,
    },
    {
      number: "04",
      title: t.howItWorks.step4Title,
      description: t.howItWorks.step4Desc,
      icon: ChartIcon,
    },
  ];

  return (
    <section id="how-it-works" className="py-20 lg:py-32 bg-slate-50 dark:bg-slate-900/50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-6">
            {t.howItWorks.title}
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            {t.howItWorks.subtitle}
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, i) => (
            <div
              key={i}
              className="relative group"
            >
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-blue-500 to-transparent z-0" />
              )}

              <div className="relative bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg card-hover">
                {/* Number badge */}
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <span className="text-white font-bold">{step.number}</span>
                </div>

                {/* Icon */}
                <div className="w-14 h-14 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-6 mt-4 text-blue-600 dark:text-blue-400">
                  <step.icon />
                </div>

                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Features Section
function FeaturesSection({ t }: { t: Translations }) {
  const features = [
    {
      icon: QrCodeIcon,
      title: t.features.feature1Title,
      description: t.features.feature1Desc,
      color: "blue",
    },
    {
      icon: TruckIcon,
      title: t.features.feature2Title,
      description: t.features.feature2Desc,
      color: "green",
    },
    {
      icon: ChatIcon,
      title: t.features.feature3Title,
      description: t.features.feature3Desc,
      color: "purple",
    },
    {
      icon: UsersIcon,
      title: t.features.feature4Title,
      description: t.features.feature4Desc,
      color: "orange",
    },
    {
      icon: ChartIcon,
      title: t.features.feature5Title,
      description: t.features.feature5Desc,
      color: "cyan",
    },
    {
      icon: MobileIcon,
      title: t.features.feature6Title,
      description: t.features.feature6Desc,
      color: "pink",
    },
    {
      icon: GlobeIcon,
      title: t.features.feature7Title,
      description: t.features.feature7Desc,
      color: "indigo",
    },
    {
      icon: ApiIcon,
      title: t.features.feature8Title,
      description: t.features.feature8Desc,
      color: "teal",
    },
    {
      icon: CloudIcon,
      title: t.features.feature9Title,
      description: t.features.feature9Desc,
      color: "sky",
    },
    {
      icon: CompassIcon,
      title: t.features.feature10Title,
      description: t.features.feature10Desc,
      color: "amber",
    },
    {
      icon: ClockIcon,
      title: t.features.feature11Title,
      description: t.features.feature11Desc,
      color: "lime",
    },
    {
      icon: MapPinIcon,
      title: t.features.feature12Title,
      description: t.features.feature12Desc,
      color: "rose",
    },
  ];

  const colorMap: Record<string, { bg: string; text: string; darkBg: string; darkText: string }> = {
    blue: { bg: "bg-blue-100", text: "text-blue-600", darkBg: "dark:bg-blue-900/30", darkText: "dark:text-blue-400" },
    green: { bg: "bg-green-100", text: "text-green-600", darkBg: "dark:bg-green-900/30", darkText: "dark:text-green-400" },
    purple: { bg: "bg-purple-100", text: "text-purple-600", darkBg: "dark:bg-purple-900/30", darkText: "dark:text-purple-400" },
    orange: { bg: "bg-orange-100", text: "text-orange-600", darkBg: "dark:bg-orange-900/30", darkText: "dark:text-orange-400" },
    cyan: { bg: "bg-cyan-100", text: "text-cyan-600", darkBg: "dark:bg-cyan-900/30", darkText: "dark:text-cyan-400" },
    pink: { bg: "bg-pink-100", text: "text-pink-600", darkBg: "dark:bg-pink-900/30", darkText: "dark:text-pink-400" },
    indigo: { bg: "bg-indigo-100", text: "text-indigo-600", darkBg: "dark:bg-indigo-900/30", darkText: "dark:text-indigo-400" },
    teal: { bg: "bg-teal-100", text: "text-teal-600", darkBg: "dark:bg-teal-900/30", darkText: "dark:text-teal-400" },
    sky: { bg: "bg-sky-100", text: "text-sky-600", darkBg: "dark:bg-sky-900/30", darkText: "dark:text-sky-400" },
    amber: { bg: "bg-amber-100", text: "text-amber-600", darkBg: "dark:bg-amber-900/30", darkText: "dark:text-amber-400" },
    lime: { bg: "bg-lime-100", text: "text-lime-600", darkBg: "dark:bg-lime-900/30", darkText: "dark:text-lime-400" },
    rose: { bg: "bg-rose-100", text: "text-rose-600", darkBg: "dark:bg-rose-900/30", darkText: "dark:text-rose-400" },
  };

  return (
    <section id="features" className="py-20 lg:py-32 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-6">
            {t.features.title}
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            {t.features.subtitle}
          </p>
        </div>

        {/* Features grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => {
            const colors = colorMap[feature.color];
            return (
              <div
                key={i}
                className="group bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 card-hover"
              >
                <div
                  className={`w-14 h-14 rounded-xl ${colors.bg} ${colors.darkBg} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}
                >
                  <div className={`${colors.text} ${colors.darkText}`}>
                    <feature.icon />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// Benefits Section
function BenefitsSection({ t }: { t: Translations }) {
  const warehouseBenefits = [
    t.benefits.warehouse1,
    t.benefits.warehouse2,
    t.benefits.warehouse3,
    t.benefits.warehouse4,
    t.benefits.warehouse5,
    t.benefits.warehouse6,
  ];

  const driverBenefits = [
    t.benefits.drivers1,
    t.benefits.drivers2,
    t.benefits.drivers3,
    t.benefits.drivers4,
    t.benefits.drivers5,
    t.benefits.drivers6,
  ];

  return (
    <section id="benefits" className="py-20 lg:py-32 bg-slate-50 dark:bg-slate-900/50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-6">
            {t.benefits.title}
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            {t.benefits.subtitle}
          </p>
        </div>

        {/* Benefits grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* For Warehouse */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 text-sm font-medium mb-6">
                <UsersIcon />
                {t.benefits.forWarehouse}
              </div>
              <ul className="space-y-4">
                {warehouseBenefits.map((benefit, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckIcon />
                    </div>
                    <span className="text-blue-50">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* For Drivers */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-medium mb-6">
                <TruckIcon />
                {t.benefits.forDrivers}
              </div>
              <ul className="space-y-4">
                {driverBenefits.map((benefit, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0 mt-0.5 text-green-600 dark:text-green-400">
                      <CheckIcon />
                    </div>
                    <span className="text-slate-700 dark:text-slate-300">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Testimonials Section
function TestimonialsSection({ t }: { t: Translations }) {
  const testimonials = [
    {
      quote: t.testimonials.testimonial1,
      author: t.testimonials.testimonial1Author,
      role: t.testimonials.testimonial1Role,
      rating: 5,
    },
    {
      quote: t.testimonials.testimonial2,
      author: t.testimonials.testimonial2Author,
      role: t.testimonials.testimonial2Role,
      rating: 5,
    },
    {
      quote: t.testimonials.testimonial3,
      author: t.testimonials.testimonial3Author,
      role: t.testimonials.testimonial3Role,
      rating: 5,
    },
  ];

  return (
    <section className="py-20 lg:py-32 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-6">
            {t.testimonials.title}
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            {t.testimonials.subtitle}
          </p>
        </div>

        {/* Testimonials grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, i) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 card-hover"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-6 text-yellow-400">
                {Array.from({ length: testimonial.rating }).map((_, j) => (
                  <StarIcon key={j} />
                ))}
              </div>

              {/* Quote */}
              <blockquote className="text-slate-700 dark:text-slate-300 mb-6 leading-relaxed">
                &ldquo;{testimonial.quote}&rdquo;
              </blockquote>

              {/* Author */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold">
                  {testimonial.author.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {testimonial.author}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Pricing Section
function PricingSection({ t }: { t: Translations }) {
  const professionalFeatures = [
    t.pricing.feature1,
    t.pricing.feature2,
    t.pricing.feature3,
    t.pricing.feature4,
    t.pricing.feature5,
    t.pricing.feature6,
    t.pricing.feature7,
  ];

  const enterpriseFeatures = [
    t.pricing.enterpriseFeature1,
    t.pricing.enterpriseFeature2,
    t.pricing.enterpriseFeature3,
    t.pricing.enterpriseFeature4,
    t.pricing.enterpriseFeature5,
    t.pricing.enterpriseFeature6,
    t.pricing.enterpriseFeature7,
    t.pricing.enterpriseFeature8,
  ];

  return (
    <section id="pricing" className="py-20 lg:py-32 bg-slate-50 dark:bg-slate-900/50 relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-6">
            {t.pricing.title}
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            {t.pricing.subtitle}
          </p>
        </div>

        {/* Pricing cards - 2 columns */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Professional Plan */}
          <div className="relative bg-white dark:bg-slate-800 rounded-3xl p-8 border-2 border-blue-500 ring-2 ring-blue-500/20 card-hover">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-blue-600 text-white text-sm font-medium rounded-full">
              {t.pricing.singleLocation}
            </div>

            <div className="mb-6 pt-2">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                {t.pricing.professional}
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                {t.pricing.professionalDesc}
              </p>
            </div>

            <div className="mb-8">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                {t.pricing.includedFeatures}
              </p>
              <ul className="space-y-3">
                {professionalFeatures.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0 mt-0.5 text-green-600 dark:text-green-400">
                      <CheckIcon />
                    </div>
                    <span className="text-slate-700 dark:text-slate-300 text-sm">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <Link
              href="https://cloud.logistiq.ro"
              className="block w-full py-4 rounded-xl font-semibold text-center btn-primary text-white"
            >
              {t.pricing.getStarted}
            </Link>
          </div>

          {/* Enterprise Plan */}
          <div className="relative bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 card-hover">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-purple-600 text-white text-sm font-medium rounded-full">
              {t.pricing.multipleLocations}
            </div>

            <div className="mb-6 pt-2">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                {t.pricing.enterprise}
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                {t.pricing.enterpriseDesc}
              </p>
            </div>

            <div className="mb-6">
              <div className="text-3xl font-bold text-slate-900 dark:text-white">
                {t.pricing.customPricing}
              </div>
            </div>

            <div className="mb-8">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                {t.pricing.includedFeatures}
              </p>
              <ul className="space-y-3">
                {enterpriseFeatures.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0 mt-0.5 text-purple-600 dark:text-purple-400">
                      <CheckIcon />
                    </div>
                    <span className="text-slate-700 dark:text-slate-300 text-sm">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <Link
              href="#contact"
              className="block w-full py-4 rounded-xl font-semibold text-center bg-purple-600 hover:bg-purple-700 text-white transition-colors"
            >
              {t.pricing.contactUs}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// CTA Section
function CTASection({ t }: { t: Translations }) {
  return (
    <section className="py-20 lg:py-32 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 relative overflow-hidden">
      <div className="absolute inset-0 dots-pattern opacity-10" />
      <div className="blob w-96 h-96 bg-cyan-400 -top-48 -right-48 opacity-20" />
      <div className="blob w-64 h-64 bg-purple-400 bottom-0 -left-32 opacity-20" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
          {t.cta.title}
        </h2>
        <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
          {t.cta.subtitle}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="#contact"
            className="group bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg flex items-center gap-2 hover:bg-blue-50 transition-colors"
          >
            {t.cta.button}
            <ArrowRightIcon />
          </Link>
          <p className="text-blue-200 text-sm">{t.cta.noCreditCard}</p>
        </div>
      </div>
    </section>
  );
}

// Contact Section
function ContactSection({ t }: { t: Translations }) {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log(formState);
  };

  return (
    <section id="contact" className="py-20 lg:py-32 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16">
          {/* Left - Info */}
          <div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-6">
              {t.contact.title}
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-10">
              {t.contact.subtitle}
            </p>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 flex-shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Email</h3>
                  <a href="mailto:contact@logistiq.ro" className="text-blue-600 dark:text-blue-400 hover:underline">
                    contact@logistiq.ro
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 flex-shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1">{t.cta.callUs}</h3>
                  <a href="tel:+40xxxxxxxxx" className="text-green-600 dark:text-green-400 hover:underline">
                    {t.cta.phoneNumber}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 flex-shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1">{t.contact.info}</h3>
                  <p className="text-slate-600 dark:text-slate-300">{t.contact.address}</p>
                </div>
              </div>

              <div className="pt-6">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {t.contact.responseTime}
                </p>
              </div>
            </div>
          </div>

          {/* Right - Form */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl border border-slate-200 dark:border-slate-700">
            <form onSubmit={handleSubmit} className="space-y-6" aria-label="Contact form">
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="contact-name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    {t.contact.name}
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    value={formState.name}
                    onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                    autoComplete="name"
                  />
                </div>
                <div>
                  <label htmlFor="contact-email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    {t.contact.email}
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    value={formState.email}
                    onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="contact-company" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    {t.contact.company}
                  </label>
                  <input
                    id="contact-company"
                    type="text"
                    value={formState.company}
                    onChange={(e) => setFormState({ ...formState, company: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    autoComplete="organization"
                  />
                </div>
                <div>
                  <label htmlFor="contact-phone" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    {t.contact.phone}
                  </label>
                  <input
                    id="contact-phone"
                    type="tel"
                    value={formState.phone}
                    onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    autoComplete="tel"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="contact-message" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  {t.contact.message}
                </label>
                <textarea
                  id="contact-message"
                  value={formState.message}
                  onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                  rows={4}
                  placeholder={t.contact.messagePlaceholder}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full btn-primary text-white py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2"
              >
                {t.contact.send}
                <ArrowRightIcon />
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
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
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">L</span>
              </div>
              <span className="text-xl font-bold">Logistiq</span>
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
                <Link href="#" className="text-slate-400 hover:text-white transition-colors">
                  {t.footer.integrations}
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold mb-4">{t.footer.company}</h3>
            <ul className="space-y-3">
              <li>
                <Link href="#" className="text-slate-400 hover:text-white transition-colors">
                  {t.footer.about}
                </Link>
              </li>
              <li>
                <Link href="#" className="text-slate-400 hover:text-white transition-colors">
                  {t.footer.careers}
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
                <Link href="#" className="text-slate-400 hover:text-white transition-colors">
                  {t.footer.privacy}
                </Link>
              </li>
              <li>
                <Link href="#" className="text-slate-400 hover:text-white transition-colors">
                  {t.footer.terms}
                </Link>
              </li>
              <li>
                <Link href="#" className="text-slate-400 hover:text-white transition-colors">
                  {t.footer.cookies}
                </Link>
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
      <TestimonialsSection t={t} />
      <PricingSection t={t} />
      <CTASection t={t} />
      <ContactSection t={t} />
      <Footer t={t} locale={locale} />
    </main>
  );
}
