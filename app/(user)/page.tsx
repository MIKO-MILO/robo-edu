import HeroSection from "@/components/user/landing/hero-section";
import ICardsInfo from "@/components/user/landing/card-info";
import InfoCardsList, { defaultCards as DEFAULT_INFO_CARD_ITEMS } from "@/components/user/landing/info-cards-list";
import TextMarquee from "@/components/user/landing/text-marquee";
import CardProduct, { type ProductItem } from "@/components/user/landing/card-product";
import DiskonPromo from "@/components/user/landing/diskon-promo";
import VideoDemo from "@/components/user/landing/video-demo";
import Testimoni, { type FeaturedReview } from "@/components/user/landing/testimoni";
import FAQ from "@/components/user/landing/faq";
import { db } from "@/src/db";
import {
  reviews,
  users,
  landingPageConfig,
  landingFeaturedVouchers,
  landingFeaturedReviews,
  vouchers,
} from "@/src/db/schema";
import { asc, desc, eq } from "drizzle-orm";
import { getProducts } from "@/src/lib/api/product";
import {
  DEFAULT_LANDING_CONFIG,
  LANDING_CONFIG_ID,
  type LandingPageFullConfig,
  type LandingHeroConfig,
  type LandingAboutConfig,
  type LandingInfoCardsConfig,
  type LandingMarqueeConfig,
  type LandingVideoDemoConfig,
  type LandingFAQConfig,
} from "@/src/lib/landing/defaults";
import { mapVoucherToPromoItem } from "@/types/voucher";
import type { VoucherPromoItem } from "@/types/voucher";

