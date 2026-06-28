import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { ImageFigure } from "@/components/ui/image-figure";
import { ButtonLink } from "@/components/ui/button-link";
import { Reveal } from "@/components/motion/reveal";
import { copy } from "@/content/site";
import { photographer } from "@/content/photographer";
import { buildMetadata } from "@/lib/seo";

// Name-as-H1 (A4): "À propos" is a navigation label, not a page subject — the
// photographer's name is the page's strongest ranking + branding signal, so it is
// the H1 and "À propos" is demoted to the eyebrow (the nav label is unaffected).
// The page title keeps "À propos" for wayfinding AND carries the name for the SERP.
// Description is person-specific, not the inherited site tagline (A5).
export const metadata: Metadata = buildMetadata({
  title: `${copy.about.title} — ${photographer.name}`,
  description: copy.about.metaDescription,
  path: "/a-propos",
});

// Bio, location, specialties and availability all come from the single identity
// model (content/photographer) — nothing about the person is hardcoded here. Brought
// onto the homepage system (D030): PageHeader, Reveal, FLOW rhythm.
export default function AProposPage() {
  return (
    <Container className="pt-14 pb-10 sm:pt-20 sm:pb-16">
      <Reveal>
        <PageHeader eyebrow={copy.about.title} title={photographer.name} />
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
          {/* One quiet forward step at peak trust — secondary, not a loud pill, to
              stay on the page's calm register (A1). */}
          <ButtonLink href="/contact" variant="secondary" className="mt-8">
            {copy.about.cta}
          </ButtonLink>
        </Reveal>

        <Reveal delay={120} className="order-1 lg:order-2">
          <ImageFigure
            image={
              photographer.portrait ?? {
                alt: copy.about.portraitAlt,
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
