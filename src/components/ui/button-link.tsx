import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary";

/**
 * The CTA system (D019). Two roles, one warm language:
 * - **primary (emotional)** — a filled, tactile button: on light surfaces a clay
 *   layer *wipes* behind the label on hover (the accent's one expressive moment);
 *   the arrow advances; soft active-scale. On dark bands: paper fill, no wipe
 *   (contrast), just an advancing arrow + a gentle bg settle.
 * - **secondary (informational)** — a quiet link whose underline *draws* from the
 *   left, with an advancing arrow.
 *
 * Transform/opacity only; ~400–500ms; reduced-motion collapses these to instant
 * via the global rule (globals.css); touch targets ≥44px.
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
      <PrimaryInner onDark={onDark}>{children}</PrimaryInner>
    ) : (
      <SecondaryInner onDark={onDark}>{children}</SecondaryInner>
    );

  const base =
    variant === "primary"
      ? "group relative inline-flex items-center gap-3 overflow-hidden px-7 py-4 text-sm tracking-wide active:scale-[0.98]"
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

function PrimaryInner({
  children,
  onDark,
}: {
  children: ReactNode;
  onDark: boolean;
}) {
  return (
    <>
      {/* Base fill */}
      <span
        aria-hidden
        className={cn(
          "absolute inset-0",
          onDark ? "bg-paper group-hover:bg-paper/90" : "bg-ink",
        )}
      />
      {/* Clay wipe — light surfaces only */}
      {!onDark ? (
        <span
          aria-hidden
          className="absolute inset-0 -translate-x-full bg-clay transition-transform duration-500 ease-[var(--ease-arrive)] group-hover:translate-x-0"
        />
      ) : null}
      <span className={cn("relative", onDark ? "text-ink" : "text-paper")}>
        {children}
      </span>
      <span
        aria-hidden
        className={cn(
          "relative transition-transform duration-500 ease-[var(--ease-arrive)] group-hover:translate-x-1",
          onDark ? "text-ink" : "text-paper",
        )}
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
        className="transition-transform duration-500 ease-[var(--ease-arrive)] group-hover:translate-x-1"
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
