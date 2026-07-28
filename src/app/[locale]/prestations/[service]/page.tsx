// Prestation [service] — a dossier, and the commercial landing page for its query.
//
// It used to be one chapter: cover plate, description, how the session runs, one ask —
// 159–170 words, one photograph, and no answer to a single question a client asks before
// booking. It now walks the booking decision, in the order a visitor needs it:
//
//   the offer          heading · price · duration · the cover
//   who I am to you    the documentary description, beside the approach
//   THE WORK           the genre's real shoots — a photography page shows photographs first
//   what's included    from pricing.ts (sessions) or the three packages (weddings)
//   how it goes ∥ where  the four steps, beside the real coverage policy
//   what people ask    real answers from faq.ts — the ones the steps do not already give
//   the ask            the existing crosslinks
//
// Every fact is READ FROM the module that owns it — pricing.ts, locations.ts, faq.ts,
// stories.generated.ts. Nothing factual is authored here or in service-dossier.ts, so a price
// or policy edit reaches this page on its own and no fact can drift out of sync.

import { notFound } from "next/navigation";
import Link from "next/link";
import { getDictionary } from "@/lib/dictionary";
import { setRequestLocale } from "@/lib/request-locale";
import { isLocale, defaultLocale, type Locale } from "@/lib/i18n";
import { link, allServiceParams, type ServiceSlug, type GenreSlug } from "@/lib/routes";
import { genreForService } from "@/lib/service-genre";
import { formatPrice } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { ChambreScene, ChapterOpening } from "@/components/chambre/scene";
import { Plate } from "@/components/chambre/plate";
import { Develop } from "@/components/chambre/develop";
import { FaqItem } from "@/components/content/faq-item";
import { JsonLd } from "@/components/seo/json-ld";
import { serviceJsonLd } from "@/lib/structured-data";
import { storiesIn, storyDateLabel, storyTitle } from "@/lib/stories";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const dynamicParams = false;

