// text-link — whisper/contextual asks and inline actions. Rest underline in
// the secondary tone, hover completes to primary (the turn) + arrow nudge.
// Internal hrefs are Next links; external/mailto render plain anchors.

import Link from "next/link";
import { cn } from "@/lib/utils/cn";

const classes = cn(
  "group inline-flex items-center gap-2 text-button text-ink",
  "underline decoration-ink-secondary underline-offset-4 decoration-1",
  "transition-colors duration-(--duration-standard) ease-(--ease-standard)",
  "hover:decoration-ink active:opacity-(--opacity-press)",
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

export function TextLink(props: {
  href: string;
  showArrow?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  const { href, showArrow = false, onClick, children } = props;
  const isExternal = /^(https?:|mailto:|tel:)/.test(href);
  if (isExternal) {
    return (
      <a
        href={href}
        onClick={onClick}
        target={href.startsWith("http") ? "_blank" : undefined}
        rel={href.startsWith("http") ? "noreferrer noopener" : undefined}
        className={classes}
      >
        {children}
        {showArrow && <Arrow />}
      </a>
    );
  }
  return (
    <Link href={href} onClick={onClick} className={classes}>
      {children}
      {showArrow && <Arrow />}
    </Link>
  );
}
