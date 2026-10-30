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
      "C'est beaucoup plus que de la survie. La survie, c'est quoi faire une fois perdu ; ici, on apprend à ne pas se perdre, à planifier ses sorties en sécurité et à combler ses besoins de base en forêt : s'orienter, s'abriter, faire du feu, trouver de l'eau, reconnaître les arbres et les plantes. Des stages pédagogiques, pour tous, dans un cadre sécuritaire.",
  },
  {
    question: "Enseignez-vous la pêche, la chasse ou le piégeage ?",
    answer:
      "Non. La pêche peut faire l'objet d'une démonstration, dans le respect de la réglementation du Québec, mais elle n'est pas enseignée pour l'instant. La chasse et le piégeage (collets) ne le sont pas non plus : nous apprenons à reconnaître les traces et à comprendre le comportement des animaux, pas à les capturer.",
  },
  {
    question: "Où se déroulent les activités ?",
    answer:
      "Principalement en Montérégie, sur des terrains privés. La municipalité est indiquée pour chaque événement ; l'adresse exacte est transmise après l'inscription. D'autres terrains s'ajouteront ailleurs au Québec : le calendrier dit où et quand.",
  },
  {
    question: "À qui s'adressent les stages ?",
    answer:
      "À tout âge et à toute condition physique pour les stages de formation, en famille, entre amis ou en groupe. Les camps immersifs demandent une bonne forme physique pour les déplacements en milieu sauvage.",
  },
];
