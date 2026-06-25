import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary";

/**
 * The canonical primary-pill shape + hover, shared so nothing re-implements it
 * (the contact submit is a real `<button type="submit">`, which an anchor can't be,
 * so it consumes this class string rather than the component). Colour/bg/border
 * transitions ride the global interaction clock; only the local active-scale is here.
 */
export function primaryPillClasses({ onDark = false }: { onDark?: boolean } = {}) {
  return cn(
    "group inline-flex h-[52px] items-center gap-3 rounded-full border px-7 text-sm tracking-wide active:scale-[0.99]",
    onDark
      ? "border-paper/45 text-paper hover:border-paper hover:bg-paper hover:text-ink"
      : "border-ink/35 text-ink hover:border-ink hover:bg-ink hover:text-paper",
  );
}

/**
 * The CTA system (v2). Two editorial roles, one warm language:
 *
 * - **primary** — a pill (radius 999px, 52px tall) with a *thin* border and no
 *   fill at rest; on hover the surface fills gently (ink on light, paper on dark)
 *   and the arrow advances ~5px. The fill/colour transition rides the global
 *   interaction clock (~250–300ms, globals.css); only the arrow's transform is
 *   local. Used sparingly — one primary per viewport.
 * - **secondary** — a quiet text link: an underline *draws* from the left and the
 *   arrow advances. No border, no box, no fill — ever.
 *
 * Transform/opacity only; reduced-motion collapses these to instant via the
 * global rule; touch targets ≥44px.
 */
export function ButtonLink({
  href,
  children,
  variant = "primary",
  onDark = false,
  className,
}: {
  href: string;
  children: ReactNode;
  variant?: Variant;
  onDark?: boolean;
  className?: string;
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
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        {inner}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {inner}
    </Link>
  );
}

function PrimaryInner({ children }: { children: ReactNode }) {
  return (
    <>
      <span>{children}</span>
      <span
        aria-hidden
        className="transition-transform duration-300 ease-[var(--ease-arrive)] group-hover:translate-x-[5px]"
      >
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
      <span
        aria-hidden
        className="transition-transform duration-300 ease-[var(--ease-arrive)] group-hover:translate-x-[5px]"
      >
        →
      </span>
      {/* Resting hairline + drawing clay underline */}
      <span
        aria-hidden
        className="absolute bottom-0 left-0 h-px w-full bg-current opacity-20"
      />
      <span
        aria-hidden
        className="absolute bottom-0 left-0 h-px w-full origin-left scale-x-0 bg-clay transition-transform duration-500 ease-[var(--ease-arrive)] group-hover:scale-x-100"
      />
    </span>
  );
}
