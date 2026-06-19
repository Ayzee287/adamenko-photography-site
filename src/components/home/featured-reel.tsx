import { Container } from "@/components/layout/container";
import { SectionHeading } from "./section-heading";
import { Reveal } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button-link";
import { HorizontalGallery } from "@/components/gallery/horizontal-gallery";
import { home } from "@/content/home";
import { featured } from "@/content/galleries";

/**
 * Section 5 — the immersive gallery. A horizontal "reel" the visitor explores
 * without leaving the page (swipe / arrows / click → lightbox). Proof of the eye,
 * in sequence. Real frames replace the reserved ones with no layout change.
 */
export function FeaturedReel() {
  const { gallery } = home;

  return (
    <section className="py-24 sm:py-32">
      <Container>
        <Reveal variant="rise-left">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading
              eyebrow={gallery.eyebrow}
              title={gallery.title}
              intro={gallery.intro}
              className="max-w-xl"
            />
            <ButtonLink href={gallery.cta.href} variant="secondary">
              {gallery.cta.label}
            </ButtonLink>
          </div>
        </Reveal>
      </Container>
      {/* The reel breaks out of the container — an edge-to-edge exhibition wall. */}
      <div className="mt-12 sm:mt-16">
        <HorizontalGallery images={featured} />
      </div>
    </section>
  );
}
