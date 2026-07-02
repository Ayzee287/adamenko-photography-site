import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { SectionHeading } from "./section-heading";
import { Reveal } from "@/components/motion/reveal";
import { blurFor } from "@/lib/image-blur";
import { getDictionary } from "@/lib/dictionary";
import { getRequestLocale, localeHref } from "@/lib/request-locale";

/**
 * "Pour découvrir" — a premium editorial navigation menu (v6: a print emerging).
 *
 * Three equal destinations sit on one shared baseline: a square media area on mobile, a
 * 2:3 card on desktop, with a centred eyebrow + serif title. The WHOLE column is one link.
 *
 * Desktop interaction — the photograph WAKES UP. Each card is two physical layers: a warm
 * paper field, and a photographic print resting on it. At rest the print touches only the
 * top edge, with real paper margins (sides, and a generous bottom where the caption reads
 * on paper). On hover/keyboard-focus the print's FRAME opens — not its content: we animate
 * `clip-path`, never `transform`, so the image is perfectly still (no zoom, no resample,
 * no "scale" sensation). The clip opens non-symmetrically — top locked, sides a little,
 * BOTTOM a lot — so the print grows DOWNWARD into the paper until it reaches and covers the
 * caption. The paper disappears because the photograph occupies it, not because a layer
 * slides over it.
 *
 * It plays as a story, not a flip: the print opens AND warms (the resting wash lifts)
 * together; then, ~0.5s in, once the opening edge has travelled over the caption, the
 * caption inverts ink→paper on a delay — a consequence, not a co-animation; a feathered
 * bottom vignette appears only enough for AA legibility (no dark panel).
 *
 * Mechanics (zero CLS, zero text movement): only `clip-path` (the frame), `opacity` (wash
 * + vignette) and `color` (caption) animate — no transform ever touches the type, so the
 * title can neither jump, rewrap, nor ghost. A real photo drops into the same frame
 * untouched. All of it lives in globals.css under `.discover-media` / `.discover-wash` /
 * `.discover-caption` / `.discover-veil`.
 *
 * Touch (no hover) and reduced-motion keep the calm inset print-on-paper state. The reveal
 * is gated to pointer/focus + motion-safe + `lg`.
 */
export function DiscoverCards() {
  const d = getDictionary(getRequestLocale()).home.discover;

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
                  href={localeHref(card.href)}
                  aria-label={`${card.label} : ${card.title}`}
                  className="discover-item group relative block lg:aspect-[2/3] lg:overflow-hidden"
                >
                  {/* Media — a square in flow on mobile; on lg it fills the card,
                      clipped to the inset print at rest (.discover-media). On
                      hover/focus the CLIP opens (top locked, bottom most) so the
                      print grows into the paper margins — the image itself never
                      transforms (see the component header). A real photograph
                      (object-cover) sits in the same frame; the warm radial field
                      remains the fallback if a card has no image. */}
                  <span className="discover-media relative block aspect-square overflow-hidden lg:absolute lg:inset-0 lg:aspect-auto">
                    {card.image?.src ? (
                      <Image
                        src={card.image.src}
                        alt=""
                        fill
                        quality={82}
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

                  {/* Feathered legibility vignette — desktop hover/focus only. Concentrated
                      at the very bottom edge and fading fast to nothing, so it reads as a
                      natural exposure falloff, never a dark panel sliding in. Just enough
                      for the inverted caption to clear AA. Opacity owned by .discover-veil
                      (not a utility) so the delayed wake state isn't beaten by Tailwind. */}
                  <span
                    aria-hidden
                    className="discover-veil pointer-events-none absolute inset-x-0 bottom-0 hidden h-2/5 bg-gradient-to-t from-ink/40 via-ink/5 to-transparent lg:block"
                  />

                  {/* Caption — below the image on mobile; on lg fixed in the bottom paper
                      margin. The growing photo passes UNDER it; only its colour inverts
                      ink→paper. The text box never moves, rewraps, or duplicates. */}
                  <span
                    aria-hidden
                    className="discover-caption mt-5 block text-center lg:absolute lg:inset-x-0 lg:bottom-0 lg:mt-0 lg:flex lg:flex-col lg:items-center lg:px-4 lg:pb-5"
                  >
                    <span className="relative block text-xs uppercase tracking-eyebrow opacity-70">
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
