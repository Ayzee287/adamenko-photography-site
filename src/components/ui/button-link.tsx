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
      <CtaText onDark={onDark}>{children}</CtaText>
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

/**
 * The single secondary-CTA signature, reused everywhere a text call-to-action
 * appears — the standalone `ButtonLink variant="secondary"` AND inline CTAs that
 * live inside a larger `<Link>` (gallery covers, the /prestations service links),
 * which cannot nest a `ButtonLink` (an anchor inside an anchor). Rendering a
 * `<span>` lets those reuse the exact same underline + arrow without an extra
 * tab stop, so every text CTA reads as ONE handcrafted affordance.
 *
 * The contract this enforces (the "one system"):
 *   • the underline sits on the TEXT ONLY — the arrow is a sibling, never underlined;
 *   • identical 1px thickness, identical 4px offset (`pb-1` + `bottom-0`);
 *   • identical resting hairline (`bg-current` @ 20%) → clay underline that wipes
 *     IN from the left on hover/focus and retracts to the RIGHT on release
 *     (`.link-draw`, globals.css), driven by the nearest `<a>/<button>` ancestor;
 *   • identical `gap-2` between text and the kinetic `.cta-arrow` (the `.group`
 *     ancestor advances it).
 *
 * Use inside an element that is BOTH a `.group` and an `<a>/<button>` so both the
 * draw and the arrow animate (every call site is).
 */
export function CtaText({
  children,
  onDark = false,
  className,
}: {
  children: ReactNode;
  onDark?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2",
        onDark ? "text-paper" : undefined,
        className,
      )}
    >
      {/* The underlined region — wraps the text alone, so the underline can never
          extend under the arrow. */}
      <span className="relative pb-1">
        {children}
        <span
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-px bg-current opacity-20"
        />
        <span
          aria-hidden
          className="link-draw absolute inset-x-0 bottom-0 h-px bg-clay"
        />
      </span>
      <span aria-hidden className="cta-arrow">
        →
      </span>
    </span>
  );
}
