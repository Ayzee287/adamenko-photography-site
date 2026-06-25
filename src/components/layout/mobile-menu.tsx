"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Container } from "@/components/layout/container";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { ButtonLink } from "@/components/ui/button-link";
import { copy, site } from "@/content/site";
import { cn } from "@/lib/utils";

/**
 * Flagship mobile navigation (Design Sprint V2 · D038). Replaces the old `w-44`
 * `<details>` dropdown with a **full-screen editorial overlay** on the brand's warm
 * paper surface — the same generous-whitespace, large-serif, quiet register as the
 * homepage, so the menu feels authored, not bolted on.
 *
 * Form (chosen over a drawer/bottom-sheet, which read as app/Material): a calm
 * full-bleed panel — brand + close on a bar that mirrors the header, oversized serif
 * destinations centred in the field, and a quiet footer (Instagram + a single
 * contact pill). One purposeful motion: the panel fades in and the links rise in a
 * gentle stagger — `--ease-arrive`, transform/opacity only, collapsed by the global
 * reduced-motion rule. It closes on Escape, on backdrop-less ×, and on navigation.
 *
 * A11y: scroll-locks the body, moves focus to the close control, traps Tab within
 * the panel, restores focus to the trigger on close (handled by the header), and is
 * removed from the DOM (not just hidden) when closed. JS-only by design — every page
 * also remains reachable from the always-present footer nav (plain links) and direct
 * URLs, so no content is gated behind it.
 */
export function MobileMenu({
  open,
  onClose,
  isActive,
}: {
  open: boolean;
  onClose: () => void;
  isActive: (href: string) => boolean;
}) {
  // mounted = in the DOM (kept during the exit transition); shown = the visible CSS
  // state (flipped a frame after mount so the entrance animates).
  const [mounted, setMounted] = useState(false);
  const [shown, setShown] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);

  // Mount the moment we open, via React's "adjust state during render" pattern
  // (guarded, runs once) — never a synchronous setState inside an effect.
  if (open && !mounted) setMounted(true);

  // Drive the enter/exit: a frame after mount flip `shown` on (entrance animates);
  // on close flip it off (exit animates) and unmount after the transition. All
  // setState here lives in rAF / timeout callbacks, not the effect body.
  useEffect(() => {
    if (open) {
      const raf = requestAnimationFrame(() => setShown(true));
      return () => cancelAnimationFrame(raf);
    }
    const raf = requestAnimationFrame(() => setShown(false));
    // Safety net: unmount even if the panel's transitionend never arrives (e.g.
    // reduced-motion near-zero durations, or an interrupted transition).
    const timer = setTimeout(() => setMounted(false), 400);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
  }, [open]);

  // Lock background scroll while the overlay is in the DOM.
  useEffect(() => {
    if (!mounted) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [mounted]);

  // Escape to close; focus the close control on open; trap Tab within the panel.
  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const panel = panelRef.current;
      if (!panel) return;
      const focusables = panel.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const activeEl = document.activeElement;
      if (e.shiftKey && activeEl === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && activeEl === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!mounted) return null;

  return (
    <div
      id="mobile-menu"
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      onTransitionEnd={(e) => {
        // Only the panel's own opacity transition ends the close → unmount.
        if (e.target === panelRef.current && !open) setMounted(false);
      }}
      className={cn(
        "fixed inset-0 z-[60] flex flex-col bg-paper transition-opacity duration-300 ease-[var(--ease-arrive)] sm:hidden",
        shown ? "opacity-100" : "opacity-0",
      )}
    >
      {/* Bar — mirrors the header height so the overlay reads as a continuation. */}
      <Container className="flex h-16 shrink-0 items-center justify-between">
        <Link
          href="/"
          onClick={onClose}
          className="font-serif text-lg text-ink"
        >
          {site.brand}
        </Link>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Fermer le menu"
          className="-mr-2.5 flex h-11 w-11 items-center justify-center text-ink hover:text-clay"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinecap="round"
            aria-hidden
          >
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </Container>

      {/* Destinations — anchored to the lower field, just above the contact cluster,
          so the nav and the CTA read as one grounded unit and the negative space
          settles into a single intentional field beneath the wordmark (rather than the
          old floating-centre, which left two voids and felt top-heavy). Generous row
          padding gives comfortable tap targets without enlarging the type. */}
      <Container className="flex flex-1 flex-col justify-end pb-12">
        <span aria-hidden className="mb-7 block h-px w-12 bg-clay" />
        <nav aria-label="Navigation principale" className="flex flex-col">
          {site.nav.map((item, i) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                aria-current={active ? "page" : undefined}
                style={{ transitionDelay: shown ? `${90 + i * 55}ms` : "0ms" }}
                className={cn(
                  "py-3.5 font-serif text-4xl leading-tight transition-[opacity,transform] duration-500 ease-[var(--ease-arrive)]",
                  shown ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
                  active
                    ? "text-clay"
                    : "text-ink hover:text-clay",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </Container>

      {/* Contact cluster — the composition's natural endpoint. A full-width pill gives
          the CTA the weight to close the column (it read lighter than the nav as a
          short inline button), with Instagram grouped tight beneath it so the two read
          as one contact unit rather than a stray, disconnected link. */}
      <Container className="shrink-0 border-t border-line py-8">
        <ButtonLink
          href="/contact"
          variant="primary"
          onClick={onClose}
          className="w-full justify-center"
        >
          {copy.home.contactCta}
        </ButtonLink>
        <div className="mt-4 flex items-center justify-between">
          <a
            href={site.social.instagram}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="text-sm text-muted hover:text-clay"
          >
            Instagram
          </a>
          {/* Renders nothing until a second locale is active (zero change today). */}
          <LanguageSwitcher />
        </div>
      </Container>
    </div>
  );
}
