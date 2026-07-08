import Link from "next/link";
import { type Translations } from "@/lib/i18n/translations";
import { ArrowRightIcon } from "@/components/icons";

export function CTASection({ t }: { t: Translations }) {
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

