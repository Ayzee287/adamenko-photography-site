"use client";

// menu-dialog — full-screen navigation below 1024 (Addendum ruling). Native
// <dialog>: showModal() gives the focus trap, Escape, top layer and
// focus-return for free (no Radix, no Headless UI — Architecture §1.1).
// Anatomy per the frozen component: top row (wordmark + close 44) → nav stack
// (serif h2 items) → bottom (contact pill · socials · FR·EN). Paper surface;
// body scroll locked while open; in 250ms / out via close (motion polish P18).

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale } from "@/lib/i18n";
import { getAlternates, link, navInventory, refFromPathname } from "@/lib/routes";
import { PillButton } from "@/components/actions/pill-button";
import { IconLink } from "@/components/actions/icon-link";
import { cn } from "@/lib/utils/cn";

export interface MenuDialogLabels {
  closeMenu: string;
  language: string;
  primary: string;
  contactCta: string;
  instagram: string;
  facebook: string;
  brand: string;
}

export function MenuDialog(props: {
  open: boolean;
  onClose: () => void;
  locale: Locale;
  showSeances: boolean;
  labels: MenuDialogLabels;
  socials: { instagram?: string; facebook?: string };
}) {
  const { open, onClose, locale, showSeances, labels, socials } = props;
  const ref = useRef<HTMLDialogElement>(null);
  const pathname = usePathname() ?? "/";
  const currentRef = refFromPathname(pathname) ?? { page: "home" as const };
  const alternates = getAlternates(currentRef);
  const lang = locale === "en" ? "en" : "fr";

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  // Body scroll lock while open.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <dialog
      id="menu-dialog"
      ref={ref}
      onClose={onClose}
      className="z-dialog m-0 h-dvh max-h-none w-screen max-w-none bg-paper p-5 md:p-7"
    >
      <div className="flex h-full flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-wordmark text-ink">{labels.brand}</span>
          <button
            type="button"
            onClick={onClose}
            aria-label={labels.closeMenu}
            className="flex h-(--size-target-min) w-(--size-target-min) items-center justify-center text-ink"
          >
            <svg
              viewBox="0 0 20 20"
              className="h-(--size-icon) w-(--size-icon)"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              aria-hidden
            >
              <path d="M4 4l12 12M16 4L4 16" />
            </svg>
          </button>
        </div>

        <nav aria-label={labels.primary} className="flex flex-col gap-6">
          {navInventory
            .filter((item) => !item.gated || showSeances)
            .map((item) => (
              <Link
                key={item.id}
                href={link(locale, { page: item.id })}
                onClick={onClose}
                className="text-h2 text-ink"
              >
                {item.label[lang]}
              </Link>
            ))}
        </nav>

        <div className="flex flex-col gap-6">
          <PillButton
            href={link(locale, { page: "contact" })}
            onClick={onClose}
            showArrow
          >
            {labels.contactCta}
          </PillButton>
          <div className="flex items-center justify-between">
            <div className="flex">
              {socials.instagram && (
                <IconLink
                  icon="instagram"
                  href={socials.instagram}
                  label={labels.instagram}
                />
              )}
              {socials.facebook && (
                <IconLink
                  icon="facebook"
                  href={socials.facebook}
                  label={labels.facebook}
                />
              )}
            </div>
            <span aria-label={labels.language} className="flex items-center gap-2">
              <Link
                href={alternates.fr}
                onClick={onClose}
                className={cn(
                  "text-nav underline-offset-4",
                  lang === "fr" ? "text-ink underline decoration-1" : "text-ink-secondary",
                )}
              >
                FR
              </Link>
              <span aria-hidden className="text-ink-secondary">
                ·
              </span>
              <Link
                href={alternates.en}
                onClick={onClose}
                className={cn(
                  "text-nav underline-offset-4",
                  lang === "en" ? "text-ink underline decoration-1" : "text-ink-secondary",
                )}
              >
                EN
              </Link>
            </span>
          </div>
        </div>
      </div>
    </dialog>
  );
}
