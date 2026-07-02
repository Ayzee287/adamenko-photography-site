import type { Metadata } from "next";
import {
  localizedAlternates,
  defaultLocale,
  isLocale,
  type Locale,
} from "@/lib/i18n";
import { setRequestLocale } from "@/lib/request-locale";
import { getDictionary } from "@/lib/dictionary";
import { HeroImmersive } from "@/components/home/hero-immersive";
import { SignatureLine } from "@/components/home/signature-line";
import { AboutPreview } from "@/components/home/about-preview";
import { ExperienceSteps } from "@/components/home/experience-steps";
import { FeaturedReel } from "@/components/home/featured-reel";
import { ServicesShowcase } from "@/components/home/services-showcase";
import { DiscoverCards } from "@/components/home/discover-cards";
import { Testimonials } from "@/components/home/testimonials";
import { FinalCta } from "@/components/home/final-cta";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : defaultLocale;
  return { alternates: localizedAlternates("/", locale) };
}

// The homepage is the product (D010): a long-form narrative that lets a visitor feel
// the warmth, trust the person, and inquire without navigating. Each section reads its
// content from the request locale (set below), so the same composition renders French
// at "/" and English at "/en" with no per-section props.
export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : defaultLocale;
  setRequestLocale(locale);
  const dict = getDictionary(locale);
  // Testimonials is a client island (manual carousel) → it can't read the request
  // locale; pass its strings as props. Every other section is a server component that
  // resolves its own slice from the request locale.
  const testimonials = {
    ...dict.home.testimonials,
    prevLabel: dict.ui.testimonials.prev,
    nextLabel: dict.ui.testimonials.next,
  };
  return (
    <>
      <HeroImmersive />
      <SignatureLine />
      <AboutPreview />
      <ExperienceSteps />
      <FeaturedReel />
      <ServicesShowcase />
      {/* The Investissement teaser (PricingInvestment) is temporarily withheld — a
          launch-scope product decision, not a removal: the homepage stays on one
          story (work → trust → contact) while /prestations still evolves. Restore
          by re-adding the import + element here once the pricing page is final. */}
      <DiscoverCards />
      <Testimonials t={testimonials} />
      <FinalCta />
    </>
  );
}
