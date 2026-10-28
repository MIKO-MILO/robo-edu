import HeroSection from "@/components/user/landing/hero-section";
import ICardsInfo from "@/components/user/landing/card-info";
import Carousel from "@/components/user/landing/carousel";
import CardProduct from "@/components/user/landing/card-product";
import VideoDemo from "@/components/user/landing/video-demo";
import Testimoni, { type FeaturedReview } from "@/components/user/landing/testimoni";
import FAQ from "@/components/user/landing/faq";
import Footer from "@/components/user/footer";
import { db } from "@/src/db";
import { reviews, users } from "@/src/db/schema";
import { desc, eq } from "drizzle-orm";
import { getProducts } from "@/src/lib/api/product";
import { PASTEL_VARIANTS } from "@/components/ui/filter-button";

async function getFeaturedReviews(): Promise<FeaturedReview[]> {
  try {
    const rows = await db
      .select({
        id: reviews.id,
        rating: reviews.rating,
        comment: reviews.comment,
        createdAt: reviews.createdAt,
        userName: users.name,
      })
      .from(reviews)
      .innerJoin(users, eq(reviews.userId, users.id))
      .where(eq(reviews.status, "PUBLISHED"))
      .orderBy(desc(reviews.rating), desc(reviews.createdAt))
      .limit(20);

    // Filter: hanya yang punya komentar & rating >= 4
    return rows
      .filter((r) => r.comment && r.comment.trim().length > 0 && r.rating >= 4)
      .slice(0, 8)
      .map((r) => ({
        id: r.id,
        userName: r.userName,
        rating: r.rating,
        comment: r.comment!,
        createdAt: r.createdAt.toISOString(),
      }));
  } catch {
    // Jika DB tidak bisa diakses, kembalikan array kosong agar fallback statis aktif
    return [];
  }
}

export default async function HomePage() {
  const featuredReviews = await getFeaturedReviews();

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
      <Testimoni reviews={featuredReviews} />
      <FAQ />
      <Footer />
    </main>
  );
}
