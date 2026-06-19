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
    <section className="py-28 sm:py-40">
      <Container>
        <Reveal variant="fade">
          <span aria-hidden className="mb-10 block h-px w-14 bg-clay" />
          <p className="max-w-5xl text-pretty font-serif text-[1.9rem] leading-[1.16] text-ink sm:text-5xl sm:leading-[1.12] lg:text-6xl">
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
