import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { ImageFigure } from "@/components/ui/image-figure";
import { CtaText } from "@/components/ui/button-link";
import { Reveal } from "@/components/motion/reveal";
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
    title: t.copy.galleries.title,
    description: t.copy.galleries.intro,
    path: "/galeries",
    locale,
  });
}

// De-boxed editorial contact sheet (D030): each genre is its cover frame, borderless,
// the photograph as the object — no bordered text cards (D021). Gallery data + copy are
// resolved for the request locale; links are locale-prefixed.
export default async function GaleriesPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : defaultLocale;
  setRequestLocale(locale);
  const t = getDictionary(locale);
  const c = t.copy.galleries;

  return (
    <Container className="pt-14 pb-10 sm:pt-20 sm:pb-16">
      <Reveal>
        <PageHeader eyebrow={c.eyebrow} title={c.title} intro={c.intro} />
      </Reveal>

      <ul className="mt-10 grid gap-x-8 gap-y-12 sm:mt-16 sm:grid-cols-2">
        {t.galleries.map((g, i) => {
          const cover = g.cover ?? g.images[0];
          return (
            <li key={g.slug}>
              <Reveal delay={(i % 2) * 90}>
                <Link
                  href={localizedPath(locale, `/galeries/${g.slug}`)}
                  className="group block"
                >
                  <ImageFigure
                    image={cover}
                    interactive
                    priority={i === 0}
                    sizes="(min-width:640px) 50vw, 100vw"
                  />
                  <h2 className="mt-5 font-serif text-2xl text-ink transition-colors duration-300 ease-[var(--ease-settle)] group-hover:text-clay">
                    {g.title}
                  </h2>
                  <p className="mt-2 max-w-md text-pretty text-sm text-muted">
                    {g.intro}
                  </p>
                  <CtaText className="mt-3 text-sm text-ink group-hover:text-clay">
                    {c.view}
                  </CtaText>
                </Link>
              </Reveal>
            </li>
          );
        })}
      </ul>
    </Container>
  );
}
