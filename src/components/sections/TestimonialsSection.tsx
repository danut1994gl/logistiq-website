import { type Translations } from "@/lib/i18n/translations";
import { StarIcon } from "@/components/icons";

export function TestimonialsSection({ t }: { t: Translations }) {
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
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

