import Link from "next/link";
import { Container } from "@/components/layout/container";
import { ImageFigure } from "@/components/ui/image-figure";
import { Reveal } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button-link";
import { cn } from "@/lib/utils";
import { home } from "@/content/home";

// A magazine feature organised by emotion, not a service grid (D021/D022). Large
// photography, oversized emotion word, the genre reduced to a faint whisper.
// Alternating side, varied span/scale/offset, deep negative space between spreads.
const SPREADS = [
  { img: "lg:col-span-7", txt: "lg:col-span-5", right: false, ratio: "aspect-[5/4]", reveal: "rise" as const, offset: "" },
  { img: "lg:col-span-7", txt: "lg:col-span-5", right: true, ratio: "aspect-[4/5]", reveal: "rise-left" as const, offset: "lg:pt-12" },
  { img: "lg:col-span-8", txt: "lg:col-span-4", right: false, ratio: "aspect-[16/10]", reveal: "rise" as const, offset: "lg:pt-24" },
  { img: "lg:col-span-7", txt: "lg:col-span-5", right: true, ratio: "aspect-[4/5]", reveal: "rise-slow" as const, offset: "" },
];

export function ServicesShowcase() {
  const { seances } = home;

  return (
    <section className="py-28 sm:py-40">
      <Container>
        <Reveal variant="fade">
          <p className="text-xs uppercase tracking-[0.24em] text-muted">
            {seances.eyebrow}
          </p>
          <h2 className="mt-4 max-w-2xl text-balance font-serif text-3xl leading-tight text-ink sm:text-4xl lg:text-5xl">
            {seances.title}
          </h2>
        </Reveal>

        <div className="mt-20 space-y-28 sm:mt-28 sm:space-y-44">
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
                      sizes="(min-width:1024px) 60vw, 100vw"
                    />
                  </Link>
                  <div
                    className={cn(
                      "mt-8 lg:mt-0",
                      s.txt,
                      s.offset,
                      s.right && "lg:order-1",
                    )}
                  >
                    <h3 className="font-serif text-5xl leading-[0.95] text-ink sm:text-6xl lg:text-7xl">
                      {scene.emotion}
                    </h3>
                    <p className="mt-6 max-w-xs text-pretty text-lg leading-snug text-ink/85 sm:text-xl">
                      {scene.emotive}
                    </p>
                    <Link
                      href={`/galeries/${scene.slug}`}
                      className="mt-7 inline-block text-[0.7rem] uppercase tracking-[0.24em] text-muted hover:text-clay"
                    >
                      {scene.tag} →
                    </Link>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>

        <div className="mt-24 flex flex-wrap items-center gap-x-8 gap-y-4">
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
