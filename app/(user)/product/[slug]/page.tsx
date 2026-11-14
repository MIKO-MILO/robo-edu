"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import {
  Star,
  StarHalf,
  ChevronLeft,
  ChevronRight,
  PlayCircle,
  Heart,
  CheckCircle2,
  UserCircle,
  BadgeCheck,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductImage } from "@/components/ui/product-image";
import { ProductCard } from "@/components/ui/product-card";
import { useWishlist } from "@/contexts/wishlist-context";
import { useCart } from "@/contexts/cart-context";
// ---------------------------------------------------------------------------
// Type definitions — data shape real dari /api/product/[slug] (sumber: database)
// ---------------------------------------------------------------------------
interface ProductImage {
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
  images: ProductImage[];
  mainImage: ProductImage;
  videos: ProductVideo[];
  reviews: ProductReview[];
  reviewSummary: { average: number; total: number };
  relatedProducts: RelatedProduct[];
}

// Type untuk produk listing dari API
interface ApiProduct {
  id: string;
  name: string;
  slug: string;
  price: { min: number | null; max: number | null };
  image: string | null;
}

// ---------------------------------------------------------------------------
// Star Rating Helper
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
// Section 2 — Deskripsi Produk & Komponen
// ---------------------------------------------------------------------------
/** Renders filled / half / empty stars for a given numeric rating */
function ReviewStars({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div
      className="flex items-center gap-0.5 text-[#FFD700]"
      aria-hidden="true"
    >
      {[1, 2, 3, 4, 5].map((s) => {
        const filled = rating >= s;
        const half = !filled && rating >= s - 0.5;
        if (half)
          return (
            <StarHalf
              key={s}
              size={size}
              className="fill-[#FFD700] stroke-[#FFD700]"
            />
          );
        return (
          <Star
            key={s}
            size={size}
            className={
              filled
                ? "fill-[#FFD700] stroke-[#FFD700]"
                : "fill-none stroke-[#FFD700]"
            }
          />
        );
      })}
    </div>
  );
}

