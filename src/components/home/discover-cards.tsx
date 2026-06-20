import Link from "next/link";
import { Container } from "@/components/layout/container";
import { ImageFigure } from "@/components/ui/image-figure";
import { SectionHeading } from "./section-heading";
import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";
import { home } from "@/content/home";

/**
 * A quiet destination trio (D018), rebalanced to be placeholder-first (v2). Each
 * destination is a *reserved frame* with its caption set BELOW it — de-carded
 * (no border, no scrim, no sliding panel that only works once a photo exists). The
 * three sit at different widths, heights, and vertical offsets, so they read as a
 * scattered, curated set rather than a tidy row. The frame carries the directed
 * placeholder now and a real photograph later, with no layout change.
 */
// Col-spans 5/4/3 sum to 12; varied ratios + offsets → a curated trio, not a grid.
const LAYOUT = [
  { col: "sm:col-span-5", mt: "", ratio: "aspect-[4/5]" },
  { col: "sm:col-span-4", mt: "sm:mt-24", ratio: "aspect-[2/3]" },
  { col: "sm:col-span-3", mt: "sm:mt-12", ratio: "aspect-[3/4]" },
];

export function DiscoverCards() {
  const d = home.discover;

  return (
    <section className="py-18 sm:py-32">
      <Container>
        <Reveal variant="rise-left">
          <SectionHeading eyebrow={d.eyebrow} title={d.title} />
        </Reveal>
        <ul className="mt-12 grid grid-cols-1 gap-x-8 gap-y-12 sm:mt-18 sm:grid-cols-12 sm:items-start">
          {d.cards.map((card, i) => {
            const l = LAYOUT[i % LAYOUT.length];
            return (
              <li key={card.title} className={cn(l.col, l.mt)}>
                <Reveal delay={i * 110}>
                  <Link href={card.href} className="group block">
                    <ImageFigure
                      image={{ alt: "", ratio: l.ratio, hint: card.hint }}
                      interactive
                      sizes="(min-width:640px) 32vw, 100vw"
                    />
                    <div className="mt-4 flex items-baseline justify-between gap-4">
                      <div>
                        <span className="block text-[0.7rem] uppercase tracking-[0.2em] text-muted">
                          {card.label}
                        </span>
                        <span className="mt-1 block font-serif text-xl text-ink transition-colors duration-300 group-hover:text-clay">
                          {card.title}
                        </span>
                      </div>
                      <span
                        aria-hidden
                        className="text-ink/40 transition-transform duration-300 ease-[var(--ease-arrive)] group-hover:translate-x-1"
                      >
                        →
                      </span>
                    </div>
                  </Link>
                </Reveal>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
