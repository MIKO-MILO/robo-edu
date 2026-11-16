import type { Metadata } from "next";
import { ContactHeroSection, ContactMainSection } from "@/components/user/contact";

export const metadata: Metadata = {
  title: "Hubungi Kami | RoboEdu - Kit Robotika Edukasi & Sparepart",
  description:
    "Hubungi tim RoboEdu Indonesia via WhatsApp, Email, Instagram, YouTube, atau kirim pesan langsung untuk pertanyaan produk, bantuan teknis, dan pesanan sekolah/institusi.",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-background pb-16">
      {/* 1. Hero Section */}
      <ContactHeroSection />

      {/* 2. Main Section dengan wrapper kontainer yang rapi */}
      <div className="container mx-auto px-4 max-w-6xl mt-8">
        <ContactMainSection />
      </div>
    </main>
  );
}