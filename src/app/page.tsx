import type { Metadata } from "next";
import { localizedAlternates } from "@/lib/i18n";
import { HeroImmersive } from "@/components/home/hero-immersive";
import { SignatureLine } from "@/components/home/signature-line";
import { AboutPreview } from "@/components/home/about-preview";
import { ExperienceSteps } from "@/components/home/experience-steps";
import { FeaturedReel } from "@/components/home/featured-reel";
import { ServicesShowcase } from "@/components/home/services-showcase";
import { PricingInvestment } from "@/components/home/pricing-investment";
import { DiscoverCards } from "@/components/home/discover-cards";
import { Testimonials } from "@/components/home/testimonials";
import { FinalCta } from "@/components/home/final-cta";

export const metadata: Metadata = {
  alternates: localizedAlternates("/"),
};

// The homepage is the product (D010): a long-form narrative that lets a visitor
// feel the warmth, trust the person, and inquire without navigating. Each section
// is its own component, composed in the order of the conversion arc
// (vault: homepage-blueprint). Imagery is reserved-frame placeholders that accept
// real photographs with zero layout change.
export default function HomePage() {
  return (
    <>
      <HeroImmersive />
      <SignatureLine />
      <AboutPreview />
      <ExperienceSteps />
      <FeaturedReel />
      <ServicesShowcase />
      <PricingInvestment />
      <DiscoverCards />
      <Testimonials />
      <FinalCta />
    </>
  );
}
