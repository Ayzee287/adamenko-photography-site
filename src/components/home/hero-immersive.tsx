import { Container } from "@/components/layout/container";
import { HeroMedia } from "./hero-media";
import { home } from "@/content/home";
import type { GalleryImage } from "@/types/gallery";

/**
 * Section 1 — the hero, redirected to be image-first (D021). The photograph IS the
 * screen; text is a small, low-left caption with deep negative space above — no
 * CTAs (curiosity, not conversion), just an emotional headline, one supporting
 * line, and a quiet scroll cue. The dark band inverts chrome (.dark-surface).
 * `image` optional — a directed dark stand-in until a real opening frame lands.
 */
export function HeroImmersive({ image }: { image?: GalleryImage }) {
  const { hero } = home;

  return (
    <section className="dark-surface relative flex min-h-[100svh] flex-col overflow-hidden bg-ink text-paper">
      <HeroMedia image={image} hint={hero.imageHint} />

      {/* Cinematic scrim — weighted at the bottom-left where the caption lives. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/15 to-ink/25"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-r from-ink/55 via-transparent to-transparent"
      />

      {/* Caption anchored low-left — one emotional line, nothing explained.
          The photograph carries the screen; the words just name the feeling. */}
      <Container className="relative mt-auto pb-16 sm:pb-20">
        <div className="max-w-2xl">
          <p className="motion-rise text-[0.65rem] uppercase tracking-[0.36em] text-paper/45">
            {hero.kicker}
          </p>
          <h1
            className="motion-rise mt-4 text-balance font-serif text-[2.65rem] leading-[1.03] text-paper sm:text-6xl lg:text-7xl"
            style={{ animationDelay: "120ms" }}
          >
            {hero.title}
          </h1>
        </div>
      </Container>

      {/* Scroll cue */}
      <div className="pointer-events-none absolute inset-x-0 bottom-7 flex justify-center">
        <span className="hero-cue flex flex-col items-center gap-1.5 text-[0.6rem] uppercase tracking-[0.28em] text-paper/55">
          {hero.scrollCue}
          <span aria-hidden className="text-sm leading-none">
            ↓
          </span>
        </span>
      </div>
    </section>
  );
}
