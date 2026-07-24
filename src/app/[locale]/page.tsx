// Accueil — CHAMBRE. The homepage is not a stack of sections; it is a film in seven
// movements, from the black of the overture to the smallest returning warmth of the
// invitation. Photography is the protagonist; the interface is the usher — it recolours
// to obsidian (chambre.css, scoped by the [data-chambre] marker below), the chrome
// floats away, and every plate develops out of the dark.
//
// Engineering survives intact: content comes from the dictionary (FR canonical, EN by
// fallback), hrefs from the route registry, images from the one next/image workhorse
// (via <Plate>/<Photo>), motion from SSR-safe islands (<Develop>/<Overture>). The layout
// still owns the <main> landmark, the skip-link, and the header/footer chrome.

import { getDictionary } from "@/lib/dictionary";
import { setRequestLocale } from "@/lib/request-locale";
import { isLocale, defaultLocale, type Locale } from "@/lib/i18n";
import { link, type GenreSlug } from "@/lib/routes";
import Link from "next/link";
import { Photo } from "@/components/media/photo";
import { Overture } from "@/components/chambre/overture";
import { Develop } from "@/components/chambre/develop";
import { Plate, type PlateRatio } from "@/components/chambre/plate";
import { Voices } from "@/components/chambre/voices";
import { googleRating, googleProfile } from "@/content/reviews.generated";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildMetadata({ path: "/", locale: isLocale(locale) ? locale : defaultLocale });
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const active: Locale = isLocale(locale) ? locale : defaultLocale;
  setRequestLocale(active);
  const dict = getDictionary(active);
  const { home } = dict;
  const portrait = dict.photographer.portrait;

  // Voices — real Google reviews only. The FR-visible text is Google's translation
  // when the review was written in another language; otherwise the verbatim original.
  const voices = dict.testimonials.slice(0, 3).map((r) => {
    const translated = r.translations?.[active];
    return {
      text: translated && translated !== r.quote ? translated : r.quote,
      name: r.name,
      rating: r.rating,
    };
  });

  return (
    <div data-chambre className="ch-root">
      <Overture wordmark={dict.site.brand} />
      {/* No JS → no black curtain (the film simply begins developed). */}
      <noscript>
        <style dangerouslySetInnerHTML={{ __html: ".ch-overture{display:none!important}" }} />
      </noscript>

      {/* ── M·01 · THE FIRST FRAME ─────────────────────────────────────────────
          Full-bleed, the LCP. The photograph is the screen; a single line names the
          feeling low-left. No CTA — curiosity, not conversion. */}
      <section className="ch-hero" aria-label={home.hero.title}>
        <div className="ch-hero-media">
          <Photo src={home.hero.image.src} alt={home.hero.image.alt} sizes="100vw" priority />
        </div>
        <div className="ch-hero-scrim" aria-hidden />
        <div className="ch-hero-content">
          <p className="ch-mono ch-kicker" style={{ marginBottom: "1.4rem" }}>
            <span className="n">§</span> {home.hero.kicker}
          </p>
          <h1 className="ch-display ch-hero-title">{home.hero.title}</h1>
        </div>
        <div className="ch-hero-cue" aria-hidden>
          <span>{home.hero.scrollCue}</span>
          <span className="bar" />
        </div>
      </section>

      {/* ── M·02 · THE WHISPER (manifesto) ─────────────────────────────────────
          The void, then one line after another. Pure emotion. */}
      <section className="ch-movement ch-wrap" style={{ textAlign: "center" }} aria-label="Manifeste">
        <Develop>
          <p className="ch-display" style={{ fontSize: "clamp(2.1rem,6vw,5rem)", margin: "0 auto", maxWidth: "18ch", position: "relative" }}>
            {home.signature.map((line, i) => (
              <span key={i} style={{ display: "block" }}>
                {line}
              </span>
            ))}
          </p>
        </Develop>
      </section>

      {/* ── M·03 · THE WITNESS (about) ─────────────────────────────────────────
          Her portrait, lit like a print on the dark wall; the first person beside it. */}
      <section className="ch-movement ch-wrap" aria-labelledby="ch-about">
        <div className="ch-about-grid">
          {portrait?.src ? (
            <Develop>
              <Plate
                src={portrait.src}
                alt={portrait.alt}
                ratio="tall"
                plaque="Irina Adamenko · Portraitiste"
                sizes="(min-width: 52rem) 40vw, 100vw"
              />
            </Develop>
          ) : null}
          <Develop delay={90}>
            <p className="ch-mono ch-kicker">
              <span className="n">§</span> {home.about.eyebrow}
            </p>
            <h2 id="ch-about" className="ch-title" style={{ marginTop: "1.2rem" }}>
              {home.about.title}
            </h2>
            <div
              className="text-body-letter text-ink-secondary"
              style={{ marginTop: "1.6rem", maxWidth: "34rem", display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              {home.about.body.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            <p className="ch-mono" style={{ marginTop: "1.8rem" }}>
              {home.about.values.join("   ·   ")}
            </p>
            <div style={{ marginTop: "2.2rem" }}>
              <Link className="ch-go" href={link(active, { page: "a-propos" })}>
                {home.about.cta.label} <span className="ch-arrow" aria-hidden>→</span>
              </Link>
            </div>
          </Develop>
        </div>
      </section>

      {/* ── M·04 · THE WORK (plates → the galleries) ───────────────────────────
          Not a grid of thumbnails: a sequence of lit plates, each a door to its series. */}
      <section className="ch-movement ch-wrap" aria-labelledby="ch-work">
        <Develop>
          <p className="ch-mono ch-kicker">
            <span className="n">§</span> {home.seances.eyebrow}
          </p>
          <h2 id="ch-work" className="ch-title" style={{ marginTop: "1.2rem", marginBottom: "clamp(2.5rem,6vh,5rem)" }}>
            {home.seances.title}
          </h2>
        </Develop>
        <div className="ch-plates">
          {home.seances.scenes.map((scene, i) => {
            const full = i % 3 === 0;
            const ratio: PlateRatio = full ? "cine" : "tall";
            return (
              <Develop key={scene.slug} delay={(i % 2) * 90} className={full ? "ch-span-full" : undefined}>
                <Plate
                  href={link(active, { page: "genre", genre: scene.slug as GenreSlug })}
                  src={scene.src}
                  alt={scene.alt}
                  ratio={ratio}
                  plaque={scene.title}
                  caption={scene.caption}
                  sizes={full ? "(min-width: 82rem) 1312px, 100vw" : "(min-width: 52rem) 46vw, 100vw"}
                />
              </Develop>
            );
          })}
        </div>
        <Develop>
          <div style={{ marginTop: "clamp(2.5rem,6vh,4rem)" }}>
            <Link className="ch-go" href={link(active, { page: "galeries" })}>
              {home.seances.cta.label} <span className="ch-arrow" aria-hidden>→</span>
            </Link>
          </div>
        </Develop>
      </section>

      {/* ── M·05 · THE VOICES (proof) ──────────────────────────────────────────
          Real reviews, treated as fragments overheard in the dark — not cards. */}
      <section className="ch-movement ch-wrap" aria-labelledby="ch-voices">
        <Develop>
          <p className="ch-mono ch-kicker">
            <span className="n">§</span> {home.testimonials.carouselLabel}
          </p>
          <h2 id="ch-voices" className="ch-title" style={{ marginTop: "1.2rem" }}>
            {home.testimonials.title}
          </h2>
        </Develop>
        <Develop>
          <div style={{ marginTop: "clamp(2rem,5vh,3.25rem)" }}>
            <Voices
              items={voices}
              attribution={home.testimonials.attribution}
              carouselLabel={home.testimonials.carouselLabel}
              aggregate={googleRating}
              aggregateTemplate={home.testimonials.summary}
              viewAllLabel={home.testimonials.viewAllOnGoogle}
              viewAllHref={googleProfile?.reviewsUri}
            />
          </div>
        </Develop>
      </section>

      {/* ── M·06 · THE INVITATION (the close) ──────────────────────────────────
          The safelight returns; one warm line, one quiet ask, the coordinates in mono. */}
      <section className="ch-movement ch-wrap" style={{ textAlign: "center" }} aria-labelledby="ch-invite">
        <Develop>
          <p className="ch-mono ch-kicker" style={{ justifyContent: "center" }}>
            <span className="n">§</span> {home.finalCta.eyebrow}
          </p>
          <h2 id="ch-invite" className="ch-display" style={{ fontSize: "clamp(2.2rem,6vw,4.5rem)", margin: "1.4rem auto 0", maxWidth: "16ch", position: "relative" }}>
            {home.finalCta.title}
          </h2>
          <p className="text-body-letter text-ink-secondary" style={{ maxWidth: "34rem", margin: "1.6rem auto 0", position: "relative" }}>
            {home.finalCta.body}
          </p>
          <div style={{ marginTop: "2.4rem", position: "relative" }}>
            <Link className="ch-go" href={link(active, { page: "contact" })}>
              {home.finalCta.cta.label} <span className="ch-arrow" aria-hidden>→</span>
            </Link>
          </div>
          <p className="ch-mono" style={{ marginTop: "2rem", position: "relative" }}>
            45.7640°N 4.8357°E — {home.finalCta.location}
          </p>
        </Develop>
      </section>
    </div>
  );
}
