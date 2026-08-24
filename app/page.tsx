import HeroSection from "@/components/user/landing/hero-section";
import InfoCards from "@/components/user/maskot/Info-cards";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <HeroSection />
      <InfoCards />
    </main>
  );
}