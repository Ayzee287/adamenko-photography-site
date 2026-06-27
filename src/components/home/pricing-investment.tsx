import { Container } from "@/components/layout/container";
import { SectionHeading } from "./section-heading";
import { Reveal } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button-link";
import { pricing } from "@/content/pricing";

/**
 * Section 7 — investment TEASER (P1 IA consolidation). The full offering — formules,
 * "ce qui est inclus" and the add-ons — now lives once on /prestations (the canonical
 * services funnel). The homepage keeps only this quiet, persuasive pointer: the
 * "Investissement" framing and a single link into the page. No prices on the homepage.
 */
export function PricingInvestment() {
  return (
    <section className="py-10 sm:py-16">
      <Container>
        <Reveal>
          <SectionHeading eyebrow={pricing.eyebrow} title={pricing.title} />
          <div className="mt-8">
            <ButtonLink href={pricing.overviewCta.href} variant="secondary">
              {pricing.overviewCta.label}
            </ButtonLink>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
