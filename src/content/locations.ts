// Location / coverage model (real-content launch pass). Drives the "where I work"
// content, the LocalBusiness `areaServed`, and future per-location SEO. Structured
// so a new area is one entry. Reflects the real policy: based in Lyon, available
// across Europe, international considered case by case.

export type CoverageTier = "primary" | "regional" | "international";

export type Location = {
  /** Stable key. */
  id: string;
  /** Display label, French. */
  label: string;
  tier: CoverageTier;
  /** schema.org areaServed type. */
  schemaType: "City" | "AdministrativeArea" | "Country" | "Continent";
  /** One quiet line for content surfaces. */
  note: string;
};

export const locations = {
  base: {
    city: "Lyon",
    region: "Auvergne-Rhône-Alpes",
    country: "France",
    label: "Lyon, France",
  },
  /** Headline used wherever coverage is summarised (matches the homepage CTA tone). */
  summary: "Basée à Lyon, disponible partout en Europe — projets internationaux étudiés au cas par cas.",
  areas: [
    {
      id: "lyon",
      label: "Lyon et ses environs",
      tier: "primary",
      schemaType: "City",
      note: "Séances chez vous ou en extérieur, sans frais de déplacement dans l'agglomération.",
    },
    {
      id: "france",
      label: "France",
      tier: "regional",
      schemaType: "Country",
      note: "Déplacements dans toute la France pour les séances et les mariages.",
    },
    {
      id: "europe",
      label: "Europe",
      tier: "regional",
      schemaType: "Continent",
      note: "Disponible pour des projets partout en Europe ; le déplacement est convenu ensemble.",
    },
    {
      id: "international",
      label: "International",
      tier: "international",
      schemaType: "Continent",
      note: "Les projets hors d'Europe sont étudiés individuellement — parlons-en.",
    },
  ] satisfies Location[],
} as const;
