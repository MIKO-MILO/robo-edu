import type { Metadata } from "next";
import {
  ResellerHeroSection,
  ResellerBenefitsSection,
  ResellerPricingSection,
  ResellerStepsSection,
  ResellerCategorySection,
  ResellerFaqSection,
  ResellerCtaSection,
  ResellerMembershipSection,
} from "@/components/user/reseller";

export const metadata: Metadata = {
  title: "Reseller | RoboEdu - Program Mitra Reseller Kit Robotika Edukasi",
  description:
    "Bergabunglah sebagai mitra reseller resmi RoboEdu. Dapatkan harga spesial, prioritas kuota produksi, materi pemasaran eksklusif, dan dukungan teknis VIP untuk mengembangkan bisnis Anda.",
};

export default function ResellerPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* 1. Hero Section */}
      <ResellerHeroSection />

      {/* 2. Benefits Section (4 keuntungan eksklusif) */}
      <ResellerBenefitsSection />
      
      {/* 3. Pricing Comparison Section */}
      <ResellerPricingSection />

      {/* 4. Category & Partnership Requirements */}
      <ResellerCategorySection />

      {/* 5. FAQ Section */}
      <ResellerFaqSection />

      {/* 6. Membership Card Section */}
      <ResellerMembershipSection />

      {/* 7. 3-Step Onboarding Section */}
      <ResellerStepsSection />
      
      {/* 8. Final CTA Section */}
      <ResellerCtaSection />
      
    </main>
  );
}

