import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/home/Hero";
import Stats from "@/components/home/Stats";
import Journey from "@/components/home/Journey";
import ProBanner from "@/components/home/ProBanner";
import Categories from "@/components/home/Categories";
import FAQ from "@/components/home/FAQ";
import CTA from "@/components/home/CTA";
import Footer from "@/components/layout/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <Stats />
      <Journey />
      <ProBanner />
      <Categories />
      <FAQ />
      <CTA />
      <Footer />
    </main>
  );
}