import { Container } from "@/components/layout/container";
import { SectionHeading } from "./section-heading";
import { Reveal } from "@/components/motion/reveal";
import { home } from "@/content/home";

/** Section 8 — add-ons. The ways a session flexes, as a quiet hairline grid. */
export function AddOns() {
  const a = home.addons;

  return (
    <section className="border-t border-line bg-ink/[0.02] py-24 sm:py-32">
      <Container>
        <Reveal>
          <SectionHeading eyebrow={a.eyebrow} title={a.title} />
        </Reveal>
        <ul className="mt-12 grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {a.items.map((item, i) => (
            <li key={item.title} className="bg-paper p-7">
              <Reveal delay={(i % 3) * 70}>
                <h3 className="font-serif text-lg text-ink">{item.title}</h3>
                <p className="mt-2 text-sm text-muted">{item.body}</p>
              </Reveal>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
