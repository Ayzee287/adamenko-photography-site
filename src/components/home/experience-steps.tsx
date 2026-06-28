import { Container } from "@/components/layout/container";
import { SectionHeading } from "./section-heading";
import { Reveal } from "@/components/motion/reveal";
import { getDictionary } from "@/lib/dictionary";
import { getRequestLocale } from "@/lib/request-locale";

/** Section 4 — how a session feels, as four calm steps (ease the nerves). */
export function ExperienceSteps() {
  const { experience } = getDictionary(getRequestLocale()).home;

  return (
    <section className="bg-sand py-10 sm:py-16">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow={experience.eyebrow}
            title={experience.title}
            intro={experience.intro}
          />
        </Reveal>
        <ol className="mt-10 grid gap-x-8 gap-y-10 sm:mt-16 sm:grid-cols-2 lg:grid-cols-4">
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
