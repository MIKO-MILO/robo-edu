"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import {
  Star,
  StarHalf,
  ChevronLeft,
  ChevronRight,
  PlayCircle,
  CheckCircle2,
  UserCircle,
  BadgeCheck,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { ProductImage } from "@/components/ui/product-image";
import { ProductCard } from "@/components/ui/product-card";
import { WishlistButton } from "@/components/ui/wishlist-button";
import { Button } from "@/components/ui/button";
import { QuantitySelector } from "@/components/ui/quantity-selector";
import { useWishlist } from "@/contexts/wishlist-context";
import { useCart } from "@/contexts/cart-context";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Type Definitions
// ---------------------------------------------------------------------------
interface ProductImageItem {
  src: string;
  alt: string;
}

interface ProductComponent {
  name: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  bgClass: string;
}

interface ProductReview {
  id: number | string;
  rating: number;
  text: string;
  author: string;
  verified: boolean;
}

interface RelatedProduct {
  id: string;
  name: string;
  price: string;
  rating: number;
  reviewCount: string;
  imageUrl: string;
  bgColorClass: string;
}

interface ProductVideo {
  id: string;
  url: string;
  title: string | null;
  sort_order: number;
}

interface ProductDetail {
  id: string;
  slug: string;
  name: string;
  description: string;
  longDescription: string[];
  highlights: string[];
  components: ProductComponent[];
  price: string;
  basePrice: number;
  defaultVariantId: string | null;
  inStock: boolean;
  resellerNote: string;
  rating: number;
  reviewCount: number;
  images: ProductImageItem[];
  mainImage: ProductImageItem;
  videos: ProductVideo[];
  reviews: ProductReview[];
  reviewSummary: { average: number; total: number };
  relatedProducts: RelatedProduct[];
}

interface ApiProduct {
  id: string;
  name: string;
  slug: string;
  price: { min: number | null; max: number | null };
  image: string | null;
  stock?: number;
}

