// À propos — The Witness. The homepage promised the person; this is the full portrait.
// Her own words (photographer.biography), lit like a print on the dark wall.

import Link from "next/link";
import { getDictionary } from "@/lib/dictionary";
import { setRequestLocale } from "@/lib/request-locale";
import { isLocale, defaultLocale, type Locale } from "@/lib/i18n";
import { link } from "@/lib/routes";
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
  const dict = getDictionary(active);
  return buildMetadata({
    title: dict.copy.about.title,
    description: dict.copy.about.metaDescription,
    path: "/a-propos",
    locale: active,
  });
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const active: Locale = isLocale(locale) ? locale : defaultLocale;
  setRequestLocale(active);
  const dict = getDictionary(active);
  const ph = dict.photographer;

  return (
    <ChambreScene>
      <ChapterOpening kicker={dict.copy.about.title} title={ph.name} mark="§ Portrait" />

      <section className="ch-movement ch-wrap">
        <div className="ch-split narrow-media">
          {ph.portrait?.src ? (
            <Develop>
              <Plate
                src={ph.portrait.src}
                alt={ph.portrait.alt}
                ratio="tall"
                plaque="Irina Adamenko · Lyon"
                sizes="(min-width: 52rem) 40vw, 100vw"
              />
            </Develop>
          ) : null}
          <Develop delay={90}>
            <div className="ch-prose text-body-letter text-ink">
              {ph.biography.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            <p className="ch-mono" style={{ marginTop: "1.8rem" }}>
              {dict.home.about.values.join("   ·   ")}
            </p>
            <div style={{ marginTop: "2.4rem" }}>
              <Link className="ch-go" href={link(active, { page: "contact" })}>
                {dict.copy.about.cta} <span className="ch-arrow" aria-hidden>→</span>
              </Link>
            </div>
          </Develop>
        </div>
      </section>

      <section className="ch-movement ch-wrap">
        <Develop>
          <nav aria-label="Suite" className="ch-crosslinks">
            <Link className="ch-go" href={link(active, { page: "galeries" })}>
              Voir le travail <span className="ch-arrow" aria-hidden>→</span>
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
