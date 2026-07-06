// Homepage content schema — the long-form conversion narrative (D010). One typed
// object per section so the page composes from data, French is canonical (D008),
// and a second locale wraps this later without touching components. Copy is in the
// brand voice (warm, plain, first person, concrete — not mood words). Banned:
// "capturing moments", "passionate about", hype, fabricated facts.

export const home = {
  // Hero is image-first (D021): no CTAs — curiosity, not conversion. A short
  // emotional headline + one supporting line, anchored low-left.
  hero: {
    kicker: "Photographe · Lyon",
    title: "Des photos qui vous ressemblent.",
    scrollCue: "Faites défiler",
    // Real opening frame (2026-06-25): a documentary wedding moment on a terrace
    // over the hills at dusk — full-bleed, the headline sits low-left over the scrim.
    image: {
      src: "/home/hero.jpg",
      width: 1280,
      height: 853,
      alt: "Des mariés, bras levés face aux collines, sur une terrasse au crépuscule.",
    },
    imageHint:
      "Une étreinte, à la lumière chaude de fin de journée. La toute première chose que l'on ressent.",
  },

  // The manifesto (D021) — a print pull-quote, broken across lines.
  signature: [
    "Je photographie les liens.",
    "Une famille qui se serre, l'attente d'un enfant,",
    "deux personnes qui s'aiment.",
  ],

  about: {
    eyebrow: "La photographe",
    title: "Derrière l'objectif.",
    body: [
      "Je m'appelle Irina, photographe de famille à Lyon, ukrainienne d'origine et maman de trois enfants.",
      "Avocate de formation devenue photographe, je vous mets à l'aise puis je m'efface : ce sont les vrais moments qui m'intéressent, jamais les poses figées.",
    ],
    values: ["Chaleur", "Sincérité", "Présence", "Patience"],
    cta: { label: "En savoir plus", href: "/a-propos" },
    portraitAlt: "Portrait de la photographe",
    portraitLabel: "La photographe",
    portraitHint: "Un portrait franc. Regard direct, épaules de trois-quarts. Lumière douce de fenêtre.",
  },

  experience: {
    eyebrow: "L'expérience",
    title: "Simple, du premier message aux images.",
    intro:
      "D'une séance famille tranquille à la maison à tout un mariage, je veux que chaque étape soit simple et qu'elle vous ressemble.",
    steps: [
      {
        n: "01",
        title: "On se rencontre",
        body: "On échange sur votre projet, vos envies, ce qui compte vraiment pour vous.",
      },
      {
        n: "02",
        title: "On prépare ensemble",
        body: "Le lieu, le moment, le rythme : on cale tout ce qu'il faut pour être tranquille le jour venu.",
      },
      {
        n: "03",
        title: "La séance",
        body: "Je vous laisse vivre et je photographie ce qui arrive vraiment. Aucune pose figée.",
      },
      {
        n: "04",
        title: "La livraison",
        body: "Une galerie privée d'images retouchées, prêtes à imprimer et à transmettre.",
      },
    ],
  },

  gallery: {
    eyebrow: "Le travail",
    title: "Un aperçu, à faire défiler.",
    intro:
      "Quelques images, choisies parmi les séances récentes. La sélection complète est dans les galeries.",
    cta: { label: "Parcourir les galeries", href: "/galeries" },
  },

  // The genres, shown as an editorial feature (D021): each scene is a real frame,
  // a short concrete line, and a link to its gallery. Four DIFFERENT compositions
  // (split-left · split-right · full-width · full-bleed) keep the spread from
  // reading as a grid. Copy is plain and first person — what each séance is, not a
  // mood word.
  seances: {
    eyebrow: "Par thème",
    title: "Mes séances.",
    scenes: [
      {
        slug: "familles",
        title: "Familles",
        cta: "Voir la galerie",
        caption: "Le quotidien et les liens, à la maison ou dehors.",
        src: "/galleries/familles/familles-01.jpg",
        alt: "Une mère et son enfant, front contre front, dans les herbes au soleil couchant.",
      },
      {
        slug: "grossesse",
        title: "Grossesse",
        cta: "Voir la galerie",
        caption: "Les semaines douces avant l'arrivée du bébé.",
        src: "/galleries/grossesse/grossesse-05.jpg",
        alt: "Future maman en lumière naturelle, l'attente avant la naissance.",
      },
      {
        slug: "couples",
        title: "Couples",
        cta: "Voir la galerie",
        caption: "Deux personnes, sans poses figées.",
        src: "/galleries/couples/couples-01.jpg",
        alt: "Un couple complice sous les halles, lumière chaude.",
      },
      {
        slug: "mariages",
        title: "Mariages",
        cta: "Voir la galerie",
        caption: "Votre journée, des préparatifs à la fête.",
        src: "/galleries/mariages/mariages-09.jpg",
        alt: "Les mariés portés par leurs invités, explosion de joie, en noir et blanc.",
      },
    ],
    cta: { label: "Voir toutes les galeries", href: "/galeries" },
  },

  // A quiet destination trio (D018) — replaces the inline FAQ; sits after add-ons so
  // pricing stays uninterrupted. De-carded to a placeholder-first editorial trio
  // (v2): each is a reserved frame with its caption set below, so it reads as
  // intentional with no photography and accepts a real frame with no layout change.
  // FAQ content now lives on /prestations. `hint` directs each frame.
  discover: {
    // Eyebrow distinct from the add-ons title "Pour aller plus loin." just above it
    // (v4) — the same phrase twice in adjacent sections read as a copy bug once the
    // rhythm tightened. "Pour découvrir" keeps the invitation, drops the echo.
    eyebrow: "Pour découvrir",
    title: "Avant de me contacter.",
    cards: [
      {
        label: "L'expérience",
        title: "À quoi s'attendre",
        href: "/prestations",
        image: { src: "/galleries/familles/familles-04.jpg", alt: "" },
        hint: "Un détail tendre d'une séance : des mains, un regard hors-champ.",
      },
      {
        label: "Infos pratiques",
        title: "Questions fréquentes",
        href: "/prestations#faq",
        image: { src: "/galleries/couples/couples-06.jpg", alt: "" },
        hint: "Un instant calme, en attente, dans la lumière d'une fin d'après-midi.",
      },
      {
        label: "À propos",
        title: "Rencontrer la photographe",
        href: "/a-propos",
        image: { src: "/about/portrait-irina.jpg", alt: "" },
        hint: "La photographe dans son élément, un geste entre deux prises.",
      },
    ],
  },

  testimonials: {
    eyebrow: "Elles en parlent",
    title: "La confiance, avant tout.",
    // Reserved-by-choice (v3 QA): frames the absence as integrity, not "coming soon".
    empty: "Les avis de mes clientes apparaîtront ici. De vrais mots, jamais inventés.",
    /** Accessible name of the review carousel (scroll region). */
    carouselLabel: "Avis clients Google",
    /** Card truncation toggle — shown only when a review is long enough to clamp. */
    readMore: "Lire la suite",
    readLess: "Réduire",
    /** Aggregate line under the carousel; {rating} and {count} are replaced. */
    summary: "Note Google {rating} / 5 · d'après {count} avis",
    /** Per-card source attribution — quiet, next to the rating. */
    attribution: "Avis Google",
    /** Translation toggle (shown only when the review was written in another
     *  language and Google provides a translation). */
    viewOriginal: "Voir l'original",
    viewTranslation: "Voir la traduction",
  },

  finalCta: {
    eyebrow: "Contact",
    title: "Travaillons ensemble.",
    body: "Parlez-moi de votre projet : la date, le lieu, ce que vous imaginez. Je réponds sous quelques jours.",
    locationLabel: "Basée à",
    location: "Lyon, France",
    availabilityLabel: "Disponibilité",
    availability: "À Lyon et partout dans le monde.",
    cta: { label: "Me contacter", href: "/contact" },
    instagramLabel: "Suivre sur Instagram",
  },
} as const;
