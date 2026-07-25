// The service ↔ genre slug bridge. The route registry keys services by ServiceSlug
// (famille, couple…) while the service/gallery CONTENT keys by GenreSlug (familles,
// couples…). This is the single, typed map between the two vocabularies, so pages
// never hand-roll the correspondence (grossesse is the one that coincides).

import type { GenreSlug, ServiceSlug } from "@/lib/routes";

export const serviceForGenre: Record<GenreSlug, ServiceSlug> = {
  familles: "famille",
  couples: "couple",
  grossesse: "grossesse",
  mariages: "mariage",
  portraits: "portrait",
};

export const genreForService: Record<ServiceSlug, GenreSlug> = {
  famille: "familles",
  couple: "couples",
  grossesse: "grossesse",
  mariage: "mariages",
  portrait: "portraits",
};
