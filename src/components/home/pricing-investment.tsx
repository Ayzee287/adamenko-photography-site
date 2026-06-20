import Link from "next/link";
import { Container } from "@/components/layout/container";
import { SectionHeading } from "./section-heading";
import { Reveal } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button-link";
import { home } from "@/content/home";
import { pricing } from "@/content/pricing";

/**
 * Section 7 — investment. Transparent in structure, honest in numbers (D012): a
 * real `priceFrom` renders "à partir de N €"; otherwise "Tarif sur demande". No
 * fabricated prices. The FAQ uses native <details> (no JS) to remove buying anxiety.
 */
export function PricingInvestment() {
  const p = home.pricing;

  return (
    <section className="py-10 sm:py-16">
      <Container>
        <Reveal>
          <SectionHeading eyebrow={p.eyebrow} title={p.title} intro={p.intro} />
        </Reveal>

        {/* De-boxed (D021): editorial blocks separated by a single top hairline,
            not cards. The hairline carries meaning (it sets one offering apart). */}
        <div className="mt-10 grid gap-x-12 gap-y-10 sm:mt-16 lg:grid-cols-2 lg:gap-x-24">
          {pricing.packages.map((pkg, i) => (
            <Reveal key={pkg.name} delay={i * 90}>
              <div className="border-t border-line pt-8">
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="font-serif text-3xl text-ink">{pkg.name}</h3>
                  <span className="whitespace-nowrap text-sm text-muted">
                    {pkg.priceFrom == null
                      ? p.onRequest
                      : `${p.fromLabel} ${pkg.priceFrom} €`}
                  </span>
                </div>
                <p className="mt-3 max-w-sm text-pretty text-sm text-muted">
                  {pkg.summary}
                </p>
                <ul className="mt-6 space-y-2.5 text-sm text-ink">
                  {pkg.includes.map((inc) => (
                    <li key={inc} className="flex gap-3">
                      <span aria-hidden className="mt-2 h-px w-3 shrink-0 bg-clay" />
                      {inc}
                    </li>
                  ))}
                </ul>
                {/* Secondary here so the page keeps a single primary per viewport
                    (the closing contact CTA); pricing should inform, not shout. */}
                <div className="mt-8">
                  <ButtonLink href={p.cta.href} variant="secondary">
                    {p.cta.label}
                  </ButtonLink>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <p className="mt-10 text-sm text-muted">
          Des questions ?{" "}
          <Link href="/prestations#faq" className="text-clay hover:text-ink">
            Voir les questions fréquentes
          </Link>
          .
        </p>
      </Container>
    </section>
  );
}
