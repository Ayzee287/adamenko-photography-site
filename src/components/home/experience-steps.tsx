import { Container } from "@/components/layout/container";
import { SectionHeading } from "./section-heading";
import { Reveal } from "@/components/motion/reveal";
import { home } from "@/content/home";

/** Section 4 — how a session feels, as four calm steps (ease the nerves). */
export function ExperienceSteps() {
  const { experience } = home;

  return (
    <section className="bg-[#f3ece1] py-24 sm:py-32">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow={experience.eyebrow}
            title={experience.title}
            intro={experience.intro}
          />
        </Reveal>
        <ol className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {experience.steps.map((step, i) => (
            <li key={step.n}>
              <Reveal delay={i * 90}>
                <span className="font-serif text-3xl tabular-nums text-clay">
                  {step.n}
                </span>
                <h3 className="mt-3 font-serif text-xl text-ink">{step.title}</h3>
                <p className="mt-2 text-sm text-muted">{step.body}</p>
              </Reveal>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
