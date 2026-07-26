// Galeries — the contact sheet. Five genres, each a lit plate that opens its series.

import { getDictionary } from "@/lib/dictionary";
import { setRequestLocale } from "@/lib/request-locale";
import { isLocale, defaultLocale, type Locale } from "@/lib/i18n";
import { link, type GenreSlug } from "@/lib/routes";
import { ChambreScene, ChapterOpening } from "@/components/chambre/scene";
import { Plate } from "@/components/chambre/plate";
import { Develop } from "@/components/chambre/develop";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const active = isLocale(locale) ? locale : defaultLocale;
  const g = getDictionary(active).copy.galleries;
  return buildMetadata({ title: g.title, description: g.intro, path: "/galeries", locale: active });
}

export default async function GaleriesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const active: Locale = isLocale(locale) ? locale : defaultLocale;
  setRequestLocale(active);
  const dict = getDictionary(active);
  const g = dict.copy.galleries;

  return (
    <ChambreScene>
      <ChapterOpening kicker={g.eyebrow} title={g.title} intro={g.intro} mark="§ Galeries" />

      <section className="ch-movement ch-wrap">
        {(() => {
          // Curated hang for FOUR albums: one featured cinematic print above a strip of
          // three. The previous composition put four narrow plates under the feature —
          // correct when there were five albums, but with four remaining that strip goes
          // to three, which lets each supporting plate breathe at a third of the wall
          // instead of a quarter. A 2×2 was the alternative and was rejected: it reads as
          // a grid of equals and throws away the hierarchy the feature print creates.
          const albums = dict.galleries.filter((gg) => gg.cover?.src);
          const featured = albums.find((gg) => gg.slug === "mariages") ?? albums[0];
          const supporting = albums.filter((gg) => gg !== featured);
          return (
            <div className="ch-gallery-wall">
              <Develop>
                <Plate
                  href={link(active, { page: "genre", genre: featured.slug as GenreSlug })}
                  src={featured.cover!.src!}
                  alt={`${featured.title} — ${featured.intro}`}
                  ratio="cine"
                  plaque={g.view}
                  caption={featured.title}
                  sizes="(min-width: 82rem) 1312px, 100vw"
                />
              </Develop>
              <div className="ch-gallery-support">
                {supporting.map((gallery, i) => (
                  <Develop key={gallery.slug} delay={(i % 3) * 70}>
                    <Plate
                      href={link(active, { page: "genre", genre: gallery.slug as GenreSlug })}
                      src={gallery.cover!.src!}
                      alt={`${gallery.title} — ${gallery.intro}`}
                      ratio="tall"
                      plaque={g.view}
                      caption={gallery.title}
                      sizes="(min-width: 64rem) 31vw, (min-width: 40rem) 46vw, 100vw"
                    />
                  </Develop>
                ))}
              </div>
            </div>
          );
        })()}
      </section>
    </ChambreScene>
  );
}
