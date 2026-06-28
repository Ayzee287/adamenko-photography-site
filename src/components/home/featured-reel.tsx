import { Container } from "@/components/layout/container";
import { SectionHeading } from "./section-heading";
import { Reveal } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button-link";
import { HorizontalGallery } from "@/components/gallery/horizontal-gallery";
import { getDictionary } from "@/lib/dictionary";
import { getRequestLocale, localeHref } from "@/lib/request-locale";

/**
 * Section 5 — the immersive gallery. A horizontal "reel" the visitor explores
 * without leaving the page (swipe / arrows / click → lightbox). Proof of the eye,
 * in sequence. Real frames replace the reserved ones with no layout change.
 */
export function FeaturedReel() {
  const t = getDictionary(getRequestLocale());
  const { gallery } = t.home;

  return (
    <section className="py-10 sm:py-16">
      <Container>
        <Reveal variant="rise-left">
          <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-6">
            <SectionHeading
              eyebrow={gallery.eyebrow}
              title={gallery.title}
              intro={gallery.intro}
              className="max-w-xl"
            />
            <ButtonLink href={localeHref(gallery.cta.href)} variant="secondary">
              {gallery.cta.label}
            </ButtonLink>
          </div>
        </Reveal>
      </Container>
      {/* The reel breaks out of the container — an edge-to-edge exhibition wall. */}
      <div className="mt-10 sm:mt-16">
        <HorizontalGallery images={t.featured} t={t.ui.gallery} />
      </div>
    </section>
  );
}
