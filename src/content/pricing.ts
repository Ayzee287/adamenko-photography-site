// Pricing & investment — the SINGLE SOURCE OF TRUTH for the /tarifs surface. Two honest
// registers: portrait SESSIONS (family, maternity, couple & portrait — each its own
// service, each starting at the same 220 €) and the three WEDDING packages (flat prices,
// real coverage/deliverables/turnaround supplied by the studio). No fabricated numbers.

export type SessionType = {
  /** Matches a gallery genre slug (familles → /galeries/familles). */
  slug: string;
  name: string;
  summary: string;
  /** EUR. */
  price: number;
  /**
   * true → the client has fixed this price exactly (renders bare: "220 €").
   * false/absent → renders as a starting point ("à partir de 220 €").
   */
  exactPrice?: boolean;
  /**
   * Exact session length where the studio has fixed one. Family and maternity are
   * EXACTLY one hour (client, 2026-07-19) — not "up to", not a range. Omitted where the
   * length genuinely varies, rather than invented.
   */
  duration?: string;
  includes: string[];
};

export type WeddingPackage = {
  name: string;
  /** EUR — a flat package price (not "from"). */
  price: number;
  /** Hours of coverage, e.g. "Jusqu'à 5 heures". */
  coverage: string;
  /** Approx. edited-photo count, e.g. "Environ 300 photographies retouchées". */
  photos: string;
  /** Deliverables beyond coverage/photos (gallery, prints…). */
  includes: string[];
  /** Turnaround, e.g. "3 à 4 semaines". */
  delivery: string;
  /** Optional availability caveat (package 1). */
  note?: string;
  /** The one the studio recommends — highlighted in the layout. */
  recommended?: boolean;
};

export const pricing = {
  currency: "EUR",
  eyebrow: "Investissement",
  title: "Transparent, et adapté à vous.",
  intro:
    "Des tarifs clairs, pour savoir d'emblée à quoi vous attendre. Le reste se décide ensemble : le lieu, le rythme, ce que vous garderez.",
  fromLabel: "à partir de",
  onRequest: "Tarif sur demande",
  coverageLabel: "Couverture",
  deliveryLabel: "Livraison",
  // Teaser → the tarifs hub (no prices on the homepage).
  overviewCta: { label: "Voir les tarifs", href: "/tarifs" },

  // ── Portrait sessions — family & maternity are two independent services (clearer
  //    choice, more premium), couple & portrait share the same honest starting point.
  sessions: {
    eyebrow: "Séances",
    title: "Famille, maternité & portrait.",
    intro:
      "La séance famille et la séance maternité sont deux rendez-vous distincts : 220 €, une heure, à Lyon. Rien à calculer, rien à négocier.",
    durationLabel: "Durée",
    items: [
      {
        slug: "familles",
        name: "Famille",
        summary:
          "Une heure avec les vôtres, chez vous ou dehors, à Lyon. Les jeux, les câlins, le désordre tendre du quotidien.",
        price: 220,
        exactPrice: true,
        duration: "1 heure",
        includes: [
          "Un lieu, chez vous ou en extérieur",
          "Préparation et repérage ensemble",
          "Galerie privée en ligne",
          "Photographies retouchées en haute définition",
          "Droits d'usage privé",
        ],
      },
      {
        slug: "grossesse",
        name: "Maternité",
        summary:
          "Une heure pour garder une trace de l'attente : seule, à deux, ou avec les aînés. À Lyon, à votre rythme.",
        price: 220,
        exactPrice: true,
        duration: "1 heure",
        includes: [
          "Un lieu, chez vous ou en extérieur",
          "Un rythme calme, adapté à votre confort",
          "Galerie privée en ligne",
          "Photographies retouchées en haute définition",
          "Droits d'usage privé",
        ],
      },
      {
        slug: "couples",
        name: "Couple & portrait",
        summary: "Deux personnes, ou un portrait franc, sans poses figées.",
        price: 220,
        includes: [
          "En extérieur ou chez vous",
          "Des indications légères, jamais une chorégraphie",
          "Galerie privée en ligne",
          "Photographies retouchées en haute définition",
          "Droits d'usage privé",
        ],
      },
    ] as SessionType[],
  },

  // ── Weddings — three real packages, across France. Package 3 is the recommended one.
  wedding: {
    eyebrow: "Mariages",
    title: "Trois formules, partout en France.",
    intro:
      "De la cérémonie intime à la journée complète : trois formules claires, chacune racontée en reportage, en lumière naturelle.",
    recommendedLabel: "Recommandée",
    photosLabel: "Photographies",
    packages: [
      {
        name: "Essentiel",
        price: 650,
        coverage: "Jusqu'à 5 heures",
        photos: "Environ 300 photographies retouchées",
        includes: ["Galerie privée en ligne"],
        delivery: "3 à 4 semaines",
        note: "En semaine, hors haute saison, ou en réservation de dernière minute, selon les disponibilités.",
      },
      {
        name: "Signature",
        price: 1100,
        coverage: "Jusqu'à 8 heures",
        photos: "Environ 450 photographies retouchées",
        includes: ["Galerie privée en ligne"],
        delivery: "6 à 8 semaines",
      },
      {
        name: "Grand jour",
        price: 1600,
        coverage: "Jusqu'à 10 heures",
        photos: "Environ 600 photographies retouchées",
        includes: ["Galerie privée en ligne"],
        delivery: "6 à 8 semaines",
        recommended: true,
      },
    ] as WeddingPackage[],
  },

  // Add-ons (rendered on /tarifs).
  addons: {
    eyebrow: "Options",
    title: "Pour aller plus loin.",
    items: [
      { title: "Heures supplémentaires", body: "Plus de temps ensemble, pour ne rien précipiter." },
      { title: "Lieux additionnels", body: "Un second décor qui compte pour vous." },
      { title: "Séance d'engagement", body: "Une séance à deux avant le mariage, pour être à l'aise le jour J." },
      { title: "Livraison express", body: "Vos images en priorité, sous quelques jours." },
      { title: "Sur mesure", body: "Une idée particulière ? Parlons-en, on s'adapte." },
    ],
  },
} as const;
