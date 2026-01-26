"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type CookiePreferences = {
  essential: boolean;
  functional: boolean;
  analytics: boolean;
};

type CookieConsentTranslations = {
  title: string;
  description: string;
  acceptAll: string;
  rejectOptional: string;
  customize: string;
  save: string;
  categories: {
    essential: { name: string; desc: string };
    functional: { name: string; desc: string };
    analytics: { name: string; desc: string };
  };
  required: string;
  learnMore: string;
  managePreferences: string;
};

const COOKIE_CONSENT_KEY = "logistiq_cookie_consent";

// Icons
const CookieIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CloseIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const SettingsIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

function Toggle({
  checked,
  onChange,
  disabled = false
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={`
        relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent
        transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        ${disabled ? "cursor-not-allowed opacity-50" : ""}
        ${checked ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-600"}
      `}
    >
      <span
        className={`
          pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0
          transition duration-200 ease-in-out
          ${checked ? "translate-x-5" : "translate-x-0"}
        `}
      />
    </button>
  );
}

export default function CookieConsent({
  locale,
  t,
}: {
  locale: string;
  t: CookieConsentTranslations;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    functional: true,
    analytics: true,
  });

  useEffect(() => {
    // Check if user has already set preferences
    const saved = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setPreferences(parsed);
        setIsVisible(false);
      } catch {
        setIsVisible(true);
      }
    } else {
      // Show banner after a short delay for better UX
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const savePreferences = (prefs: CookiePreferences) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(prefs));
    setPreferences(prefs);
    setIsVisible(false);
    setShowModal(false);

    // Dispatch event for analytics scripts to listen to
    window.dispatchEvent(new CustomEvent("cookieConsentUpdate", { detail: prefs }));
  };

  const acceptAll = () => {
    savePreferences({ essential: true, functional: true, analytics: true });
  };

  const rejectOptional = () => {
    savePreferences({ essential: true, functional: false, analytics: false });
  };

  const saveCustom = () => {
    savePreferences(preferences);
  };

  if (!isVisible && !showModal) return null;

  return (
    <>
      {/* Banner */}
      {isVisible && !showModal && (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-fade-in">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Icon & Text */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400">
                      <CookieIcon />
                    </div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      {t.title}
                    </h3>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {t.description}{" "}
                    <Link
                      href={`/${locale}/cookies`}
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {t.learnMore}
                    </Link>
                  </p>
                </div>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                  <button
                    onClick={() => setShowModal(true)}
                    className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center justify-center gap-2"
                  >
                    <SettingsIcon />
                    {t.customize}
                  </button>
                  <button
                    onClick={rejectOptional}
                    className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    {t.rejectOptional}
                  </button>
                  <button
                    onClick={acceptAll}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
                  >
                    {t.acceptAll}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />

          {/* Modal Content */}
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 max-w-lg w-full max-h-[90vh] overflow-y-auto animate-fade-in">
            {/* Header */}
            <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <CookieIcon />
                </div>
                <h2 className="font-semibold text-slate-900 dark:text-white">
                  {t.customize}
                </h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
              >
                <CloseIcon />
              </button>
            </div>

            {/* Categories */}
            <div className="p-4 space-y-4">
              {/* Essential */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-slate-900 dark:text-white">
                    {t.categories.essential.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded">
                      {t.required}
                    </span>
                    <Toggle checked={true} onChange={() => {}} disabled />
                  </div>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {t.categories.essential.desc}
                </p>
              </div>

              {/* Functional */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-slate-900 dark:text-white">
                    {t.categories.functional.name}
                  </h3>
                  <Toggle
                    checked={preferences.functional}
                    onChange={(checked) => setPreferences({ ...preferences, functional: checked })}
                  />
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {t.categories.functional.desc}
                </p>
              </div>

              {/* Analytics */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-slate-900 dark:text-white">
                    {t.categories.analytics.name}
                  </h3>
                  <Toggle
                    checked={preferences.analytics}
                    onChange={(checked) => setPreferences({ ...preferences, analytics: checked })}
                  />
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {t.categories.analytics.desc}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 p-4 flex flex-col sm:flex-row gap-2">
              <Link
                href={`/${locale}/cookies`}
                className="text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-center sm:text-left flex-1"
                onClick={() => setShowModal(false)}
              >
                {t.learnMore}
              </Link>
              <div className="flex gap-2">
                <button
                  onClick={rejectOptional}
                  className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  {t.rejectOptional}
                </button>
                <button
                  onClick={saveCustom}
                  className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
                >
                  {t.save}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Export a button to manage preferences (for Footer)
export function CookiePreferencesButton({
  label,
  className = "",
}: {
  label: string;
  className?: string;
}) {
  const openPreferences = () => {
    // Remove saved preferences to show the banner again
    localStorage.removeItem(COOKIE_CONSENT_KEY);
    window.location.reload();
  };

  return (
    <button
      onClick={openPreferences}
      className={`text-slate-400 hover:text-white transition-colors ${className}`}
    >
      {label}
    </button>
  );
}