/** The dossier teases the genre's most recent work; the gallery holds all of it. */
const STORY_TEASER_MAX = 3;

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
  // The genre's curated cover, unless the cinematic band would destroy it — see the
  // `hero` note in content/service-dossier.ts. The override can replace the frame (`src`)
  // or only re-aim the crop on the cover (`position`); the cover is the operator's own
  // choice and stays authoritative wherever it survives the band.
  const galleryCover = dict.galleries.find((g) => g.slug === genre)?.cover;
  const heroOverride = dict.serviceDossier.hero[genre];
  const cover = heroOverride?.src ? { src: heroOverride.src } : galleryCover;

  const d = dict.serviceDossier;
  const p = dict.pricing;
  const isWedding = genre === "mariages";

  // The offer, stated plainly on the service itself: the PRICE is the headline; the
  // session length is supporting information beside it, never a second price.
  const session = p.sessions.items.find((s) => s.slug === genre);
  let priceLine = "";
  let durationLine = "";
  if (session) {
    priceLine = session.exactPrice
      ? formatPrice(session.price, active)
      : `${p.fromLabel} ${formatPrice(session.price, active)}`;
    if (session.duration) durationLine = `${p.sessions.durationLabel} · ${session.duration}`;
  } else if (isWedding) {
    const min = Math.min(...p.wedding.packages.map((pk) => pk.price));
    priceLine = `${p.fromLabel} ${formatPrice(min, active)}`;
  }

  // The genre's real shoots — newest first, capped so the dossier teases and the gallery holds.
  const stories = storiesIn(genre as GenreSlug).slice(0, STORY_TEASER_MAX);

  // Coverage, from the real policy: a wedding travels, a séance is a Lyon-area service.
  // locations.ts owns the wording; this only selects which of its areas apply.
  const areas = dict.locations.areas.filter((a) => (isWedding ? true : a.id !== "france"));

  // The four moments a client actually lives. 01/02 and 04 are shared; 03 is per-service and
  // states a FACT (a séance's duration, a wedding's coverage range), not a mood.
  const steps = [
    ...d.steps.shared,
    {
      n: "03",
      title: isWedding ? d.steps.dayWedding : d.steps.daySession,
      body: d.steps.onTheDay[genre],
    },
    d.steps.delivery,
  ];

  // The options this séance can actually carry, cited by id — see service-dossier.ts.
  const addons = d.addons[genre]
    .map((id) => p.addons.items.find((a) => a.id === id))
    .filter((a): a is NonNullable<typeof a> => Boolean(a));

  // Only the questions the steps above do NOT already answer — the page never repeats itself.
  const questions = d.faq[genre]
    .map((id) => dict.faq.items.find((f) => f.id === id))
    .filter((f): f is NonNullable<typeof f> => Boolean(f));

  return (
    <ChambreScene>
      {/* The page sells one named service, at a stated price, in a stated area — all three
          visible on it, which is the condition for claiming any of them. FAQPage is
          deliberately NOT emitted: Google removed the FAQ rich result on 2026-05-07, so it
          would be markup with no reader and no result. */}
      <JsonLd
        data={serviceJsonLd({
          name: item.title,
          description: item.metaDescription,
          path: `/prestations/${service}`,
          locale: active,
          price: session?.price ?? Math.min(...p.wedding.packages.map((pk) => pk.price)),
          exactPrice: session?.exactPrice ?? false,
          areas: areas.map((a) => ({ label: a.label, schemaType: a.schemaType })),
        })}
      />

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
              alt={heroOverride?.alt ?? `${item.shortTitle} — ${item.tagline}`}
              focus={heroOverride?.position}
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
              {item.description.map((para, i) => (
                <p key={i}>{para}</p>
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
      </section>

      {/* ── THE WORK, before the commercial detail. This is a photography site: the answer to
             "can you photograph my wedding" is the wedding you photographed last month. It
             also puts real photographs between two blocks of text, so the page reads as a
             portfolio page that sells rather than a sales page with a picture on top. ── */}
      {stories.length > 0 && (
        <section className="ch-movement ch-wrap" aria-labelledby="ch-dossier-work">
          <Develop>
            <p className="ch-mono ch-kicker"><span className="n">§</span> {d.work.eyebrow}</p>
            <h2 id="ch-dossier-work" className="ch-title" style={{ marginTop: "1.2rem" }}>
              {isWedding ? d.work.weddingTitle : d.work.title}
            </h2>
            <p className="ch-lead">{isWedding ? d.work.weddingLead : d.work.lead}</p>
          </Develop>
          <div
            className="ch-story-index"
            data-count={Math.min(stories.length, 3)}
            style={{ marginTop: "clamp(2rem,5vh,3.25rem)" }}
          >
            {stories.map((s, i) => (
              <Develop key={s.id} delay={(i % 3) * 70}>
                <Plate
                  href={link(active, { page: "genreStory", genre: genre as GenreSlug, story: s.slug })}
                  src={s.cover}
                  alt={storyTitle(s, active)}
                  ratio="frame"
                  plaque={storyDateLabel(s, active) || undefined}
                  caption={storyTitle(s, active)}
                  sizes="(min-width: 64rem) 31vw, (min-width: 40rem) 46vw, 92vw"
                />
              </Develop>
            ))}
          </div>
          <Develop>
            <div style={{ marginTop: "clamp(1.75rem,4vh,2.5rem)" }}>
              <Link className="ch-go" href={link(active, { page: "genre", genre: genre as GenreSlug })}>
                {d.work.all} <span className="ch-arrow" aria-hidden>→</span>
              </Link>
            </div>
          </Develop>
        </section>
      )}

      {/* ── WHAT IS INCLUDED. The price was already stated at the top; this says what it buys.
             The single largest commercial gap the audit found: /tarifs held these lists, and
             the page a visitor actually lands on from a search did not. ── */}
      <section className="ch-movement ch-wrap" aria-labelledby="ch-dossier-included">
        <Develop>
          <p className="ch-mono ch-kicker"><span className="n">§</span> {d.included.eyebrow}</p>
          <h2 id="ch-dossier-included" className="ch-title" style={{ marginTop: "1.2rem" }}>
            {isWedding ? d.included.weddingTitle : d.included.title}
          </h2>
          {isWedding && <p className="ch-lead">{d.included.weddingLead}</p>}
        </Develop>

        {isWedding ? (
          // The three real packages, compact: name, price, and the hard specs. The full
          // comparison (what each one includes) stays on /tarifs — linked, not copied.
          <div className="ch-price-grid ch-price-grid--wedding" style={{ marginTop: "clamp(2rem,5vh,3.5rem)" }}>
            {p.wedding.packages.map((pkg, i) => (
              <Develop
                key={pkg.name}
                delay={(i % 3) * 80}
                className={cn("ch-package-cell", pkg.recommended && "is-featured")}
              >
                <article className={cn("ch-card ch-offer ch-package", pkg.recommended && "ch-package--featured")}>
                  {pkg.recommended && <span className="ch-package-badge">{p.wedding.recommendedLabel}</span>}
                  <header className="ch-offer-head">
                    <h3 className="ch-offer-name">{pkg.name}</h3>
                    <p className="ch-price ch-price--lg">{formatPrice(pkg.price, active)}</p>
                  </header>
                  <dl className="ch-package-spec">
                    <div>
                      <dt>{p.coverageLabel}</dt>
                      <dd>{pkg.coverage}</dd>
                    </div>
                    <div>
                      <dt>{p.wedding.photosLabel}</dt>
                      <dd>{pkg.photos}</dd>
                    </div>
                    <div>
                      <dt>{p.deliveryLabel}</dt>
                      <dd>{pkg.delivery}</dd>
                    </div>
                  </dl>
                </article>
              </Develop>
            ))}
          </div>
        ) : (
          session && (
            <div className="ch-split" style={{ marginTop: "clamp(2rem,5vh,3.25rem)" }}>
              <Develop>
                <article className="ch-card">
                  <header className="ch-offer-head">
                    <h3 className="ch-offer-name">{session.name}</h3>
                    <p className="ch-price">{formatPrice(session.price, active)}</p>
                  </header>
                  <p className="ch-offer-duration">
                    <span className="ch-offer-duration-label">{p.sessions.durationLabel}</span>
                    {session.duration}
                  </p>
                  <ul className="ch-spec-list" style={{ marginTop: "1.2rem" }}>
                    {session.includes.map((inc, j) => (
                      <li key={j}>{inc}</li>
                    ))}
                  </ul>
                </article>
              </Develop>
              <Develop delay={90}>
                <p className="text-body text-ink-secondary" style={{ maxWidth: "34rem" }}>
                  {session.summary}
                </p>
                <ul className="ch-list text-body text-ink" style={{ marginTop: "1.4rem" }}>
                  {addons.map((a) => (
                    <li key={a.id}>
                      <span className="ch-area-label">{a.title}</span>
                      <span className="ch-area-note">{a.body}</span>
                    </li>
                  ))}
                </ul>
              </Develop>
            </div>
          )
        )}

        <Develop>
          <div style={{ marginTop: "clamp(1.75rem,4vh,2.5rem)" }}>
            <Link className="ch-go" href={link(active, { page: "tarifs" })}>
              {d.included.allPricing} <span className="ch-arrow" aria-hidden>→</span>
            </Link>
          </div>
        </Develop>
      </section>

      {/* ── HOW IT GOES, beside WHERE. Paired in one editorial split rather than stacked as two
             more full-width movements: they are the two logistics answers, and the page has
             enough vertical rhythm already. "Where" is also the local-SEO statement — it is
             the real coverage policy, not a keyword list of communes. ── */}
      <section className="ch-movement ch-wrap" aria-labelledby="ch-dossier-process">
        <div className="ch-split">
          <Develop>
            <p className="ch-mono ch-kicker"><span className="n">§</span> {d.process.eyebrow}</p>
            <h2 id="ch-dossier-process" className="ch-title ch-title--sub" style={{ marginTop: "1.2rem" }}>
              {d.process.title}
            </h2>
            <ol className="ch-steps" style={{ marginTop: "1.8rem" }}>
              {steps.map((s) => (
                <li key={s.n}>
                  <span className="n" aria-hidden>{s.n}</span>
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                </li>
              ))}
            </ol>
          </Develop>
          <Develop delay={90}>
            <p className="ch-mono ch-kicker"><span className="n">§</span> {d.coverage.eyebrow}</p>
            <h2 className="ch-title ch-title--sub" style={{ marginTop: "1.2rem" }}>{d.coverage.title}</h2>
            <ul className="ch-list text-body text-ink" style={{ marginTop: "1.8rem" }}>
              {areas.map((a) => (
                <li key={a.id}>
                  <span className="ch-area-label">{a.label}</span>
                  <span className="ch-area-note">{a.note}</span>
                </li>
              ))}
            </ul>
          </Develop>
        </div>
      </section>

      {/* ── WHAT PEOPLE ASK — real answers from faq.ts, cited by id, never rewritten. Only the
             questions the steps above do not already answer, so nothing is said twice. ── */}
      {questions.length > 0 && (
        <section className="ch-movement ch-wrap" aria-labelledby="ch-dossier-faq">
          <Develop>
            <p className="ch-mono ch-kicker"><span className="n">§</span> {d.questions.eyebrow}</p>
            <h2 id="ch-dossier-faq" className="ch-title" style={{ marginTop: "1.2rem" }}>
              {d.questions.title}
            </h2>
          </Develop>
          <div style={{ marginTop: "clamp(1.75rem,4vh,2.5rem)", maxWidth: "48rem" }}>
            {questions.map((f) => (
              <FaqItem key={f.id} group={`dossier-faq-${service}`} question={f.q} answer={f.a} />
            ))}
          </div>
          <Develop>
            <div style={{ marginTop: "clamp(1.75rem,4vh,2.5rem)" }}>
              <Link className="ch-go" href={link(active, { page: "tarifs" })}>
                {d.questions.all} <span className="ch-arrow" aria-hidden>→</span>
              </Link>
            </div>
          </Develop>
        </section>
      )}

      <section className="ch-movement ch-wrap">
        <Develop>
          <nav aria-label={dict.ui.actions.more} className="ch-crosslinks">
            <Link className="ch-go" href={link(active, { page: "genre", genre: genre as GenreSlug })}>
              {dict.ui.actions.viewGallery} <span className="ch-arrow" aria-hidden>→</span>
            </Link>
            <Link className="ch-go" href={link(active, { page: "tarifs" })}>
              {dict.ui.actions.pricing} <span className="ch-arrow" aria-hidden>→</span>
            </Link>
            {/* The dossier knows which séance this visitor read about; the contact form asks
                for it in a required field. Carry it, so the highest-intent path on the site
                does not ask a question it has already been told the answer to. */}
            <Link
              className="ch-go"
              href={link(active, { page: "contact", seance: service as ServiceSlug })}
            >
              {dict.ui.actions.contactMe} <span className="ch-arrow" aria-hidden>→</span>
            </Link>
          </nav>
        </Develop>
      </section>
    </ChambreScene>
  );
}
