import { Container } from "@/components/layout/container";
import { ButtonLink } from "@/components/ui/button-link";
import { HeroMedia } from "./hero-media";
import { home } from "@/content/home";
import type { GalleryImage } from "@/types/gallery";

/**
 * Section 1 — the immersive hero. Full-bleed media (warm dark stand-in until a
 * real frame lands), a warm serif headline that arrives on load, and two CTAs.
 * Communicates connection and warmth, not equipment. The dark band inverts chrome
 * details (.dark-surface). `image` is optional so the composition is real now and
 * a real hero photograph drops in with zero layout change.
 */
export function HeroImmersive({ image }: { image?: GalleryImage }) {
  const { hero } = home;

  return (
    <section className="dark-surface relative flex min-h-[100svh] flex-col justify-center overflow-hidden bg-ink text-paper">
      <HeroMedia image={image} />

      {/* Cinematic scrim — anchored to the text (left) and weighted at top/bottom
          so the headline stays legible over any real photo, and the header + scroll
          cue read against it. Two soft layers, not a flat veil. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-r from-ink/80 via-ink/40 to-ink/5"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-ink/65 via-transparent to-ink/35"
      />

      <Container className="relative py-28">
        <p className="motion-rise text-xs uppercase tracking-[0.28em] text-paper/70">
          {hero.kicker}
        </p>
        <h1
          className="motion-rise mt-5 max-w-3xl text-balance font-serif text-4xl leading-[1.08] text-paper sm:text-5xl lg:text-6xl"
          style={{ animationDelay: "90ms" }}
        >
          {hero.title}
        </h1>
        <p
          className="motion-rise mt-6 max-w-xl text-base text-paper/80 sm:text-lg"
          style={{ animationDelay: "180ms" }}
        >
          {hero.subtitle}
        </p>
        <div
          className="motion-rise mt-10 flex flex-wrap items-center gap-6"
          style={{ animationDelay: "270ms" }}
        >
          <ButtonLink href={hero.primary.href} variant="primary" onDark>
            {hero.primary.label}
          </ButtonLink>
          <ButtonLink href={hero.secondary.href} variant="secondary" onDark>
            {hero.secondary.label}
          </ButtonLink>
        </div>
      </Container>

      {/* Scroll cue */}
      <div className="absolute inset-x-0 bottom-8 flex justify-center">
        <span className="hero-cue flex flex-col items-center gap-2 text-[0.65rem] uppercase tracking-[0.22em] text-paper/60">
          {hero.scrollCue}
          <span aria-hidden className="text-base leading-none">
            ↓
          </span>
        </span>
      </div>
    </section>
  );
}
