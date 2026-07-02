import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { Reveal } from "@/components/motion/reveal";
import { ButtonLink, CtaText } from "@/components/ui/button-link";
import { FinalCta } from "@/components/home/final-cta";
import { buildMetadata } from "@/lib/seo";
import { getDictionary } from "@/lib/dictionary";
import { setRequestLocale } from "@/lib/request-locale";
import { defaultLocale, isLocale, localizedPath, type Locale } from "@/lib/i18n";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : defaultLocale;
  const t = getDictionary(locale);
  return buildMetadata({
    title: t.copy.services.title,
    description: t.copy.services.intro,
    path: "/prestations",
    locale,
  });
}

export default async function PrestationsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : defaultLocale;
  setRequestLocale(locale);
  const t = getDictionary(locale);
  const { copy, services, pricing, faq } = t;

  return (
    <>
      <Container className="pt-14 pb-10 sm:pt-20 sm:pb-16">
        <Reveal>
          <PageHeader
            eyebrow={copy.services.eyebrow}
            title={copy.services.title}
            intro={copy.services.intro}
          />

          <div className="mt-8">
            <ButtonLink href={localizedPath(locale, "/contact")} variant="primary">
              {copy.services.cta}
            </ButtonLink>
          </div>
        </Reveal>

        {/* Service descriptions — de-boxed editorial blocks, each linking to its gallery. */}
        <Reveal variant="rise-slow" className="block">
          <section className="mt-12 sm:mt-16">
            <p className="text-xs uppercase tracking-[0.22em] text-muted">
              {services.eyebrow}
            </p>
            <h2 className="mt-3 font-serif text-3xl text-ink sm:text-4xl">
              {services.title}
            </h2>
            <p className="mt-4 max-w-2xl text-pretty text-muted">{services.intro}</p>

            <div className="mt-10 grid gap-x-12 gap-y-10 sm:mt-16 lg:grid-cols-2 lg:gap-x-24">
              {services.items.map((s) => (
                <article key={s.slug} className="border-t border-line pt-8">
                  <h3 className="font-serif text-2xl text-ink">{s.title}</h3>
                  <p className="mt-2 font-serif text-lg italic text-muted">
                    {s.tagline}
                  </p>
                  <div className="mt-4 space-y-3 text-pretty text-sm text-ink/85">
                    {s.description.map((p, i) => (
                      <p key={i}>{p}</p>
                    ))}
                  </div>
                  <ul className="mt-5 space-y-2 text-sm text-ink">
                    {s.approach.map((a) => (
                      <li key={a} className="flex gap-3">
                        <span aria-hidden className="mt-2 h-px w-3 shrink-0 bg-clay" />
                        {a}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-4 text-sm text-muted">{s.idealFor}</p>
                  <Link
                    href={localizedPath(locale, `/galeries/${s.slug}`)}
                    className="group mt-5 inline-block text-sm text-ink hover:text-clay"
                  >
                    <CtaText>{t.ui.gallery.viewGallery}</CtaText>
                  </Link>
                </article>
              ))}
            </div>
          </section>
        </Reveal>

        {/* Investment — packages + what's included (P1). No figures until set (D012). */}
        <Reveal variant="rise-slow" className="block">
          <section className="mt-12 sm:mt-16">
            <p className="text-xs uppercase tracking-[0.22em] text-muted">
              {pricing.eyebrow}
            </p>
            <h2 className="mt-3 font-serif text-3xl text-ink sm:text-4xl">
              {pricing.title}
            </h2>
            <p className="mt-4 max-w-2xl text-pretty text-muted">{pricing.intro}</p>

            <div className="mt-10 grid gap-x-12 gap-y-10 sm:mt-16 lg:grid-cols-2 lg:gap-x-24">
              {pricing.packages.map((pkg) => (
                <div key={pkg.name} className="border-t border-line pt-8">
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="font-serif text-2xl text-ink">{pkg.name}</h3>
                    <span className="whitespace-nowrap text-sm text-muted">
                      {pkg.priceFrom == null
                        ? pricing.onRequest
                        : `${pricing.fromLabel} ${pkg.priceFrom} €`}
                    </span>
                  </div>
                  <p className="mt-3 max-w-sm text-pretty text-sm text-ink/85">
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
                </div>
              ))}
            </div>
          </section>
        </Reveal>

        {/* Options — add-ons (P1). */}
        <Reveal variant="fade" className="block">
          <section className="mt-12 sm:mt-16">
            <p className="text-xs uppercase tracking-[0.22em] text-muted">
              {pricing.addons.eyebrow}
            </p>
            <h2 className="mt-3 font-serif text-3xl text-ink sm:text-4xl">
              {pricing.addons.title}
            </h2>
            <ul className="mt-10 grid gap-x-8 gap-y-10 sm:mt-16 sm:grid-cols-2 lg:grid-cols-3">
              {pricing.addons.items.map((item) => (
                <li key={item.title}>
                  <span aria-hidden className="block h-px w-8 bg-clay/60" />
                  <h3 className="mt-4 font-serif text-lg text-ink">{item.title}</h3>
                  <p className="mt-2 text-pretty text-sm text-ink/85">{item.body}</p>
                </li>
              ))}
            </ul>
          </section>
        </Reveal>

        {/* FAQ — native <details> (no JS), sourced from the expanded faq model. */}
        <Reveal variant="fade" className="block">
          <section id="faq" className="mt-12 sm:mt-16">
            <h2 className="font-serif text-2xl text-ink">{faq.title}</h2>
            <p className="mt-3 max-w-2xl text-muted">{faq.intro}</p>
            <div className="mt-6 max-w-3xl divide-y divide-line border-y border-line">
              {faq.items.map((item) => (
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
                  <p className="mt-3 max-w-2xl text-sm text-ink/85">{item.a}</p>
                </details>
              ))}
            </div>
          </section>
        </Reveal>
      </Container>

      {/* Closing invitation — reuses the homepage FinalCta band (H1). It reads the
          request locale set above. */}
      <FinalCta />
    </>
  );
}
