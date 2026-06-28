import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { ImageFigure } from "@/components/ui/image-figure";
import { ButtonLink } from "@/components/ui/button-link";
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
  // Name-as-H1 (A4): the photographer's name is the page subject; "À propos"/"About"
  // is demoted to the eyebrow. The <title> keeps the label AND carries the name (A4);
  // the description is person-specific, not the inherited tagline (A5).
  return buildMetadata({
    title: `${t.copy.about.title} — ${t.photographer.name}`,
    description: t.copy.about.metaDescription,
    path: "/a-propos",
    locale,
  });
}

export default async function AProposPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : defaultLocale;
  setRequestLocale(locale);
  const t = getDictionary(locale);
  const { photographer } = t;

  return (
    <Container className="pt-14 pb-10 sm:pt-20 sm:pb-16">
      <Reveal>
        <PageHeader eyebrow={t.copy.about.title} title={photographer.name} />
      </Reveal>

      <div className="mt-10 grid gap-10 sm:mt-16 lg:grid-cols-2 lg:gap-24">
        <Reveal variant="rise-left" className="order-2 lg:order-1">
          <div className="space-y-4 text-pretty text-muted">
            {photographer.biography.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
          {/* Specialties — reuses the homepage "values" idiom, no new visual language. */}
          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink">
            {photographer.specialties.map((s) => (
              <li
                key={s}
                className="before:mr-2 before:text-clay before:content-['·']"
              >
                {s}
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm text-muted">{photographer.availability.note}</p>
          {/* One quiet forward step at peak trust — secondary, not a loud pill (A1). */}
          <ButtonLink
            href={localizedPath(locale, "/contact")}
            variant="secondary"
            className="mt-8"
          >
            {t.copy.about.cta}
          </ButtonLink>
        </Reveal>

        <Reveal delay={120} className="order-1 lg:order-2">
          <ImageFigure
            image={
              photographer.portrait ?? {
                alt: t.copy.about.portraitAlt,
                ratio: "aspect-[4/5]",
              }
            }
            priority
            sizes="(min-width:1024px) 50vw, 100vw"
          />
        </Reveal>
      </div>
    </Container>
  );
}
