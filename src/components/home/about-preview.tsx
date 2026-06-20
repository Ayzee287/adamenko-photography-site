import { Container } from "@/components/layout/container";
import { ImageFigure } from "@/components/ui/image-figure";
import { Parallax } from "@/components/motion/parallax";
import { Reveal } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button-link";
import { home } from "@/content/home";
import type { GalleryImage } from "@/types/gallery";

/**
 * Section 3 — the person. Portrait (gentle drift) beside a first-person bio and
 * values: humanise before the work, so trust is built early. `portrait` is
 * optional; until a real portrait lands it renders a reserved 4:5 frame.
 */
export function AboutPreview({ portrait }: { portrait?: GalleryImage }) {
  const { about } = home;
  // No `label` here: the section eyebrow already reads "La photographe", so the
  // frame shows only orientation·ratio + the art-direction note (v3 QA: no echo).
  const image = portrait ?? {
    alt: about.portraitAlt,
    ratio: "aspect-[4/5]",
    hint: about.portraitHint,
  };

  return (
    <section className="py-10 sm:py-16">
      <Container className="grid items-center gap-10 lg:grid-cols-2 lg:gap-24">
        <Parallax speed={0.05} className="lg:order-1">
          <ImageFigure image={image} sizes="(min-width:1024px) 45vw, 100vw" />
        </Parallax>
        <Reveal variant="rise-left" className="lg:order-2">
          <p className="text-xs uppercase tracking-[0.22em] text-muted">
            {about.eyebrow}
          </p>
          <h2 className="mt-3 font-serif text-3xl text-ink sm:text-4xl">
            {about.title}
          </h2>
          {about.body.map((p) => (
            <p key={p} className="mt-5 max-w-md text-pretty text-muted">
              {p}
            </p>
          ))}
          <ul className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink">
            {about.values.map((v) => (
              <li
                key={v}
                className="before:mr-2 before:text-clay before:content-['—']"
              >
                {v}
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <ButtonLink href={about.cta.href} variant="secondary">
              {about.cta.label}
            </ButtonLink>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
