// skip-link — first focusable element; visually hidden until keyboard focus
// (V1's production pattern, restyled with V2 tokens: paper, hairline, label
// type, inset space/3, z-skip). Target: the layout's main#main.

import { getDictionary } from "@/lib/dictionary";
import { getRequestLocale } from "@/lib/request-locale";

export function SkipLink() {
  const t = getDictionary(getRequestLocale()).ui;
  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-skip focus:border focus:border-hairline focus:bg-paper focus:px-5 focus:py-3 focus:text-label focus:text-ink"
    >
      {t.skipToContent}
    </a>
  );
}
