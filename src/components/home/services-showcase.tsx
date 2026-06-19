import Link from "next/link";
import { Container } from "@/components/layout/container";
import { ImageFigure } from "@/components/ui/image-figure";
import { Reveal } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button-link";
import { cn } from "@/lib/utils";
import { home } from "@/content/home";

// A magazine feature, not a service grid (D021). Each emotion is a large editorial
// spread — alternating side, varied span/scale/offset, deep negative space. Text
// lives beside the image (never colliding with it). Motion varies per spread.
const SPREADS = [
  { img: "lg:col-span-7", txt: "lg:col-span-5", right: false, ratio: "aspect-[4/5]", reveal: "rise" as const, offset: "" },
  { img: "lg:col-span-6", txt: "lg:col-span-6", right: true, ratio: "aspect-[3/4]", reveal: "rise-left" as const, offset: "lg:pt-16" },
  { img: "lg:col-span-8", txt: "lg:col-span-4", right: false, ratio: "aspect-[3/2]", reveal: "rise" as const, offset: "lg:pt-24" },
  { img: "lg:col-span-7", txt: "lg:col-span-5", right: true, ratio: "aspect-[5/6]", reveal: "rise-slow" as const, offset: "" },
];

export function ServicesShowcase() {
  const { seances } = home;

  return (
    <section className="py-24 sm:py-36">
      <Container>
        <Reveal variant="fade">
          <p className="text-xs uppercase tracking-[0.22em] text-muted">
            {seances.eyebrow}
          </p>
          <h2 className="mt-3 max-w-2xl text-balance font-serif text-3xl leading-tight text-ink sm:text-4xl lg:text-5xl">
            {seances.title}
          </h2>
        </Reveal>

        <div className="mt-16 space-y-24 sm:mt-24 sm:space-y-36">
          {seances.scenes.map((scene, i) => {
            const s = SPREADS[i % SPREADS.length];
            return (
              <Reveal key={scene.slug} variant={s.reveal}>
                <article className="lg:grid lg:grid-cols-12 lg:items-center lg:gap-12">
                  <Link
                    href={`/galeries/${scene.slug}`}
                    className={cn("group block", s.img, s.right && "lg:order-2")}
                  >
                    <ImageFigure
                      image={{ alt: scene.tag, ratio: s.ratio, hint: scene.hint }}
                      interactive
                      sizes="(min-width:1024px) 58vw, 100vw"
                    />
                  </Link>
                  <div
                    className={cn(
                      "mt-7 lg:mt-0",
                      s.txt,
                      s.offset,
                      s.right && "lg:order-1",
                    )}
                  >
                    <span className="text-xs uppercase tracking-[0.24em] text-clay">
                      {scene.tag}
                    </span>
                    <h3 className="mt-3 font-serif text-4xl leading-[1.05] text-ink sm:text-5xl lg:text-6xl">
                      {scene.emotion}
                    </h3>
                    <p className="mt-5 max-w-sm text-pretty font-serif text-lg text-ink sm:text-xl">
                      {scene.emotive}
                    </p>
                    <Link
                      href={`/galeries/${scene.slug}`}
                      className="mt-5 inline-block text-sm text-muted hover:text-clay"
                    >
                      Voir {scene.tag.toLowerCase()} →
                    </Link>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>

        <div className="mt-20 flex flex-wrap items-center gap-x-8 gap-y-4">
          <ButtonLink href={seances.cta.href} variant="secondary">
            {seances.cta.label}
          </ButtonLink>
          <Link
            href={seances.also.href}
            className="text-sm text-muted hover:text-clay"
          >
            {seances.also.label} →
          </Link>
        </div>
      </Container>
    </section>
  );
}
