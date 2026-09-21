"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const listItems = ["Stage de formation", "Camp immersif", "Mentorat privé"];

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
        className="object-cover"
        priority
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, rgba(4,31,15,0.85) 10%, rgba(4,31,15,0.75) 25%, rgba(4,31,15,0.45) 40%, rgba(4,31,15,0.15) 55%, transparent 70%)",
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-10 px-6 md:flex-row md:items-center md:gap-16">
        <motion.picture
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <source srcSet="/images/logo-crest.svg" type="image/svg+xml" />
          <Image
            src="/images/logo-crest.png"
            alt="Blason Terra Indomita"
            width={520}
            height={520}
            className="h-auto w-[min(520px,80vw)] drop-shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
          />
        </motion.picture>

        <div>
          <motion.h1
            className="text-[clamp(2.5rem,6vw,3.75rem)] font-bold uppercase tracking-tight text-brand-light"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
          >
            École de plein air
          </motion.h1>
          <motion.div
            className="mt-2 h-[3px] w-16 rounded-full bg-brand-accent"
            initial={{ scaleX: 0, originX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
          />
          <ul className="mt-4 flex flex-col gap-2 text-[clamp(1.1rem,2.5vw,1.6rem)] font-semibold text-brand-light/90">
            {listItems.map((item, i) => (
              <motion.li
                key={item}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: 0.5,
                  delay: 0.6 + i * 0.15,
                  ease: "easeOut",
                }}
              >
                {item}
              </motion.li>
            ))}
          </ul>
        </div>
      </div>

      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.8 }}
      >
        <motion.div
          className="h-8 w-5 rounded-full border-2 border-white/40 p-1"
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
        >
          <div className="h-2 w-1 rounded-full bg-white/60 mx-auto" />
        </motion.div>
      </motion.div>
    </header>
  );
}
