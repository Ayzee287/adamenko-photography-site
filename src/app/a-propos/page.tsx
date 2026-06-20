import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { ImageFigure } from "@/components/ui/image-figure";
import { copy } from "@/content/site";
import { photographer } from "@/content/photographer";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: copy.about.title,
  path: "/a-propos",
});

// Bio, location, specialties and availability all come from the single identity
// model (content/photographer) — nothing about the person is hardcoded here.
export default function AProposPage() {
  return (
    <Container className="grid gap-10 py-16 sm:py-24 lg:grid-cols-2 lg:gap-24">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-muted">
          {photographer.location.label}
        </p>
        <h1 className="mt-3 font-serif text-4xl text-ink">{copy.about.title}</h1>
        <div className="mt-6 space-y-4 text-muted">
          {photographer.biography.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
        {/* Specialties — reuses the homepage "values" idiom, no new visual language. */}
        <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink">
          {photographer.specialties.map((s) => (
            <li
              key={s}
              className="before:mr-2 before:text-clay before:content-['—']"
            >
              {s}
            </li>
          ))}
        </ul>
        <p className="mt-6 text-sm text-muted">
          {photographer.availability.note}
        </p>
      </div>
      <ImageFigure
        image={{ alt: copy.about.portraitAlt, ratio: "aspect-[4/5]" }}
        sizes="(min-width:1024px) 50vw, 100vw"
      />
    </Container>
  );
}
