import HeroSection from "@/components/user/landing/hero-section";
import InfoCards from "@/components/user/landing/info-cards";
import CardProduct from "@/components/user/landing/card-product";
import VideoDemo from "@/components/user/landing/video-demo";
import DiskonPromo from "@/components/user/landing/diskon-promo";
import Testimoni from "@/components/user/landing/testimoni";
import MaskotProduct from "@/components/user/landing/maskot-product";
import FAQ from "@/components/user/landing/faq";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <HeroSection />
      <InfoCards />
      <CardProduct />
      <VideoDemo />
      <DiskonPromo />
      <Testimoni />
      <FAQ />
    </main>
  );
}