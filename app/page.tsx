import HeroSection from "@/components/user/landing/hero-section";
import ICardsInfo from "@/components/user/landing/card-info";
import InfoCardsList from "@/components/user/landing/info-cards-list";
import TextMarquee from "@/components/user/landing/text-marquee";
import CardProduct from "@/components/user/landing/card-product";
import VideoDemo from "@/components/user/landing/video-demo";
import DiskonPromo from "@/components/user/landing/diskon-promo";
import Testimoni from "@/components/user/landing/testimoni";
import MaskotProduct from "@/components/user/landing/maskot-product";
import FAQ from "@/components/user/landing/faq";
import Footer from "@/components/user/footer";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <HeroSection />
      <ICardsInfo />
      <InfoCardsList />
      <TextMarquee />
      <CardProduct />
      <DiskonPromo />
      <VideoDemo />
      <Testimoni />
      <FAQ />
      <Footer />
    </main>
  );
}