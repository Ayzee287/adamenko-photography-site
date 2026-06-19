import Link from "next/link";
import { Container } from "@/components/layout/container";
import { ImageFigure } from "@/components/ui/image-figure";
import { Reveal } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button-link";
import { cn } from "@/lib/utils";
import { home } from "@/content/home";
import { getGallery } from "@/content/galleries";

// Per-scene composition — varied scale + alignment so the section reads as an
// edit, not a grid (D016/D018). Heading is sticky on desktop (one editorial beat).
const LAYOUTS = [
  { wrap: "", ratio: "aspect-[4/5]", side: "left" as const, reveal: "rise" as const },
  {
    wrap: "sm:w-[86%] sm:ml-auto",
    ratio: "aspect-[3/4]",
    side: "right" as const,
    reveal: "rise-left" as const,
  },
  {
    wrap: "sm:w-[78%]",
    ratio: "aspect-[5/4]",
    side: "left" as const,
    reveal: "rise" as const,
  },
  { wrap: "", ratio: "aspect-[3/2]", side: "left" as const, reveal: "rise-slow" as const },
];

export function ServicesShowcase() {
  const { services } = home;

  return (
    <section className="border-t border-line py-24 sm:py-32">
      <Container className="lg:grid lg:grid-cols-12 lg:gap-16">
        {/* Sticky heading (desktop) — the one pinned narrative beat (D020). */}
        <header className="lg:col-span-4">
          <div className="lg:sticky lg:top-28">
            <p className="text-xs uppercase tracking-[0.22em] text-muted">
              {services.eyebrow}
            </p>
            <h2 className="mt-3 text-balance font-serif text-3xl leading-tight text-ink sm:text-4xl">
              {services.title}
            </h2>
            <p className="mt-4 max-w-xs text-pretty text-muted">{services.intro}</p>
            <div className="mt-7 flex flex-col gap-4">
              <ButtonLink href={services.cta.href} variant="secondary">
                {services.cta.label}
              </ButtonLink>
              <Link
                href={services.also.href}
                className="text-sm text-muted hover:text-clay"
              >
                {services.also.label} →
              </Link>
            </div>
          </div>
        </header>

        {/* Scenes */}
        <div className="mt-14 space-y-20 lg:col-span-8 lg:mt-0 lg:space-y-28">
          {services.scenes.map((scene, i) => {
            const layout = LAYOUTS[i % LAYOUTS.length];
            const first = getGallery(scene.slug)?.images[0];
            const preview = { alt: first?.alt ?? scene.title, ratio: layout.ratio };
            const right = layout.side === "right";
            return (
              <Reveal key={scene.slug} variant={layout.reveal}>
                <Link
                  href={`/galeries/${scene.slug}`}
                  className={cn("group block", layout.wrap)}
                >
                  <ImageFigure
                    image={preview}
                    interactive
                    sizes="(min-width:1024px) 55vw, 100vw"
                  />
                  {/* Oversized serif title overlapping the image edge (mostly on
                      paper, so it stays legible over any photo). */}
                  <h3
                    className={cn(
                      "relative z-10 -mt-7 font-serif text-4xl text-ink sm:-mt-10 sm:text-5xl",
                      right ? "pr-2 text-right" : "pl-1",
                    )}
                  >
                    {scene.title}
                  </h3>
                  <div className={cn("mt-5 max-w-md", right && "ml-auto text-right")}>
                    <p className="text-pretty font-serif text-lg text-ink sm:text-xl">
                      {scene.emotive}
                    </p>
                    <p className="mt-2 text-sm text-muted">{scene.line}</p>
                    <span className="mt-3 inline-block text-sm text-clay">
                      Voir la galerie →
                    </span>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
