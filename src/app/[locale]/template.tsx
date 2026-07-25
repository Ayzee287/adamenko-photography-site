"use client";

// Page transition — the film cuts between chapters. Next re-mounts a template on every
// navigation, so the new page develops in (fade + a short rise). The very first paint is
// NEVER animated (a module flag, only ever set on the client via the effect — so SSR is
// always the un-animated first frame and hydration matches) → the hero LCP is untouched;
// the `backwards` fill leaves no lingering transform to trap the fixed grain/lightbox.
// Reduced-motion collapses it to an instant cut (chambre.css backstop).

import { useEffect, useState } from "react";

let navigated = false;

export default function Template({ children }: { children: React.ReactNode }) {
  // Lazy init reads the flag once at mount: false on the first paint, true thereafter.
  const [animate] = useState(() => navigated);
  useEffect(() => {
    navigated = true;
  }, []);
  return <div className={animate ? "ch-page-enter" : undefined}>{children}</div>;
}
