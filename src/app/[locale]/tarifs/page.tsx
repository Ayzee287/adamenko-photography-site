// Tarifs — the investment chapter. Two honest registers: portrait SESSIONS (family,
// maternity, couple & portrait — each from 220 €) and the three WEDDING packages (flat
// prices, the studio's real coverage/deliverables/turnaround; package 3 recommended).

import Link from "next/link";
import { getDictionary } from "@/lib/dictionary";
import { setRequestLocale } from "@/lib/request-locale";
import { isLocale, defaultLocale, type Locale } from "@/lib/i18n";
import { link, type GenreSlug } from "@/lib/routes";
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
  return buildMetadata({
    title: "Tarifs",
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
    <ChambreScene>
      <ChapterOpening kicker={p.eyebrow} title={p.title} intro={p.intro} mark="§" />

      {/* ── Sessions — family & maternity as distinct services, each from 220 € ───── */}
      <section className="ch-movement ch-wrap">
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
                  {/* An exact, client-fixed offer states its price and its hour plainly; a
                      genuinely variable one is honest about being a starting point. */}
                  {s.exactPrice ? (
                    <p className="ch-price">
                      {formatPrice(s.price, active)}
                      {s.duration && (
                        <>
                          <span className="ch-price-sep" aria-hidden>
                            ·
                          </span>
                          <span className="ch-price-duration">{s.duration}</span>
                        </>
                      )}
                    </p>
                  ) : (
                    <p className="ch-price">
                      <span className="ch-price-from">{p.fromLabel}</span>{" "}
                      {formatPrice(s.price, active)}
                    </p>
                  )}
                </header>
                <p className="ch-offer-summary">{s.summary}</p>
                <ul className="ch-spec-list">
                  {s.includes.map((inc, j) => (
                    <li key={j}>{inc}</li>
                  ))}
                </ul>
                <Link className="ch-go ch-offer-cta" href={link(active, { page: "genre", genre: s.slug as GenreSlug })}>
                  Voir la galerie <span className="ch-arrow" aria-hidden>→</span>
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
                {pkg.note && <p className="ch-package-note">{pkg.note}</p>}
              </article>
            </Develop>
          ))}
        </div>
        <Develop>
          <div style={{ marginTop: "clamp(2rem,5vh,3rem)" }}>
            <Link className="ch-go" href={link(active, { page: "contact" })}>
              Demander une date <span className="ch-arrow" aria-hidden>→</span>
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
              Demander un devis <span className="ch-arrow" aria-hidden>→</span>
            </Link>
          </div>
        </Develop>
      </section>
    </ChambreScene>
  );
}
