// FAQ model (real-content launch pass) — expanded from the original four entries
// (previously in content/pricing.ts) into the questions people actually ask before
// booking, written in the brand voice. `category` lets a future redesign group them;
// the current /prestations page renders them as a flat accordion. Confirm wording
// with the photographer. See docs/content-collection/faq-questionnaire.md.

export type FaqCategory = "reservation" | "seance" | "livraison" | "deplacement" | "approche";

/** Stable keys, so a page can cite a question without string-matching its text. */
export type FaqId =
  | "reserver"
  | "delai-reservation"
  | "confiance"
  | "style"
  | "poses"
  | "lieux"
  | "preparation"
  | "delai-livraison"
  | "livraison"
  | "deplacement";

export type FaqItem = {
  /** Referenced by content/service-dossier.ts to place a real answer on a dossier.
   *  Ids, not indices or text: the list is reordered and reworded, and a service page
   *  must never silently pick up whichever question happens to sit at position 3. */
  id: FaqId;
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
      id: "reserver",
      category: "reservation",
      q: "Comment réserver une séance ?",
      a: "Écrivez-moi via le formulaire de contact avec la date, le lieu et ce que vous imaginez. On échange, puis je vous envoie un devis adapté ; la date est bloquée à la réservation.",
    },
    {
      id: "delai-reservation",
      category: "reservation",
      q: "Combien de temps à l'avance faut-il réserver ?",
      a: "Pour une séance, quelques semaines suffisent en général. Pour un mariage, mieux vaut s'y prendre plusieurs mois à l'avance, surtout en haute saison.",
    },
    {
      id: "confiance",
      category: "approche",
      q: "Et si on n'est pas à l'aise devant l'objectif ?",
      a: "C'est le cas de presque tout le monde, et c'est mon métier de vous mettre à l'aise. On avance doucement, sans poses figées ; les vraies images arrivent quand on oublie l'appareil.",
    },
    {
      id: "style",
      category: "approche",
      q: "Quel est votre style de photographie ?",
      a: "Une approche documentaire, en lumière naturelle : je privilégie les vrais moments et les interactions sincères aux poses parfaites. Je travaille aussi bien en couleur qu'en noir et blanc.",
    },
    {
      id: "poses",
      category: "approche",
      q: "Faites-vous des photos posées ?",
      a: "Très peu, et toujours en douceur. Quelques portraits posés sont possibles (à deux lors d'un mariage, par exemple), mais l'essentiel reste les moments vécus.",
    },
    {
      id: "lieux",
      category: "seance",
      q: "Où ont lieu les séances ?",
      a: "Chez vous ou en extérieur, en région lyonnaise le plus souvent, mais aussi ailleurs selon votre projet. Pour les mariages, je me déplace dans toute la France.",
    },
    {
      id: "preparation",
      category: "seance",
      q: "Que faut-il prévoir pour la séance ?",
      a: "Surtout d'être vous-mêmes. Je vous envoie quelques conseils simples avant la séance (tenues, lieu, moment de la journée) ; rien de compliqué.",
    },
    {
      id: "delai-livraison",
      category: "livraison",
      q: "Quand reçoit-on les photos ?",
      a: "Vous recevez un aperçu rapidement, puis la galerie complète sous quelques semaines selon la saison. Une livraison express est possible en option.",
    },
    {
      id: "livraison",
      category: "livraison",
      q: "Sous quelle forme les photos sont-elles livrées ?",
      a: "Dans une galerie privée en ligne, en haute définition. Vous téléchargez vos photos et les gardez pour toujours.",
    },
    {
      id: "deplacement",
      category: "deplacement",
      q: "Vous déplacez-vous pour les mariages ?",
      a: "Oui, dans toute la France. Je suis basée à Lyon ; pour les mariages, les frais de déplacement sont convenus ensemble, en toute transparence.",
    },
  ] satisfies FaqItem[],
} as const;
