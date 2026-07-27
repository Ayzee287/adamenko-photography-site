// Prestation [service] — a dossier. One way of working, told as a chapter: the cover
// plate, the documentary description, how the session actually runs, and one clear ask.

import { notFound } from "next/navigation";
import Link from "next/link";
import { getDictionary } from "@/lib/dictionary";
import { setRequestLocale } from "@/lib/request-locale";
import { isLocale, defaultLocale, type Locale } from "@/lib/i18n";
import { link, allServiceParams, type ServiceSlug, type GenreSlug } from "@/lib/routes";
import { genreForService } from "@/lib/service-genre";
import { formatPrice } from "@/lib/utils/format";
import { ChambreScene, ChapterOpening } from "@/components/chambre/scene";
import { Plate } from "@/components/chambre/plate";
import { Develop } from "@/components/chambre/develop";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; service: string }>;
}): Promise<Metadata> {
  const { locale, service } = await params;
  const active = isLocale(locale) ? locale : defaultLocale;
  const genre = genreForService[service as ServiceSlug];
  const item = getDictionary(active).services.items.find((it) => it.slug === genre);
  return buildMetadata({
    title: item?.title ?? "Prestation",
    // The SERP promise, not the page lead: `tagline` is an editorial line for a reader
    // who has already arrived, `metaDescription` states the offer for someone still
    // choosing a result. Falls back to the tagline if a service ever lacks one.
    description: item?.metaDescription ?? item?.tagline,
    path: `/prestations/${service}`,
    locale: active,
  });
}

export function generateStaticParams() {
  return allServiceParams.map((service) => ({ service }));
}

export default async function ServicePage({
  params,
}: {
  params: Promise<{ locale: string; service: string }>;
}) {
  const { locale, service } = await params;
  const active: Locale = isLocale(locale) ? locale : defaultLocale;
  setRequestLocale(active);
  const dict = getDictionary(active);

  const genre = genreForService[service as ServiceSlug];
  const item = dict.services.items.find((it) => it.slug === genre);
  if (!item) notFound();
  const cover = dict.galleries.find((g) => g.slug === genre)?.cover;

  // The offer, stated plainly on the service itself: the PRICE is the headline; the
  // session length is supporting information beside it, never a second price.
  const p = dict.pricing;
  const session = p.sessions.items.find((s) => s.slug === genre);
  let priceLine = "";
  let durationLine = "";
  if (session) {
    priceLine = session.exactPrice
      ? formatPrice(session.price, active)
      : `${p.fromLabel} ${formatPrice(session.price, active)}`;
    if (session.duration) durationLine = `${p.sessions.durationLabel} · ${session.duration}`;
  } else if (genre === "mariages") {
    const min = Math.min(...p.wedding.packages.map((pk) => pk.price));
    priceLine = `${p.fromLabel} ${formatPrice(min, active)}`;
  }

  return (
    <ChambreScene>
      <ChapterOpening
        kicker={dict.services.eyebrow}
        title={item.title}
        intro={item.tagline}
        mark="§ Prestation"
      />

      <section className="ch-movement ch-wrap">
        {priceLine && (
          <Develop>
            <p className="ch-service-meta">
              {priceLine}
              {durationLine && <span className="ch-service-duration">{durationLine}</span>}
            </p>
          </Develop>
        )}
        {cover?.src ? (
          <Develop>
            <Plate
              src={cover.src}
              alt={`${item.shortTitle} — ${item.tagline}`}
              ratio="cine"
              // The plaque is a caption on a photograph, so it takes the SHORT label.
              // The heading above already carries the full "Photographe de … à Lyon".
              plaque={item.shortTitle}
              priority
              sizes="(min-width: 82rem) 1312px, 100vw"
            />
          </Develop>
        ) : null}

        <div className="ch-split" style={{ marginTop: "clamp(2.5rem,6vh,4rem)" }}>
          <Develop>
            <div className="ch-prose text-body-letter text-ink">
              {item.description.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </Develop>
          <Develop delay={90}>
            <p className="ch-mono ch-kicker"><span className="n">§</span> {dict.ui.actions.howItWorks}</p>
            <ul className="ch-list text-body text-ink" style={{ marginTop: "1.4rem" }}>
              {item.approach.map((a, i) => (
                <li key={i}>{a}</li>
              ))}
            </ul>
            <p className="text-body text-ink-secondary" style={{ marginTop: "1.6rem", maxWidth: "34rem" }}>
              {item.idealFor}
            </p>
          </Develop>
        </div>

        <Develop>
          <nav aria-label={dict.ui.actions.more} className="ch-crosslinks" style={{ marginTop: "clamp(2.5rem,6vh,4rem)" }}>
            <Link className="ch-go" href={link(active, { page: "genre", genre: genre as GenreSlug })}>
              {dict.ui.actions.viewGallery} <span className="ch-arrow" aria-hidden>→</span>
            </Link>
            <Link className="ch-go" href={link(active, { page: "tarifs" })}>
              {dict.ui.actions.pricing} <span className="ch-arrow" aria-hidden>→</span>
            </Link>
            <Link className="ch-go" href={link(active, { page: "contact" })}>
              {dict.ui.actions.contactMe} <span className="ch-arrow" aria-hidden>→</span>
            </Link>
          </nav>
        </Develop>
      </section>
    </ChambreScene>
  );
}
