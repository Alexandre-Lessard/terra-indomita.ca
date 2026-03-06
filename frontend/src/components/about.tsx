import Image from "next/image";

export function About() {
  return (
    <section className="bg-brand-dark py-16 text-brand-light" id="presentation">
      <div className="mx-auto grid max-w-[1100px] gap-8 px-4 md:grid-cols-2 md:items-center">
        <div className="flex justify-center">
          <picture>
            <source srcSet="/images/logo-crest.svg" type="image/svg+xml" />
            <Image
              src="/images/logo-crest.png"
              alt="Blason Terra Indomita"
              width={260}
              height={260}
            />
          </picture>
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-brand-accent">
            Qui sommes-nous
          </p>
          <p className="text-lg leading-relaxed">
            <strong>Terra Indomita</strong> est une école de plein air qui offre
            des stages et des camps immersifs pour développer votre autonomie en
            plein air, en vue d&apos;activités de plein air planifiées ou
            simplement pour approfondir vos connaissances pour le plaisir, ou
            pour vous préparer à faire face à des bris de normalité.
          </p>
        </div>
      </div>
    </section>
  );
}
