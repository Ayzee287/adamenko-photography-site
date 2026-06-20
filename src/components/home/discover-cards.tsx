import Link from "next/link";
import { Container } from "@/components/layout/container";
import { SectionHeading } from "./section-heading";
import { Reveal } from "@/components/motion/reveal";
import { home } from "@/content/home";

/**
 * "Pour découvrir" — a premium editorial navigation menu (v4 redesign).
 *
 * Three equal destinations sit on one shared baseline: a square media area with a
 * centred eyebrow + serif title beneath it. The WHOLE column is one link.
 *
 * On desktop, hovering (or keyboard-focusing) an item "opens" the destination: the
 * media expands downward to consume the caption area and the title + label reappear in
 * white over the image — a single, slow, intentional move. There is **no card, border,
 * shadow, or decorative gradient**; the only gradient is a functional legibility scrim
 * (the same device the hero uses) so the white caption stays readable over a light
 * placeholder or a real photograph.
 *
 * Mechanics (zero CLS, transforms only, no reflow): each item is a fixed-footprint 2:3
 * frame on `lg`. The media fills the whole frame; a paper "cover" panel hides its
 * bottom third and carries the default dark caption, so by default you see a square +
 * caption below. On hover/focus the cover slides down out of the (clipped) frame —
 * revealing the full portrait — while the scrim and white caption fade in. The footprint
 * never changes, so nothing reflows and a real photo drops into the same frame untouched.
 *
 * Touch (no hover) and reduced-motion keep the static default: square + caption, always
 * visible. The expansion is gated to pointer + motion-safe + `lg` in globals.css.
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
                  {/* Media — a square in flow on mobile; on lg it fills the portrait
                      frame so the cover can slide off it and reveal the rest. The warm
                      radial field is the reserved placeholder; a real export later drops
                      straight in (object-cover) with no layout change. */}
                  <span
                    aria-hidden
                    className="block aspect-square bg-[radial-gradient(120%_120%_at_28%_18%,#f6efe4,#e3d6c4)] lg:absolute lg:inset-0 lg:aspect-auto"
                  />

                  {/* Functional legibility scrim — desktop hover/focus only. Opacity is
                      owned by .discover-reveal (not a utility) so the hover state isn't
                      overridden by Tailwind's utilities layer. */}
                  <span
                    aria-hidden
                    className="discover-veil discover-reveal pointer-events-none absolute inset-0 hidden bg-gradient-to-t from-ink/85 via-ink/35 to-transparent lg:block"
                  />

                  {/* White caption that fades in over the expanded image (lg only). */}
                  <span
                    aria-hidden
                    className="discover-veil discover-reveal pointer-events-none absolute inset-x-0 bottom-0 hidden h-1/3 flex-col items-center justify-center px-5 text-center text-paper lg:flex"
                  >
                    <span className="text-xs uppercase tracking-[0.22em] text-paper/70">
                      {card.label}
                    </span>
                    <span className="mt-2 font-serif text-2xl lg:text-3xl">
                      {card.title}
                    </span>
                  </span>

                  {/* Default caption — below the image on mobile; on lg it is the paper
                      cover panel that slides away on hover/focus. */}
                  <span
                    aria-hidden
                    className="discover-cover mt-5 block text-center lg:absolute lg:inset-x-0 lg:bottom-0 lg:mt-0 lg:flex lg:h-1/3 lg:flex-col lg:items-center lg:justify-center lg:bg-paper lg:px-5"
                  >
                    <span className="block text-xs uppercase tracking-[0.22em] text-muted">
                      {card.label}
                    </span>
                    <span className="mt-2 block font-serif text-2xl text-ink transition-colors duration-300 group-hover:text-clay lg:text-3xl">
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
