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
  /** One introductory line naming who the package is for (client copy). */
  description?: string;
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
  // NB: the three eyebrows that RENDER are `sessions.eyebrow`, `wedding.eyebrow` and
  // `addons.eyebrow`. A page-level `eyebrow: "Investissement"` used to sit here and label the
  // chapter opening; the opening dropped it (it named a chapter whose body no longer exists)
  // and the string stayed behind, reachable from nothing. Removed rather than left to rot.
  // The chapter names itself, as every other chapter on the site does — "Galeries",
  // "Prestations", "Contact", "À propos". The old title ("Transparent, et adapté à vous.")
  // was a claim, not a name: it promised in the abstract what the two section leads and the
  // FAQ already state concretely, and it left the page's <h1> reading as a subtitle above a
  // larger section <h2>. Nothing factual was lost — `intro` below still carries the promise
  // where it does work, in the search result.
  title: "Tarifs",
  intro:
    "Des tarifs clairs, pour savoir d'emblée à quoi vous attendre. Le reste se décide ensemble : le lieu, le rythme, ce que vous garderez.",
  fromLabel: "à partir de",
  onRequest: "Tarif sur demande",
  coverageLabel: "Couverture",
  deliveryLabel: "Livraison",
  // Teaser → the tarifs hub (no prices on the homepage).
  overviewCta: { label: "Voir les tarifs", href: "/tarifs" },

  // ── The three SESSIONS — family, maternity and couple are independent services at the
  //    same honest starting point. (Portrait was retired as a standalone category; the
  //    couple session still covers a portrait, which is why its NAME keeps the word.)
  sessions: {
    eyebrow: "Séances",
    title: "Famille, maternité & couple.",
    intro:
      "Trois séances distinctes, au même tarif. On choisit ensemble le lieu et le rythme : chez vous, en extérieur, là où vous serez le plus à l'aise.",
    durationLabel: "Durée",
    items: [
      {
        slug: "familles",
        name: "Famille",
        summary:
          "Avec les vôtres, chez vous ou en extérieur : les jeux, les câlins, le désordre tendre du quotidien.",
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
          "Pour garder une trace de l'attente : seule, à deux, ou avec les aînés, à votre rythme.",
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
        exactPrice: true,
        duration: "1 heure",
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
        // ONE name. "Pack essentiel" over "Pack mini": it parallels "Pack classique" (the
        // two lower tiers share a form, so the three read as one ladder), it names what the
        // package CONTAINS rather than how small the client's day is, and "mini" is a
        // retail word in a register that says "Grand jour".
        name: "Pack essentiel",
        price: 650,
        description:
          "Idéale pour les mariages civils, petites cérémonies ou journées en semaine.",
        coverage: "Jusqu'à 3 heures",
        photos: "Environ 300 photographies retouchées",
        includes: ["Galerie privée en ligne"],
        delivery: "3 à 4 semaines",
      },
      {
        name: "Pack classique",
        price: 1100,
        description:
          "Une couverture idéale pour capturer les moments clés de votre mariage en toute simplicité.",
        coverage: "Jusqu'à 8 heures",
        photos: "Environ 450 photographies retouchées",
        includes: ["Galerie privée en ligne"],
        delivery: "6 à 8 semaines",
      },
      {
        name: "Grand jour",
        price: 1600,
        description:
          "La couverture idéale pour vivre votre mariage sereinement du début de journée jusqu'au début de soirée (23:00).",
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
      { id: "heures", title: "Heures supplémentaires", body: "Plus de temps ensemble, pour ne rien précipiter." },
      { id: "lieux", title: "Lieux additionnels", body: "Un second décor qui compte pour vous." },
      { id: "engagement", title: "Séance d'engagement", body: "Une séance à deux avant le mariage, pour être à l'aise le jour J." },
      { id: "express", title: "Livraison express", body: "Vos images en priorité, sous quelques jours." },
      { id: "sur-mesure", title: "Sur mesure", body: "Une idée particulière ? Parlons-en, on s'adapte." },
    ],
  },
} as const;
