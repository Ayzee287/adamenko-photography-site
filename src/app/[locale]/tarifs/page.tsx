// Tarifs — the investment chapter. Two honest registers: the SESSIONS (family, maternity,
// couple & portrait — each from 220 €) and the three WEDDING packages (flat
// prices, the studio's real coverage/deliverables/turnaround; package 3 recommended).

import Link from "next/link";
import { getDictionary } from "@/lib/dictionary";
import { setRequestLocale } from "@/lib/request-locale";
import { isLocale, defaultLocale, type Locale } from "@/lib/i18n";
import { link, navInventory, type GenreSlug } from "@/lib/routes";
import { formatPrice } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { ChambreScene, ChapterOpening } from "@/components/chambre/scene";
import { Develop } from "@/components/chambre/develop";
import { FaqItem } from "@/components/content/faq-item";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const active = isLocale(locale) ? locale : defaultLocale;
  // Localized page name (Tarifs / Pricing) from the route registry — the hardcoded
  // "Tarifs" literal made the EN <title> read "Tarifs" instead of "Pricing".
  const title = navInventory.find((n) => n.id === "tarifs")!.label[active === "fr" ? "fr" : "en"];
  return buildMetadata({
    title,
    description: getDictionary(active).pricing.intro,
    path: "/tarifs",
    locale: active,
  });
}

