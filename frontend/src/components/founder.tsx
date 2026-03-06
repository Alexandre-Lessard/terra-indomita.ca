import Image from "next/image";

export function Founder() {
  return (
    <section className="bg-brand-dark py-16 text-brand-light" id="fondateur">
      <div className="mx-auto grid max-w-[1100px] gap-8 px-4 md:grid-cols-2 md:items-center">
        <div className="flex justify-center">
          <Image
            src="/images/fondateur-alex.jpg"
            alt="Portrait d'Alex, fondateur de Terra Indomita"
            width={400}
            height={400}
            className="rounded-lg object-cover"
          />
        </div>

        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand-accent">
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
        </div>
      </div>
    </section>
  );
}
