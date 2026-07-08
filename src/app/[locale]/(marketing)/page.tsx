import { translations } from "@/lib/i18n/translations";
import { isValidLocale } from "@/lib/i18n/config";
import { JsonLd, webPageSchema } from "@/lib/seo/jsonld";
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

// Home page. Chrome (header/footer/cookie-consent) is provided by the marketing
// layout; this page only composes the landing sections.
export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  const locale = isValidLocale(localeParam) ? localeParam : "ro";
  const t = translations[locale];

  return (
    <>
      <JsonLd
        data={webPageSchema({
          locale,
          path: "/",
          title: t.seo.title,
          description: t.seo.description,
        })}
      />
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
    </>
  );
}
