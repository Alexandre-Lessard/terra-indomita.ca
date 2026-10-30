import { SITE_DESCRIPTION, SITE_URL, SOCIAL_LINKS } from "@/lib/site";
import { FAQ_ITEMS } from "@/lib/faq";

// Organization data for search engines (schema.org), rendered at build time.
const organization = {
  "@context": "https://schema.org",
  "@type": ["EducationalOrganization", "LocalBusiness"],
  "@id": `${SITE_URL}/#organisation`,
  name: "Terra Indomita",
  description: SITE_DESCRIPTION,
  url: `${SITE_URL}/`,
  logo: `${SITE_URL}/images/logo-crest.png`,
  image: `${SITE_URL}/images/og-terra-indomita.jpg`,
  email: "info@terra-indomita.ca",
  founder: { "@type": "Person", name: "Alexandre Courchesne" },
  address: {
    "@type": "PostalAddress",
    addressRegion: "QC",
    addressCountry: "CA",
  },
  areaServed: [
    { "@type": "AdministrativeArea", name: "Montérégie" },
    { "@type": "AdministrativeArea", name: "Rive-Sud de Montréal" },
  ],
  sameAs: SOCIAL_LINKS,
};

const faq = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_ITEMS.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: { "@type": "Answer", text: item.answer },
  })),
};

const escape = (data: unknown) => JSON.stringify(data).replace(/</g, "\\u003c");

export function StructuredData() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: escape(organization) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: escape(faq) }} />
    </>
  );
}
