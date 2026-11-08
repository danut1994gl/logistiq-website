"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { type Translations } from "@/lib/i18n/translations";
import { ArrowRightIcon } from "@/components/icons";
import {
  ELAPSED_FIELD,
  FIELD_MAX,
  HONEYPOT_FIELD,
  IDLE_RESTART_MS,
  RECAPTCHA_FIELD,
  type ContactErrorCode,
} from "@/lib/contact/protocol";
import { loadRecaptcha, recaptchaToken } from "@/lib/contact/recaptcha-client";

// Off-screen with inline styles (hidden even without the stylesheet), out of the
// tab order and the accessibility tree: people never reach it, form bots fill it.
const HONEYPOT_STYLE: React.CSSProperties = {
  position: "absolute",
  left: "-10000px",
  top: "auto",
  width: 1,
  height: 1,
  overflow: "hidden",
};

export function ContactSection({ t, compact = false }: { t: Translations; compact?: boolean }) {
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

  // When the form opened, on the monotonic clock (a wrong device clock can't
  // skew it); the route drops messages sent too fast or a day later. Read only
  // after hydration (golden rule 6).
  const openedAt = useRef(0);
  const used = useRef(false);
  useEffect(() => {
    openedAt.current = performance.now();
  }, []);

  const onFirstUse = () => {
    if (used.current) return;
    used.current = true;
    // A tab left open and untouched: the form really opens now.
    if (performance.now() - openedAt.current > IDLE_RESTART_MS) openedAt.current = performance.now();
    // Warm reCAPTCHA (when configured) while the visitor types.
    loadRecaptcha()?.catch(() => {});
  };

  const errorFor = (data: { code?: unknown; error?: unknown }): string => {
    const byCode: Partial<Record<ContactErrorCode, string>> = {
      rate_limited: t.contact.rateLimited,
      verify_failed: t.contact.verifyFailed,
    };
    return (
      byCode[data.code as ContactErrorCode] ??
      (typeof data.error === "string" && data.error ? data.error : t.contact.error)
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      let token: string | null;
      try {
        token = await recaptchaToken();
      } catch {
        // reCAPTCHA is on but blocked or offline: say so rather than send a
        // message the route would have to drop.
        setSubmitStatus('error');
        setErrorMessage(t.contact.verifyFailed);
        return;
      }

      const trap = form.elements.namedItem(HONEYPOT_FIELD);
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formState,
          [HONEYPOT_FIELD]: trap instanceof HTMLInputElement ? trap.value : "",
          [ELAPSED_FIELD]: Math.round(performance.now() - openedAt.current),
          ...(token ? { [RECAPTCHA_FIELD]: token } : {}),
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setSubmitStatus('error');
        setErrorMessage(errorFor(data));
        return;
      }

      setSubmitStatus('success');
      setFormState({ name: '', email: '', company: '', phone: '', message: '' });
      // The next message gets its own fill time.
      openedAt.current = performance.now();
      used.current = false;
    } catch {
      setSubmitStatus('error');
      setErrorMessage(t.contact.error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className={`${compact ? "pt-6 pb-20 lg:pt-8 lg:pb-28" : "py-20 lg:py-32"} relative overflow-hidden`}>
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
                  <a href="tel:+40771570577" className="text-green-600 dark:text-green-400 hover:underline">
                    {t.cta.phoneNumber}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 flex-shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1">{t.contact.info}</h3>
                  <div className="text-slate-600 dark:text-slate-300 text-sm grid grid-cols-[auto_auto] gap-x-4 gap-y-0.5">
                    {[
                      t.contact.schedule.monday,
                      t.contact.schedule.tuesday,
                      t.contact.schedule.wednesday,
                      t.contact.schedule.thursday,
                      t.contact.schedule.friday,
                    ].map((day, i) => {
                      const [name, hours] = day.split(': ');
                      return (
                        <Fragment key={i}>
                          <span>{name}</span>
                          <span className="tabular-nums">{hours}</span>
                        </Fragment>
                      );
                    })}
                    {[
                      t.contact.schedule.saturday,
                      t.contact.schedule.sunday,
                    ].map((day, i) => {
                      const [name, hours] = day.split(': ');
                      return (
                        <Fragment key={`we-${i}`}>
                          <span className="text-slate-400">{name}</span>
                          <span className="text-slate-400">{hours}</span>
                        </Fragment>
                      );
                    })}
                  </div>
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
            <form onSubmit={handleSubmit} onFocus={onFirstUse} className="space-y-6" aria-label="Contact form">
              <div aria-hidden="true" style={HONEYPOT_STYLE}>
                <label htmlFor="contact-reference">{t.contact.honeypot}</label>
                <input
                  id="contact-reference"
                  type="text"
                  name={HONEYPOT_FIELD}
                  tabIndex={-1}
                  autoComplete="off"
                  defaultValue=""
                />
              </div>

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
                    maxLength={FIELD_MAX.name}
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
                    maxLength={FIELD_MAX.email}
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
                    maxLength={FIELD_MAX.company}
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
                    maxLength={FIELD_MAX.phone}
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
                  maxLength={FIELD_MAX.message}
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

