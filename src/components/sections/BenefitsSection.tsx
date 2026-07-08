import { type Translations } from "@/lib/i18n/translations";
import { UsersIcon, SteeringWheelIcon, CheckIcon } from "@/components/icons";

export function BenefitsSection({ t }: { t: Translations }) {
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
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

