"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export function About() {
  return (
    <section className="bg-brand-dark py-24 text-brand-light" id="presentation">
      <div className="mx-auto grid max-w-[1100px] grid-cols-[repeat(auto-fit,minmax(280px,1fr))] items-center gap-16 px-4">
        <motion.div
          className="flex justify-center"
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <Image
            src="/images/about-forest.jpg"
            alt="Ruisseau bordé de fougères en forêt"
            width={480}
            height={360}
            className="w-[min(480px,100%)] rounded-2xl object-cover shadow-[0_12px_40px_-8px_rgba(0,0,0,0.4)]"
          />
        </motion.div>

        <motion.div
          className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-8"
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
        >
          <p className="mb-4 text-xl font-semibold uppercase tracking-[0.2em] text-brand-accent">
            Qui sommes-nous
          </p>
          <div className="space-y-4 text-[1.05rem] leading-relaxed">
            <p>
              <strong>Terra Indomita</strong> est une école de plein air établie à Franklin, en
              Montérégie. Nous aidons les gens de tout âge à devenir plus autonomes dehors : purifier
              l&apos;eau, rester au chaud grâce à un abri et un feu, reconnaître les arbres et les
              plantes, comprendre le comportement des animaux et des oiseaux, pêcher et poser des
              collets.
            </p>
            <p>
              Notre approche n&apos;est pas la survie une fois perdu. Nous vous apprenons plutôt à ne
              pas vous perdre et à planifier vos activités de plein air en toute sécurité.
            </p>
            <p>
              C&apos;est aussi une occasion de décrocher des écrans, de sortir de votre zone de confort
              et de rencontrer des gens qui partagent le goût de la forêt.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
