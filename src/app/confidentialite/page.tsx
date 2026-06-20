import type { Metadata } from "next";
import { LegalDocumentView } from "@/components/legal/legal-document";
import { confidentialite } from "@/content/legal";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: confidentialite.title,
  description: confidentialite.intro,
  path: "/confidentialite",
});

export default function ConfidentialitePage() {
  return <LegalDocumentView doc={confidentialite} />;
}
