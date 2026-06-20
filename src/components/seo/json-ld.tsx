/**
 * Renders a JSON-LD block as a `<script type="application/ld+json">`. Server
 * component; the payload is serialised at build time. Kept tiny on purpose so any
 * page can drop structured data in (e.g. a future BreadcrumbList or ImageObject)
 * by passing a different object.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // Data is our own, built from typed content — no user input is interpolated.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
