import type { Metadata } from "next";
import { ContactHeroSection, ContactMainSection } from "@/components/user/contact";
import CarouselLogo from "@/components/user/carousel-logo";

export const metadata: Metadata = {
  title: "Hubungi Kami | RoboEdu - Kit Robotika Edukasi & Sparepart",
  description:
    "Hubungi tim RoboEdu Indonesia via WhatsApp, Email, Instagram, YouTube, atau kirim pesan langsung untuk pertanyaan produk, bantuan teknis, dan pesanan sekolah/institusi.",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* 1. Hero Section */}
      <ContactHeroSection />

      {/* 2. Main 2-Column Section (Left: 4 Social Cards, Right: Message Form) */}
      <ContactMainSection />

      {/* 3. Logo Marquee Carousel */}
      <CarouselLogo />
    </main>
  );
}
