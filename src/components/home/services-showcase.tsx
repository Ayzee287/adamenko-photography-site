import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { ImageFigure } from "@/components/ui/image-figure";
import { Reveal } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button-link";
import { blurFor } from "@/lib/image-blur";
import { cn } from "@/lib/utils";
import { home } from "@/content/home";

// A scene accepts a real export later (`src` + dimensions) with zero layout change;
// until then every composition renders its directed reserved frame (v2).
type Scene = {
  slug: string;
  /** Genre name — the dominant serif word. */
  title: string;
  /** The small uppercase link label. */
  cta: string;
  /** One short, concrete line under the title. */
  caption: string;
  src?: string;
  alt?: string;
  hint?: string;
};

// A magazine feature of the genres — photography leads, but the spread is built to
// stand on directed placeholders alone (v2). Four scenes, four DIFFERENT
// compositions: split-left · split-right · full-width · FULL-BLEED text-overlay.
// The last breaks the formula completely (D024).

function Lede({ scene, onDark = false }: { scene: Scene; onDark?: boolean }) {
  return (
    <>
      <h3
        className={cn(
          "font-serif text-5xl leading-[0.95] sm:text-6xl lg:text-7xl",
          onDark ? "text-paper" : "text-ink",
        )}
      >
        {scene.title}
      </h3>
      <p
        className={cn(
          "mt-5 max-w-xs text-pretty text-lg leading-snug sm:text-xl",
          onDark ? "text-paper/85" : "text-ink/85",
        )}
      >
        {scene.caption}
      </p>
      <span
        className={cn(
          "mt-6 inline-block text-[0.7rem] uppercase tracking-[0.24em]",
          onDark ? "text-paper/70" : "text-muted group-hover:text-clay",
        )}
      >
        {scene.cta}{" "}
        <span aria-hidden className="cta-arrow inline-block">
          →
        </span>
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
          image={{ src: scene.src, alt: scene.alt ?? scene.title, ratio, hint: scene.hint }}
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
          image={{ src: scene.src, alt: scene.alt ?? scene.title, ratio: "aspect-[16/9]" }}
          interactive
          sizes="100vw"
        />
      </Link>
      <Link
        href={`/galeries/${scene.slug}`}
        className="group mt-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"
      >
        <h3 className="font-serif text-5xl leading-[0.95] text-ink sm:text-7xl">
          {scene.title}
        </h3>
        <div className="sm:max-w-xs sm:text-right">
          <p className="text-pretty text-lg text-ink/85 sm:text-xl">{scene.caption}</p>
          <span className="mt-3 inline-block text-[0.7rem] uppercase tracking-[0.24em] text-muted group-hover:text-clay">
            {scene.cta}{" "}
            <span aria-hidden className="cta-arrow inline-block">
              →
            </span>
          </span>
        </div>
      </Link>
    </article>
  );
}

// The pattern-breaker: a full-bleed band with the emotion overlaid (D024). With a
// real export it's the photograph; without one it's a directed dark frame — a
// warm-black field carrying the same big serif, so the break still lands (v2).
function FullBleed({ scene }: { scene: Scene }) {
  const hasImage = Boolean(scene.src);
  return (
    <Link
      href={`/galeries/${scene.slug}`}
      className="dark-surface group relative block h-[72vh] w-full overflow-hidden sm:h-[80vh]"
    >
      {hasImage ? (
        <>
          <Image
            src={scene.src as string}
            alt={scene.alt ?? scene.title}
            fill
            sizes="100vw"
            placeholder={blurFor(scene.src) ? "blur" : undefined}
            blurDataURL={blurFor(scene.src)}
            className="object-cover transition-transform duration-[800ms] ease-[var(--ease-settle)] group-hover:scale-[1.03]"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-ink/10"
          />
        </>
      ) : (
        <>
          <div
            aria-hidden
            className="absolute inset-0 bg-[radial-gradient(120%_120%_at_72%_12%,#3c332b,#1a1511)]"
          />
          {/* Directed reserved frame — a quiet, paper-tinted art-direction caption. */}
          <span
            aria-hidden
            className="absolute right-5 top-6 flex max-w-[26ch] flex-col items-end gap-2 text-right sm:right-8 sm:top-8"
          >
            <span className="text-[0.6rem] uppercase tracking-[0.28em] text-paper/35">
              Paysage · 16:9
            </span>
            {scene.hint ? (
              <span className="font-serif text-sm italic leading-snug text-paper/35">
                {scene.hint}
              </span>
            ) : null}
          </span>
        </>
      )}
      <Container className="absolute inset-x-0 bottom-0 pb-14 sm:pb-20">
        <h3 className="max-w-3xl font-serif text-6xl leading-[0.9] text-paper sm:text-7xl lg:text-8xl">
          {scene.title}
        </h3>
        <p className="mt-5 max-w-md text-pretty text-lg text-paper/85 sm:text-xl">
          {scene.caption}
        </p>
        <span className="mt-6 inline-block text-[0.7rem] uppercase tracking-[0.24em] text-paper/70">
          {scene.cta}{" "}
          <span aria-hidden className="cta-arrow inline-block">
            →
          </span>
        </span>
      </Container>
    </Link>
  );
}

export function ServicesShowcase() {
  const { seances } = home;
  const [s0, s1, s2, s3] = seances.scenes;

  return (
    <section className="py-10 sm:py-16">
      <Container>
        <Reveal variant="fade">
          <p className="text-xs uppercase tracking-[0.24em] text-muted">
            {seances.eyebrow}
          </p>
          <h2 className="mt-4 max-w-2xl text-balance font-serif text-3xl leading-tight text-ink sm:text-4xl lg:text-5xl">
            {seances.title}
          </h2>
        </Reveal>

        <div className="mt-10 space-y-16 sm:mt-16 sm:space-y-24">
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
      <div className="mt-16 sm:mt-24">
        <FullBleed scene={s3} />
      </div>

      {/* One clear path to the work — Portraits is a normal category on /galeries. */}
      <Container className="mt-10 sm:mt-16">
        <ButtonLink href={seances.cta.href} variant="secondary">
          {seances.cta.label}
        </ButtonLink>
      </Container>
    </section>
  );
}
