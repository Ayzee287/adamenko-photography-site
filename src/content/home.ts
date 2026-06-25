// Homepage content schema — the long-form conversion narrative (D010). One typed
// object per section so the page composes from data, French is canonical (D008),
// and a second locale wraps this later without touching components. All marketing
// copy is a careful DRAFT in the brand voice (warm, plain, first person); confirm
// every line with the photographer. Banned: "capturing moments", "passionate
// about", hype, fabricated facts. Personal first name is intentionally absent
// until supplied — never invented.

export const home = {
  // Hero is image-first (D021): no CTAs — curiosity, not conversion. A short
  // emotional headline + one supporting line, anchored low-left.
  hero: {
    kicker: "Photographe · Lyon",
    title: "Les moments qui restent.",
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
      "Quelques images choisies parmi les séances. La sélection complète vit dans les galeries.",
    cta: { label: "Voir toutes les galeries", href: "/galeries" },
  },

  // A magazine feature organised by EMOTION, not category (D021). The genre is a
  // quiet tag + link; the emotion leads. Editorial spreads, not a grid. With no
  // `src`, each scene renders a directed reserved frame — the spread is designed to
  // read as intentional on placeholders alone (v2); a real frame drops in with no
  // layout change. `hint` directs that frame. Copy is DRAFT — confirm with the
  // photographer.
  seances: {
    eyebrow: "Les séances",
    title: "Quatre émotions, une même tendresse.",
    scenes: [
      {
        slug: "familles",
        emotion: "Le lien",
        tag: "Famille",
        emotive: "Le brouhaha du dimanche matin, gardé pour toujours.",
        src: "/galleries/familles/familles-01.jpg",
        alt: "Une mère et son enfant, front contre front, dans les herbes au soleil couchant.",
      },
      {
        slug: "grossesse",
        emotion: "L'attente",
        tag: "Grossesse",
        emotive: "Ces semaines suspendues, juste avant que tout change.",
        src: "/galleries/grossesse/grossesse-05.jpg",
        alt: "Future maman en lumière naturelle, l'attente avant la naissance.",
      },
      {
        slug: "couples",
        emotion: "L'intimité",
        tag: "Couple",
        emotive: "La façon dont vous vous regardez quand personne ne regarde.",
        src: "/galleries/couples/couples-01.jpg",
        alt: "Un couple complice sous les halles, lumière chaude.",
      },
      {
        slug: "mariages",
        emotion: "La fête",
        tag: "Mariage",
        emotive: "Toute une journée, racontée comme vous l'avez vécue.",
        src: "/galleries/mariages/mariages-09.jpg",
        alt: "Les mariés portés par leurs invités, explosion de joie, en noir et blanc.",
      },
    ],
    also: { label: "Aussi : les portraits", href: "/galeries/portraits" },
    cta: { label: "Voir les galeries", href: "/galeries" },
  },

  pricing: {
    eyebrow: "Investissement",
    title: "Transparent, et adapté à vous.",
    intro:
      "Chaque projet est différent ; les formules ci-dessous posent le cadre. Le tarif exact dépend de la durée, du lieu et de ce que vous souhaitez garder.",
    fromLabel: "à partir de",
    onRequest: "Tarif sur demande",
    cta: { label: "Demander les tarifs", href: "/contact" },
    faqTitle: "Questions fréquentes",
  },

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
    title: "Avant de me confier votre histoire.",
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
    empty: "Les mots de mes clientes trouveront leur place ici, vrais et jamais inventés.",
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
