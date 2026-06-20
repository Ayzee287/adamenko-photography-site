// FAQ model (real-content launch pass) — expanded from the original four entries
// (previously in content/pricing.ts) into the questions people actually ask before
// booking, written in the brand voice. `category` lets a future redesign group them;
// the current /prestations page renders them as a flat accordion. Confirm wording
// with the photographer. See docs/content-collection/faq-questionnaire.md.

export type FaqCategory = "reservation" | "seance" | "livraison" | "deplacement" | "approche";

export type FaqItem = {
  q: string;
  a: string;
  category: FaqCategory;
};

export const faq = {
  title: "Questions fréquentes",
  intro:
    "Quelques réponses pour préparer votre projet. Une autre question ? Écrivez-moi, je réponds avec plaisir.",
  items: [
    {
      category: "reservation",
      q: "Comment réserver une séance ?",
      a: "Écrivez-moi via le formulaire de contact avec la date, le lieu et ce que vous imaginez. On échange, puis je vous envoie un devis adapté ; la date est bloquée à la réservation.",
    },
    {
      category: "reservation",
      q: "Combien de temps à l'avance faut-il réserver ?",
      a: "Pour une séance, quelques semaines suffisent en général. Pour un mariage, mieux vaut s'y prendre plusieurs mois à l'avance, surtout en haute saison.",
    },
    {
      category: "approche",
      q: "Et si on n'est pas à l'aise devant l'objectif ?",
      a: "C'est le cas de presque tout le monde, et c'est mon métier de vous mettre à l'aise. On avance doucement, sans poses figées ; les vraies images arrivent quand on oublie l'appareil.",
    },
    {
      category: "approche",
      q: "Quel est votre style de photographie ?",
      a: "Une approche documentaire, en lumière naturelle : je privilégie les vrais moments et les interactions sincères aux poses parfaites. Je travaille aussi bien en couleur qu'en noir et blanc.",
    },
    {
      category: "approche",
      q: "Faites-vous des photos posées ?",
      a: "Très peu, et toujours en douceur. Quelques portraits posés sont possibles (à deux lors d'un mariage, par exemple), mais l'essentiel reste les moments vécus.",
    },
    {
      category: "seance",
      q: "Où ont lieu les séances ?",
      a: "À Lyon et dans les environs, chez vous ou en extérieur. Je me déplace aussi en France, en Europe et à l'étranger pour les projets qui le demandent.",
    },
    {
      category: "seance",
      q: "Que faut-il prévoir pour la séance ?",
      a: "Surtout d'être vous-mêmes. Je vous envoie quelques conseils simples avant la séance (tenues, lieu, moment de la journée) ; rien de compliqué.",
    },
    {
      category: "livraison",
      q: "Quand reçoit-on les photos ?",
      a: "Vous recevez un aperçu rapidement, puis la galerie complète sous quelques semaines selon la saison. Une livraison express est possible en option.",
    },
    {
      category: "livraison",
      q: "Sous quelle forme les photos sont-elles livrées ?",
      a: "Dans une galerie privée en ligne, en haute définition et prêtes à imprimer. Des albums et des tirages d'art sont disponibles en option.",
    },
    {
      category: "deplacement",
      q: "Travaillez-vous en dehors de la France ?",
      a: "Oui. Je suis basée à Lyon et disponible partout en Europe ; les projets internationaux sont étudiés au cas par cas. Les frais de déplacement sont convenus ensemble, en toute transparence.",
    },
  ] satisfies FaqItem[],
} as const;
