import { Container } from "@/components/layout/container";
import { SectionHeading } from "./section-heading";
import { Reveal } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button-link";
import { getDictionary } from "@/lib/dictionary";
import { getRequestLocale, localeHref } from "@/lib/request-locale";

/**
 * Section 7 — investment TEASER (P1 IA consolidation). The full offering — formules,
 * "ce qui est inclus" and the add-ons — now lives once on /prestations (the canonical
 * services funnel). The homepage keeps only this quiet, persuasive pointer: the
 * "Investissement" framing and a single link into the page. No prices on the homepage.
 *
 * Arrangement: the reel section's header row (heading left, secondary CTA right on
 * the shared baseline). Stacked, the teaser read as a truncated full section whose
 * lone left-column link echoed the séances CTA directly above it — a stutter between
 * two heavyweight sections. On one axis it reads as a deliberate compact interlude;
 * the section rhythm (py-10 sm:py-16) and page order are untouched.
 */
export function PricingInvestment() {
  const { pricing } = getDictionary(getRequestLocale());
  return (
    <section className="py-10 sm:py-16">
      <Container>
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-6">
            <SectionHeading
              eyebrow={pricing.eyebrow}
              title={pricing.title}
              className="max-w-xl"
            />
            <ButtonLink href={localeHref(pricing.overviewCta.href)} variant="secondary">
              {pricing.overviewCta.label}
            </ButtonLink>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
