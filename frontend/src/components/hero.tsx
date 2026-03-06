"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export function Hero() {
  return (
    <header
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-brand-dark"
      id="accueil"
    >
      <Image
        src="/images/hero-background.jpg"
        alt=""
        fill
        className="object-cover opacity-40"
        priority
      />

      <motion.div
        className="relative z-10 flex flex-col items-center gap-6 px-4 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <picture>
          <source srcSet="/images/logo-crest.svg" type="image/svg+xml" />
          <Image
            src="/images/logo-crest.png"
            alt="Blason Terra Indomita"
            width={180}
            height={180}
            className="drop-shadow-lg"
          />
        </picture>

        <div>
          <h1 className="text-4xl font-bold tracking-tight text-brand-light md:text-5xl">
            École de plein air
          </h1>
          <ul className="mt-4 flex flex-wrap justify-center gap-x-6 gap-y-1 text-lg font-light text-brand-light/80">
            <li>Stage de formation</li>
            <li>Camp immersif</li>
            <li>Mentorat privé</li>
          </ul>
        </div>
      </motion.div>
    </header>
  );
}
