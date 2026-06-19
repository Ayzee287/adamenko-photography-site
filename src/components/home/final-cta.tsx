import { Container } from "@/components/layout/container";
import { ButtonLink } from "@/components/ui/button-link";
import { Reveal } from "@/components/motion/reveal";
import { home } from "@/content/home";
import { site } from "@/content/site";

/**
 * Section 10 — the close. A warm dark band (inverts chrome via .dark-surface):
 * location, availability, one low-pressure inquiry CTA, and Instagram. The last
 * thing a visitor feels should be "I want to work with her — and it's easy to ask".
 */
export function FinalCta() {
  const f = home.finalCta;

  return (
    <section className="dark-surface bg-ink text-paper">
      <Container className="py-32 text-center sm:py-44">
        <Reveal variant="rise-slow">
          <p className="text-xs uppercase tracking-[0.28em] text-paper/60">
            {f.eyebrow}
          </p>
          <h2 className="mx-auto mt-5 max-w-2xl text-balance font-serif text-4xl leading-tight text-paper sm:text-5xl">
            {f.title}
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-pretty text-paper/80">
            {f.body}
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6">
            <ButtonLink href={f.cta.href} variant="primary" onDark>
              {f.cta.label}
            </ButtonLink>
            <ButtonLink
              href={site.social.instagram}
              variant="secondary"
              onDark
            >
              {f.instagramLabel}
            </ButtonLink>
          </div>
          <p className="mt-12 text-sm text-paper/60">
            {f.location} — {f.availability}
          </p>
        </Reveal>
      </Container>
    </section>
  );
}
