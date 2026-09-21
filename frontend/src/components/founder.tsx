"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export function Founder() {
  return (
    <section className="bg-brand-dark py-24 text-brand-light" id="fondateur">
      <div className="mx-auto grid max-w-[1100px] grid-cols-[repeat(auto-fit,minmax(280px,1fr))] items-center gap-16 px-4">
        <motion.div
          className="flex justify-center"
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <Image
            src="/images/fondateur-alex.jpg"
            alt="Portrait d'Alex, fondateur de Terra Indomita"
            width={400}
            height={400}
            className="w-[min(400px,100%)] rounded-2xl object-cover shadow-[0_12px_40px_-8px_rgba(0,0,0,0.4)]"
          />
        </motion.div>

        <motion.div
          className="space-y-4 rounded-2xl border border-white/[0.08] bg-white/[0.04] p-8 text-[1.05rem] leading-relaxed"
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
        >
          <p className="text-xl font-semibold uppercase tracking-[0.2em] text-brand-accent">
            À propos du fondateur
          </p>
          <p>
            Depuis maintenant huit ans, Alex se passionne pour la survie en
            forêt, l&apos;autonomie en plein air, le savoir ancestral et bien
            plus encore.
          </p>
          <p>
            Il s&apos;est formé auprès d&apos;écoles bien établies au Québec,
            telles que Les Primitifs, Kanatha-Aki et Un Goût de Forêt. En plus
            de ses compétences en survie et en vie en nature, Alex est
            secouriste formé et cumule plus de dix ans d&apos;expérience dans le
            domaine de la sécurité privée.
          </p>
          <p>
            Après avoir passé plusieurs années à organiser des activités de
            plein air avec sa famille et ses amis, il a maintenant décidé de
            transmettre sa passion au plus grand nombre.
          </p>
          <p>
            Alex prône une approche inclusive et sans jugement du monde. Le
            respect, l&apos;entraide et le plaisir font partie de ses valeurs
            profondes.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
