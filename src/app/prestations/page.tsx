import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { copy } from "@/content/site";
import { home } from "@/content/home";
import { pricing } from "@/content/pricing";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: copy.services.title,
  description: copy.services.intro,
  path: "/prestations",
});

export default function PrestationsPage() {
  return (
    <Container className="py-16">
      <h1 className="font-serif text-4xl text-ink">{copy.services.title}</h1>
      <p className="mt-4 max-w-xl text-muted">{copy.services.intro}</p>

      {/* Inquiry-led; transparent range communicated on request until set (D012). */}
      <p className="mt-8 text-sm text-ink">{copy.services.note}</p>
      <Link
        href="/contact"
        className="mt-6 inline-block border border-ink px-6 py-2 text-sm text-ink hover:border-clay hover:text-clay"
      >
        {copy.services.cta}
      </Link>

      {/* FAQ — moved here from the homepage so pricing stays uninterrupted (D018). */}
      <section id="faq" className="mt-20 scroll-mt-24">
        <h2 className="font-serif text-2xl text-ink">{home.pricing.faqTitle}</h2>
        <div className="mt-6 max-w-3xl divide-y divide-line border-y border-line">
          {pricing.faq.map((item) => (
            <details key={item.q} className="group py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-ink [&::-webkit-details-marker]:hidden">
                <span>{item.q}</span>
                <span
                  aria-hidden
                  className="text-xl leading-none text-clay group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="mt-3 max-w-2xl text-sm text-muted">{item.a}</p>
            </details>
          ))}
        </div>
      </section>
    </Container>
  );
}
