import { Container } from "@/components/layout/container";
import { Reveal } from "@/components/motion/reveal";
import { home } from "@/content/home";

/**
 * Section 2 — the manifesto (D021). A print pull-quote: large editorial serif,
 * broken across lines, left-anchored, with generous air above and below. No band,
 * no border — whitespace frames it.
 */
export function SignatureLine() {
  return (
    <section className="py-32 sm:py-44">
      <Container>
        <Reveal variant="fade">
          <span aria-hidden className="mb-8 block h-px w-12 bg-clay" />
          <p className="max-w-4xl text-pretty font-serif text-3xl leading-[1.18] text-ink sm:text-4xl lg:text-5xl">
            {home.signature.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </p>
        </Reveal>
      </Container>
    </section>
  );
}
