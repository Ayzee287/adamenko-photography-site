"use client";

// navigation — the inline destination row (≥1024): the frozen inventory in
// frozen order (Galeries · Prestations · Tarifs · Séances[gated] · À propos ·
// Contact) + the FR·EN switch. Every href resolves through the registry;
// active state derives from the pathname via refFromPathname (never stored).

import { usePathname } from "next/navigation";
import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import {
  getAlternates,
  link,
  navInventory,
  refFromPathname,
} from "@/lib/routes";
import { cn } from "@/lib/utils/cn";
import { NavItem } from "./nav-item";

export interface NavigationLabels {
  primary: string;
  language: string;
}

export function Navigation(props: {
  locale: Locale;
  showSeances: boolean;
  labels: NavigationLabels;
}) {
  const { locale, showSeances, labels } = props;
  const pathname = usePathname() ?? "/";
  const currentRef = refFromPathname(pathname) ?? { page: "home" as const };
  const alternates = getAlternates(currentRef);
  const lang = locale === "en" ? "en" : "fr";

  return (
    <nav aria-label={labels.primary} className="flex items-center gap-6">
      {navInventory
        .filter((item) => !item.gated || showSeances)
        .map((item) => (
          <NavItem
            key={item.id}
            href={link(locale, { page: item.id })}
            label={item.label[lang]}
            active={currentRef.page === item.id}
          />
        ))}
      <span aria-label={labels.language} className="flex items-center gap-2">
        <Link
          href={alternates.fr}
          aria-current={lang === "fr" ? "true" : undefined}
          className={cn(
            "text-nav underline-offset-4",
            lang === "fr" ? "text-ink underline decoration-1" : "text-ink-secondary hover:text-ink",
          )}
        >
          FR
        </Link>
        <span aria-hidden className="text-ink-secondary">
          ·
        </span>
        <Link
          href={alternates.en}
          aria-current={lang === "en" ? "true" : undefined}
          className={cn(
            "text-nav underline-offset-4",
            lang === "en" ? "text-ink underline decoration-1" : "text-ink-secondary hover:text-ink",
          )}
        >
          EN
        </Link>
      </span>
    </nav>
  );
}
