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

      <section className="ch-movement">
        <Exhibition items={items} serie={gallery.title} labels={labels} />
      </section>

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
