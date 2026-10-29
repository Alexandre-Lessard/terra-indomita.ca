import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "Politique de confidentialité — Terra Indomita",
  description:
    "Comment Terra Indomita recueille, utilise et conserve les renseignements personnels fournis lors d'une inscription.",
  alternates: { canonical: "/confidentialite/" },
};

const UPDATED_ON = "21 septembre 2026";

export default function PrivacyPage() {
  return (
    <>
      <main className="bg-[#fcf9f3] py-16 text-[#142012]">
        <article className="mx-auto max-w-[760px] space-y-8 px-4 leading-relaxed">
          <header className="space-y-2">
            <Link href="/" className="text-sm underline">
              ← Retour au site
            </Link>
            <h1 className="text-3xl font-semibold">Politique de confidentialité</h1>
            <p className="text-sm text-[#6b6b6b]">Dernière mise à jour : {UPDATED_ON}</p>
          </header>

          <section className="space-y-3">
            <p>
              Terra Indomita est une école de plein air exploitée par Alexandre Courchesne, entreprise
              individuelle immatriculée au Québec. Cette politique explique quels renseignements
              personnels nous recueillons sur ce site, pourquoi, et comment vous pouvez exercer vos
              droits, conformément à la Loi sur la protection des renseignements personnels dans le
              secteur privé (Loi 25).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Responsable de la protection des renseignements personnels</h2>
            <p>
              Alexandre Courchesne, fondateur de Terra Indomita, est responsable de la protection des
              renseignements personnels. Pour toute question ou demande :{" "}
              <a className="underline" href="mailto:info@terra-indomita.ca">
                info@terra-indomita.ca
              </a>
              .
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Renseignements recueillis</h2>
            <p>Lorsque vous vous inscrivez à un événement, nous recueillons :</p>
            <ul className="list-disc space-y-1 pl-6">
              <li>votre nom ;</li>
              <li>votre adresse courriel ;</li>
              <li>votre numéro de téléphone, si vous choisissez de le fournir ;</li>
              <li>l&apos;événement choisi, la date de l&apos;inscription et celle de votre consentement.</li>
            </ul>
            <p>
              Le site n&apos;utilise aucun témoin (cookie) publicitaire ni outil de suivi. Pour bloquer
              les robots, le formulaire utilise Cloudflare Turnstile, qui vérifie la requête sans
              recueillir de renseignements servant à vous identifier.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Pourquoi nous les utilisons</h2>
            <p>Ces renseignements servent uniquement à :</p>
            <ul className="list-disc space-y-1 pl-6">
              <li>enregistrer votre inscription et confirmer votre place ;</li>
              <li>vous joindre au sujet de l&apos;événement (horaire, lieu, météo, annulation).</li>
            </ul>
            <p>
              Ils ne sont ni vendus, ni loués, ni utilisés à des fins de publicité. Seul Alexandre
              Courchesne y a accès.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Conservation</h2>
            <p>
              Les inscriptions sont effacées automatiquement douze mois après la fin de
              l&apos;événement. Chaque inscription génère aussi un avis envoyé à la boîte courriel de
              Terra Indomita ; ces avis sont supprimés dans le même délai.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Hébergement</h2>
            <p>
              Le site et ses données sont hébergés par Cloudflare, dont l&apos;infrastructure peut
              traiter ou conserver des renseignements à l&apos;extérieur du Québec. Cloudflare agit
              comme sous-traitant et applique des mesures de sécurité reconnues (chiffrement en transit
              et au repos, contrôle des accès).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Vos droits</h2>
            <p>Vous pouvez en tout temps, en écrivant à info@terra-indomita.ca :</p>
            <ul className="list-disc space-y-1 pl-6">
              <li>demander l&apos;accès aux renseignements que nous détenons sur vous ;</li>
              <li>les faire corriger ;</li>
              <li>retirer votre consentement et en demander la suppression.</li>
            </ul>
            <p>
              Nous répondons dans un délai de 30 jours. Si vous n&apos;êtes pas satisfait de notre
              réponse, vous pouvez vous adresser à la Commission d&apos;accès à l&apos;information du
              Québec.
            </p>
          </section>
        </article>
      </main>
      <Footer />
    </>
  );
}
