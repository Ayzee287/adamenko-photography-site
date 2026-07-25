// pill-button — the only button (Component Library §6/Addendum: height 52,
// padding-x space/6, radius pill, 1px outline; rest border = secondary tone,
// hover = primary + arrow nudge; the .surface-dark scope remaps tones).
// Built in P7 because two frozen chrome components (menu-dialog CTA) and the
// close band/submit (P10/P11) require it — the sanctioned shared case.

import Link from "next/link";
import { cn } from "@/lib/utils/cn";

const pillClasses = cn(
  "group inline-flex items-center justify-center gap-2",
  "h-(--size-control-pill) rounded-pill border border-ink-secondary px-6",
  "text-button text-ink bg-transparent",
  "transition-colors duration-(--duration-standard) ease-(--ease-standard)",
  "hover:border-ink active:opacity-(--opacity-press)",
  "disabled:border-hairline disabled:text-ink-disabled",
);

function Arrow() {
  return (
    <span
      aria-hidden
      className="transition-transform duration-(--duration-standard) ease-(--ease-standard) group-hover:translate-x-(--distance-nudge)"
    >
      →
    </span>
  );
}

export function PillButton(props: {
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  showArrow?: boolean;
  /** The census disabled state (button rendering only). */
  disabled?: boolean;
  /** Sending-state a11y flag (frozen submit contract: aria-busy while pending). */
  busy?: boolean;
  children: React.ReactNode;
}) {
  const {
    href,
    onClick,
    type = "button",
    showArrow = false,
    disabled,
    busy,
    children,
  } = props;
  if (href !== undefined) {
    return (
      <Link href={href} onClick={onClick} className={pillClasses}>
        {children}
        {showArrow && <Arrow />}
      </Link>
    );
  }
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-busy={busy || undefined}
      className={pillClasses}
    >
      {children}
      {showArrow && <Arrow />}
    </button>
  );
}
