"use client";

import { useState } from "react";
import Link from "next/link";
import { type Translations } from "@/lib/i18n/translations";
import { CheckIcon } from "@/components/icons";

export function PricingSection({ t }: { t: Translations }) {
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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
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
              href="https://logistiq.cloud/signup?plan=professional"
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
              href={`https://logistiq.cloud/signup?plan=enterprise-${selectedWarehouses}`}
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

