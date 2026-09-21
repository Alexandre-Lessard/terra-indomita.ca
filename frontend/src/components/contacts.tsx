"use client";

import Image from "next/image";
import { motion } from "framer-motion";

function MailIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-9 w-9 text-brand-accent"
    >
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M22 7l-10 7L2 7" />
    </svg>
  );
}

const contacts = [
  {
    href: "https://www.facebook.com/terraindomitaqc",
    icon: "/images/f.webp",
    label: "Facebook",
    external: true,
  },
  {
    href: "https://www.instagram.com/terra_indomita_qc",
    icon: "/images/i.webp",
    label: "Instagram",
    external: true,
  },
  {
    href: "mailto:info@terra-indomita.ca",
    icon: null,
    label: "info@terra-indomita.ca",
    external: false,
  },
] as const;

export function Contacts() {
  return (
    <section
      className="bg-brand-dark pb-[4.5rem] pt-24 text-brand-light"
      id="contact"
    >
      <div className="mx-auto max-w-[1100px] px-4">
        <motion.p
          className="mb-12 text-center text-xl font-semibold uppercase tracking-[0.2em] text-brand-accent"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Contacts
        </motion.p>

        <motion.div
          className="mx-auto grid max-w-3xl grid-cols-1 gap-6 sm:grid-cols-3"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.12 } } }}
        >
          {contacts.map((contact) => (
            <motion.a
              variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } } }}
              key={contact.label}
              href={contact.href}
              className="group flex flex-col items-center gap-5 rounded-2xl border border-white/[0.08] bg-white/[0.04] px-6 py-8 text-center transition-all duration-300 hover:-translate-y-1 hover:border-brand-accent/30 hover:bg-white/[0.08] hover:shadow-[0_12px_32px_-8px_rgba(212,164,85,0.2)]"
              {...(contact.external
                ? { target: "_blank", rel: "noopener" }
                : {})}
            >
              <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-white/[0.06] transition-colors duration-300 group-hover:bg-white/[0.12]">
                {contact.icon ? (
                  <Image
                    src={contact.icon}
                    alt={contact.label}
                    width={40}
                    height={40}
                    className="object-contain"
                  />
                ) : (
                  <MailIcon />
                )}
              </div>
              <span className="text-[1.05rem] font-medium text-brand-light/90 transition-colors duration-300 group-hover:text-brand-light">
                {contact.label}
              </span>
            </motion.a>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
