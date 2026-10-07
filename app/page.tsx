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
import { getProducts } from "@/src/lib/api/product";
import { PASTEL_VARIANTS } from "@/components/ui/filter-button";

export default async function HomePage() {
  // Ambil 6 produk terbaru dari DB untuk showcase landing page
  let landingProducts: import("@/components/user/landing/card-product").ProductItem[] = [];
  try {
    const result = await getProducts({ limit: 6, sort: "newest" });
    landingProducts = result.data.map((p, index) => ({
      id: index + 1,
      name: p.name,
      slug: p.slug,
      category: p.productType?.name ?? "",
      description: "",
      image: p.image ?? "/images/placeholder-product.jpg",
      age: "",
      size: "",
      duration: "",
      price: new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
      }).format(p.price.min ?? 0),
      rating: 5,
      reviewCount: "0 ulasan",
      bgColorClass: PASTEL_VARIANTS[index % PASTEL_VARIANTS.length],
    }));
  } catch {
    // Fallback ke data default jika fetch gagal
  }

  return (
    <main className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <HeroSection />
      <ICardsInfo />
      <Carousel />
      <CardProduct products={landingProducts.length > 0 ? landingProducts : undefined} />
      <VideoDemo />
      <Testimoni />
      <FAQ />
      <Footer />
    </main>
  );
}