// The site's single "return to the top" behaviour, shared by the floating back-to-top
// control and the header wordmark (when already on the homepage) — one mechanism, not two.
// Glides to the top (respecting reduced-motion, where it jumps) and hands focus to the
// main landmark so a keyboard visitor lands where they can Tab straight back into the header.

export function scrollToTop() {
  const reduce =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  document.getElementById("main")?.focus({ preventScroll: true });
}
