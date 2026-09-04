import HeroSection from "@/components/user/landing/hero-section";
import ICardsInfo from "@/components/user/landing/card-info";
import Carousel from "@/components/user/landing/carousel";
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
      <Carousel />
      <CardProduct />
      <VideoDemo />
      <Testimoni />
      <FAQ />
      <Footer />
    </main>
  );
}