/** Single review card */
function ReviewCard({ review }: { review: ProductReview }) {
  return (
    <article
      className="
        min-w-70 md:min-w-75 max-w-75
        bg-card rounded-xl p-6
        border-2 border-foreground neo-shadow
        flex flex-col gap-3
        snap-center
        transition-transform hover:-translate-y-0.5
      "
    >
      <ReviewStars rating={review.rating} />

      <p className="font-body text-sm text-foreground leading-relaxed grow">
        “{review.text}”
      </p>

      {/* Author footer */}
      <div className="flex items-center justify-between border-t border-border-strong/20 pt-3 mt-1">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full border-2 border-border-strong/30 bg-muted flex items-center justify-center shrink-0">
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

/** Single key-component card: circular image + name + description. */
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

/** Product Info & Reviews Section with 3 Tabs */
/** Product Info & Reviews Section with 3 Tabs */
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
      {/* Garis pemisah utama (Dibuat sedikit lebih tebal dengan border-t-2) */}
      <hr className="border-t-2 border-foreground/40 mb-8" />

      {/* Tabs Header (3 Tab: Deskripsi, Komponen, Ulasan) */}
      <div className="flex items-center gap-8 mb-8 relative border-b-2 border-foreground/30 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("description")}
          className={`pb-3 font-heading font-bold text-lg md:text-xl uppercase tracking-wide transition-colors relative shrink-0 cursor-pointer ${
            activeTab === "description" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Deskripsi Produk
          {activeTab === "description" && (
            <span className="absolute bottom-0 left-0 w-full h-[2.5px] bg-foreground transition-all" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("components")}
          className={`pb-3 font-heading font-bold text-lg md:text-xl uppercase tracking-wide transition-colors relative shrink-0 cursor-pointer ${
            activeTab === "components" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Komponen Produk
          {activeTab === "components" && (
            <span className="absolute bottom-0 left-0 w-full h-[2.5px] bg-foreground transition-all" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("reviews")}
          className={`pb-3 font-heading font-bold text-lg md:text-xl uppercase tracking-wide transition-colors relative shrink-0 cursor-pointer ${
            activeTab === "reviews" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Ulasan Pengguna
          {activeTab === "reviews" && (
            <span className="absolute bottom-0 left-0 w-full h-[2.5px] bg-foreground transition-all" />
          )}
        </button>
      </div>

      {/* Tab Contents */}
      <div className="py-2">
        {activeTab === "description" && (
          <div className="flex flex-col gap-6 animate-fadeIn">
            <div className="flex flex-col gap-4 max-w-3xl">
              {product.longDescription.map((para, i) => (
                <p
                  key={i}
                  className="font-body text-sm text-muted-foreground leading-relaxed"
                >
                  {para}
                </p>
              ))}
            </div>

            <ul
              className="flex flex-col gap-3 mt-2 max-w-3xl"
              aria-label="Keunggulan produk"
            >
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
            {/* Left: Global rating summary */}
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

            {/* Right: Carousel */}
            <div className="relative flex items-center gap-2 flex-1 w-full min-w-0 group">
              <button
                onClick={() => scroll("left")}
                aria-label="Scroll ulasan ke kiri"
                className="
                  absolute -left-4 z-10
                  w-10 h-10 rounded-full
                  bg-card border-2 border-foreground neo-shadow-icon
                  flex items-center justify-center
                  opacity-0 group-hover:opacity-100
                  transition-opacity hover:bg-muted
                  shrink-0
                "
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
                className="
                  absolute -right-4 z-10
                  w-10 h-10 rounded-full
                  bg-card border-2 border-foreground neo-shadow-icon
                  flex items-center justify-center
                  opacity-0 group-hover:opacity-100
                  transition-opacity hover:bg-muted
                  shrink-0
                "
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

// ---------------------------------------------------------------------------
// Section 4 — You Might Also Like
// ---------------------------------------------------------------------------

const BG_COLORS = [
  "bg-accent-pink",
  "bg-accent-soft-blue",
  "bg-accent-mint",
  "bg-accent-yellow",
  "bg-accent-peach",
  "bg-accent-purple",
];

/** Full-bleed yellow carousel section with related products. */
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
      className="w-full bg-accent-yellow py-16 px-4 md:px-16 relative overflow-hidden"
    >
      <div className="max-w-5xl mx-auto">
        {/* Section heading */}
        <h2
          className="font-heading font-black text-3xl md:text-5xl uppercase tracking-tighter text-foreground mb-10"
          style={{ letterSpacing: "-0.06em" }}
        >
          You Might Also Like...
        </h2>

        {/* Scrollable card track */}
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto pb-2 snap-x snap-mandatory"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {products.map((item, idx) => (
            <div
              key={item.id}
              className="flex-none w-65 md:w-75 snap-start"
            >
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
              />
            </div>
          ))}
        </div>

        {/* Footer: nav buttons */}
        <div className="mt-10 flex justify-between items-center border-t-2 border-foreground pt-4">
          <div className="hidden md:block h-px bg-foreground flex-1 mr-6" />
          <div className="flex gap-3 ml-auto">
            <button
              onClick={() => scroll("left")}
              aria-label="Scroll kiri"
              className="w-12 h-12 rounded-full border-2 border-foreground flex items-center justify-center hover:bg-foreground hover:text-accent-yellow transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => scroll("right")}
              aria-label="Scroll kanan"
              className="w-12 h-12 rounded-full border-2 border-foreground flex items-center justify-center hover:bg-foreground hover:text-accent-yellow transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------
export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [isLoadingProduct, setIsLoadingProduct] = useState(true);
  // selectedMedia: { type: "image", index: number } | { type: "video", index: number }
  const [selectedMedia, setSelectedMedia] = useState<
    { type: "image"; index: number } | { type: "video"; index: number }
  >({ type: "image", index: 0 });
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<ApiProduct[]>([]);

  const { isWishlisted: checkWishlist, toggleItem } = useWishlist();
  const { addToCart } = useCart();

  useEffect(() => {
    let active = true;
    const loadingTimer = setTimeout(() => {
      if (active) setIsLoadingProduct(true);
    }, 0);
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
        setSelectedMedia({ type: "image", index: 0 });
      })
      .catch(() => active && setProduct(null))
      .finally(() => active && setIsLoadingProduct(false));

    // Fetch related products — ambil 3 produk, exclude current slug client-side
    fetch(`/api/product?limit=4&sort=newest`)
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (!active || !json?.data) return;
        const filtered = (json.data as ApiProduct[]).filter(
          (p) => p.slug !== slug,
        );
        setRelatedProducts(filtered.slice(0, 3));
      })
      .catch(() => {
        /* non-fatal */
      });
      
    return () => {
      active = false;
      clearTimeout(loadingTimer);
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

  const safeImageIndex =
    selectedMedia.type === "image"
      ? Math.min(Math.max(selectedMedia.index, 0), Math.max(product.images.length - 1, 0))
      : 0;
  const selectedImage = product.images[safeImageIndex] ?? product.mainImage;

  return (
    <>
   <main className="w-full px-4 md:px-16 pt-35 md:pt-50 pb-12 bg-background min-h-screen">
        {/* Product Grid */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-10 gap-10">
 {/* Left Column: Images & Videos (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {/* Main Viewer (Kotak Besar tanpa outline & tanpa neo-shadow) */}
            <div className="w-full aspect-square bg-card rounded-2xl overflow-hidden p-4 flex items-center justify-center">
              {selectedMedia.type === "video" && product.videos[selectedMedia.index] ? (
                <video
                  key={product.videos[selectedMedia.index].url}
                  src={product.videos[selectedMedia.index].url}
                  controls
                  autoPlay
                  className="w-full h-full object-contain bg-black rounded-xl"
                  aria-label={product.videos[selectedMedia.index].title ?? "Video produk"}
                >
                  Browser kamu tidak mendukung tag video.
                </video>
              ) : (
                <ProductImage
                  src={selectedImage.src}
                  alt={selectedImage.alt}
                  size="full"
                  aspectRatio="square"
                  className="w-full h-full object-contain rounded-xl border-0"
                  sizes="(max-width: 1024px) 85vw, 40vw"
                  priority
                />
              )}
            </div>

            {/* Thumbnail Strip: 3 Thumbnail di Tengah dengan Border/Outline Biru pada yang Aktif */}
            <div className="flex items-center justify-center gap-6">
              {/* Tombol Panah Kiri */}
              <button
                onClick={() => {
                  const totalMedia = product.images.length + product.videos.length;
                  if (totalMedia <= 1) return;
                  const currentIndex = selectedMedia.type === "image" 
                    ? selectedMedia.index 
                    : product.images.length + selectedMedia.index;
                  const prevIndex = (currentIndex - 1 + totalMedia) % totalMedia;
                  if (prevIndex < product.images.length) {
                    setSelectedMedia({ type: "image", index: prevIndex });
                  } else {
                    setSelectedMedia({ type: "video", index: prevIndex - product.images.length });
                  }
                }}
                aria-label="Media sebelumnya"
                className="p-2 text-foreground hover:text-primary transition-colors cursor-pointer"
              >
                <ArrowLeft size={26} strokeWidth={2.5} />
              </button>

              {/* Container 3 Thumbnail */}
              <div className="flex items-center gap-8">
                {(() => {
                  const allMedia = [
                    ...product.images.map((img, i) => ({ type: "image" as const, index: i, data: img })),
                    ...product.videos.map((vid, i) => ({ type: "video" as const, index: i, data: vid }))
                  ];
                  const total = allMedia.length;
                  if (total === 0) return null;

                  const currentIndex = selectedMedia.type === "image" 
                    ? selectedMedia.index 
                    : product.images.length + selectedMedia.index;

                  const visibleItems = [
                    allMedia[(currentIndex - 1 + total) % total],
                    allMedia[currentIndex % total],
                    allMedia[(currentIndex + 1) % total],
                  ];

                  return visibleItems.map((item, idx) => {
                    const isSelected = item.type === selectedMedia.type && item.index === selectedMedia.index;
                    const uniqueKey = `slot-${idx}-${item.type}-${item.index}`;

                    if (item.type === "image") {
                      const img = item.data as (typeof product.images)[0];
                      return (
                        <button
                          key={uniqueKey}
                          onClick={() => setSelectedMedia({ type: "image", index: item.index })}
                          aria-label={`Foto produk ${item.index + 1}`}
                          className={[
                            "w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden shrink-0 transition-all bg-card",
                            // Jika aktif diberi border tipis biru, jika tidak transparan/tanpa border
                            isSelected
                              ? "border-2 border-blue-500 shadow-sm scale-105"
                              : "border border-transparent opacity-70 hover:opacity-100",
                          ].join(" ")}
                        >
                          <ProductImage
                            src={img.src}
                            alt={img.alt}
                            size="full"
                            aspectRatio="square"
                            className="w-full h-full object-cover rounded-lg"
                            sizes="80px"
                            priority={false}
                          />
                        </button>
                      );
                    } else {
                      const video = item.data as (typeof product.videos)[0];
                      return (
                        <button
                          key={uniqueKey}
                          onClick={() => setSelectedMedia({ type: "video", index: item.index })}
                          aria-label={video.title ?? `Video produk ${item.index + 1}`}
                          title={video.title ?? `Video ${item.index + 1}`}
                          className={[
                            "w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden shrink-0 transition-all bg-muted flex items-center justify-center",
                            isSelected
                              ? "border-2 border-blue-500 shadow-sm scale-105 bg-blue-500/10"
                              : "border border-transparent opacity-70 hover:opacity-100",
                          ].join(" ")}
                        >
                          <PlayCircle
                            size={24}
                            className={isSelected ? "text-blue-500" : "text-muted-foreground"}
                          />
                        </button>
                      );
                    }
                  });
                })()}
              </div>

              {/* Tombol Panah Kanan */}
              <button
                onClick={() => {
                  const totalMedia = product.images.length + product.videos.length;
                  if (totalMedia <= 1) return;
                  const currentIndex = selectedMedia.type === "image" 
                    ? selectedMedia.index 
                    : product.images.length + selectedMedia.index;
                  const nextIndex = (currentIndex + 1) % totalMedia;
                  if (nextIndex < product.images.length) {
                    setSelectedMedia({ type: "image", index: nextIndex });
                  } else {
                    setSelectedMedia({ type: "video", index: nextIndex - product.images.length });
                  }
                }}
                aria-label="Media selanjutnya"
                className="p-2 text-foreground hover:text-primary transition-colors cursor-pointer"
              >
                <ArrowRight size={26} strokeWidth={2.5} />
              </button>
            </div>
          </div>

        {/* Right Column: Product Info (5 cols) */}
          <div className="lg:col-span-5 flex flex-col">
            {/* Header: Judul & Deskripsi (Tanpa Rating) */}
            <div>
              {/* Product Name */}
              <h1 className="font-heading font-bold text-2xl md:text-4xl text-foreground leading-tight mb-3 uppercase">
                {product.name}
              </h1>

              {/* Description */}
              <p className="font-body text-sm text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Gap Lebih Jauh dari Deskripsi ke Harga */}
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

            {/* Actions: Quantity & Tombol Sejajar */}
            <div className="mt-6 flex flex-col gap-6">
              {/* Quantity Selector */}
              <div className="flex flex-col gap-2">
                <span className="font-body font-semibold text-sm text-foreground">
                  Quantity
                </span>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={handleDecrement}
                    aria-label="Kurangi jumlah"
                    className="w-8 h-8 rounded-full bg-foreground text-background hover:opacity-80 transition-opacity flex items-center justify-center font-bold text-base cursor-pointer"
                  >
                    −
                  </button>
                  <span className="font-body font-bold text-base text-foreground min-w-[1.5rem] text-center">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={handleIncrement}
                    aria-label="Tambah jumlah"
                    className="w-8 h-8 rounded-full bg-foreground text-background hover:opacity-80 transition-opacity flex items-center justify-center font-bold text-base cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* CTA Buttons: Sejajar 1 Baris (Beli Sekarang | Tambah Ke Keranjang | Wishlist Tanpa Bayangan) */}
              <div className="flex items-center gap-3 w-full">
                {/* Buy Now (Hitam solid pill) */}
                <button
                  type="button"
                  onClick={() => console.log("Buy now:", product.name, quantity)}
                  className="flex-1 h-12 px-5 rounded-full bg-foreground text-background font-body font-bold text-xs uppercase tracking-wider hover:opacity-95 transition-opacity cursor-pointer"
                >
                  Beli Sekarang
                </button>

                {/* Add to Cart (Outline hitam pill) */}
                <button
                  type="button"
                  disabled={
                    isAdding || !product.inStock || !product.defaultVariantId
                  }
                  onClick={handleAddToCart}
                  className="flex-1 h-12 px-5 rounded-full bg-transparent border border-foreground text-foreground font-body font-bold text-xs uppercase tracking-wider hover:bg-foreground/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isAdding
                    ? "Menambahkan..."
                    : addedSuccess
                      ? "✓ Ditambahkan"
                      : !product.inStock
                        ? "Stok Habis"
                        : "Tambah Ke Keranjang"}
                </button>

                {/* Wishlist (Bulat Kuning TANPA BAYANGAN / neo-shadow) */}
                <button
                  type="button"
                  aria-label={
                    isWishlisted ? "Hapus dari wishlist" : "Tambah ke wishlist"
                  }
                  onClick={handleToggleWishlist}
                  className="w-12 h-12 rounded-full bg-[#FFE156] border border-foreground flex items-center justify-center shrink-0 hover:opacity-90 transition-opacity cursor-pointer"
                >
                  <Heart
                    size={20}
                    className={`transition-all ${
                      isWishlisted
                        ? "fill-foreground stroke-foreground"
                        : "fill-none stroke-foreground"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

        </div>
        {/* ── Section 2: Deskripsi & Komponen ── */}
        <ProductInfoSection product={product} />
        {/* ── Section 3: Ulasan Pengguna ── */}
      </main>
      {/* ── Section 4: You Might Also Like (full-bleed) ── */}
      <RelatedProductsSection products={relatedProducts} />
    </>
  );
}
