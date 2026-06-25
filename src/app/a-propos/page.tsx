import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { ImageFigure } from "@/components/ui/image-figure";
import { Reveal } from "@/components/motion/reveal";
import { copy } from "@/content/site";
import { photographer } from "@/content/photographer";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: copy.about.title,
  path: "/a-propos",
});

// Bio, location, specialties and availability all come from the single identity
// model (content/photographer) — nothing about the person is hardcoded here. Brought
// onto the homepage system (D030): PageHeader, Reveal, FLOW rhythm.
export default function AProposPage() {
  return (
    <Container className="pt-14 pb-10 sm:pt-20 sm:pb-16">
      <Reveal>
        <PageHeader eyebrow={photographer.location.label} title={copy.about.title} />
      </Reveal>

      <div className="mt-10 grid gap-10 sm:mt-16 lg:grid-cols-2 lg:gap-24">
        <Reveal variant="rise-left">
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
        </Reveal>

        <Reveal delay={120}>
          <ImageFigure
            image={
              photographer.portrait ?? {
                alt: copy.about.portraitAlt,
                ratio: "aspect-[4/5]",
              }
            }
            sizes="(min-width:1024px) 50vw, 100vw"
          />
        </Reveal>
      </div>
    </Container>
  );
}
