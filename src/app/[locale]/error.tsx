"use client";

// Voice-compliant failure page (DNA error law): state what happened plainly, blame
// nobody, offer the way back — developed from the CHAMBRE dark. Client component by
// Next contract; locale derived from the pathname (the request-locale cache is
// server-only). No dictionary import — error pages must carry zero dependencies that
// could themselves be the failure; the [data-chambre] marker re-themes it in place.

import Link from "next/link";
import { usePathname } from "next/navigation";
import { localeFromPathname } from "@/lib/i18n";
import { link } from "@/lib/routes";

const copy = {
  fr: {
    kicker: "Erreur",
    title: "Quelque chose n'a pas fonctionné.",
    intro: "Ce n'est pas vous, c'est nous. Vous pouvez réessayer, ou revenir à l'accueil.",
    retry: "Réessayer",
    home: "Retour à l'accueil",
  },
  en: {
    kicker: "Error",
    title: "Something didn't work.",
    intro: "It's not you, it's us. You can try again, or head back home.",
    retry: "Try again",
    home: "Back to home",
  },
} as const;

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const pathname = usePathname() ?? "/";
  const locale = localeFromPathname(pathname) === "en" ? "en" : "fr";
  const t = copy[locale];
  return (
    <div data-chambre className="ch-root">
      <section className="ch-movement ch-wrap ch-chapter" style={{ textAlign: "center" }}>
        <p className="ch-mono ch-kicker" style={{ justifyContent: "center" }}>
          <span className="n">!</span> {t.kicker}
        </p>
        <h1 className="ch-display ch-chapter-title" style={{ margin: "1.2rem auto 0", maxWidth: "18ch" }}>
          {t.title}
        </h1>
        <p className="ch-lead" style={{ margin: "1.6rem auto 0" }}>{t.intro}</p>
        <div
          style={{ marginTop: "2.4rem", display: "flex", justifyContent: "center", gap: "2.2rem", flexWrap: "wrap" }}
        >
          <button type="button" onClick={reset} className="ch-go">
            {t.retry}
          </button>
          <Link href={link(locale, { page: "home" })} className="ch-go">
            {t.home} <span className="ch-arrow" aria-hidden>→</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
