import { SITE_DESCRIPTION, SITE_URL, SOCIAL_LINKS } from "@/lib/site";

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
    addressLocality: "Franklin",
    addressRegion: "QC",
    addressCountry: "CA",
  },
  areaServed: { "@type": "AdministrativeArea", name: "Montérégie" },
  sameAs: SOCIAL_LINKS,
};

export function StructuredData() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(organization).replace(/</g, "\\u003c") }}
    />
  );
}
