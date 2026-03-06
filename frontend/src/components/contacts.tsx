import Image from "next/image";

const contacts = [
  {
    href: "https://www.facebook.com/profile.php?id=61576874895617",
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
    href: "mailto:terra_indomita@outlook.com",
    icon: "/images/@.png",
    label: "terra_indomita@outlook.com",
    external: false,
  },
] as const;

export function Contacts() {
  return (
    <section className="bg-brand-dark py-16 text-brand-light" id="contact">
      <div className="mx-auto max-w-[1100px] px-4">
        <p className="mb-8 text-center text-sm font-semibold uppercase tracking-widest text-brand-accent">
          Contacts
        </p>

        <div className="flex flex-wrap justify-center gap-8">
          {contacts.map((contact) => (
            <a
              key={contact.label}
              href={contact.href}
              className="flex items-center gap-3 transition-transform hover:translate-x-1.5"
              {...(contact.external
                ? { target: "_blank", rel: "noopener" }
                : {})}
            >
              <Image
                src={contact.icon}
                alt={contact.label}
                width={32}
                height={32}
              />
              <span>{contact.label}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
