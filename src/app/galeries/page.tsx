import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { ImageFigure } from "@/components/ui/image-figure";
import { Reveal } from "@/components/motion/reveal";
import { copy } from "@/content/site";
import { galleries } from "@/content/galleries";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: copy.galleries.title,
  description: copy.galleries.intro,
  path: "/galeries",
});

// De-boxed editorial contact sheet (D030): each genre is its cover frame, borderless,
// the photograph as the object — no bordered text cards (D021). Mirrors the homepage
// idiom (ImageFigure + Reveal + FLOW rhythm) so /galeries belongs to the homepage.
export default function GaleriesPage() {
  return (
    <Container className="pt-14 pb-10 sm:pt-20 sm:pb-16">
      <Reveal>
        <PageHeader
          eyebrow={copy.galleries.eyebrow}
          title={copy.galleries.title}
          intro={copy.galleries.intro}
        />
      </Reveal>

      <ul className="mt-10 grid gap-x-8 gap-y-12 sm:mt-16 sm:grid-cols-2">
        {galleries.map((g, i) => {
          const cover = g.cover ?? g.images[0];
          return (
            <li key={g.slug}>
              <Reveal delay={(i % 2) * 90}>
                <Link href={`/galeries/${g.slug}`} className="group block">
                  <ImageFigure
                    image={cover}
                    interactive
                    sizes="(min-width:640px) 50vw, 100vw"
                  />
                  <h2 className="mt-5 font-serif text-2xl text-ink transition-colors duration-300 group-hover:text-clay">
                    {g.title}
                  </h2>
                  <p className="mt-2 max-w-md text-pretty text-sm text-muted">
                    {g.intro}
                  </p>
                  <span className="mt-3 inline-flex items-center gap-2 text-sm text-ink">
                    {copy.galleries.view}
                    <span
                      aria-hidden
                      className="transition-transform duration-300 ease-[var(--ease-arrive)] group-hover:translate-x-[5px]"
                    >
                      →
                    </span>
                  </span>
                </Link>
              </Reveal>
            </li>
          );
        })}
      </ul>
    </Container>
  );
}