// ---------------------------------------------------------------------------
// Star Rating Helper (Sesuai kode awal yang kamu inginkan: 5 bintang kuning)
// ---------------------------------------------------------------------------
function StarRating({ rating }: { rating: number }) {
  return (
    <div
      className="flex items-center text-[#FFB800]"
      aria-label={`Rating ${rating} dari 5`}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = rating >= star;
        const half = !filled && rating >= star - 0.5;
        if (half) {
          return (
            <StarHalf
              key={star}
              size={18}
              className="fill-[#FFB800] stroke-[#FFB800]"
            />
          );
        }
        return (
          <Star
            key={star}
            size={18}
            className={
              filled
                ? "fill-[#FFB800] stroke-[#FFB800]"
                : "fill-none stroke-[#FFB800]"
            }
          />
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Inline Product Media Gallery (Galeri Gambar Utama + 3 Thumbnail & Panah)
// ---------------------------------------------------------------------------
type MediaItem =
  | { type: "image"; src: string; alt: string }
  | { type: "video"; url: string; title: string };

function InlineProductMediaGallery({
  images = [],
  videos = [],
  productName,
}: {
  images?: ProductImageItem[];
  videos?: ProductVideo[];
  productName: string;
}) {
  const mediaList: MediaItem[] = useMemo(() => {
    let baseImages: MediaItem[] = images.map((img) => ({
      type: "image",
      src: img.src,
      alt: img.alt || productName,
    }));

    if (baseImages.length === 0) {
      baseImages = [
        { type: "image", src: "/images/placeholder-product.jpg", alt: productName },
      ];
    }
    if (baseImages.length === 1) {
      baseImages = [baseImages[0], baseImages[0], baseImages[0]];
    } else if (baseImages.length === 2) {
      baseImages = [baseImages[0], baseImages[1], baseImages[0]];
    }

    const vidItems: MediaItem[] = videos.map((vid, idx) => ({
      type: "video",
      url: vid.url,
      title: vid.title ?? `Video ${productName} ${idx + 1}`,
    }));

    return [...baseImages, ...vidItems];
  }, [images, videos, productName]);

  const [activeIndex, setActiveIndex] = useState(0);
  const totalMedia = mediaList.length;

  const safeActiveIndex = Math.min(activeIndex, totalMedia - 1);
  const currentMedia = mediaList[safeActiveIndex] ?? mediaList[0];

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + totalMedia) % totalMedia);
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % totalMedia);
  };

  const visibleThumbnails = useMemo(() => {
    if (totalMedia <= 3) {
      return mediaList.map((item, idx) => ({ item, originalIndex: idx }));
    }
    const startWindow = Math.min(
      Math.max(0, Math.floor(safeActiveIndex / 3) * 3),
      totalMedia - 3
    );
    return mediaList
      .slice(startWindow, startWindow + 3)
      .map((item, idx) => ({ item, originalIndex: startWindow + idx }));
  }, [mediaList, safeActiveIndex, totalMedia]);

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Gambar Utama Besar Tanpa Kotak Putih */}
      <div className="w-full aspect-square rounded-2xl overflow-hidden flex items-center justify-center bg-transparent">
        {currentMedia.type === "video" ? (
          <video
            key={currentMedia.url}
            src={currentMedia.url}
            controls
            autoPlay
            className="w-full h-full object-contain bg-foreground/95 rounded-2xl"
            aria-label={currentMedia.title}
          >
            Browser kamu tidak mendukung tag video.
          </video>
        ) : (
          <ProductImage
            src={currentMedia.src}
            alt={currentMedia.alt}
            size="full"
            aspectRatio="square"
            className="w-full h-full bg-transparent border-0 rounded-2xl shadow-none"
            imageClassName="object-contain"
            sizes="(max-width: 1024px) 90vw, 45vw"
            priority
          />
        )}
      </div>

      {/* Thumbnail Strip dengan Panah & Outline Biru Tua (ring-primary) */}
      <div className="flex items-center justify-center gap-4 sm:gap-6">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          neo={false}
          onClick={handlePrev}
          aria-label="Media sebelumnya"
          className="text-foreground hover:text-primary transition-colors cursor-pointer shrink-0"
        >
          <ArrowLeft className="w-6 h-6 stroke-[2.5px]" />
        </Button>

        <div className="flex items-center gap-3 sm:gap-4">
          {visibleThumbnails.map(({ item, originalIndex }) => {
            const isSelected = originalIndex === safeActiveIndex;

            return (
              <button
                key={`thumb-${item.type}-${originalIndex}`}
                type="button"
                onClick={() => setActiveIndex(originalIndex)}
                aria-label={`Tampilkan media ${originalIndex + 1}`}
                className={cn(
                  "w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 transition-all cursor-pointer flex items-center justify-center bg-card",
                  isSelected
                    ? "ring-2 ring-primary ring-offset-2 ring-offset-background scale-105"
                    : "opacity-75 hover:opacity-100 border border-transparent"
                )}
              >
                {item.type === "image" ? (
                  <ProductImage
                    src={item.src}
                    alt={item.alt}
                    size="full"
                    aspectRatio="square"
                    className="w-full h-full bg-transparent border-0 rounded-xl"
                    imageClassName="object-cover"
                    sizes="80px"
                    priority={false}
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center rounded-xl">
                    <PlayCircle
                      className={cn(
                        "w-6 h-6",
                        isSelected ? "text-primary" : "text-muted-foreground"
                      )}
                    />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          neo={false}
          onClick={handleNext}
          aria-label="Media selanjutnya"
          className="text-foreground hover:text-primary transition-colors cursor-pointer shrink-0"
        >
          <ArrowRight className="w-6 h-6 stroke-[2.5px]" />
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-Components Ulasan & Komponen
// ---------------------------------------------------------------------------
function ReviewStars({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5 text-[#FFD700]" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((s) => {
        const filled = rating >= s;
        const half = !filled && rating >= s - 0.5;
        if (half)
          return (
            <StarHalf key={s} size={size} className="fill-[#FFD700] stroke-[#FFD700]" />
          );
        return (
          <Star
            key={s}
            size={size}
            className={filled ? "fill-[#FFD700] stroke-[#FFD700]" : "fill-none stroke-[#FFD700]"}
          />
        );
      })}
    </div>
  );
}

function ReviewCard({ review }: { review: ProductReview }) {
  return (
    <article
      className="
        min-w-[280px] md:min-w-[300px] max-w-[300px]
        bg-background rounded-xl p-6
        border-2 border-foreground/30 shadow-none
        flex flex-col gap-3
        snap-center
        transition-transform hover:-translate-y-0.5
      "
    >
      <ReviewStars rating={review.rating} />

      <p className="font-body text-sm text-foreground leading-relaxed grow">
        “{review.text}”
      </p>

      <div className="flex items-center justify-between pt-3 mt-1">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center shrink-0">
            <UserCircle size={20} className="text-muted-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="font-body font-semibold text-xs text-foreground leading-tight">
              {review.author}
            </span>
            <span className="font-body text-[10px] text-muted-foreground">
              Pembeli Terverifikasi
            </span>
          </div>
        </div>
        {review.verified && (
          <BadgeCheck
            size={20}
            className="text-primary fill-primary stroke-background shrink-0"
            aria-label="Pembeli terverifikasi"
          />
        )}
      </div>
    </article>
  );
}

function ComponentCard({ item }: { item: ProductComponent }) {
  return (
    <li className="flex items-center gap-4 pb-5 last:pb-0 border-b border-border-strong/20 last:border-0">
      <ProductImage
        src={item.imageSrc}
        alt={item.imageAlt}
        size="full"
        aspectRatio="square"
        className={`w-14 h-14 shrink-0 rounded-full border-2 border-foreground neo-shadow-icon ${item.bgClass}`}
        sizes="56px"
        priority={false}
      />
      <div className="flex flex-col gap-0.5">
        <h3 className="font-body font-semibold text-xs uppercase tracking-widest text-foreground">
          {item.name}
        </h3>
        <p className="font-body text-xs text-muted-foreground leading-snug">
          {item.description}
        </p>
      </div>
    </li>
  );
}

function ProductInfoSection({ product }: { product: ProductDetail }) {
  const [activeTab, setActiveTab] = useState<"description" | "components" | "reviews">("description");
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = 320;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <section
      aria-label="Informasi dan Ulasan Produk"
      className="max-w-5xl mx-auto mt-16 px-4 md:px-0 pb-16"
    >
      {/* Garis Horizontal Atas diubah ke warna primary / biru */}
      <hr className="border-t-2 border-primary/40 mb-8" />

      {/* Tabs Header */}
      <div className="flex items-center gap-8 mb-8 relative border-b-2 border-primary/30 overflow-x-auto">
        {(["description", "components", "reviews"] as const).map((tab) => {
          const labels = {
            description: "Deskripsi Produk",
            components: "Komponen Produk",
            reviews: "Ulasan Pengguna",
          };
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`pb-3 font-heading font-bold text-lg md:text-xl uppercase tracking-wide transition-colors relative shrink-0 cursor-pointer ${
                isActive ? "text-primary-700" : "text-muted-foreground hover:text-primary"
              }`}
            >
              {labels[tab]}
              {isActive && (
                <span className="absolute bottom-0 left-0 w-full h-[2.5px] bg-primary transition-all" />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <div className="py-2">
        {activeTab === "description" && (
          <div className="flex flex-col gap-6 animate-fadeIn">
            <div className="flex flex-col gap-4 max-w-3xl">
              {product.longDescription.map((para, i) => (
                <p key={i} className="font-body text-sm text-muted-foreground leading-relaxed">
                  {para}
                </p>
              ))}
            </div>
            <ul className="flex flex-col gap-3 mt-2 max-w-3xl" aria-label="Keunggulan produk">
              {product.highlights.map((text, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2
                    size={20}
                    className="text-primary fill-primary stroke-background shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <span className="font-body text-sm text-foreground leading-snug">
                    {text}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {activeTab === "components" && (
          <div className="flex flex-col gap-6 animate-fadeIn max-w-xl">
            <ul className="flex flex-col gap-4" aria-label="Komponen produk">
              {product.components.map((comp) => (
                <ComponentCard key={comp.name} item={comp} />
              ))}
            </ul>
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="flex flex-col md:flex-row gap-8 md:gap-10 items-start w-full animate-fadeIn">
            <div
              className="flex flex-col items-center md:items-start gap-2 md:w-1/4 shrink-0"
              aria-label={`Rating rata-rata ${product.reviewSummary.average} dari 5`}
            >
              <div
                className="font-heading font-black leading-none text-primary"
                style={{ fontSize: "72px", letterSpacing: "-0.03em" }}
              >
                {product.reviewSummary.average.toFixed(1).replace(".", ",")}
                <span className="text-2xl font-bold">/5</span>
              </div>
              <ReviewStars rating={product.reviewSummary.average} size={20} />
              <p className="font-body text-sm text-muted-foreground">
                Berdasarkan {product.reviewSummary.total} ulasan
              </p>
            </div>

            <div className="relative flex items-center gap-2 flex-1 w-full min-w-0 group">
              <button
                onClick={() => scroll("left")}
                aria-label="Scroll ulasan ke kiri"
                className="absolute -left-4 z-10 w-10 h-10 rounded-full bg-card border-2 border-foreground neo-shadow-icon flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted shrink-0 cursor-pointer"
              >
                <ChevronLeft size={18} className="text-foreground" />
              </button>

              <div
                ref={scrollRef}
                className="flex gap-5 overflow-x-auto pb-2 w-full snap-x snap-mandatory"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {product.reviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>

              <button
                onClick={() => scroll("right")}
                aria-label="Scroll ulasan ke kanan"
                className="absolute -right-4 z-10 w-10 h-10 rounded-full bg-card border-2 border-foreground neo-shadow-icon flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted shrink-0 cursor-pointer"
              >
                <ChevronRight size={18} className="text-foreground" />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

const BG_COLORS = [
  "bg-accent-pink",
  "bg-accent-soft-blue",
  "bg-accent-mint",
  "bg-accent-yellow",
  "bg-accent-peach",
  "bg-accent-purple",
];

function RelatedProductsSection({ products }: { products: ApiProduct[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -340 : 340,
      behavior: "smooth",
    });
  };

  if (products.length === 0) return null;

return (
    <section
      aria-label="Produk Yang Mungkin Kamu Suka"
      className="w-full bg-accent-yellow/85 py-16 px-4 md:px-16 relative overflow-hidden"
    >
      <div className="max-w-5xl mx-auto">
        {/* Section heading di kiri, SVG menyesuaikan */}
        <div className="mb-12 flex flex-col items-start w-full">
          <h2
            className="font-heading font-black text-2xl md:text-4xl uppercase tracking-tighter text-foreground/90 mb-0"
            style={{ letterSpacing: "-0.06em" }}
          >
            You Might Also Like...
          </h2>
          
          {/* Container SVG */}
          <div className="w-full flex justify-center md:justify-start pl-0 md:pl-64 -mt-2">
            <svg 
              width="240" 
              height="44" 
              viewBox="0 0 152 35" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className="overflow-visible text-foreground/90"
              aria-hidden="true"
            >
              <path 
                d="M21.2324 26.4054C21.2324 26.4054 50.0395 21.2423 75.2324 20.4054C99.5651 19.5971 136.73 21.905 136.73 21.905" 
                strokeWidth="3.5" 
                stroke="currentColor" 
                strokeLinecap="round"
              />
              <path 
                d="M0.231543 34.4055C0.231543 34.4055 51.2311 26.4054 81.7313 26.4054C112.772 26.4054 151.732 28.9054 151.732 28.9054" 
                strokeWidth="3.5" 
                stroke="currentColor" 
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* Scrollable card track */}
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto pb-2 snap-x snap-mandatory"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {products.map((item, idx) => (
            <div key={item.id} className="flex-none w-[260px] md:w-[300px] snap-start">
              <ProductCard
                slug={item.slug}
                name={item.name}
                price={
                  item.price.min
                    ? `Rp ${new Intl.NumberFormat("id-ID").format(item.price.min)}`
                    : "Hubungi kami"
                }
                rating={0}
                reviewCount="0 ulasan"
                imageUrl={item.image ?? "/images/placeholder-product.jpg"}
                bgColorClass={BG_COLORS[idx % BG_COLORS.length]}
                outOfStock={item.stock === 0}
              />
            </div>
          ))}
        </div>

        {/* Footer: nav buttons */}
        <div className="mt-10 flex justify-end items-center">
          <div className="flex gap-3">
            <button
              onClick={() => scroll("left")}
              aria-label="Scroll kiri"
              className="w-14 h-14 rounded-full border-2 border-foreground bg-transparent text-foreground flex items-center justify-center hover:bg-foreground hover:text-accent-yellow transition-colors cursor-pointer"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              onClick={() => scroll("right")}
              aria-label="Scroll kanan"
              className="w-14 h-14 rounded-full border-2 border-foreground bg-transparent text-foreground flex items-center justify-center hover:bg-foreground hover:text-accent-yellow transition-colors cursor-pointer"
            >
              <ChevronRight size={22} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Main Page Component
// ---------------------------------------------------------------------------
export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [isLoadingProduct, setIsLoadingProduct] = useState(true);

  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<ApiProduct[]>([]);

  const { isWishlisted: checkWishlist, toggleItem } = useWishlist();
  const { addToCart } = useCart();

  useEffect(() => {
    let active = true;
    setIsLoadingProduct(true);

    fetch(`/api/product/${encodeURIComponent(slug)}`)
      .then(async (response) => {
        if (!response.ok) throw new Error("Produk tidak ditemukan");
        return response.json();
      })
      .then((response) => {
        if (!active) return;
        const raw = response.data as ProductDetail;
        const safeImages =
          Array.isArray(raw.images) && raw.images.length > 0
            ? raw.images
            : [raw.mainImage];
        setProduct({
          ...raw,
          images: safeImages,
          mainImage: raw.mainImage ?? safeImages[0],
          videos: Array.isArray(raw.videos) ? raw.videos : [],
        });
      })
      .catch(() => active && setProduct(null))
      .finally(() => active && setIsLoadingProduct(false));

    fetch(`/api/product?limit=4&sort=newest`)
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (!active || !json?.data) return;
        const filtered = (json.data as ApiProduct[]).filter(
          (p) => p.slug !== slug,
        );
        setRelatedProducts(filtered.slice(0, 3));
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [slug]);

  const productId = product?.id ?? "";
  const isWishlisted = checkWishlist(productId);

  const handleDecrement = () => setQuantity((q) => Math.max(1, q - 1));
  const handleIncrement = () => setQuantity((q) => q + 1);

  const handleToggleWishlist = () => {
    if (!product) return;
    toggleItem({
      product_id: productId,
      product_name: product.name,
      product_slug: product.slug,
      image_url: product.mainImage.src,
      base_price: product.basePrice,
      in_stock: product.inStock,
    });
  };

  const handleAddToCart = async () => {
    if (!product?.defaultVariantId) return;
    setIsAdding(true);
    const ok = await addToCart({
      productId,
      variantId: product.defaultVariantId,
      quantity,
    });
    setIsAdding(false);
    if (ok) {
      setAddedSuccess(true);
      setTimeout(() => setAddedSuccess(false), 3000);
    }
  };

  if (isLoadingProduct) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center font-body">
        Memuat produk...
      </main>
    );
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center font-body">
        Produk tidak ditemukan.
      </main>
    );
  }

  return (
    <>
      <main className="w-full px-4 md:px-16 pt-35 md:pt-50 pb-12 bg-background min-h-screen">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-10 gap-10">
          
          {/* Left Column: Inline Galeri Media */}
          <div className="lg:col-span-5">
            <InlineProductMediaGallery
              images={product.images}
              videos={product.videos}
              productName={product.name}
            />
          </div>

          {/* Right Column: Product Info & Actions */}
          <div className="lg:col-span-5 flex flex-col">
            <div>
              {/* Bintang Rating Sesuai Permintaan (5 Bintang Kuning Berjajar) */}
              <div className="flex items-center gap-2 mb-2">
                <StarRating rating={product.rating} />
                <span className="text-sm font-semibold font-body text-muted-foreground underline cursor-pointer tracking-wide">
                  {product.reviewCount} ulasan
                </span>
              </div>

              <h1 className="font-heading font-bold text-2xl md:text-4xl text-foreground leading-tight mb-3 uppercase">
                {product.name}
              </h1>
              <p className="font-body text-sm text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </div>

            <div className="mt-28">
              <div className="flex items-baseline gap-3">
                <span className="font-heading font-bold text-3xl md:text-4xl text-foreground leading-tight">
                  {product.price}
                </span>
                {product.resellerNote && (
                  <span className="text-sm font-body text-muted-foreground">
                    {product.resellerNote}
                  </span>
                )}
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-6">
              {/* Quantity */}
              <QuantitySelector
                value={quantity}
                onDecrement={handleDecrement}
                onIncrement={handleIncrement}
              />
              {/* CTA Buttons */}
              <div className="flex items-center gap-3 w-full">
                <Button
                  variant="primary"
                  size="lg"
                  neo={false}
                  className="flex-1 rounded-full text-xs uppercase tracking-wider"
                  onClick={() => console.log("Buy now:", product.name, quantity)}
                >
                  Beli Sekarang
                </Button>

                <Button
                  variant="card"
                  size="lg"
                  neo={false}
                  className="flex-1 rounded-full text-xs uppercase tracking-wider bg-background border border-foreground text-foreground hover:bg-muted"
                  disabled={isAdding || !product.inStock || !product.defaultVariantId}
                  onClick={handleAddToCart}
                >
                  {isAdding
                    ? "Menambahkan..."
                    : addedSuccess
                      ? "✓ Ditambahkan"
                      : !product.inStock
                        ? "Stok Habis"
                        : "Tambah Ke Keranjang"}
                </Button>

                <WishlistButton
                  isWishlisted={isWishlisted}
                  onClick={handleToggleWishlist}
                  variant="accent-yellow"
                  size="icon-lg"
                  neo={false}
                  className="rounded-full border border-foreground shrink-0"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Section 2: Deskripsi & Komponen */}
        <ProductInfoSection product={product} />
      </main>

      {/* Section 4: You Might Also Like */}
      <RelatedProductsSection products={relatedProducts} />
    </>
  );
}