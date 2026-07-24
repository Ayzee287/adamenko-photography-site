"use client";

// nav-item — sans/nav text; active = bronze underline (1px, 4px below —
// decoration-based so active and rest items keep identical layout);
// hover = the underline turn. Tone remapping rides the .surface-dark scope
// on the header, never per-item colors.

import Link from "next/link";
import { cn } from "@/lib/utils/cn";

// nav-item — a floating-nav destination. Rest = ash; hover/focus draws a bone underline
// in from the left; active = bone label with the underline held in ember. Motion is the
// wayfinding (chambre.css .ch-navlink).

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
      className={cn("ch-navlink", active && "is-active")}
    >
      {label}
    </Link>
  );
}
