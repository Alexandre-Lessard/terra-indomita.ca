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
          <p className="text-[1.05rem] leading-relaxed">
            <strong>Terra Indomita</strong> est une école de plein air qui offre
            des stages et des camps immersifs pour développer votre autonomie en
            plein air, en vue d&apos;activités de plein air planifiées ou
            simplement pour approfondir vos connaissances pour le plaisir, ou
            pour vous préparer à faire face à des bris de normalité.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
