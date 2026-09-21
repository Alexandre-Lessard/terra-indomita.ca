import { Hero } from "@/components/hero";
import { About } from "@/components/about";
import { Offers } from "@/components/offers";
import { Founder } from "@/components/founder";
import { EventsSection } from "@/components/events/events-section";
import { Contacts } from "@/components/contacts";
import { Footer } from "@/components/footer";
import { StructuredData } from "@/components/structured-data";

export default function Home() {
  return (
    <>
      <StructuredData />
      <Hero />
      <main>
        <About />
        <Offers />
        <Founder />
        <EventsSection />
        <Contacts />
      </main>
      <Footer />
    </>
  );
}
