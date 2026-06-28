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
    <section className="py-10 sm:py-16">
      <Container>
        <Reveal variant="fade">
          <span aria-hidden className="mb-10 block h-px w-14 bg-clay" />
          {/* The author's line breaks are a desktop-only typographic device: on the
              narrow mobile measure each forced line itself re-wrapped raggedly, so below
              `sm` the copy flows as one `text-pretty` paragraph and the breaks only apply
              from `sm` up (F7). The trailing space keeps the inline (mobile) flow from
              gluing lines together; it's inert on the `sm:block` lines. */}
          <p className="max-w-5xl text-pretty font-serif text-[1.9rem] leading-[1.16] text-ink sm:text-5xl sm:leading-[1.12] lg:text-6xl">
            {home.signature.map((line, i) => (
              <span key={line} className="inline sm:block">
                {line}
                {i < home.signature.length - 1 ? " " : ""}
              </span>
            ))}
          </p>
        </Reveal>
      </Container>
    </section>
  );
}
