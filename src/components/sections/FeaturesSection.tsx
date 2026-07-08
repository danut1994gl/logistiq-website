import { type Translations } from "@/lib/i18n/translations";
import { QrCodeIcon, ChatIcon, UsersIcon, ChartIcon, MobileIcon, GlobeIcon, GateIcon, ApiIcon, CloudIcon, MapPinIcon, ClockIcon, CompassIcon } from "@/components/icons";

export function FeaturesSection({ t }: { t: Translations }) {
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
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

