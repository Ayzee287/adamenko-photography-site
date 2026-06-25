import { Container } from "@/components/layout/container";
import { SectionHeading } from "./section-heading";
import { Reveal } from "@/components/motion/reveal";
import { home } from "@/content/home";

/**
 * Section 8 — add-ons. De-boxed (D021): an open list, each item set off only by a
 * short clay rule and whitespace — no hairline grid, no cards. Warm-tinted band for
 * the page's dense/practical rhythm beat.
 */
export function AddOns() {
  const a = home.addons;

  return (
    <section className="bg-sand py-10 sm:py-16">
      <Container>
        <Reveal variant="fade">
          <SectionHeading eyebrow={a.eyebrow} title={a.title} />
        </Reveal>
        <ul className="mt-10 grid gap-x-8 gap-y-10 sm:mt-16 sm:grid-cols-2 lg:grid-cols-3">
          {a.items.map((item, i) => (
            <li key={item.title}>
              <Reveal delay={(i % 3) * 70}>
                <span aria-hidden className="block h-px w-8 bg-clay/60" />
                <h3 className="mt-4 font-serif text-lg text-ink">{item.title}</h3>
                <p className="mt-2 text-pretty text-sm text-muted">{item.body}</p>
              </Reveal>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
