import Link from "next/link";
import { Container } from "@/components/layout/container";
import { SectionHeading } from "./section-heading";
import { ImageFigure } from "@/components/ui/image-figure";
import { Reveal } from "@/components/motion/reveal";
import { home } from "@/content/home";
import { getGallery } from "@/content/galleries";

/**
 * Section 6 — services. The five genres, each with an emotional value prop, a
 * visual preview, and a link into its gallery. Previews reuse each genre's first
 * reserved frame, normalised to 4:5 for an even, calm grid.
 */
export function ServicesShowcase() {
  const { services } = home;

  return (
    <section className="border-t border-line py-24 sm:py-32">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow={services.eyebrow}
            title={services.title}
            intro={services.intro}
          />
        </Reveal>
        <ul className="mt-14 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {services.items.map((item, i) => {
            const first = getGallery(item.slug)?.images[0];
            const preview = { alt: first?.alt ?? item.title, ratio: "aspect-[4/5]" };
            return (
              <li key={item.slug}>
                <Reveal delay={(i % 3) * 80}>
                  <Link href={`/galeries/${item.slug}`} className="group block">
                    <ImageFigure
                      image={preview}
                      interactive
                      sizes="(min-width:1024px) 30vw, (min-width:640px) 45vw, 100vw"
                    />
                    <h3 className="mt-4 font-serif text-xl text-ink group-hover:text-clay">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-sm text-muted">{item.valueProp}</p>
                    <span className="mt-3 inline-block text-sm text-clay">
                      Voir la galerie →
                    </span>
                  </Link>
                </Reveal>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
