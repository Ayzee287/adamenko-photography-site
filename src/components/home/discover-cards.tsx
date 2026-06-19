import Image from "next/image";
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
// Different widths + heights + vertical offsets → a scattered, curated trio, not a
// three-column layout (D024). Col-spans 5/4/3 sum to 12.
const LAYOUT = [
  { col: "sm:col-span-5", mt: "", aspect: "aspect-[4/5]" },
  { col: "sm:col-span-4", mt: "sm:mt-28", aspect: "aspect-[2/3]" },
  { col: "sm:col-span-3", mt: "sm:mt-12", aspect: "aspect-[3/5]" },
];

export function DiscoverCards() {
  const d = home.discover;

  return (
    <section className="py-24 sm:py-32">
      <Container>
        <Reveal variant="rise-left">
          <SectionHeading eyebrow={d.eyebrow} title={d.title} />
        </Reveal>
        <ul className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-12 sm:items-start sm:gap-8">
          {d.cards.map((card, i) => {
            const l = LAYOUT[i % LAYOUT.length];
            return (
            <li key={card.title} className={cn(l.col, l.mt)}>
              <Reveal delay={i * 110}>
                <Link
                  href={card.href}
                  className={cn("group relative block overflow-hidden", l.aspect)}
                >
                  {/* Image (temp demo, D023; swap for a real photo — no layout change) */}
                  <Image
                    src={card.img}
                    alt=""
                    fill
                    sizes="(min-width:640px) 30vw, 100vw"
                    className="object-cover"
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
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
