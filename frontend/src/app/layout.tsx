import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import { SITE_DESCRIPTION, SITE_URL } from "@/lib/site";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
});

const TITLE = "Terra Indomita — École de plein air en Montérégie";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
  icons: {
    icon: "/images/favicon.png",
  },
  openGraph: {
    type: "website",
    locale: "fr_CA",
    url: "/",
    siteName: "Terra Indomita",
    title: TITLE,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/images/og-terra-indomita.jpg",
        width: 1200,
        height: 630,
        alt: "Terra Indomita, école de plein air à Franklin, en Montérégie",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: SITE_DESCRIPTION,
    images: ["/images/og-terra-indomita.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr-CA">
      <body className={`${nunito.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
