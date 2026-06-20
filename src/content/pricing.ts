// Pricing: transparent in structure, honest in numbers (D012). The section and
// "ce qui est inclus" exist now; a real `priceFrom` renders "à partir de N €" only
// once the photographer sets it — a package without a figure shows "Tarif sur
// demande". No fabricated prices, ever. Inclusions below are a DRAFT to confirm
// with the photographer (structure is safe; wording is hers to approve).

export type PricePackage = {
  name: string;
  summary: string;
  /** EUR. Omitted until the photographer sets it — never invented. */
  priceFrom?: number;
  includes: string[];
};

// NOTE: the FAQ moved to content/faq.ts (expanded + categorised). Pricing now holds
// only the package structure (unchanged).

export const pricing = {
  currency: "EUR",
  packages: [
    {
      name: "Séance",
      summary: "Famille, grossesse, couple ou portrait — chez vous ou en extérieur.",
      // priceFrom: TODO(operator) — set the real starting figure; leave unset until then.
      includes: [
        "1 à 2 heures, un lieu",
        "Préparation et repérage ensemble",
        "Galerie privée en ligne",
        "Photographies retouchées en haute définition",
        "Droits d'usage privé",
      ],
    },
    {
      name: "Mariage",
      summary: "Le récit d'une journée, de la préparation à la fête.",
      // priceFrom: TODO(operator) — set the real starting figure.
      includes: [
        "Demi-journée ou journée complète",
        "Rendez-vous de préparation",
        "Galerie privée en ligne",
        "Photographies retouchées en haute définition",
        "Options album et tirages",
      ],
    },
  ] as PricePackage[],
} as const;
