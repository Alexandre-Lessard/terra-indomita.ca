"use client";

import Image from "next/image";
import { motion, type Variants } from "framer-motion";

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
      "Les stages sont la porte d'entrée de l'autonomie en plein air. Apprenez à vous orienter, à préparer une sortie en sécurité et à combler vos besoins de base en forêt, dans un cadre éducatif et familial. Pour tous les âges, peu importe votre condition physique. Offerts aux formats 4 h, 8 h, 48 h et plus.",
  },
  {
    title: "Camp immersif",
    image: "/images/offre-camp-immersif.jpg",
    alt: "Campement en pleine forêt",
    description:
      "Mettez vos connaissances en pratique pendant quelques jours en pleine nature : abris naturels, feu, eau potable, bivouac, cuisine en forêt, cueillette, pêche et pose de collets. Comme nos arrière-grands-parents, en bonne compagnie !",
    extra:
      "Nécessite une bonne forme physique pour les déplacements en milieu sauvage.",
  },
  {
    title: "Mentorat privé",
    image: "/images/offre-mentorat-prive.jpg",
    alt: "Lecture de carte et boussole",
    description:
      "Un accompagnement adapté à vos besoins et à votre niveau, pour vous, vos proches ou votre famille : préparer une expédition, gagner en confiance en forêt ou approfondir une compétence. Nous offrons aussi des stages et des camps immersifs privés.",
  },
];

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.18 } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export function Offers() {
  return (
    <section className="bg-white py-24" id="services">
      <div className="mx-auto max-w-[1100px] px-4">
        <motion.p
          className="mb-12 text-center text-xl font-semibold uppercase tracking-[0.2em] text-[#1c3120]"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Ce que nous offrons
        </motion.p>

        <motion.div
          className="grid gap-8 md:grid-cols-3"
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {offers.map((offer) => (
            <motion.div
              key={offer.title}
              variants={fadeUp}
              className="group h-full overflow-hidden rounded-2xl border border-[rgba(20,32,18,0.12)] bg-white shadow-[0_4px_24px_-8px_rgba(20,32,18,0.12)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_16px_48px_-12px_rgba(20,32,18,0.25)]"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={offer.image}
                  alt={offer.alt}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-6">
                <h3 className="mb-3 text-xl font-semibold text-[#0e2514]">
                  {offer.title}
                </h3>
                <p className="text-[1.05rem] leading-relaxed text-[rgba(14,37,20,0.8)]">
                  {offer.description}
                </p>
                {offer.extra && (
                  <p className="mt-3 text-sm text-[rgba(14,37,20,0.5)]">
                    {offer.extra}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
