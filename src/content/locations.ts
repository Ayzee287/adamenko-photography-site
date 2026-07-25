// Location / coverage model (real-content launch pass). Drives the "where I work"
// content, the LocalBusiness `areaServed`, and future per-location SEO. Structured
// so a new area is one entry. Reflects the real policy: based in Lyon, available
// family & maternity in Lyon, weddings throughout France (2026-07 policy).

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
  summary: "Basée à Lyon. Famille et grossesse à Lyon ; mariages dans toute la France.",
  areas: [
    {
      id: "lyon",
      label: "Lyon et ses environs",
      tier: "primary",
      schemaType: "City",
      note: "Famille et grossesse à Lyon, chez vous ou en extérieur, sans frais de déplacement dans l'agglomération.",
    },
    {
      id: "france",
      label: "France",
      tier: "regional",
      schemaType: "Country",
      note: "Mariages dans toute la France ; le déplacement est convenu ensemble, en toute transparence.",
    },
  ] satisfies Location[],
} as const;
