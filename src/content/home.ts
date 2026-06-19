// Homepage content schema — the long-form conversion narrative (D010). One typed
// object per section so the page composes from data, French is canonical (D008),
// and a second locale wraps this later without touching components. All marketing
// copy is a careful DRAFT in the brand voice (warm, plain, first person); confirm
// every line with the photographer. Banned: "capturing moments", "passionate
// about", hype, fabricated facts. Personal first name is intentionally absent
// until supplied — never invented.

export const home = {
  hero: {
    kicker: "Photographe à Lyon",
    title: "Des images chaleureuses, fidèles à ceux qu'elles montrent.",
    subtitle:
      "Famille, grossesse, couple, portrait et mariage — à Lyon et partout où l'on m'emmène.",
    primary: { label: "Voir les galeries", href: "/galeries" },
    secondary: { label: "Me contacter", href: "/contact" },
    scrollCue: "Découvrir",
  },

  signature:
    "Je photographie les liens : une famille qui se serre, l'attente d'un enfant, deux personnes qui s'aiment.",

  about: {
    eyebrow: "La photographe",
    // TODO(operator): insert her real name once confirmed (e.g. "Bonjour, je suis …").
    title: "Derrière l'objectif.",
    body: [
      "Photographe à Lyon, je fais des images douces et sincères, faites pour durer.",
      "Mon approche est simple : vous mettre à l'aise, puis disparaître — pour que les vraies images arrivent d'elles-mêmes.",
    ],
    values: ["Chaleur", "Sincérité", "Présence", "Patience"],
    cta: { label: "En savoir plus", href: "/a-propos" },
    portraitAlt: "Portrait de la photographe",
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
        body: "Le lieu, le moment, le rythme — on cale tout ce qu'il faut pour être tranquille le jour venu.",
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

  services: {
    eyebrow: "Prestations",
    title: "Ce que je photographie.",
    intro:
      "Cinq univers, une même façon de faire : douce, présente, fidèle à vous.",
    items: [
      { slug: "familles", title: "Famille", valueProp: "Le quotidien et les liens — à la maison, dehors, ensemble." },
      { slug: "grossesse", title: "Grossesse", valueProp: "L'attente et la douceur des semaines qui précèdent." },
      { slug: "couples", title: "Couple", valueProp: "Deux personnes, un lien — sans poses figées." },
      { slug: "portraits", title: "Portrait", valueProp: "Un visage, une présence — simple et juste." },
      { slug: "mariages", title: "Mariage", valueProp: "Le récit d'une journée — l'émotion plutôt que la mise en scène." },
    ],
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

  testimonials: {
    eyebrow: "Elles en parlent",
    title: "La confiance, avant tout.",
    empty: "Les premiers témoignages arriveront ici très bientôt.",
  },

  finalCta: {
    eyebrow: "Contact",
    title: "Travaillons ensemble.",
    body: "Parlez-moi de votre projet — la date, le lieu, ce que vous imaginez. Je réponds sous quelques jours.",
    location: "Lyon, France",
    availability: "Disponible à Lyon et partout dans le monde.",
    cta: { label: "Me contacter", href: "/contact" },
    instagramLabel: "Suivre sur Instagram",
  },
} as const;
