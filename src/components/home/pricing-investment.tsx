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
    <section className="border-t border-line py-24 sm:py-32">
      <Container>
        <Reveal>
          <SectionHeading eyebrow={p.eyebrow} title={p.title} intro={p.intro} />
        </Reveal>

        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          {pricing.packages.map((pkg, i) => (
            <Reveal key={pkg.name} delay={i * 90}>
              <article className="flex h-full flex-col border border-line p-8">
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="font-serif text-2xl text-ink">{pkg.name}</h3>
                  <span className="whitespace-nowrap text-sm text-muted">
                    {pkg.priceFrom == null
                      ? p.onRequest
                      : `${p.fromLabel} ${pkg.priceFrom} €`}
                  </span>
                </div>
                <p className="mt-2 text-pretty text-sm text-muted">
                  {pkg.summary}
                </p>
                <ul className="mt-6 flex-1 space-y-2.5 text-sm text-ink">
                  {pkg.includes.map((inc) => (
                    <li key={inc} className="flex gap-3">
                      <span aria-hidden className="mt-2 h-px w-3 shrink-0 bg-clay" />
                      {inc}
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  <ButtonLink href={p.cta.href} variant="primary">
                    {p.cta.label}
                  </ButtonLink>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <p className="mt-8 text-sm text-muted">
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
