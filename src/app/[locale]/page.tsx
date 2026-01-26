"use client";

import Link from "next/link";
import { useState, useEffect, useRef, use } from "react";
import { translations, type Translations } from "@/lib/i18n/translations";
import { locales, localeNames, isValidLocale, type Locale } from "@/lib/i18n/config";
import CookieConsent, { CookiePreferencesButton } from "@/components/CookieConsent";

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

const GateIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21V8l9-5 9 5v13M3 21h18M7 21v-8h4v8M13 21v-8h4v8M3 8h18" />
  </svg>
);

const SteeringWheelIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="9" strokeWidth={2} />
    <circle cx="12" cy="12" r="3" strokeWidth={2} />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v6M12 15v6M3 12h6M15 12h6" />
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
const localeToFlag: Record<Locale, React.FC> = {
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const langDropdownRef = useRef<HTMLDivElement>(null);

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

  return (
    <nav
      className="fixed top-0 w-full z-50 transition-all duration-300 glass shadow-lg"
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
    <section className="relative min-h-screen flex items-start pt-28 overflow-hidden hero-gradient">
      {/* Decorative elements */}
      <div className="absolute inset-0 grid-pattern opacity-50" />
      <div className="blob w-96 h-96 bg-blue-500 -top-48 -right-48 animate-float" />
      <div className="blob w-64 h-64 bg-cyan-500 bottom-20 -left-32 animate-float" style={{ animationDelay: "1s" }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
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

  // Calculate daily varying stats based on date
  const getDailyStats = () => {
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    const seed = dayOfYear + today.getFullYear() * 365;

    // Pseudo-random but consistent for each day
    const driversBase = 2100 + (seed % 400); // 2100-2499
    const checkinsBase = 35000 + ((seed * 7) % 8000); // 35000-42999

    return { drivers: driversBase, checkins: checkinsBase };
  };

  const dailyStats = getDailyStats();
  const drivers = useCountUp(dailyStats.drivers, 2000, false);
  const warehouses = useCountUp(47, 2000, false);
  const checkins = useCountUp(dailyStats.checkins, 2500, false);

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
    { value: "11%", label: t.stats.timeReduction, icon: ChartIcon },
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
      icon: GateIcon,
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
                <SteeringWheelIcon />
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

// Phone Frame Component
function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mx-auto w-[220px] h-[450px]">
      {/* Phone outer frame */}
      <div className="absolute inset-0 bg-slate-800 rounded-[2.5rem] shadow-2xl border-4 border-slate-700">
        {/* Notch */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-5 bg-slate-900 rounded-full" />
        {/* Screen */}
        <div className="absolute top-8 left-2 right-2 bottom-8 bg-slate-900 rounded-[1.5rem] overflow-hidden">
          {children}
        </div>
        {/* Home indicator */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-24 h-1 bg-slate-600 rounded-full" />
      </div>
    </div>
  );
}

// Driver App Mockup - Waiting Status
// QR Code SVG component for qrgo.ro
function QRCodeSVG() {
  return (
    <svg viewBox="0 0 29 29" className="w-full h-full">
      <rect width="29" height="29" fill="white"/>
      <path d="M0,0h7v1h-7zM8,0h1v1h-1zM10,0h2v1h-2zM14,0h1v1h-1zM16,0h2v1h-2zM19,0h3v1h-3zM22,0h7v1h-7zM0,1h1v1h-1zM6,1h1v1h-1zM8,1h2v1h-2zM11,1h1v1h-1zM13,1h3v1h-3zM17,1h1v1h-1zM20,1h1v1h-1zM22,1h1v1h-1zM28,1h1v1h-1zM0,2h1v1h-1zM2,2h3v1h-3zM6,2h1v1h-1zM10,2h1v1h-1zM12,2h1v1h-1zM14,2h1v1h-1zM18,2h1v1h-1zM22,2h1v1h-1zM24,2h3v1h-3zM28,2h1v1h-1zM0,3h1v1h-1zM2,3h3v1h-3zM6,3h1v1h-1zM8,3h1v1h-1zM10,3h5v1h-5zM16,3h2v1h-2zM19,3h2v1h-2zM22,3h1v1h-1zM24,3h3v1h-3zM28,3h1v1h-1zM0,4h1v1h-1zM2,4h3v1h-3zM6,4h1v1h-1zM9,4h1v1h-1zM11,4h2v1h-2zM14,4h3v1h-3zM18,4h3v1h-3zM22,4h1v1h-1zM24,4h3v1h-3zM28,4h1v1h-1zM0,5h1v1h-1zM6,5h1v1h-1zM8,5h1v1h-1zM10,5h1v1h-1zM13,5h1v1h-1zM15,5h1v1h-1zM17,5h2v1h-2zM20,5h1v1h-1zM22,5h1v1h-1zM28,5h1v1h-1zM0,6h7v1h-7zM8,6h1v1h-1zM10,6h1v1h-1zM12,6h1v1h-1zM14,6h1v1h-1zM16,6h1v1h-1zM18,6h1v1h-1zM20,6h1v1h-1zM22,6h7v1h-7zM9,7h2v1h-2zM12,7h2v1h-2zM15,7h1v1h-1zM17,7h1v1h-1zM19,7h2v1h-2zM0,8h1v1h-1zM2,8h1v1h-1zM4,8h3v1h-3zM8,8h3v1h-3zM13,8h3v1h-3zM19,8h1v1h-1zM21,8h2v1h-2zM24,8h2v1h-2zM27,8h2v1h-2zM1,9h2v1h-2zM5,9h2v1h-2zM9,9h1v1h-1zM11,9h3v1h-3zM17,9h2v1h-2zM21,9h1v1h-1zM23,9h1v1h-1zM25,9h1v1h-1zM27,9h1v1h-1zM1,10h1v1h-1zM3,10h3v1h-3zM7,10h1v1h-1zM10,10h1v1h-1zM12,10h2v1h-2zM15,10h3v1h-3zM20,10h2v1h-2zM23,10h1v1h-1zM26,10h1v1h-1zM28,10h1v1h-1zM0,11h2v1h-2zM4,11h2v1h-2zM8,11h4v1h-4zM14,11h2v1h-2zM17,11h1v1h-1zM21,11h2v1h-2zM25,11h1v1h-1zM27,11h2v1h-2zM0,12h1v1h-1zM3,12h2v1h-2zM6,12h1v1h-1zM9,12h2v1h-2zM12,12h4v1h-4zM17,12h3v1h-3zM23,12h1v1h-1zM25,12h2v1h-2zM28,12h1v1h-1zM0,13h1v1h-1zM2,13h3v1h-3zM7,13h1v1h-1zM9,13h1v1h-1zM11,13h1v1h-1zM14,13h2v1h-2zM17,13h1v1h-1zM19,13h1v1h-1zM23,13h1v1h-1zM26,13h2v1h-2zM1,14h1v1h-1zM3,14h1v1h-1zM6,14h1v1h-1zM8,14h2v1h-2zM11,14h1v1h-1zM13,14h2v1h-2zM16,14h4v1h-4zM21,14h2v1h-2zM24,14h2v1h-2zM27,14h1v1h-1zM0,15h1v1h-1zM2,15h2v1h-2zM5,15h1v1h-1zM7,15h3v1h-3zM11,15h1v1h-1zM14,15h1v1h-1zM16,15h1v1h-1zM18,15h2v1h-2zM21,15h1v1h-1zM23,15h3v1h-3zM27,15h2v1h-2zM0,16h3v1h-3zM5,16h3v1h-3zM10,16h2v1h-2zM13,16h3v1h-3zM18,16h1v1h-1zM20,16h1v1h-1zM23,16h2v1h-2zM0,17h1v1h-1zM2,17h1v1h-1zM5,17h2v1h-2zM8,17h1v1h-1zM11,17h5v1h-5zM18,17h2v1h-2zM21,17h4v1h-4zM26,17h3v1h-3zM0,18h1v1h-1zM2,18h2v1h-2zM5,18h2v1h-2zM9,18h1v1h-1zM12,18h2v1h-2zM15,18h1v1h-1zM17,18h1v1h-1zM19,18h1v1h-1zM21,18h1v1h-1zM23,18h1v1h-1zM26,18h1v1h-1zM0,19h1v1h-1zM3,19h1v1h-1zM5,19h2v1h-2zM9,19h3v1h-3zM14,19h2v1h-2zM17,19h2v1h-2zM20,19h2v1h-2zM24,19h5v1h-5zM2,20h1v1h-1zM4,20h1v1h-1zM8,20h4v1h-4zM14,20h2v1h-2zM17,20h1v1h-1zM19,20h2v1h-2zM22,20h4v1h-4zM27,20h1v1h-1zM8,21h2v1h-2zM11,21h1v1h-1zM14,21h1v1h-1zM18,21h2v1h-2zM22,21h1v1h-1zM25,21h2v1h-2zM28,21h1v1h-1zM0,22h7v1h-7zM8,22h1v1h-1zM10,22h3v1h-3zM16,22h1v1h-1zM18,22h1v1h-1zM20,22h3v1h-3zM24,22h2v1h-2zM27,22h2v1h-2zM0,23h1v1h-1zM6,23h1v1h-1zM9,23h1v1h-1zM12,23h1v1h-1zM14,23h2v1h-2zM17,23h3v1h-3zM21,23h2v1h-2zM24,23h1v1h-1zM26,23h1v1h-1zM0,24h1v1h-1zM2,24h3v1h-3zM6,24h1v1h-1zM8,24h1v1h-1zM10,24h1v1h-1zM13,24h4v1h-4zM18,24h2v1h-2zM21,24h2v1h-2zM24,24h1v1h-1zM27,24h2v1h-2zM0,25h1v1h-1zM2,25h3v1h-3zM6,25h1v1h-1zM9,25h2v1h-2zM12,25h2v1h-2zM15,25h3v1h-3zM19,25h1v1h-1zM21,25h1v1h-1zM23,25h3v1h-3zM27,25h2v1h-2zM0,26h1v1h-1zM2,26h3v1h-3zM6,26h1v1h-1zM9,26h3v1h-3zM13,26h3v1h-3zM17,26h1v1h-1zM19,26h4v1h-4zM24,26h3v1h-3zM0,27h1v1h-1zM6,27h1v1h-1zM8,27h3v1h-3zM13,27h1v1h-1zM16,27h1v1h-1zM18,27h1v1h-1zM20,27h2v1h-2zM24,27h1v1h-1zM26,27h1v1h-1zM0,28h7v1h-7zM9,28h2v1h-2zM13,28h1v1h-1zM15,28h2v1h-2zM19,28h1v1h-1zM22,28h2v1h-2zM25,28h1v1h-1zM27,28h2v1h-2z" fill="black"/>
    </svg>
  );
}

// Driver App Mockup - Waiting Status
function DriverMockupWaiting({ t }: { t: Translations }) {
  return (
    <PhoneFrame>
      <div className="h-full overflow-hidden text-white">
        {/* Status Header */}
        <div className="bg-blue-600 px-3 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-500/50 flex items-center justify-center">
                <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-[9px] font-semibold">{t.qrgoDriver?.statusCheckin || "Status Check-in"}</p>
                <p className="text-[7px] text-blue-200">{t.qrgoDriver?.warehouseName || "Depozit București"}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[7px] bg-emerald-500/20 px-1.5 py-0.5 rounded-full">
              <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-300">LIVE</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-2 space-y-2">
          {/* Status Card */}
          <div className="bg-slate-800 rounded-lg p-2 border border-slate-700">
            <div className="flex gap-2">
              {/* Status Icon Side */}
              <div className="flex-1 flex flex-col items-center justify-center py-2">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center mb-1">
                  <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-[8px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {t.qrgoDriver?.waiting || "În Așteptare"}
                </span>
                <p className="text-[7px] text-slate-400 mt-1 text-center">{t.qrgoDriver?.waitingDesc || "Aștepți confirmarea operatorului"}</p>
              </div>
              {/* QR Code Side - Real QR code to qrgo.ro */}
              <div className="flex-1 flex flex-col items-center justify-center py-2">
                <div className="w-16 h-16 bg-white rounded p-1 mb-1">
                  <QRCodeSVG />
                </div>
                <p className="text-[7px] text-slate-500">fcee6dfd...</p>
              </div>
            </div>
            <div className="border-t border-slate-700 mt-2 pt-2 flex items-center justify-end gap-1 text-[7px] text-slate-400">
              <svg className="w-2.5 h-2.5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <svg className="w-2.5 h-2.5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>{t.qrgoDriver?.sent || "Trimis"} 19:07</span>
            </div>
          </div>

          {/* Action Card */}
          <div className="bg-amber-500/10 rounded-lg p-2 border border-amber-500/30">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-5 h-5 rounded-full bg-amber-500/30 flex items-center justify-center">
                <svg className="w-3 h-3 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-[8px] text-amber-300 font-medium">{t.qrgoDriver?.whatToDo || "Ce trebuie să faci"}</span>
            </div>
            <p className="text-[9px] text-amber-200 font-semibold">{t.qrgoDriver?.pleaseWait || "Te rugăm să aștepți"}</p>
            <p className="text-[7px] text-amber-300/70">{t.qrgoDriver?.willBeNotified || "Vei fi notificat la următoarea acțiune"}</p>
          </div>

          {/* Driver Info Card */}
          <div className="bg-slate-800 rounded-lg p-2 border border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-4 h-4 rounded-full bg-blue-500/30 flex items-center justify-center">
                <svg className="w-2.5 h-2.5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-[8px] text-slate-300 font-medium">{t.qrgoDriver?.driverInfo || "Informații Șofer"}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[7px]">
              <div>
                <p className="text-slate-500">{t.qrgoDriver?.driverNameLabel || "NUME"}</p>
                <p className="text-white">{t.qrgoDriver?.driverName || "Popescu Ion"}</p>
              </div>
              <div>
                <p className="text-slate-500">{t.qrgoDriver?.driverPhoneLabel || "TELEFON"}</p>
                <p className="text-white">{t.qrgoDriver?.driverPhone || "+40 722 345 678"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}

// Driver App Mockup - Assigned Status
// Driver App Mockup - Assigned Status
function DriverMockupAssigned({ t }: { t: Translations }) {
  return (
    <PhoneFrame>
      <div className="h-full overflow-hidden text-white">
        {/* Status Header */}
        <div className="bg-blue-600 px-3 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-500/50 flex items-center justify-center">
                <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-[9px] font-semibold">{t.qrgoDriver?.statusCheckin || "Status Check-in"}</p>
                <p className="text-[7px] text-blue-200">{t.qrgoDriver?.warehouseName || "Depozit București"}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[7px] bg-emerald-500/20 px-1.5 py-0.5 rounded-full">
              <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-300">LIVE</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-2 space-y-2">
          {/* Status Card */}
          <div className="bg-slate-800 rounded-lg p-2 border border-slate-700">
            <div className="flex gap-2">
              {/* Status Icon Side */}
              <div className="flex-1 flex flex-col items-center justify-center py-2">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center mb-1">
                  <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-[8px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {t.qrgoDriver?.assigned || "Alocat"}
                </span>
                <p className="text-[7px] text-slate-400 mt-1 text-center">{t.qrgoDriver?.assignedDesc || "V-a fost atribuită o rampă"}</p>
              </div>
              {/* QR Code Side - Real QR code to qrgo.ro */}
              <div className="flex-1 flex flex-col items-center justify-center py-2">
                <div className="w-16 h-16 bg-white rounded p-1 mb-1">
                  <QRCodeSVG />
                </div>
                <p className="text-[7px] text-slate-500">562a10b7...</p>
              </div>
            </div>
            <div className="border-t border-slate-700 mt-2 pt-2 flex items-center justify-end gap-1 text-[7px] text-slate-400">
              <svg className="w-2.5 h-2.5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <svg className="w-2.5 h-2.5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <svg className="w-2.5 h-2.5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>{t.qrgoDriver?.seen || "Văzut"} 19:44</span>
            </div>
          </div>

          {/* Action Card - Go to Ramp */}
          <div className="bg-emerald-500/10 rounded-lg p-2 border border-emerald-500/30">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-5 h-5 rounded-full bg-emerald-500/30 flex items-center justify-center">
                <svg className="w-3 h-3 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-[8px] text-emerald-300 font-medium">{t.qrgoDriver?.whatToDo || "Ce trebuie să faci"}</span>
            </div>
            <p className="text-[11px] text-emerald-200 font-bold">{t.qrgoDriver?.goToRamp || "Mergi la Rampa 1"}</p>
          </div>

          {/* Ramp Card */}
          <div className="bg-slate-800 rounded-lg p-2 border border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-4 h-4 rounded-full bg-purple-500/30 flex items-center justify-center">
                <svg className="w-2.5 h-2.5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-[8px] text-slate-300 font-medium">{t.qrgoDriver?.rampAssigned || "Rampă Alocată"}</span>
            </div>
            <p className="text-[11px] text-white font-bold mb-2">{t.qrgoDriver?.ramp1 || "Rampa 1"}</p>
            <div className="w-full h-14 bg-slate-700 rounded flex items-center justify-center">
              <svg className="w-12 h-10 text-slate-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 8h-3V4H1v13h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}

// Driver App Mockup - Check-in Info
// Driver App Mockup - Check-in Info
function DriverMockupInfo({ t }: { t: Translations }) {
  return (
    <PhoneFrame>
      <div className="h-full overflow-hidden text-white">
        {/* Info Header */}
        <div className="bg-slate-800 px-3 py-2 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-blue-500/30 flex items-center justify-center">
              <svg className="w-2.5 h-2.5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-[9px] font-semibold">{t.qrgoDriver?.checkinInfo || "Informații Check-in"}</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-2 space-y-2 overflow-y-auto" style={{ maxHeight: 'calc(100% - 36px)' }}>
          {/* Operation Type Badge */}
          <div className="flex justify-center">
            <span className="text-[8px] px-2 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
              <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              {t.qrgoDriver?.unloadAndLoad || "Descărcare & Încărcare"}
            </span>
          </div>

          {/* Reference Cards */}
          <div className="bg-emerald-500/10 rounded-lg p-2 border border-emerald-500/30">
            <p className="text-[7px] text-emerald-400 mb-0.5 flex items-center gap-1">
              <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              {t.qrgoDriver?.unloadRef || "REF. DESCĂRCARE"}
            </p>
            <p className="text-[10px] text-emerald-300 font-bold">{t.qrgoDriver?.unloadRefValue || "PO-2024-0847"}</p>
          </div>

          <div className="bg-red-500/10 rounded-lg p-2 border border-red-500/30">
            <p className="text-[7px] text-red-400 mb-0.5 flex items-center gap-1">
              <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              {t.qrgoDriver?.loadRef || "REF. ÎNCĂRCARE"}
            </p>
            <p className="text-[10px] text-red-300 font-bold">{t.qrgoDriver?.loadRefValue || "DEL-RO-12458"}</p>
          </div>

          {/* Details */}
          <div className="bg-slate-800 rounded-lg p-2 border border-slate-700 space-y-2">
            <div className="flex items-center gap-2">
              <svg className="w-3 h-3 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-[6px] text-slate-500">{t.qrgoDriver?.scheduledTime || "ORĂ PROGRAMATĂ"}</p>
                <p className="text-[9px] text-orange-400 font-semibold">09:00</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-3 h-3 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
              </svg>
              <div>
                <p className="text-[6px] text-slate-500">{t.qrgoDriver?.cargoType || "TIP MARFĂ"}</p>
                <p className="text-[9px] text-white">{t.qrgoDriver?.cargoValue || "Legume"}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-3 h-3 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-[6px] text-slate-500">{t.qrgoDriver?.department || "DEPARTAMENT"}</p>
                <p className="text-[9px] text-white">{t.qrgoDriver?.departmentValue || "Office"}</p>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-slate-800 rounded-lg p-2 border border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-3 h-3 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6z" />
              </svg>
              <span className="text-[8px] font-semibold">{t.qrgoDriver?.timeline || "Cronologie"}</span>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[7px] text-white font-medium">{t.qrgoDriver?.rampAllocated || "Rampă Alocată"}</span>
                    <span className="text-[6px] text-slate-500">19:44</span>
                  </div>
                  <p className="text-[6px] text-slate-400">{t.qrgoDriver?.rampAllocatedDesc || "Rampa 1 alocată"}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[7px] text-white font-medium">{t.qrgoDriver?.checkinConfirmed || "Check-in confirmat"}</span>
                    <span className="text-[6px] text-slate-500">19:44</span>
                  </div>
                  <p className="text-[6px] text-slate-400">{t.qrgoDriver?.confirmedBy || "Confirmat de Daniel"}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-500 mt-1" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[7px] text-white font-medium">{t.qrgoDriver?.checkinCreated || "Check-in creat"}</span>
                    <span className="text-[6px] text-slate-500">19:43</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}

// QRGO Driver Section
function QRGODriverSection({ t }: { t: Translations }) {
  return (
    <section id="qrgo-driver" className="py-20 bg-gradient-to-b from-slate-900 to-slate-800 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full filter blur-[100px]" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-500 rounded-full filter blur-[100px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/20 text-blue-300 text-sm font-medium mb-4">
            <MobileIcon />
            {t.qrgoDriver?.badge || "Mobile App"}
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            {t.qrgoDriver?.title || "QRGO Driver"}
          </h2>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            {t.qrgoDriver?.subtitle || "Aplicația mobilă pentru șoferi - check-in rapid, notificări în timp real și instrucțiuni clare pentru fiecare operațiune."}
          </p>
        </div>

        {/* Phone Mockups */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-4 mb-12">
          <div className="transform lg:-rotate-6 lg:translate-y-4 hover:rotate-0 hover:translate-y-0 transition-transform duration-300">
            <DriverMockupWaiting t={t} />
            <p className="text-center text-sm text-slate-400 mt-4">{t.qrgoDriver?.mockup1Title || "Status în așteptare"}</p>
          </div>
          <div className="transform lg:scale-110 lg:z-10 hover:scale-115 transition-transform duration-300">
            <DriverMockupAssigned t={t} />
            <p className="text-center text-sm text-slate-400 mt-4">{t.qrgoDriver?.mockup2Title || "Rampă alocată"}</p>
          </div>
          <div className="transform lg:rotate-6 lg:translate-y-4 hover:rotate-0 hover:translate-y-0 transition-transform duration-300">
            <DriverMockupInfo t={t} />
            <p className="text-center text-sm text-slate-400 mt-4">{t.qrgoDriver?.mockup3Title || "Detalii check-in"}</p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="https://apps.apple.com/app/qrgo-driver"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-6 py-3 bg-white text-slate-900 rounded-xl font-medium hover:bg-slate-100 transition-colors"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
            <div className="text-left">
              <p className="text-[10px] opacity-70">{t.qrgoDriver?.downloadFrom || "Descarcă din"}</p>
              <p className="text-sm font-semibold">App Store</p>
            </div>
          </a>
          <a
            href="https://play.google.com/store/apps/details?id=ro.qrgo.driver"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-6 py-3 bg-white text-slate-900 rounded-xl font-medium hover:bg-slate-100 transition-colors"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.5,12.92 20.16,13.19L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
            </svg>
            <div className="text-left">
              <p className="text-[10px] opacity-70">{t.qrgoDriver?.downloadFrom || "Descarcă din"}</p>
              <p className="text-sm font-semibold">Google Play</p>
            </div>
          </a>
          <a
            href="https://qrgo.ro"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 text-blue-400 hover:text-blue-300 transition-colors"
          >
            <GlobeIcon />
            <span>{t.qrgoDriver?.visitWebsite || "Vizitează qrgo.ro"}</span>
            <ArrowRightIcon />
          </a>
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
  const [selectedWarehouses, setSelectedWarehouses] = useState<'5' | '10' | '25'>('5');

  const professionalFeatures = [
    t.pricing.feature1,
    t.pricing.feature2,
    t.pricing.feature3,
    t.pricing.feature4,
    t.pricing.feature5,
    t.pricing.feature6,
    t.pricing.feature7,
    t.pricing.feature8,
    t.pricing.feature9,
    t.pricing.feature10,
  ];

  const enterpriseFeatures = [
    t.pricing.enterpriseFeature1,
    t.pricing.enterpriseFeature2,
  ];

  const enterprisePrices = {
    '5': t.pricing.price5,
    '10': t.pricing.price10,
    '25': t.pricing.price25,
  };

  const warehouseLabels = {
    '5': t.pricing.warehouses5,
    '10': t.pricing.warehouses10,
    '25': t.pricing.warehouses25,
  };

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

            <div className="mb-6">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-slate-900 dark:text-white">
                  {t.pricing.professionalPrice}€
                </span>
                <span className="text-slate-500 dark:text-slate-400">
                  {t.pricing.perMonth}
                </span>
              </div>
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
              href="https://cloud.logistiq.ro/signup?plan=professional"
              className="block w-full py-4 rounded-xl font-semibold text-center btn-primary text-white"
            >
              {t.pricing.choosePlan}
            </Link>
          </div>

          {/* Enterprise Plan */}
          <div className="relative bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 card-hover">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-purple-600 text-white text-sm font-medium rounded-full">
              {t.pricing.multipleLocations}
            </div>

            {/* Illustration - Multiple warehouses */}
            <div className="flex justify-center mb-6 pt-2">
              <div className="relative">
                <svg className="w-24 h-24 text-purple-500" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2">
                  {/* Main warehouse */}
                  <rect x="30" y="35" width="40" height="35" rx="2" className="fill-purple-100 dark:fill-purple-900/30" />
                  <path d="M25 35 L50 15 L75 35" strokeLinejoin="round" className="fill-purple-200 dark:fill-purple-800/30" />
                  <rect x="44" y="50" width="12" height="20" rx="1" className="fill-purple-300 dark:fill-purple-700/50" />
                  {/* Left small warehouse */}
                  <rect x="5" y="50" width="22" height="20" rx="2" className="fill-purple-100 dark:fill-purple-900/30" />
                  <path d="M3 50 L16 38 L29 50" strokeLinejoin="round" className="fill-purple-200 dark:fill-purple-800/30" />
                  {/* Right small warehouse */}
                  <rect x="73" y="50" width="22" height="20" rx="2" className="fill-purple-100 dark:fill-purple-900/30" />
                  <path d="M71 50 L84 38 L97 50" strokeLinejoin="round" className="fill-purple-200 dark:fill-purple-800/30" />
                  {/* Connection lines */}
                  <path d="M27 60 L30 60" strokeDasharray="2 2" className="text-purple-400" />
                  <path d="M70 60 L73 60" strokeDasharray="2 2" className="text-purple-400" />
                </svg>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 text-center">
                {t.pricing.enterprise}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-center">
                {t.pricing.enterpriseDesc}
              </p>
            </div>

            <div className="mb-6">
              {/* Price display */}
              <div className="flex items-baseline justify-center gap-1 mb-4">
                <span className="text-4xl font-bold text-slate-900 dark:text-white">
                  {enterprisePrices[selectedWarehouses]}€
                </span>
                <span className="text-slate-500 dark:text-slate-400">
                  {t.pricing.perMonth}
                </span>
              </div>

              {/* Warehouse selector buttons */}
              <div className="grid grid-cols-3 gap-2">
                {(['5', '10', '25'] as const).map((count) => (
                  <button
                    key={count}
                    onClick={() => setSelectedWarehouses(count)}
                    className={`py-3 px-4 rounded-xl font-semibold text-sm transition-all ${
                      selectedWarehouses === count
                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    {warehouseLabels[count]}
                  </button>
                ))}
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
              href={`https://cloud.logistiq.ro/signup?plan=enterprise-${selectedWarehouses}`}
              className="block w-full py-4 rounded-xl font-semibold text-center bg-purple-600 hover:bg-purple-700 text-white transition-colors"
            >
              {t.pricing.choosePlan}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// FAQ Section
function FAQSection({ t }: { t: Translations }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    { q: t.faq.q1, a: t.faq.a1 },
    { q: t.faq.q2, a: t.faq.a2 },
    { q: t.faq.q3, a: t.faq.a3 },
    { q: t.faq.q4, a: t.faq.a4 },
    { q: t.faq.q5, a: t.faq.a5 },
    { q: t.faq.q6, a: t.faq.a6 },
    { q: t.faq.q7, a: t.faq.a7 },
    { q: t.faq.q8, a: t.faq.a8 },
    { q: t.faq.q9, a: t.faq.a9 },
    { q: t.faq.q10, a: t.faq.a10 },
    { q: t.faq.q11, a: t.faq.a11 },
    { q: t.faq.q12, a: t.faq.a12 },
    { q: t.faq.q13, a: t.faq.a13 },
    { q: t.faq.q14, a: t.faq.a14 },
    { q: t.faq.q15, a: t.faq.a15 },
  ];

  return (
    <section id="faq" className="py-20 lg:py-32 bg-white dark:bg-slate-800 relative overflow-hidden">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-6">
            {t.faq.title}
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            {t.faq.subtitle}
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-slate-50 dark:bg-slate-700/50 rounded-2xl overflow-hidden transition-all duration-200"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <span className="font-medium text-slate-900 dark:text-white pr-4">
                  {faq.q}
                </span>
                <span
                  className={`flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 transition-transform duration-200 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                >
                  <ChevronDownIcon />
                </span>
              </button>
              <div
                className={`overflow-hidden transition-all duration-200 ${
                  openIndex === index ? 'max-h-96' : 'max-h-0'
                }`}
              >
                <div className="px-6 pb-5 text-slate-600 dark:text-slate-300 leading-relaxed">
                  {faq.a}
                </div>
              </div>
            </div>
          ))}
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formState),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'A apărut o eroare');
      }

      setSubmitStatus('success');
      setFormState({ name: '', email: '', company: '', phone: '', message: '' });
    } catch (error) {
      setSubmitStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'A apărut o eroare');
    } finally {
      setIsSubmitting(false);
    }
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
                    {t.contact.name} <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    value={formState.name}
                    onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                    placeholder={t.contact.namePlaceholder}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                    autoComplete="name"
                  />
                </div>
                <div>
                  <label htmlFor="contact-email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    {t.contact.email} <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    value={formState.email}
                    onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                    placeholder={t.contact.emailPlaceholder}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="contact-company" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    {t.contact.company} <span className="text-slate-400 text-xs">({t.contact.optional})</span>
                  </label>
                  <input
                    id="contact-company"
                    type="text"
                    value={formState.company}
                    onChange={(e) => setFormState({ ...formState, company: e.target.value })}
                    placeholder={t.contact.companyPlaceholder}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    autoComplete="organization"
                  />
                </div>
                <div>
                  <label htmlFor="contact-phone" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    {t.contact.phone} <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="contact-phone"
                    type="tel"
                    value={formState.phone}
                    onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                    placeholder={t.contact.phonePlaceholder}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    autoComplete="tel"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="contact-message" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  {t.contact.message} <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="contact-message"
                  value={formState.message}
                  onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                  rows={4}
                  placeholder={t.contact.messagePlaceholder}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  required
                />
              </div>

              {/* Success message */}
              {submitStatus === 'success' && (
                <div className="p-4 rounded-xl bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800">
                  <p className="text-green-700 dark:text-green-300 font-medium flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {t.contact.sent}
                  </p>
                </div>
              )}

              {/* Error message */}
              {submitStatus === 'error' && (
                <div className="p-4 rounded-xl bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800">
                  <p className="text-red-700 dark:text-red-300 font-medium flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    {errorMessage || t.contact.error}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full btn-primary text-white py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    {t.contact.sending}
                  </>
                ) : (
                  <>
                    {t.contact.send}
                    <ArrowRightIcon />
                  </>
                )}
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
