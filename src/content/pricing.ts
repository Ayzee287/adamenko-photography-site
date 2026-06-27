// Pricing & investment — the SINGLE SOURCE OF TRUTH for the services/investment
// surface (D012 + P1 IA consolidation). Transparent in structure, honest in numbers:
// a real `priceFrom` renders "à partir de N €"; otherwise "Tarif sur demande". No
// fabricated prices, ever. This content renders ONCE, on /prestations (the canonical
// services funnel); the homepage shows only a teaser that links here.

export type PricePackage = {
  name: string;
  summary: string;
  /** EUR. Omitted until the photographer sets it — never invented. */
  priceFrom?: number;
  includes: string[];
};

export const pricing = {
  currency: "EUR",
  // Investment section copy (rendered on /prestations).
  eyebrow: "Investissement",
  title: "Transparent, et adapté à vous.",
  intro:
    "Chaque projet est différent ; les formules ci-dessous posent le cadre. Le tarif exact dépend de la durée, du lieu et de ce que vous souhaitez garder.",
  fromLabel: "à partir de",
  onRequest: "Tarif sur demande",
  // Homepage teaser → the full services page (no prices on the homepage).
  overviewCta: { label: "Voir les prestations", href: "/prestations" },
  packages: [
    {
      name: "Séance",
      summary: "Famille, grossesse, couple ou portrait, chez vous ou en extérieur.",
      // priceFrom intentionally unset — inquiry-only (renders "Tarif sur demande").
      // Add a figure to display "à partir de N €".
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
      // priceFrom intentionally unset — inquiry-only (renders "Tarif sur demande").
      includes: [
        "Demi-journée ou journée complète",
        "Rendez-vous de préparation",
        "Galerie privée en ligne",
        "Photographies retouchées en haute définition",
        "Options album et tirages",
      ],
    },
  ] as PricePackage[],
  // Add-ons (rendered on /prestations).
  addons: {
    eyebrow: "Options",
    title: "Pour aller plus loin.",
    items: [
      { title: "Heures supplémentaires", body: "Plus de temps ensemble, pour ne rien précipiter." },
      { title: "Lieux additionnels", body: "Un second décor qui compte pour vous." },
      { title: "Album premium", body: "Un livre imprimé, fait pour durer et se transmettre." },
      { title: "Livraison express", body: "Vos images en priorité, sous quelques jours." },
      { title: "Tirages d'art", body: "Des impressions soignées, prêtes à accrocher." },
      { title: "Sur mesure", body: "Une idée particulière ? Parlons-en, on s'adapte." },
    ],
  },
} as const;
