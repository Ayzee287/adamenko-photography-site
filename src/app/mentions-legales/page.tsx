import type { Metadata } from "next";
import { LegalDocumentView } from "@/components/legal/legal-document";
import { mentionsLegales } from "@/content/legal";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: mentionsLegales.title,
  description: mentionsLegales.intro,
  path: "/mentions-legales",
});

export default function MentionsLegalesPage() {
  return <LegalDocumentView doc={mentionsLegales} />;
}