export default async function TarifsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const active: Locale = isLocale(locale) ? locale : defaultLocale;
  setRequestLocale(active);
  const dict = getDictionary(active);
  const p = dict.pricing;
  const faq = dict.faq;

  return (
    <ChambreScene className="ch-tarifs">
      {/* A visitor clicking "Tarifs" wants the prices, not a full-screen statement:
          the opening is TIGHT and the page-level intro is dropped (the sessions
          register below carries the one short framing line), so the first price
          cards reach the top of the viewport. The "Investissement" eyebrow was retired
          (it labelled a chapter whose body no longer exists) — the title stands alone. */}
      <ChapterOpening tight title={p.title} mark="§" />

      {/* ── Sessions — the three fixed 220 € sessions, pulled up under the opening ── */}
      <section className="ch-movement ch-wrap ch-movement--tight-top">
        <Develop>
          <p className="ch-mono ch-kicker"><span className="n">§</span> {p.sessions.eyebrow}</p>
          <h2 className="ch-title" style={{ marginTop: "1.2rem" }}>{p.sessions.title}</h2>
          <p className="ch-lead">{p.sessions.intro}</p>
        </Develop>
        <div className="ch-price-grid" style={{ marginTop: "clamp(2rem,5vh,3.5rem)" }}>
          {p.sessions.items.map((s, i) => (
            <Develop key={s.slug} delay={(i % 3) * 80}>
              <article className="ch-card ch-offer">
                <header className="ch-offer-head">
                  <h3 className="ch-offer-name">{s.name}</h3>
                  {/* The PRICE is the headline. An exact, client-fixed offer states it
                      plainly; a genuinely variable one is honest about being a starting
                      point. The session length is supporting information, not a second
                      price — it sits quietly beneath (see the duration line below). */}
                  {s.exactPrice ? (
                    <p className="ch-price">{formatPrice(s.price, active)}</p>
                  ) : (
                    <p className="ch-price">
                      <span className="ch-price-from">{p.fromLabel}</span>{" "}
                      {formatPrice(s.price, active)}
                    </p>
                  )}
                </header>
                {s.duration && (
                  <p className="ch-offer-duration">
                    <span className="ch-offer-duration-label">{p.sessions.durationLabel}</span>
                    {s.duration}
                  </p>
                )}
                <p className="ch-offer-summary">{s.summary}</p>
                <ul className="ch-spec-list">
                  {s.includes.map((inc, j) => (
                    <li key={j}>{inc}</li>
                  ))}
                </ul>
                <Link className="ch-go ch-offer-cta" href={link(active, { page: "genre", genre: s.slug as GenreSlug })}>
                  {dict.ui.actions.viewGallery} <span className="ch-arrow" aria-hidden>→</span>
                </Link>
              </article>
            </Develop>
          ))}
        </div>
      </section>

      {/* ── Weddings — three packages, package 3 recommended ─────────────────────── */}
      <section className="ch-movement ch-wrap">
        <Develop>
          <p className="ch-mono ch-kicker"><span className="n">§</span> {p.wedding.eyebrow}</p>
          <h2 className="ch-title" style={{ marginTop: "1.2rem" }}>{p.wedding.title}</h2>
          <p className="ch-lead">{p.wedding.intro}</p>
        </Develop>
        <div className="ch-price-grid ch-price-grid--wedding" style={{ marginTop: "clamp(2rem,5vh,3.5rem)" }}>
          {p.wedding.packages.map((pkg, i) => (
            <Develop key={pkg.name} delay={(i % 3) * 80} className={cn("ch-package-cell", pkg.recommended && "is-featured")}>
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
                <ul className="ch-spec-list">
                  {pkg.includes.map((inc, j) => (
                    <li key={j}>{inc}</li>
                  ))}
                </ul>
              </article>
            </Develop>
          ))}
        </div>
        {/* Package-specific availability caveats live as a shared footnote under the grid,
            not inside one card — so the three cards keep one clean baseline (a per-card note
            made Essentiel taller and left the others with dead space). */}
        {p.wedding.packages.some((pkg) => pkg.note) && (
          <Develop>
            <p className="ch-package-conditions">
              {p.wedding.packages
                .filter((pkg) => pkg.note)
                .map((pkg) => (
                  <span key={pkg.name}>
                    <span className="ch-package-conditions-name">{pkg.name}</span> — {pkg.note}
                  </span>
                ))}
            </p>
          </Develop>
        )}
        {/* Pricing → the relevant work, with minimal friction: one shared path to the
            wedding gallery for the whole section (not a button per card), beside the booking
            action. */}
        <Develop>
          <div className="ch-tarifs-actions" style={{ marginTop: "clamp(2rem,5vh,3rem)" }}>
            <Link className="ch-go" href={link(active, { page: "genre", genre: "mariages" })}>
              {dict.ui.actions.viewGallery} <span className="ch-arrow" aria-hidden>→</span>
            </Link>
            <Link className="ch-go" href={link(active, { page: "contact" })}>
              {dict.ui.actions.requestDate} <span className="ch-arrow" aria-hidden>→</span>
            </Link>
          </div>
        </Develop>
      </section>

      {/* ── Add-ons ──────────────────────────────────────────────────────────────── */}
      <section className="ch-movement ch-wrap">
        <Develop>
          <p className="ch-mono ch-kicker"><span className="n">§</span> {p.addons.eyebrow}</p>
          <h2 className="ch-title" style={{ marginTop: "1.2rem", marginBottom: "clamp(2rem,5vh,3.5rem)" }}>
            {p.addons.title}
          </h2>
        </Develop>
        <div className="ch-voices-grid">
          {p.addons.items.map((a, i) => (
            <Develop key={a.title} delay={(i % 3) * 70}>
              <div>
                <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.3rem" }} className="text-ink">
                  {a.title}
                </h3>
                <p className="text-body text-ink-secondary" style={{ marginTop: "0.6rem" }}>{a.body}</p>
              </div>
            </Develop>
          ))}
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────────────── */}
      <section className="ch-movement ch-wrap">
        <Develop>
          <p className="ch-mono ch-kicker"><span className="n">§</span> FAQ</p>
          <h2 className="ch-title" style={{ marginTop: "1.2rem" }}>{faq.title}</h2>
          <p className="ch-lead">{faq.intro}</p>
        </Develop>
        <div style={{ marginTop: "clamp(2rem,5vh,3rem)", maxWidth: "48rem" }}>
          {faq.items.map((f, i) => (
            <FaqItem key={i} group="tarifs-faq" question={f.q} answer={f.a} />
          ))}
        </div>
        <Develop>
          <div style={{ marginTop: "clamp(2.5rem,6vh,4rem)" }}>
            <Link className="ch-go" href={link(active, { page: "contact" })}>
              {dict.ui.actions.requestQuote} <span className="ch-arrow" aria-hidden>→</span>
            </Link>
          </div>
        </Develop>
      </section>
    </ChambreScene>
  );
}
