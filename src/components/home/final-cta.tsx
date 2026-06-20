import { Container } from "@/components/layout/container";
import { ButtonLink } from "@/components/ui/button-link";
import { Reveal } from "@/components/motion/reveal";
import { home } from "@/content/home";
import { site } from "@/content/site";

/**
 * Section 10 — the close. A warm dark band (inverts chrome via .dark-surface),
 * reworked to be **editorial and asymmetric** (v3): the invitation is a large,
 * left-anchored title block; the practical meta (where she's based, availability)
 * sits in a quiet column offset to the right, aligned to the same baseline. No
 * perfect centering. On mobile it stacks, left-aligned. The last thing a visitor
 * feels should be "I want to work with her — and it's easy to ask".
 */
export function FinalCta() {
  const f = home.finalCta;

  return (
    <section className="dark-surface bg-ink text-paper">
      <Container className="py-18 sm:py-32">
        <Reveal variant="rise-slow">
          <div className="grid gap-12 lg:grid-cols-[7fr_4fr] lg:items-end lg:gap-24">
            {/* Invitation — left, dominant. */}
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-paper/55">
                {f.eyebrow}
              </p>
              <h2 className="mt-4 max-w-xl text-balance font-serif text-4xl leading-[1.03] text-paper sm:text-5xl lg:text-6xl">
                {f.title}
              </h2>
              <p className="mt-5 max-w-md text-pretty text-paper/75">{f.body}</p>
              <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
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
            </div>

            {/* Practical meta — offset right, baseline-aligned. */}
            <dl className="lg:text-right">
              <dt className="text-[0.65rem] uppercase tracking-[0.28em] text-paper/40">
                {f.locationLabel}
              </dt>
              <dd className="mt-1 font-serif text-lg text-paper/85">
                {f.location}
              </dd>
              <dt className="mt-7 text-[0.65rem] uppercase tracking-[0.28em] text-paper/40">
                {f.availabilityLabel}
              </dt>
              <dd className="mt-1 max-w-[22ch] text-pretty text-paper/75 lg:ml-auto">
                {f.availability}
              </dd>
            </dl>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
