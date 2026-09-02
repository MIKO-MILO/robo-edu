import type { Metadata } from "next";
import {
  AboutHeroSection,
  OurStorySection,
  KidSafeSection,
  AboutValuesSection,
  AboutFinalCtaSection,
} from "@/components/user/about";

export const metadata: Metadata = {
  title: "Tentang Kami | RoboEdu - Kit Robotika Edukasi & Sparepart",
  description:
    "Pelajari kisah, visi, dan jaminan keselamatan RoboEdu dalam menghadirkan kit robotika edukatif dan sparepart buatan Indonesia yang memicu logika dan kreativitas anak.",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* 1. Hero Section */}
      <AboutHeroSection />

      {/* 2. Our Story Section */}
      <OurStorySection /> 

      {/* 3. Guarantee Kid Safe Section */}
      <KidSafeSection />

      {/* 4. Keunggulan Section (Headline Center & 3 Value Cards) */}
      <AboutValuesSection />

      {/* 5. Final CTA Section */}
      <AboutFinalCtaSection />
    </main>
  );
}
