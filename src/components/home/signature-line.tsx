import { Container } from "@/components/layout/container";
import { Reveal } from "@/components/motion/reveal";
import { home } from "@/content/home";

/** Section 2 — one warm line that names the promise and bridges hero to story. */
export function SignatureLine() {
  return (
    <section className="border-b border-line">
      <Container className="py-20 sm:py-28">
        <Reveal variant="fade">
          <p className="mx-auto max-w-3xl text-balance text-center font-serif text-2xl leading-snug text-ink sm:text-3xl">
            {home.signature}
          </p>
        </Reveal>
      </Container>
    </section>
  );
}
