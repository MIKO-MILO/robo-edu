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

/** Heading with an arrow icon, coloured via the `accent` prop. */
function SectionHeading({
  children,
  accent = "text-primary",
}: {
  children: React.ReactNode;
  accent?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <h2
        className={`font-heading font-bold text-lg md:text-xl uppercase tracking-wide ${accent}`}
      >
        {children}
      </h2>
      <ChevronRight
        size={16}
        className="opacity-50 shrink-0"
        aria-hidden="true"
      />
    </div>
  );
}

/** Single key-component card: circular image + name + description. */
function ComponentCard({ item }: { item: ProductComponent }) {
  return (
    <li className="flex items-center gap-4 pb-5 last:pb-0 border-b border-border-strong/20 last:border-0">
      {/* Circular image — ProductImage handles fallback & optimisation */}
      <ProductImage
        src={item.imageSrc}
        alt={item.imageAlt}
        size="full"
        aspectRatio="square"
        className={`w-14 h-14 shrink-0 rounded-full border-2 border-foreground neo-shadow-icon ${item.bgClass}`}
        sizes="56px"
        priority={false}
      />
      {/* Text */}
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

/** Section 2: two-column layout — description left, components right. */
function ProductInfoSection({ product }: { product: ProductDetail }) {
  return (
    <section
      aria-label="Deskripsi dan Komponen Produk"
      className="max-w-5xl mx-auto mt-16 px-4 md:px-0"
    >
      {/* Full-width divider */}
      <hr className="border-2 border-foreground mb-12" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">
        {/* ── Left: Product Description ── */}
        <div className="flex flex-col gap-6 md:border-r-2 md:border-border-strong/20 md:pr-16 pb-10 md:pb-0 border-b-2 md:border-b-0 border-border-strong/20">
          <SectionHeading accent="text-primary">
            Deskripsi Produk
          </SectionHeading>

          <div className="flex flex-col gap-4">
            {product.longDescription.map((para, i) => (
              <p
                key={i}
                className="font-body text-sm text-muted-foreground leading-relaxed"
              >
                {para}
              </p>
            ))}
          </div>

          {/* Checklist highlights */}
          <ul
            className="flex flex-col gap-3 mt-2"
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

        {/* ── Right: Key Components ── */}
        <div className="flex flex-col gap-6">
          <SectionHeading accent="text-secondary">
            Component Pada Produk
          </SectionHeading>

          <ul className="flex flex-col gap-1" aria-label="Komponen produk">
            {product.components.map((comp) => (
              <ComponentCard key={comp.name} item={comp} />
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Section 3 — Ulasan Pengguna
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
        &ldquo;{review.text}&rdquo;
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

/** Section 3: Rating summary + horizontal scrollable review carousel */
function UserReviewsSection({ product }: { product: ProductDetail }) {
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
      aria-label="Ulasan Pengguna"
      className="max-w-5xl mx-auto mt-16 px-4 md:px-0 pb-16"
    >
      {/* Full-width divider */}
      <hr className="border-2 border-foreground mb-10" />

      {/* Section header */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="font-heading font-bold text-lg md:text-xl uppercase tracking-wide text-primary">
          Ulasan Pengguna
        </h2>
        <a
          href="#ulasan"
          className="font-body font-semibold text-xs uppercase tracking-widest text-primary hover:underline transition-all"
        >
          Lihat Semua Ulasan
        </a>
      </div>

      {/* Rating + Carousel row */}
      <div className="flex flex-col md:flex-row gap-8 md:gap-10 items-start w-full">
        {/* ── Left: Global rating summary ── */}
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

        {/* ── Right: Carousel ── */}
        <div className="relative flex items-center gap-2 flex-1 w-full min-w-0 group">
          {/* Left nav button */}
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

          {/* Scrollable card track */}
          <div
            ref={scrollRef}
            className="flex gap-5 overflow-x-auto pb-2 w-full snap-x snap-mandatory"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {product.reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>

          {/* Right nav button */}
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
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
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
        });
        setSelectedImageIndex(0);
      })
      .catch(() => active && setProduct(null))
      .finally(() => active && setIsLoadingProduct(false));

    // Fetch related products — ambil 8 produk, exclude current slug client-side
    fetch(`/api/product?limit=9&sort=newest`)
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (!active || !json?.data) return;
        const filtered = (json.data as ApiProduct[]).filter(
          (p) => p.slug !== slug,
        );
        setRelatedProducts(filtered.slice(0, 8));
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

  const safeImageIndex = Math.min(
    Math.max(selectedImageIndex, 0),
    Math.max(product.images.length - 1, 0),
  );
  const selectedImage = product.images[safeImageIndex] ?? product.mainImage;

  return (
    <>
      <main className="w-full px-4 md:px-16 py-12 bg-background min-h-screen">
        {/* Product Grid */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-10 gap-10">
          {/* Left Column: Images (5 cols) */}
          <div className="lg:col-span-5 flex flex-col md:flex-row gap-3">
            {/* Thumbnail Strip */}
            <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-visible shrink-0 order-2 md:order-1">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  aria-label={`Thumbnail ${idx + 1}`}
                  className={[
                    "w-14 h-14 md:w-16 md:h-16 rounded-lg overflow-hidden shrink-0 transition-all",
                    "border-2 bg-card",
                    safeImageIndex === idx
                      ? "border-foreground neo-shadow"
                      : "border-border-strong hover:border-foreground",
                  ].join(" ")}
                >
                  <ProductImage
                    src={img.src}
                    alt={img.alt}
                    size="full"
                    aspectRatio="square"
                    className="w-full h-full rounded-md"
                    sizes="64px"
                    priority={false}
                  />
                </button>
              ))}

              {/* Video Thumbnail Placeholder */}
              <button
                aria-label="Tonton video produk"
                className="w-14 h-14 md:w-16 md:h-16 border-2 border-border-strong bg-muted rounded-lg overflow-hidden shrink-0 flex items-center justify-center hover:border-foreground transition-all"
              >
                <PlayCircle size={24} className="text-primary" />
              </button>
            </div>

            {/* Main Image */}
            <div className="w-full aspect-square border-2 border-foreground neo-shadow rounded-2xl overflow-hidden order-1 md:order-2">
              <ProductImage
                src={selectedImage.src}
                alt={selectedImage.alt}
                size="full"
                aspectRatio="square"
                className="w-full h-full rounded-none border-0"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            </div>
          </div>

          {/* Right Column: Product Info (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Header */}
            <div>
              {/* Rating Row */}
              <div className="flex items-center gap-2 mb-2">
                <StarRating rating={product.rating} />
                <span className="text-sm font-semibold font-body text-muted-foreground underline cursor-pointer tracking-wide">
                  {product.reviewCount} ulasan
                </span>
              </div>

              {/* Product Name */}
              <h1 className="font-heading font-bold text-2xl md:text-3xl text-foreground leading-tight mb-2">
                {product.name}
              </h1>

              {/* Description */}
              <p className="font-body text-sm text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Price */}
            <div>
              <span className="font-heading font-bold text-2xl md:text-3xl text-primary block leading-tight">
                {product.price}
              </span>
              <span className="text-xs font-semibold font-body text-muted-foreground bg-muted px-2 py-1 rounded inline-block mt-1">
                {product.resellerNote}
              </span>
            </div>

            {/* Divider */}
            <hr className="border-border-strong" />

            {/* Actions */}
            <div className="flex flex-col gap-4">
              {/* Quantity Selector */}
              <div className="flex items-center gap-4">
                <span className="font-body font-semibold text-sm text-foreground uppercase tracking-widest">
                  Kuantitas
                </span>
                <div className="flex items-center border-2 border-foreground rounded-full overflow-hidden bg-card h-10 neo-shadow">
                  <button
                    onClick={handleDecrement}
                    aria-label="Kurangi jumlah"
                    className="px-4 h-full hover:bg-muted transition-colors flex items-center justify-center font-bold text-lg border-r-2 border-foreground cursor-pointer"
                  >
                    −
                  </button>
                  <input
                    readOnly
                    type="number"
                    value={quantity}
                    aria-label="Jumlah produk"
                    className="w-12 h-full text-center border-none outline-none font-body font-semibold text-sm p-0 m-0 bg-transparent"
                  />
                  <button
                    onClick={handleIncrement}
                    aria-label="Tambah jumlah"
                    className="px-4 h-full hover:bg-muted transition-colors flex items-center justify-center font-bold text-lg border-l-2 border-foreground cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex gap-4 w-full">
                {/* Add to Cart */}
                <Button
                  variant="primary"
                  size="lg"
                  neo
                  disabled={
                    isAdding || !product.inStock || !product.defaultVariantId
                  }
                  className="flex-1 rounded-full uppercase tracking-widest text-sm font-body font-bold"
                  onClick={handleAddToCart}
                >
                  {isAdding
                    ? "Menambahkan..."
                    : addedSuccess
                      ? "✓ Berhasil Ditambahkan!"
                      : !product.inStock
                        ? "Stok Habis"
                        : "Tambah Ke Keranjang"}
                </Button>

                {/* Wishlist */}
                <Button
                  variant="accent-yellow"
                  size="icon-lg"
                  neo
                  aria-label={
                    isWishlisted ? "Hapus dari wishlist" : "Tambah ke wishlist"
                  }
                  onClick={handleToggleWishlist}
                >
                  <Heart
                    size={20}
                    className={`transition-all ${
                      isWishlisted
                        ? "fill-foreground stroke-foreground"
                        : "fill-none stroke-foreground"
                    }`}
                  />
                </Button>
              </div>

              {/* Buy Now */}
              <Button
                variant="accent-pink"
                size="lg"
                neo
                className="w-full rounded-full uppercase tracking-widest text-sm font-body font-bold"
                onClick={() => console.log("Buy now:", product.name, quantity)}
              >
                Beli Sekarang
              </Button>
            </div>

            {/* Trust Badges */}
            {/* <div className="flex justify-between items-center border-t-2 border-border-strong pt-6">
            <div className="flex flex-col items-center gap-1 text-center">
              <span className="material-symbols-outlined text-primary text-3xl">
                local_shipping
              </span>
              <span className="font-body font-bold text-[10px] uppercase text-foreground">
                Pengiriman
                <br />
                Gratis
              </span>
            </div>
            <div className="flex flex-col items-center gap-1 text-center">
              <span className="material-symbols-outlined text-primary text-3xl">
                verified_user
              </span>
              <span className="font-body font-bold text-[10px] uppercase text-foreground">
                Pembayaran
                <br />
                Aman
              </span>
            </div>
            <div className="flex flex-col items-center gap-1 text-center">
              <span className="material-symbols-outlined text-primary text-3xl">
                autorenew
              </span>
              <span className="font-body font-bold text-[10px] uppercase text-foreground">
                Retur
                <br />
                Mudah
              </span>
            </div>
          </div> */}
          </div>
        </div>
        {/* ── Section 2: Deskripsi & Komponen ── */}
        <ProductInfoSection product={product} />
        {/* ── Section 3: Ulasan Pengguna ── */}
        <UserReviewsSection product={product} />
      </main>
      {/* ── Section 4: You Might Also Like (full-bleed) ── */}
      <RelatedProductsSection products={relatedProducts} />
    </>
  );
}
