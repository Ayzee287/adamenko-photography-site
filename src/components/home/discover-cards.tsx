import Link from "next/link";
import { Container } from "@/components/layout/container";
import { SectionHeading } from "./section-heading";
import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";
import { home } from "@/content/home";

/**
 * Cinematic destination hub (D018). Each card: image, small label, large serif
 * title. On desktop hover, a paper panel covering the image's lower third **slides
 * away** and the text **recolours onto the image** (a scrim fades in) — the card
 * becomes one interactive destination. Transform/opacity only, ~500ms. Mobile
 * renders the end-state statically (no hover dependency), tap to navigate.
 * Image layers are warm placeholders that accept a real photo with no layout change.
 * De-carded (D022): borderless, taller, and vertically offset so the three read as
 * an asymmetric trio of windows, not a tidy row of cards.
 */
const OFFSETS = ["", "sm:mt-14", "sm:mt-7"];

export function DiscoverCards() {
  const d = home.discover;

  return (
    <section className="py-28 sm:py-36">
      <Container>
        <Reveal variant="rise-left">
          <SectionHeading eyebrow={d.eyebrow} title={d.title} />
        </Reveal>
        <ul className="mt-14 grid gap-6 sm:grid-cols-3 sm:items-start sm:gap-8">
          {d.cards.map((card, i) => (
            <li key={card.title} className={OFFSETS[i % OFFSETS.length]}>
              <Reveal delay={i * 110}>
                <Link
                  href={card.href}
                  className="group relative block aspect-[3/4] overflow-hidden"
                >
                  {/* Image layer (warm placeholder; swap for a real photo later) */}
                  <span
                    aria-hidden
                    className="absolute inset-0 bg-gradient-to-b from-[#efe7db] to-[#ddd0bf]"
                  />
                  {/* Scrim — on at rest on mobile, on hover on desktop */}
                  <span
                    aria-hidden
                    className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/10 to-transparent opacity-100 transition-opacity duration-500 ease-[var(--ease-arrive)] sm:opacity-0 sm:group-hover:opacity-100"
                  />
                  {/* Sliding paper panel — desktop only, covers the lower third */}
                  <span
                    aria-hidden
                    className="absolute inset-x-0 bottom-0 hidden h-2/5 bg-paper transition-transform duration-500 ease-[var(--ease-arrive)] group-hover:translate-y-full sm:block"
                  />
                  <span className="absolute inset-x-0 bottom-0 p-6">
                    <span
                      className={cn(
                        "block text-xs uppercase tracking-[0.18em] transition-colors duration-500",
                        "text-paper/75 sm:text-muted sm:group-hover:text-paper/75",
                      )}
                    >
                      {card.label}
                    </span>
                    <span
                      className={cn(
                        "mt-1 block font-serif text-2xl transition-colors duration-500",
                        "text-paper sm:text-ink sm:group-hover:text-paper",
                      )}
                    >
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
