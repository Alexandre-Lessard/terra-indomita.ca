// Questions people actually ask before signing up. Also published as FAQPage
// structured data: these are public commitments, change them with the organizer.
export interface FaqItem {
  question: string;
  answer: string;
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: "Est-ce un cours de survie en forêt ?",
    answer:
      "Pas au sens de « quoi faire une fois perdu ». On apprend à ne pas se perdre, à rester au chaud, au sec et hydraté, et à planifier ses sorties en sécurité. Ceux qui cherchent un cours de survie y trouvent les bases, dans un esprit d'autonomie plutôt que d'urgence.",
  },
  {
    question: "Enseignez-vous la pêche, la chasse ou le piégeage ?",
    answer:
      "La pêche, oui, dans le respect de la réglementation du Québec : chaque participant détient son permis de pêche, et nous suivons les saisons et les limites. La chasse et le piégeage (collets), non : nous apprenons à reconnaître les traces et à comprendre le comportement des animaux, pas à les capturer.",
  },
  {
    question: "Où se déroulent les activités ?",
    answer:
      "En Montérégie, sur un terrain privé dont l'adresse exacte est transmise après l'inscription. D'autres terrains s'ajouteront ailleurs au Québec : le calendrier dit où et quand.",
  },
  {
    question: "À qui s'adressent les stages ?",
    answer:
      "À tout âge et à toute condition physique pour les stages de formation, en famille, entre amis ou en groupe. Les camps immersifs demandent une bonne forme physique pour les déplacements en milieu sauvage.",
  },
];
