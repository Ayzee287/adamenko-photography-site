"use client";

import { useEffect, type ReactNode } from "react";

// Page transition (D060). A `template` re-mounts on every navigation (unlike a layout),
// so it is the right place to replay a per-route enter animation — but it also renders
// on the FIRST load, where animating would touch the hero LCP. So this gates the effect:
// the very first mount (initial load + its hydration) gets NO class on both server and
// client (identical DOM → no hydration mismatch, LCP untouched); every subsequent
// template mount is a client navigation and gets `.page-enter` (a quiet rise+fade on the
// `<main>` content — see motion.css). The header/footer/JSON-LD live in the layout,
// outside this wrapper, so they persist across navigations. `children` are server
// components passed through — the content graph never enters the client bundle.

// Module-scoped (survives navigations; never true during SSG, where the effect can't run
// → no prerendered HTML ever carries the class).
let hasNavigated = false;

export default function Template({ children }: { children: ReactNode }) {
  const animate = hasNavigated;
  useEffect(() => {
    hasNavigated = true;
  }, []);

  return <div className={animate ? "page-enter" : undefined}>{children}</div>;
}
