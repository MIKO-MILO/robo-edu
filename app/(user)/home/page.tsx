import Navbar from "@/components/user/navbar";
import CarouselLogo from "@/components/user/carousel-logo";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <CarouselLogo />
      {/* Page content goes here */}
    </main>
  );
}
