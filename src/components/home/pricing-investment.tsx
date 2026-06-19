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
                <p className="mt-2 text-sm text-muted">{pkg.summary}</p>
                <ul className="mt-6 flex-1 space-y-2 text-sm text-ink">
                  {pkg.includes.map((inc) => (
                    <li key={inc} className="flex gap-2">
                      <span aria-hidden className="text-clay">
                        ·
                      </span>
                      {inc}
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  <ButtonLink href={p.cta.href} variant="solid">
                    {p.cta.label}
                  </ButtonLink>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <div className="mt-16">
          <h3 className="font-serif text-xl text-ink">{p.faqTitle}</h3>
          <div className="mt-6 max-w-3xl divide-y divide-line border-y border-line">
            {pricing.faq.map((item) => (
              <details key={item.q} className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-ink [&::-webkit-details-marker]:hidden">
                  <span>{item.q}</span>
                  <span aria-hidden className="text-xl leading-none text-clay group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 max-w-2xl text-sm text-muted">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
