"use client";

// nav-item — sans/nav text; active = bronze underline (1px, 4px below —
// decoration-based so active and rest items keep identical layout);
// hover = the underline turn. Tone remapping rides the .surface-dark scope
// on the header, never per-item colors.

import Link from "next/link";
import { cn } from "@/lib/utils/cn";

export function NavItem(props: {
  href: string;
  label: string;
  active?: boolean;
}) {
  const { href, label, active = false } = props;
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "text-nav text-ink underline-offset-4 transition-colors duration-(--duration-standard) ease-(--ease-standard)",
        active
          ? "underline decoration-bronze decoration-1"
          : "no-underline hover:underline hover:decoration-ink hover:decoration-1",
      )}
    >
      {label}
    </Link>
  );
}
