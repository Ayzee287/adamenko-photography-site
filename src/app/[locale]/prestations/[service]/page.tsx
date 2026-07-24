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
    description: item?.tagline,
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

  // The offer, stated plainly on the service itself — exact for the client-fixed
  // sessions (family/maternity: "220 € · 1 heure"), a starting point otherwise.
  const p = dict.pricing;
  const session = p.sessions.items.find((s) => s.slug === genre);
  let offerLine = "";
  if (session) {
    offerLine =
      session.exactPrice && session.duration
        ? `${formatPrice(session.price, active)} · ${session.duration}`
        : `${p.fromLabel} ${formatPrice(session.price, active)}`;
  } else if (genre === "mariages") {
    const min = Math.min(...p.wedding.packages.map((pk) => pk.price));
    offerLine = `${p.fromLabel} ${formatPrice(min, active)}`;
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
        {offerLine && (
          <Develop>
            <p className="ch-service-meta">{offerLine}</p>
          </Develop>
        )}
        {cover?.src ? (
          <Develop>
            <Plate
              src={cover.src}
              alt={`${item.title} — ${item.tagline}`}
              ratio="cine"
              plaque={item.title}
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
            <p className="ch-mono ch-kicker"><span className="n">§</span> Comment ça se passe</p>
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
          <nav aria-label="Suite" className="ch-crosslinks" style={{ marginTop: "clamp(2.5rem,6vh,4rem)" }}>
            <Link className="ch-go" href={link(active, { page: "genre", genre: genre as GenreSlug })}>
              Voir la galerie <span className="ch-arrow" aria-hidden>→</span>
            </Link>
            <Link className="ch-go" href={link(active, { page: "tarifs" })}>
              Les tarifs <span className="ch-arrow" aria-hidden>→</span>
            </Link>
            <Link className="ch-go" href={link(active, { page: "contact" })}>
              Me contacter <span className="ch-arrow" aria-hidden>→</span>
            </Link>
          </nav>
        </Develop>
      </section>
    </ChambreScene>
  );
}
