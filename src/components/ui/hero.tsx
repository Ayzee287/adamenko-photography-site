import Link from "next/link";
import { Container } from "@/components/layout/container";
import { ImageFigure } from "@/components/ui/image-figure";
import { copy } from "@/content/site";
import type { GalleryImage } from "@/types/gallery";

/**
 * Home hero — calm and editorial, not cinematic. A warm headline beside a large
 * lead image. Pass a real `image` once chosen; until then it renders a reserved
 * frame so the composition is real. `priority` marks it as the LCP candidate.
 */
export function Hero({ image }: { image?: GalleryImage }) {
  const lead: GalleryImage = image ?? {
    alt: "Image d'accueil — Adamenko Photography",
    ratio: "aspect-[4/5]",
  };

  return (
    <section className="border-b border-line">
      <Container className="grid items-center gap-10 py-16 lg:grid-cols-2 lg:py-24">
        <div className="motion-rise">
          <p className="text-xs uppercase tracking-[0.22em] text-muted">
            {copy.home.heroKicker}
          </p>
          <h1 className="mt-4 font-serif text-4xl leading-[1.1] text-ink sm:text-5xl">
            {copy.home.heroTitle}
          </h1>
          <p className="mt-5 max-w-md text-base text-muted">
            {copy.home.heroSubtitle}
          </p>
          <Link
            href="/galeries"
            className="mt-8 inline-block border-b border-clay pb-1 text-sm text-ink hover:text-clay"
          >
            {copy.home.heroCta} →
          </Link>
        </div>
        <ImageFigure
          image={lead}
          priority
          sizes="(min-width:1024px) 50vw, 100vw"
        />
      </Container>
    </section>
  );
}
