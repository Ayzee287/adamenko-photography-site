// A single, boring way to put a JSON-LD graph on a page.
//
// The root layout injects the site-wide LocalBusiness node itself; this is for the
// PER-PAGE nodes (FAQPage, BreadcrumbList), which must appear only on the page whose
// content they describe. Server component, no client cost: it renders one script tag.

export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
