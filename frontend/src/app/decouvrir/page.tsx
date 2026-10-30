import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { EventsSection } from "@/components/events/events-section";
import { Footer } from "@/components/footer";
import { SOCIAL_LINKS } from "@/lib/site";

// Where the printed QR code lands (via /qr). The flyer stays timeless; this page
// carries what changes: the next dates and the call to register.
export const metadata: Metadata = {
  title: "Découvrir Terra Indomita — prochaines activités",
  description:
    "Vous arrivez du dépliant ? Voici les prochaines activités de Terra Indomita, école de plein air en Montérégie, et comment vous inscrire.",
  alternates: { canonical: "/decouvrir/" },
};

const SOCIAL_LABELS: Record<string, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube: "YouTube",
  bsky: "Bluesky",
};

function socialLabel(url: string): string {
  const key = Object.keys(SOCIAL_LABELS).find((k) => url.includes(k));
  return key ? SOCIAL_LABELS[key] : url;
}

export default function DiscoverPage() {
  return (
    <>
      <header className="bg-brand-dark px-6 py-16 text-center text-brand-light">
        <Image
          src="/images/logo-crest.png"
          alt="Blason Terra Indomita"
          width={200}
          height={200}
          className="mx-auto h-auto w-[160px]"
          priority
        />
        <p className="mt-6 text-sm font-semibold uppercase tracking-[0.2em] text-brand-accent">
          École de plein air · Montérégie, et ailleurs
        </p>
        <h1 className="mt-3 text-[clamp(2rem,5vw,3rem)] font-bold leading-tight">
          Se sentir chez soi en forêt.
        </h1>
        <p className="mx-auto mt-4 max-w-[620px] text-lg text-brand-light/90">
          Apprendre à ne pas se perdre, à rester au chaud et au sec, et à préparer ses sorties en
          sécurité — pour tous les âges. Stages de formation, camps immersifs, groupes et mentorat.
        </p>
        <Link
          href="#evenements"
          className="mt-8 inline-block rounded-full bg-brand-accent px-6 py-3 font-semibold text-brand-dark"
        >
          Voir les prochaines dates
        </Link>
      </header>
      <main>
        <EventsSection />
        <section className="bg-brand-dark py-16 text-center text-brand-light">
          <div className="mx-auto max-w-[760px] px-4">
            <p className="text-lg">
              Pas de date qui vous convient ? Suivez-nous : les prochaines activités s&apos;annoncent
              d&apos;abord là.
            </p>
            <ul className="mt-6 flex flex-wrap justify-center gap-4">
              {SOCIAL_LINKS.map((url) => (
                <li key={url}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener"
                    className="rounded-full border border-brand-light/30 px-4 py-2 text-sm font-semibold hover:border-brand-accent"
                  >
                    {socialLabel(url)}
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-8 text-sm text-brand-light/70">
              Tout sur l&apos;école : <Link href="/" className="underline">terra-indomita.ca</Link> ·
              info@terra-indomita.ca
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
