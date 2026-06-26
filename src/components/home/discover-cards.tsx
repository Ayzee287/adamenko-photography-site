import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { SectionHeading } from "./section-heading";
import { Reveal } from "@/components/motion/reveal";
import { blurFor } from "@/lib/image-blur";
import { home } from "@/content/home";

/**
 * "Pour découvrir" — a premium editorial navigation menu (v4).
 *
 * Three equal destinations sit on one shared baseline: a square media area on mobile, a
 * 2:3 card on desktop, with a centred eyebrow + serif title. The WHOLE column is one link.
 *
 * Desktop interaction — the photograph grows. At rest the photo sits slightly inset
 * inside the card (flush to the top, paper margins on the left, right and bottom) and the
 * caption reads in dark ink on that bottom paper margin. On hover or keyboard-focus the
 * PHOTO ITSELF scales up from a fixed top edge — mostly downward, a little sideways —
 * until it consumes the paper and fills the card; as it passes under the caption, the
 * caption inverts ink→paper in place and a soft scrim fades in for legibility. It reads
 * as the photograph absorbing the card.
 *
 * Mechanics (zero CLS, zero text movement): the only things that animate are the media's
 * `transform: scale()` (GPU, origin top-centre, no distortion — object-cover never warps),
 * the caption's `color`, and the scrim's `opacity`. The caption box, its type sizes and
 * its line breaks never change, so the title can neither jump, rewrap, nor ghost. A real
 * photo drops into the same frame untouched. All of it lives in globals.css under
 * `.discover-media` / `.discover-caption` / `.discover-veil`.
 *
 * Touch (no hover) and reduced-motion keep the static inset state: photo + caption,
 * always visible. The growth is gated to pointer + motion-safe + `lg`.
 */
export function DiscoverCards() {
  const d = home.discover;

  return (
    <section className="py-10 sm:py-16">
      <Container>
        <Reveal variant="rise-left">
          <SectionHeading eyebrow={d.eyebrow} title={d.title} />
        </Reveal>

        <ul className="mt-10 grid grid-cols-1 gap-x-8 gap-y-16 sm:mt-16 lg:grid-cols-3 lg:gap-y-0">
          {d.cards.map((card, i) => (
            <li key={card.title}>
              <Reveal delay={i * 110}>
                <Link
                  href={card.href}
                  aria-label={`${card.label} : ${card.title}`}
                  className="discover-item group relative block lg:aspect-[2/3] lg:overflow-hidden"
                >
                  {/* Media — a square in flow on mobile; on lg it fills the card and
                      GROWS (scales from a fixed top edge) on hover/focus, so the
                      photograph itself expands into the paper margins. A real photograph
                      (object-cover, never distorted by the scale) sits in the same frame;
                      the warm radial field remains the fallback if a card has no image. */}
                  <span className="discover-media relative block aspect-square overflow-hidden lg:absolute lg:inset-0 lg:aspect-auto">
                    {card.image?.src ? (
                      <Image
                        src={card.image.src}
                        alt=""
                        fill
                        sizes="(min-width:1024px) 33vw, 100vw"
                        placeholder={blurFor(card.image.src) ? "blur" : undefined}
                        blurDataURL={blurFor(card.image.src)}
                        className="object-cover"
                      />
                    ) : (
                      <span aria-hidden className="frame-reserved absolute inset-0" />
                    )}
                    {/* Resting paper wash — desktop only. Sits INSIDE the media so it
                        scales with the photo and covers only the image (never the paper
                        margins). At rest it mutes the photo toward the paper tone; as the
                        photo grows it lifts to 0 and the colour blooms in. Opacity owned by
                        .discover-wash (base layer) so no Tailwind opacity utility competes. */}
                    <span
                      aria-hidden
                      className="discover-wash pointer-events-none absolute inset-0 hidden bg-paper/15 lg:block"
                    />
                  </span>

                  {/* Soft legibility gradient — desktop hover/focus only. Light and
                      restrained (no heavy/muddy overlay): just enough for the inverted
                      caption to read over the grown photo. Opacity owned by .discover-veil
                      (not a utility) so the hover state isn't beaten by Tailwind. */}
                  <span
                    aria-hidden
                    className="discover-veil pointer-events-none absolute inset-x-0 bottom-0 hidden h-1/2 bg-gradient-to-t from-ink/45 via-ink/8 to-transparent lg:block"
                  />

                  {/* Caption — below the image on mobile; on lg fixed in the bottom paper
                      margin. The growing photo passes UNDER it; only its colour inverts
                      ink→paper. The text box never moves, rewraps, or duplicates. */}
                  <span
                    aria-hidden
                    className="discover-caption mt-5 block text-center lg:absolute lg:inset-x-0 lg:bottom-0 lg:mt-0 lg:flex lg:flex-col lg:items-center lg:px-4 lg:pb-5"
                  >
                    <span className="relative block text-xs uppercase tracking-[0.22em] opacity-70">
                      {card.label}
                    </span>
                    <span className="relative mt-2 block font-serif text-2xl">
                      {card.title}
                    </span>
                  </span>
                </Link>
              </Reveal>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
