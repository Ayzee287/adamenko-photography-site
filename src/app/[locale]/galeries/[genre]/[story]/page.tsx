// Galerie [genre]/[story] — one shoot, hung as its own exhibition.
//
// Deliberately the SAME surface as a genre wall: the identical ChapterOpening, the
// identical justified Exhibition, the identical lightbox. A story is not a new kind of
// page needing a new visual language — it is the same wall with a narrower subject, and
// the only additions are the two facts a story has that a genre does not: a date and
// (opt-in) a place. Nothing here is fabricated: an undated or unplaced story simply
// renders without that line.

import { notFound } from "next/navigation";
import Link from "next/link";
import { getDictionary } from "@/lib/dictionary";
import { setRequestLocale } from "@/lib/request-locale";
import { isLocale, defaultLocale, type Locale } from "@/lib/i18n";
import { link, type GenreSlug } from "@/lib/routes";
import { serviceForGenre } from "@/lib/service-genre";
import {
  allStoryParams, findStory, storyAlt, storyDateLabel, storyDescription, storyTitle,
} from "@/lib/stories";
import { Exhibition, type ExhibitItem } from "@/components/chambre/exhibition";
import { ChambreScene, ChapterOpening } from "@/components/chambre/scene";
import { Develop } from "@/components/chambre/develop";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd } from "@/lib/structured-data";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  // Only stories the publish gate allows — a private story has no page to find.
  return allStoryParams.map(({ genre, story }) => ({ genre, story }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; genre: string; story: string }>;
}): Promise<Metadata> {
  const { locale, genre, story } = await params;
  const active = isLocale(locale) ? locale : defaultLocale;
  const s = findStory(genre, story);
  if (!s) return {};
  const gallery = getDictionary(active).galleries.find((g) => g.slug === genre);
  return buildMetadata({
    title: `${storyTitle(s, active)} · ${gallery?.title ?? ""}`.trim(),
    description: storyDescription(s, active) || gallery?.intro,
    path: `/galeries/${genre}/${story}`,
    locale: active,
    // The shoot's own cover, not a generated wordmark — a shared link to a photography
    // story should preview the photograph.
    image: s.cover,
    imageAlt: storyTitle(s, active),
  });
}

export default async function StoryPage({
  params,
}: {
  params: Promise<{ locale: string; genre: string; story: string }>;
}) {
  const { locale, genre, story } = await params;
  const active: Locale = isLocale(locale) ? locale : defaultLocale;
  setRequestLocale(active);
  const dict = getDictionary(active);

  const s = findStory(genre, story);
  if (!s) notFound();

  const gallery = dict.galleries.find((g) => g.slug === genre);

  const items: ExhibitItem[] = s.images.map((img) => ({
    src: img.src,
    alt: storyAlt(img, active),
    width: img.width,
    height: img.height,
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

  // The quiet line under the title: the month, and the place only if a human typed one.
  const when = storyDateLabel(s, active);
  const meta = [when, s.location].filter(Boolean).join(" · ");

  return (
    <ChambreScene>
      {/* Accueil › Galeries › <genre> › <shoot>. A story sits UNDER its category on
          disk and in the URL; this says the same thing to a crawler. */}
      <JsonLd
        data={breadcrumbJsonLd([
          { name: dict.ui.nav.home, path: link(active, { page: "home" }) },
          { name: dict.copy.galleries.title, path: link(active, { page: "galeries" }) },
          ...(gallery
            ? [{ name: gallery.title, path: link(active, { page: "genre", genre: genre as GenreSlug }) }]
            : []),
          {
            name: storyTitle(s, active),
            path: link(active, { page: "genreStory", genre: genre as GenreSlug, story }),
          },
        ])}
      />
      <ChapterOpening
        kicker={gallery?.title ?? dict.copy.galleries.title}
        title={storyTitle(s, active)}
        intro={storyDescription(s, active) || undefined}
        mark={meta || "§ Série"}
      />

      <section className="ch-movement">
        <Exhibition items={items} serie={storyTitle(s, active)} labels={labels} />
      </section>

      <section className="ch-movement ch-wrap">
        <Develop>
          <nav aria-label={active === "en" ? "More" : "Suite"} className="ch-crosslinks">
            <Link className="ch-go" href={link(active, { page: "genre", genre: genre as GenreSlug })}>
              {active === "en"
                ? `All ${(gallery?.title ?? "").toLowerCase()}`
                : `Toutes les ${(gallery?.title ?? "").toLowerCase()}`}{" "}
              <span className="ch-arrow" aria-hidden>→</span>
            </Link>
            <Link
              className="ch-go"
              href={link(active, { page: "service", service: serviceForGenre[genre as GenreSlug] })}
            >
              {active === "en" ? "About this session" : "En savoir plus sur cette séance"}{" "}
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
