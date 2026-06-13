import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Stats from "@/components/landing/Stats";
import Features from "@/components/landing/Features";

export default function HomePage() {
  return (
    <div className="bg-[#0D1117] text-[#E6EDF3] min-h-screen font-(--font-space-grotesk)">
      <Navbar />
      <Hero />
      <Stats />
      <Features />
    </div>
  );
}