// Galerie [genre] — the Viewing Room. The genre's edit, hung as a curated exhibition
// (Exhibition): a full-bleed opening plate, wide offset solos, dropped diptychs and quiet
// breaths — each a lit museum print that opens the shared cinematic lightbox.

import { notFound } from "next/navigation";
import Link from "next/link";
import { getDictionary } from "@/lib/dictionary";
import { setRequestLocale } from "@/lib/request-locale";
import { isLocale, defaultLocale, type Locale } from "@/lib/i18n";
import { link, allGenreParams, type GenreSlug } from "@/lib/routes";
import { serviceForGenre } from "@/lib/service-genre";
import { Exhibition, type ExhibitItem } from "@/components/chambre/exhibition";
import { ChambreScene, ChapterOpening } from "@/components/chambre/scene";
import { Develop } from "@/components/chambre/develop";
import { Plate } from "@/components/chambre/plate";
import { storiesIn, storyDateLabel, storyTitle } from "@/lib/stories";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; genre: string }>;
}): Promise<Metadata> {
  const { locale, genre } = await params;
  const active = isLocale(locale) ? locale : defaultLocale;
  const gallery = getDictionary(active).galleries.find((g) => g.slug === genre);
  return buildMetadata({
    title: gallery?.title ?? "Galerie",
    description: gallery?.intro,
    path: `/galeries/${genre}`,
    locale: active,
  });
}

export function generateStaticParams() {
  return allGenreParams.map((genre) => ({ genre }));
}

export default async function GenrePage({
  params,
}: {
  params: Promise<{ locale: string; genre: string }>;
}) {
  const { locale, genre } = await params;
  const active: Locale = isLocale(locale) ? locale : defaultLocale;
  setRequestLocale(active);
  const dict = getDictionary(active);

  const gallery = dict.galleries.find((g) => g.slug === genre);
  if (!gallery) notFound();

  const stories = storiesIn(genre as GenreSlug);

  const items: ExhibitItem[] = gallery.images
    .filter((img) => img.src && img.width && img.height)
    .map((img) => ({
      src: img.src as string,
      alt: img.alt,
      width: img.width as number,
      height: img.height as number,
    }));

  const labels = {
    enlarge: dict.ui.gallery.enlarge,
    dialog: dict.ui.gallery.lightbox,
    close: dict.ui.gallery.close,
    closeLabel: dict.ui.gallery.closeLabel,
    prevPhoto: dict.ui.gallery.prevPhoto,
    nextPhoto: dict.ui.gallery.nextPhoto,
    photograph: dict.ui.gallery.photograph,
    of: dict.ui.gallery.of,
  };

  return (
    <ChambreScene>
      <ChapterOpening
        kicker={dict.copy.galleries.title}
        title={gallery.title}
        intro={gallery.intro}
        mark="§ Série"
      />

      {/* Stories, when this category has any. They are hung ABOVE the genre wall and
          carry only their covers — entering a category must never download every story
          it contains. Each cover is a door to that shoot's own exhibition. */}
      {stories.length > 0 && (
        <section className="ch-movement ch-wrap">
          {/* The index composes to its OWN count rather than dropping every count into a
              three-column grid — one story in a 3-col grid is a plate beside two dead
              columns. One story hangs full-bleed and cinematic, two share the wall, three
              or more become the grid. Same failure the galleries index already avoids
              with its featured-plus-supporting hang. */}
          <div className="ch-story-index" data-count={stories.length >= 3 ? "many" : stories.length}>
            {stories.map((s, i) => {
              const when = storyDateLabel(s, active);
              const lone = stories.length === 1;
              return (
                <Develop key={s.id} delay={(i % 3) * 70}>
                  <Plate
                    href={link(active, {
                      page: "genreStory",
                      genre: genre as GenreSlug,
                      story: s.slug,
                    })}
                    src={s.cover}
                    alt={storyTitle(s, active)}
                    ratio={lone ? "cine" : "frame"}
                    plaque={when || undefined}
                    caption={storyTitle(s, active)}
                    sizes={
                      lone
                        ? "(min-width: 82rem) 1312px, 100vw"
                        : stories.length === 2
                          ? "(min-width: 40rem) 46vw, 92vw"
                          : "(min-width: 64rem) 31vw, (min-width: 40rem) 46vw, 92vw"
                    }
                  />
                </Develop>
              );
            })}
          </div>
        </section>
      )}

      {items.length > 0 && (
        <section className="ch-movement">
          <Exhibition items={items} serie={gallery.title} labels={labels} />
        </section>
      )}

      <section className="ch-movement ch-wrap">
        <Develop>
          <nav aria-label={active === "en" ? "More" : "Suite"} className="ch-crosslinks">
            <Link
              className="ch-go"
              href={link(active, { page: "service", service: serviceForGenre[genre as GenreSlug] })}
            >
              {active === "en" ? "About this session" : "En savoir plus sur cette séance"}{" "}
              <span className="ch-arrow" aria-hidden>→</span>
            </Link>
            <Link className="ch-go" href={link(active, { page: "galeries" })}>
              {active === "en" ? "All galleries" : "Toutes les galeries"}{" "}
              <span className="ch-arrow" aria-hidden>→</span>
            </Link>
            <Link className="ch-go" href={link(active, { page: "contact" })}>
              {active === "en" ? "Book a session" : "Réserver une séance"}{" "}
              <span className="ch-arrow" aria-hidden>→</span>
            </Link>
          </nav>
        </Develop>
      </section>
    </ChambreScene>
  );
}
