"use client";

// Voice-compliant failure page (Architecture §3.2, DNA error law): state what
// happened plainly, blame nobody, offer the way back. Client component by
// Next contract; locale derived from the pathname (the request-locale cache
// is server-only). No dictionary import — error pages must carry zero
// dependencies that could themselves be the failure.

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
    <div className="mx-auto max-w-measure px-5 py-12 text-center">
      <p className="text-kicker text-ink-secondary">{t.kicker}</p>
      <h1 className="text-display mt-3">{t.title}</h1>
      <p className="text-body mt-4 text-ink-secondary">{t.intro}</p>
      <p className="mt-6 flex justify-center gap-6">
        <button type="button" onClick={reset} className="text-button underline">
          {t.retry}
        </button>
        <Link href={link(locale, { page: "home" })} className="text-button underline">
          {t.home} →
        </Link>
      </p>
    </div>
  );
}
