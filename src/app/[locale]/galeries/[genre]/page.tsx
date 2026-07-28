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
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd } from "@/lib/structured-data";
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
  const dict = getDictionary(active);
  const gallery = dict.galleries.find((g) => g.slug === genre);
  // The <title> says what the page SHOWS ("Photos de mariage"); the <h1> below keeps the
  // bare genre noun, which reads correctly under the Galeries kicker. Two intents, two
  // registers — see content/gallery-meta.ts. Falls back to the gallery's own title.
  const metaTitle = dict.galleryMeta[genre as GenreSlug]?.metaTitle ?? gallery?.title;
  return buildMetadata({
    title: metaTitle ?? "Galerie",
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
      {/* Accueil › Galeries › <genre> — the hierarchy the URL already states. Every
          ancestor here is a real 200 page, which is the condition for claiming it. */}
      <JsonLd
        data={breadcrumbJsonLd([
          { name: dict.ui.nav.home, path: link(active, { page: "home" }) },
          { name: dict.copy.galleries.title, path: link(active, { page: "galeries" }) },
          { name: gallery.title, path: link(active, { page: "genre", genre: genre as GenreSlug }) },
        ])}
      />
      <ChapterOpening
        kicker={dict.copy.galleries.title}
        title={gallery.title}
        intro={gallery.intro}
        mark="§ Série"
      />

      {/* A category is an INDEX OF ITS SHOOTS, not a wall of photographs.
          Now that the categories hold real days — several of them over 100 frames — opening
          one can no longer mean "here are 300 pictures". It means "here are the days", and
          each door opens that day's own exhibition. The index carries covers ONLY, so
          entering a category costs four images rather than four hundred.
          The loose genre wall below is the fallback for a category that has no stories yet. */}
      {stories.length > 0 && (
        <section className="ch-movement ch-wrap">
          {(() => {
            // The index composes to its OWN count. Dropping every count into one grid is
            // what produces orphans — a single story beside two dead columns, or a fourth
            // stranded alone under a row of three.
            //
            //   1  a full-bleed cinematic plate
            //   2  two across
            //   3  three across
            //   4  a lead plate over a strip of three  (the /galeries hang, which composes
            //      four cleanly and gives the most recent day the weight it deserves)
            //
            // Stories arrive newest-first, so the lead plate is the latest shoot.
            const n = stories.length;
            const lead = n === 1 || n === 4 ? stories[0] : null;
            const strip = lead ? stories.slice(1) : stories;
            const stripCount = strip.length;

            const plate = (s: (typeof stories)[number], isLead: boolean, i: number) => (
              <Develop key={s.id} delay={isLead ? 0 : (i % 3) * 70}>
                <Plate
                  href={link(active, {
                    page: "genreStory",
                    genre: genre as GenreSlug,
                    story: s.slug,
                  })}
                  src={s.cover}
                  alt={storyTitle(s, active)}
                  ratio={isLead ? "cine" : "frame"}
                  plaque={storyDateLabel(s, active) || undefined}
                  caption={storyTitle(s, active)}
                  sizes={
                    isLead
                      ? "(min-width: 82rem) 1312px, 100vw"
                      : stripCount === 2
                        ? "(min-width: 40rem) 46vw, 92vw"
                        : "(min-width: 64rem) 31vw, (min-width: 40rem) 46vw, 92vw"
                  }
                />
              </Develop>
            );

            return (
              <div className="ch-story-wall">
                {lead && plate(lead, true, 0)}
                {stripCount > 0 && (
                  <div className="ch-story-index" data-count={Math.min(stripCount, 3)}>
                    {strip.map((s, i) => plate(s, false, i))}
                  </div>
                )}
              </div>
            );
          })()}
        </section>
      )}

      {stories.length === 0 && items.length > 0 && (
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
              {/* Names its destination ("La séance famille") instead of the old generic
                  "En savoir plus sur cette séance" — clearer in a list of links, and an
                  anchor is one of the few honest signals about the page it points at. */}
              {dict.services.items.find((it) => it.slug === genre)?.linkLabel ??
                (active === "en" ? "About this session" : "En savoir plus sur cette séance")}{" "}
              <span className="ch-arrow" aria-hidden>→</span>
            </Link>
            <Link className="ch-go" href={link(active, { page: "galeries" })}>
              {active === "en" ? "All galleries" : "Toutes les galeries"}{" "}
              <span className="ch-arrow" aria-hidden>→</span>
            </Link>
            <Link
              className="ch-go"
              href={link(active, {
                page: "contact",
                seance: serviceForGenre[genre as GenreSlug],
              })}
            >
              {active === "en" ? "Book a session" : "Réserver une séance"}{" "}
              <span className="ch-arrow" aria-hidden>→</span>
            </Link>
          </nav>
        </Develop>
      </section>
    </ChambreScene>
  );
}
