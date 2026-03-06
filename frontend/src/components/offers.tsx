"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Offer {
  title: string;
  image: string;
  alt: string;
  description: string;
  extra?: string;
}

const offers: Offer[] = [
  {
    title: "Stage de formation",
    image: "/images/offre-stage-formation.jpg",
    alt: "Participants sous un abri en forêt",
    description:
      "Les stages sont la porte d'entrée au monde de l'autonomie en plein air. Venez apprendre ou consolider vos connaissances et pratiquer dans un cadre éducatif et familial. Accessible, peu importe votre condition physique. Disponible aux formats 4 h, 8 h, 48 h et plus.",
  },
  {
    title: "Camp immersif",
    image: "/images/offre-camp-immersif.jpg",
    alt: "Campement en pleine forêt",
    description:
      "Venez tester vos connaissances et aptitudes dans un événement en pleine nature. Construction d'abris naturels, bushcraft, bivouac, cuisine en pleine nature, cueillette, chasse et pêche. Comme nos arrière-grands-parents !",
    extra:
      "Nécessite une bonne forme physique pour les déplacements en milieu sauvage.",
  },
  {
    title: "Mentorat privé",
    image: "/images/offre-mentorat-prive.jpg",
    alt: "Lecture de carte et boussole",
    description:
      "Vous souhaitez définir vos besoins et votre niveau, pour vous, vos proches ou votre famille. Nous offrons également des stages et des camps immersifs privés.",
  },
];

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function Offers() {
  return (
    <section className="bg-white py-16" id="services">
      <div className="mx-auto max-w-[1100px] px-4">
        <p className="mb-8 text-center text-sm font-semibold uppercase tracking-widest text-brand-dark">
          Ce que nous offrons
        </p>

        <motion.div
          className="grid gap-8 md:grid-cols-3"
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {offers.map((offer) => (
            <motion.div key={offer.title} variants={fadeUp}>
              <Card className="h-full overflow-hidden border-0 shadow-md">
                <div className="relative aspect-[4/3]">
                  <Image
                    src={offer.image}
                    alt={offer.alt}
                    fill
                    className="object-cover"
                  />
                </div>
                <CardHeader>
                  <CardTitle className="text-xl">{offer.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p>{offer.description}</p>
                  {offer.extra && (
                    <p className="text-sm text-muted-foreground">
                      {offer.extra}
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