// ─────────────────────────────────────────────────────────────────────────────
// Fetch landing page config from DB (singleton row).
// Falls back to defaults if the row doesn't exist yet.
// ─────────────────────────────────────────────────────────────────────────────
async function getLandingConfig(): Promise<LandingPageFullConfig> {
  try {
    const rows = await db
      .select()
      .from(landingPageConfig)
      .where(eq(landingPageConfig.id, LANDING_CONFIG_ID))
      .limit(1);

    if (rows.length === 0) return DEFAULT_LANDING_CONFIG;

    const row = rows[0];
    return {
      hero:      (row.hero      as LandingHeroConfig       | null) ?? DEFAULT_LANDING_CONFIG.hero,
      about:     (row.about     as LandingAboutConfig      | null) ?? DEFAULT_LANDING_CONFIG.about,
      infoCards: (row.infoCards as LandingInfoCardsConfig  | null) ?? DEFAULT_LANDING_CONFIG.infoCards,
      marquee:   (row.marquee   as LandingMarqueeConfig    | null) ?? DEFAULT_LANDING_CONFIG.marquee,
      videoDemo: (row.videoDemo as LandingVideoDemoConfig  | null) ?? DEFAULT_LANDING_CONFIG.videoDemo,
      faq:       (row.faq       as LandingFAQConfig        | null) ?? DEFAULT_LANDING_CONFIG.faq,
    };
  } catch {
    return DEFAULT_LANDING_CONFIG;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Fetch featured vouchers for DiskonPromo section.
// Falls back to empty array → DiskonPromo uses its own DEFAULT_PROMOS.
// ─────────────────────────────────────────────────────────────────────────────
async function getFeaturedVouchers(): Promise<VoucherPromoItem[]> {
  try {
    const rows = await db
      .select({
        sortOrder:       landingFeaturedVouchers.sortOrder,
        id:              vouchers.id,
        code:            vouchers.code,
        name:            vouchers.name,
        discountType:    vouchers.discountType,
        discountValue:   vouchers.discountValue,
        minimumPurchase: vouchers.minimumPurchase,
        maximumDiscount: vouchers.maximumDiscount,
        startAt:         vouchers.startAt,
        endAt:           vouchers.endAt,
      })
      .from(landingFeaturedVouchers)
      .innerJoin(vouchers, eq(landingFeaturedVouchers.voucherId, vouchers.id))
      .orderBy(asc(landingFeaturedVouchers.sortOrder));

    return rows.map((r, idx) =>
      mapVoucherToPromoItem(
        {
          id:               r.id,
          code:             r.code,
          name:             r.name,
          discount_type:    r.discountType as "PERCENTAGE" | "FIXED_AMOUNT",
          discount_value:   Number(r.discountValue),
          minimum_purchase: Number(r.minimumPurchase),
          maximum_discount: r.maximumDiscount !== null ? Number(r.maximumDiscount) : null,
          end_at:           r.endAt.toISOString(),
        },
        idx,
      ),
    );
  } catch {
    return [];
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Fetch featured reviews for Testimoni section.
// Falls back to empty array → Testimoni uses its own FALLBACK_REVIEWS.
// ─────────────────────────────────────────────────────────────────────────────
async function getFeaturedReviews(): Promise<FeaturedReview[]> {
  try {
    // First try featured reviews table (CMS-managed ordering)
    const featuredRows = await db
      .select({
        sortOrder: landingFeaturedReviews.sortOrder,
        id:        reviews.id,
        rating:    reviews.rating,
        comment:   reviews.comment,
        createdAt: reviews.createdAt,
        userName:  users.name,
      })
      .from(landingFeaturedReviews)
      .innerJoin(reviews, eq(landingFeaturedReviews.reviewId, reviews.id))
      .innerJoin(users, eq(reviews.userId, users.id))
      .orderBy(asc(landingFeaturedReviews.sortOrder));

    if (featuredRows.length > 0) {
      return featuredRows
        .filter((r) => r.comment && r.comment.trim().length > 0)
        .map((r) => ({
          id:        r.id,
          userName:  r.userName,
          rating:    r.rating,
          comment:   r.comment!,
          createdAt: r.createdAt.toISOString(),
        }));
    }

    // Fallback: query best reviews automatically (legacy behavior)
    const rows = await db
      .select({
        id:        reviews.id,
        rating:    reviews.rating,
        comment:   reviews.comment,
        createdAt: reviews.createdAt,
        userName:  users.name,
      })
      .from(reviews)
      .innerJoin(users, eq(reviews.userId, users.id))
      .where(eq(reviews.status, "PUBLISHED"))
      .orderBy(desc(reviews.rating), desc(reviews.createdAt))
      .limit(20);

    return rows
      .filter((r) => r.comment && r.comment.trim().length > 0 && r.rating >= 4)
      .slice(0, 8)
      .map((r) => ({
        id:        r.id,
        userName:  r.userName,
        rating:    r.rating,
        comment:   r.comment!,
        createdAt: r.createdAt.toISOString(),
      }));
  } catch {
    return [];
  }
}

export default async function HomePage() {
  // Fetch all data in parallel
  const [config, featuredVouchers, featuredReviews] = await Promise.all([
    getLandingConfig(),
    getFeaturedVouchers(),
    getFeaturedReviews(),
  ]);

  // Produk terbaru — always from DB, not CMS-managed
  let landingProducts: ProductItem[] = [];
  try {
    const result = await getProducts({ limit: 6, sort: "newest" });
    landingProducts = result.data.map((p, index) => ({
      id: index + 1,
      name: p.name,
      category: p.productType?.name ?? "",
      image: p.image ?? "/images/product.webp",
      price: new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
      }).format(p.price.min ?? 0),
    }));
  } catch {
    // Fallback ke data default jika fetch gagal
  }

  // Build FAQ props from config
  const faqPromoData = {
    titlePrefix:   config.faq.promoBanner.titlePrefix,
    highlightText: "Sekarang!",
    description:   config.faq.promoBanner.description,
    thumbnails: config.faq.promoBanner.photos.map((src, i) => ({
      id:  `thumb-${i + 1}`,
      src,
      alt: `Foto promo ${i + 1}`,
    })),
  };

  return (
    <main className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <HeroSection
        headline={config.hero.headline}
        description={config.hero.description}
        ctaPrimaryLabel={config.hero.ctaPrimaryLabel}
        ctaPrimaryUrl={config.hero.ctaPrimaryUrl}
        ctaSecondaryLabel={config.hero.ctaSecondaryLabel}
      />
      <ICardsInfo
        badgeCategory={config.about.badgeLabel}
        titleMain={config.about.titleMain}
        titleHighlight={config.about.titleHighlight}
        description={config.about.description}
        features={config.about.features}
      />
      <InfoCardsList
        cards={config.infoCards.map((card, idx) => {
          // Icons and rotation/translateY are locked in code — merge CMS title/description
          // into the default card structure so icons remain correct.
          const base = DEFAULT_INFO_CARD_ITEMS[idx % DEFAULT_INFO_CARD_ITEMS.length];
          return {
            ...base,
            id:          card.id,
            title:       card.title,
            description: card.description,
          };
        })}
      />
      <TextMarquee items={config.marquee.items} />
      <CardProduct products={landingProducts.length > 0 ? landingProducts : undefined} />
      <DiskonPromo
        promos={featuredVouchers.length > 0 ? featuredVouchers : undefined}
        displayMode={
          featuredVouchers.length === 0 ? undefined :
          featuredVouchers.length === 1 ? "single" : "multi"
        }
      />
      <VideoDemo
        title={config.videoDemo.title}
        description={config.videoDemo.description}
        thumbnailSrc={config.videoDemo.thumbnailSrc}
        videoSrc={config.videoDemo.videoSrc}
      />
      <Testimoni reviews={featuredReviews} />
      <FAQ
        title={config.faq.title}
        description={config.faq.description}
        items={config.faq.items}
        promoData={faqPromoData}
      />
    </main>
  );
}
