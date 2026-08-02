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
      <ChapterOpening kicker={dict.copy.about.title} title={ph.name} mark="§" />

      <section className="ch-movement ch-wrap">
        <div className="ch-split narrow-media">
          {ph.portrait?.src ? (
            <Develop>
              <Plate
                src={ph.portrait.src}
                alt={ph.portrait.alt}
                ratio="tall"
                sizes="(min-width: 52rem) 40vw, 100vw"
                // The portrait opens the page and is its LCP element — measured lazy.
                priority
              />
            </Develop>
          ) : null}
          <Develop delay={90}>
            <div className="ch-prose text-body-letter text-ink">
              {ph.biography.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            {/* One clear primary action at the end of the story — contacting Irina. The
                abstract value words were removed (the biography carries them concretely). */}
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
          {/* Secondary exploration only — the work and the prices. "Contact" was dropped
              here: it duplicated the primary CTA above the bio, leaving four near-identical
              actions piled together. Two quiet next-steps read as intentional. */}
          <nav aria-label={dict.copy.about.crosslinks.label} className="ch-crosslinks">
            <Link className="ch-go" href={link(active, { page: "galeries" })}>
              {dict.copy.about.crosslinks.work} <span className="ch-arrow" aria-hidden>→</span>
            </Link>
            <Link className="ch-go" href={link(active, { page: "tarifs" })}>
              {dict.copy.about.crosslinks.pricing} <span className="ch-arrow" aria-hidden>→</span>
            </Link>
          </nav>
        </Develop>
      </section>
    </ChambreScene>
  );
}
