import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary";

/**
 * The canonical primary-pill shape + hover, shared so nothing re-implements it
 * (the contact submit is a real `<button type="submit">`, which an anchor can't be,
 * so it consumes this class string rather than the component). The fill is a
 * directional ink wipe owned by `.cta-pill` (globals.css) — a ::before so the class
 * string works on a button too; border/colour ride the global interaction clock; only
 * the local active-scale is here. `cta-pill--dark` flips the fill to paper on dark bands.
 */
export function primaryPillClasses({ onDark = false }: { onDark?: boolean } = {}) {
  return cn(
    "cta-pill group inline-flex h-[52px] items-center gap-3 rounded-full border px-7 text-sm tracking-wide active:scale-[0.99]",
    onDark
      ? "cta-pill--dark border-paper/45 text-paper hover:border-paper hover:text-ink"
      : "border-ink/35 text-ink hover:border-ink hover:text-paper",
  );
}

/**
 * The CTA system (v2). Two editorial roles, one warm language:
 *
 * - **primary** — a pill (radius 999px, 52px tall) with a *thin* border and no
 *   fill at rest; on hover an ink fill *wipes in from the left* (`.cta-pill`) and the
 *   arrow advances. The directional wipe is the pill's signature — it echoes the
 *   secondary underline's left→right draw, so the two CTAs read as one handcrafted
 *   language rather than a generic crossfade. Used sparingly — one primary per viewport.
 * - **secondary** — a quiet text link: a clay underline *draws* from the left and the
 *   arrow advances. No border, no box, no fill — ever.
 *
 * Both share the kinetic `.cta-arrow`. Transform/opacity/colour only; reduced-motion
 * collapses these to instant via the global rule; touch targets ≥44px.
 */
export function ButtonLink({
  href,
  children,
  variant = "primary",
  onDark = false,
  className,
  onClick,
}: {
  href: string;
  children: ReactNode;
  variant?: Variant;
  onDark?: boolean;
  className?: string;
  /** Optional click handler (e.g. close the mobile overlay on navigate). */
  onClick?: () => void;
}) {
  const external = /^https?:\/\//.test(href);
  const inner =
    variant === "primary" ? (
      <PrimaryInner>{children}</PrimaryInner>
    ) : (
      <SecondaryInner onDark={onDark}>{children}</SecondaryInner>
    );

  const base =
    variant === "primary"
      ? primaryPillClasses({ onDark })
      : "group inline-flex min-h-[44px] items-center text-sm";

  const cls = cn(base, className);

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={cls}
        onClick={onClick}
      >
        {inner}
      </a>
    );
  }
  return (
    <Link href={href} className={cls} onClick={onClick}>
      {inner}
    </Link>
  );
}

function PrimaryInner({ children }: { children: ReactNode }) {
  return (
    <>
      <span>{children}</span>
      <span aria-hidden className="cta-arrow">
        →
      </span>
    </>
  );
}

function SecondaryInner({
  children,
  onDark,
}: {
  children: ReactNode;
  onDark: boolean;
}) {
  return (
    <span
      className={cn(
        "relative inline-flex items-center gap-2 pb-1",
        onDark ? "text-paper" : "text-ink",
      )}
    >
      <span>{children}</span>
      <span aria-hidden className="cta-arrow">
        →
      </span>
      {/* Resting hairline + a clay underline that wipes IN from the left on
          hover/focus and retracts to the RIGHT on release (directional, not a
          symmetric grow/shrink). The motion lives on `.link-draw` in globals.css. */}
      <span
        aria-hidden
        className="absolute bottom-0 left-0 h-px w-full bg-current opacity-20"
      />
      <span
        aria-hidden
        className="link-draw absolute bottom-0 left-0 h-px w-full bg-clay"
      />
    </span>
  );
}
