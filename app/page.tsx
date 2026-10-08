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

  return (
    <main className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <HeroSection />
      <ICardsInfo />
      <Carousel />
      <CardProduct />
      <VideoDemo />
      <Testimoni reviews={featuredReviews} />
      <FAQ />
      <Footer />
    </main>
  );
}
