"use client";

// header — wayfinding chrome, never brand expression. Frozen behavior:
// · height 64/72 (--size-header), inner max-w-site, wordmark left (serif 20,
//   live text, home link) · Navigation ≥1024 · Menu trigger below (Addendum:
//   the FR inventory provably overflows the tablet band)
// · tone=overlay|paper — overlay rides the .surface-dark scope over imagery
//   (P3 mechanism: one class, every child remaps); scroll-driven tone
//   DERIVATION is P18 — pages pass the tone
// · hide after 120px down / reveal on 8px up via the existing hook, UNTOUCHED
// · ALWAYS revealed when focus enters (Addendum M4): onFocusCapture → reveal()

import { useState } from "react";
import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { link } from "@/lib/routes";
import { useScrollDirection } from "@/hooks/use-scroll-direction";
import { cn } from "@/lib/utils/cn";
import { Navigation } from "./navigation";
import { MenuDialog, type MenuDialogLabels } from "./menu-dialog";

export interface HeaderChrome extends MenuDialogLabels {
  openMenu: string;
  menu: string;
}

export function Header(props: {
  locale: Locale;
  tone?: "paper" | "overlay";
  showSeances: boolean;
  chrome: HeaderChrome;
  socials: { instagram?: string; facebook?: string };
}) {
  const { locale, tone = "paper", showSeances, chrome, socials } = props;
  const { hidden, reveal } = useScrollDirection();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header
        onFocusCapture={reveal}
        className={cn(
          "sticky top-0 z-header transition-transform duration-(--duration-standard) ease-(--ease-standard)",
          tone === "overlay" ? "surface-dark bg-transparent" : "bg-paper",
          hidden && !menuOpen && "-translate-y-full",
        )}
      >
        <div className="mx-auto flex h-(--size-header) max-w-site items-center justify-between px-5 md:px-8">
          <Link href={link(locale, { page: "home" })} className="text-wordmark text-ink">
            {chrome.brand}
          </Link>

          <div className="hidden lg:block">
            <Navigation
              locale={locale}
              showSeances={showSeances}
              labels={{ primary: chrome.primary, language: chrome.language }}
            />
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={menuOpen}
            aria-controls="menu-dialog"
            aria-label={chrome.openMenu}
            className="flex h-(--size-target-min) items-center px-3 text-nav text-ink lg:hidden"
          >
            {chrome.menu}
          </button>
        </div>
      </header>

      <MenuDialog
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        locale={locale}
        showSeances={showSeances}
        labels={chrome}
        socials={socials}
      />
    </>
  );
}
