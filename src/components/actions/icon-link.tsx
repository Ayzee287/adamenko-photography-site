// icon-link — 20px glyph centered in a 44px target (Component Library §8).
// Built in P7 because two frozen chrome components (menu-dialog, footer)
// require it. Brand glyphs (Instagram/Facebook) reuse V1's production paths —
// official brand geometry outranks the 1.5px-stroke rule that governs UI
// glyphs (reconciliation note, recorded).

// The envelope is drawn SOLID, like the two brand marks, rather than as the 1.5px-stroke
// outline the UI glyphs use. The three sit side by side as one contact group, and a stroked
// glyph beside two filled ones reads a weight lighter — optical consistency inside the group
// outranks the stroke rule here, the same reconciliation the brand paths already made.
const paths: Record<"instagram" | "facebook" | "email", string> = {
  instagram:
    "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z",
  facebook:
    "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
  email:
    "M2.4 6.6A2.6 2.6 0 0 1 5 4h14a2.6 2.6 0 0 1 2.6 2.6v.25l-9.6 5.9-9.6-5.9V6.6Zm0 2.65 9.16 5.63a.85.85 0 0 0 .88 0l9.16-5.63v8.15A2.6 2.6 0 0 1 19 20H5a2.6 2.6 0 0 1-2.6-2.6V9.25Z",
};

export function IconLink(props: {
  icon: "instagram" | "facebook" | "email";
  href: string;
  label: string;
}) {
  const { icon, href, label } = props;
  // A mailto hands off to the visitor's mail client; opening it in a new tab leaves a blank
  // window behind, so only true external destinations get target/rel.
  const external = /^https?:/i.test(href);
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noreferrer noopener" } : {})}
      aria-label={label}
      className="flex h-(--size-target-min) w-(--size-target-min) items-center justify-center text-ink-secondary transition-colors duration-(--duration-standard) hover:text-ink active:opacity-(--opacity-press)"
    >
      <svg
        viewBox="0 0 24 24"
        className="h-(--size-icon) w-(--size-icon)"
        fill="currentColor"
        aria-hidden
      >
        <path d={paths[icon]} />
      </svg>
    </a>
  );
}
