import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { ImageFigure } from "@/components/ui/image-figure";
import { Reveal } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button-link";
import { cn } from "@/lib/utils";
import { home } from "@/content/home";

type Scene = (typeof home.seances.scenes)[number];

// A magazine feature organised by emotion — photography leads (D023/D024). Four
// scenes, four DIFFERENT compositions: split-left · split-right · full-width ·
// FULL-BLEED text-overlay. The last breaks the formula completely (D024).

function Lede({ scene, onDark = false }: { scene: Scene; onDark?: boolean }) {
  return (
    <>
      <h3
        className={cn(
          "font-serif text-5xl leading-[0.95] sm:text-6xl lg:text-7xl",
          onDark ? "text-paper" : "text-ink",
        )}
      >
        {scene.emotion}
      </h3>
      <p
        className={cn(
          "mt-5 max-w-xs text-pretty text-lg leading-snug sm:text-xl",
          onDark ? "text-paper/85" : "text-ink/85",
        )}
      >
        {scene.emotive}
      </p>
      <span
        className={cn(
          "mt-6 inline-block text-[0.7rem] uppercase tracking-[0.24em]",
          onDark ? "text-paper/70" : "text-muted group-hover:text-clay",
        )}
      >
        {scene.tag} →
      </span>
    </>
  );
}

function Split({ scene, ratio, side }: { scene: Scene; ratio: string; side: "left" | "right" }) {
  const right = side === "right";
  return (
    <article className="lg:grid lg:grid-cols-12 lg:items-center lg:gap-12">
      <Link
        href={`/galeries/${scene.slug}`}
        className={cn("group block lg:col-span-7", right && "lg:order-2")}
      >
        <ImageFigure
          image={{ src: scene.src, alt: scene.tag, ratio, hint: scene.hint }}
          interactive
          sizes="(min-width:1024px) 58vw, 100vw"
        />
      </Link>
      <Link
        href={`/galeries/${scene.slug}`}
        className={cn("group mt-8 block lg:col-span-5 lg:mt-0", right && "lg:order-1")}
      >
        <Lede scene={scene} />
      </Link>
    </article>
  );
}

function FullWidth({ scene }: { scene: Scene }) {
  return (
    <article>
      <Link href={`/galeries/${scene.slug}`} className="group block">
        <ImageFigure
          image={{ src: scene.src, alt: scene.tag, ratio: "aspect-[16/9]" }}
          interactive
          sizes="100vw"
        />
      </Link>
      <Link
        href={`/galeries/${scene.slug}`}
        className="group mt-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"
      >
        <h3 className="font-serif text-5xl leading-[0.95] text-ink sm:text-7xl">
          {scene.emotion}
        </h3>
        <div className="sm:max-w-xs sm:text-right">
          <p className="text-pretty text-lg text-ink/85 sm:text-xl">{scene.emotive}</p>
          <span className="mt-3 inline-block text-[0.7rem] uppercase tracking-[0.24em] text-muted group-hover:text-clay">
            {scene.tag} →
          </span>
        </div>
      </Link>
    </article>
  );
}

// The pattern-breaker: a full-bleed photograph with the emotion overlaid (D024).
function FullBleed({ scene }: { scene: Scene }) {
  return (
    <Link
      href={`/galeries/${scene.slug}`}
      className="dark-surface group relative block h-[82vh] w-full overflow-hidden sm:h-[88vh]"
    >
      <Image
        src={scene.src}
        alt={scene.tag}
        fill
        sizes="100vw"
        className="object-cover transition-transform duration-[800ms] ease-[var(--ease-settle)] group-hover:scale-[1.03]"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-ink/10"
      />
      <Container className="absolute inset-x-0 bottom-0 pb-14 sm:pb-24">
        <h3 className="max-w-3xl font-serif text-6xl leading-[0.9] text-paper sm:text-7xl lg:text-8xl">
          {scene.emotion}
        </h3>
        <p className="mt-5 max-w-md text-pretty text-lg text-paper/85 sm:text-xl">
          {scene.emotive}
        </p>
        <span className="mt-6 inline-block text-[0.7rem] uppercase tracking-[0.24em] text-paper/70">
          {scene.tag} →
        </span>
      </Container>
    </Link>
  );
}

export function ServicesShowcase() {
  const { seances } = home;
  const [s0, s1, s2, s3] = seances.scenes;

  return (
    <section className="py-16 sm:py-32">
      <Container>
        <Reveal variant="fade">
          <p className="text-xs uppercase tracking-[0.24em] text-muted">
            {seances.eyebrow}
          </p>
          <h2 className="mt-4 max-w-2xl text-balance font-serif text-3xl leading-tight text-ink sm:text-4xl lg:text-5xl">
            {seances.title}
          </h2>
        </Reveal>

        <div className="mt-14 space-y-20 sm:mt-20 sm:space-y-32">
          <Reveal variant="rise">
            <Split scene={s0} ratio="aspect-[5/4]" side="left" />
          </Reveal>
          <Reveal variant="rise-left">
            <Split scene={s1} ratio="aspect-[4/5]" side="right" />
          </Reveal>
          <Reveal variant="rise">
            <FullWidth scene={s2} />
          </Reveal>
        </div>
      </Container>

      {/* Full-bleed pattern break */}
      <div className="mt-16 sm:mt-28">
        <FullBleed scene={s3} />
      </div>

      <Container className="mt-14 sm:mt-20">
        <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
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
