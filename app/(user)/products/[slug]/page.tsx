"use client";

import { useRef, useState } from "react";
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
import Navbar from "@/components/user/navbar";
import Footer from "@/components/user/footer";

// ---------------------------------------------------------------------------
// Dummy product data — replace with real API call using `params.slug`
// ---------------------------------------------------------------------------
const DUMMY_PRODUCT = {
  name: "ROBO KIT CAR",
  description:
    "Kit robotika pemula yang interaktif. Bangun mobil pintar pertamamu dan pelajari dasar-dasar mekanika dan pemrograman dengan cara yang menyenangkan.",
  longDescription: [
    "Robo Kit Car adalah kit robotika edukatif yang dirancang untuk merangsang kreativitas dan memperkuat kemampuan logika anak melalui pendekatan belajar yang interaktif dan menyenangkan.",
    "Dilengkapi dengan modul yang dapat diprogram, sensor pintar, dan komponen modular, kit ini membantu mengembangkan kemampuan berpikir kritis, pemecahan masalah, dan potensi rekayasa alami anak.",
  ],
  highlights: [
    "Cocok untuk semua tingkat kemampuan (pemula hingga mahir)",
    "Ideal untuk rutinitas belajar harian yang menyenangkan",
    "Komponen aman, kokoh, dan bebas BPA",
    "Telah diuji dan direkomendasikan oleh para pendidik",
  ],
  components: [
    {
      name: "Mikrokontroler Utama",
      description: "Memproses data dan menjalankan program secara real-time.",
      imageSrc:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAz3wg5NltTZZCafvNA25gtiGIkWzg6LD4EVpxgIoPFNKP7xLSjwY706qCY-nVcelo3wBbWMqXWALl04RFur9Z63g_h1WiTZg4zLCLoRjdzGoUM69KwdUKJqOip9Gbix392kFdNqCZcpVTU_RSL_yK2qzaZKXjQ1Olw5MfoIxS18Hjhr3IlzMgBfqUlPdbn_-skCRn7uO8I8p1NyBA-glVR40-DWf0y98cQS9muDUhKLHjnNqZfLJYx",
      imageAlt: "Modul mikrokontroler biru",
      bgClass: "bg-accent-soft-blue",
    },
    {
      name: "Sensor Ultrasonik",
      description:
        "Mendeteksi hambatan dengan presisi tinggi untuk navigasi yang cerdas.",
      imageSrc:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAEqFBuszY_MKYpo5PRWfLJIrzWeEq6qPwStGvHcZCZu7BND77LiFhXg840UWZ_3dButeCaTW9sVeonPs0Xb0EH2SXng4Kjs5zRKV_MU6qmhzNPC3lnMapfuIev2xvRwQ1uSUr0oJEH2M3tMqsA0GHAc7sqH2GzG_j6mY_G-01boSPCJ7yy2CfEljVP1vMjNECZ_ggAkFZY2P54_KenkQMnjkgx9-Iyvhf3k8ew30aLgsXNGYwnkMQS",
      imageAlt: "Sensor ultrasonik merah",
      bgClass: "bg-accent-peach",
    },
    {
      name: "Komponen Modular",
      description: "Memperkuat struktur robot dan menyederhanakan perakitan.",
      imageSrc:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAW_BFZN5LRip7mnewOxrjTF116yTUn1bHFroxGkSyYuQMOmLaQvm96AupvVuja9GrQieO7Wrlgxlx4ZOBypoAdzOD0CR4Ta9QgZju3kC58l1sVmil1NpR3UM65WkyZArLvSdErO9wOMseLbPmV3cNUiqYKuTar56P8JQf5fM3H0Fkso4WKKcVCGdHHFs0Ed7RwrT2m2UISW6k2Yfzto7qe0OSdkc1ycwvjxLLuU_XU3sQhZJMdt9rS",
      imageAlt: "Komponen modular kuning-oranye",
      bgClass: "bg-accent-yellow",
    },
  ],
  price: "Rp 450.000",
  resellerNote: "Harga reseller tersedia mulai dari pembelian 5+ unit",
  rating: 4.5,
  reviewCount: 128,
  images: [
    {
      src: "https://lh3.googleusercontent.com/aida-public/AB6AXuAvDjLM-1x9_JpmXVLuM33wFfFk1vPtVtw6S9Xi-KUyNEF96Bb9W2tT6Gi2Z92jt3JUvGYbtinTpy9Kx8uyOdnDK4RcgEIy2RCXbL1N7kxtCw-YrMtbv3LmErDoy7BLoKY0uisanfBdz04E3IhPV2UWG4G74K1GCXI732ZneiTAvijZLwAUZT9_YYxRhiKyivZZi-ds_KUf8xV4q3rk1g9S_ukXcssXd3Oe4PHnodilQn66R1FA2l4O",
      alt: "Close up view of the Robo Kit Car wheel and chassis components",
    },
    {
      src: "https://lh3.googleusercontent.com/aida-public/AB6AXuCG7v1zUs3VNVl0R-hieky9wBAr9TFLnJZmechRFdkJ0oufEOxLz5O1YimfGz4IvBj9BDOMawt0wiDjX2HTTctB_RWpbuGJtUAp7DwdCW0nI0TSdtMMd7r63Pb5onzHEZaxFZid39gwYdXJ_p_aUPE6UfdD6CQ5sxXGMtR__iu0FIkWqzC2Tp06iuxXsv35H_xV_uyagV_g8JiAW29t3zYAVoS3iKowCvAQATxY4imEGEPF422DxwwE",
      alt: "Top down view of the assembled Robo Kit Car",
    },
    {
      src: "https://lh3.googleusercontent.com/aida-public/AB6AXuAdbg2d5fAC-LaBHXOLj2k9yF62fjjGBggrM__qvSzCcvPZ--Q5E4Diw17xWyYivSDcd7ymzViv8tv4vNbgtOxZiGlD7ve_O3nZ9ydvC5iMyuZG7RCeCLw92ZZqWbcMsnERGwi9-GYcxrwsTWgheEdvlzR-iJEOlQSXGfPvu9rIyvFPlbL5JrdjnTGY-zzkBcE4mWfCAVT8amoS2jU-gtUQ2vA1YkqFSl-2pCQWHYXVzvQ517je0GbY",
      alt: "A child hand inserting a battery block into the Robo Kit Car",
    },
  ],
  mainImage: {
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuAgia76n4xdKR_ut-9v1-eLzW9Nxh9TbTF-WMqnFMYlzj85lO9Gn-R2HDc596ITfPFUrqa-LxS42EzQ-_dQeA1bnq8H7YoPIcLmjv8KM1VQ42F31Jd4G5KvB9NsD_iqul08fSmFzDhwDsmnTwD35F5RBtrhpvb4OvhtzMsXaJWDjXF2nfI_UYy0OoZislvwE6MAsxtiCqGBckNtd9wHAhfDOk_Hg72XJR2tFeOfeq3_qdBMUb5MI23d6IDrRF5CUr_LCVqPOCRV-ZnMTA",
    alt: "Main product view",
  },
  reviews: [
    {
      id: 1,
      rating: 5,
      text: "Anak saya sangat suka! ROBO KIT CAR ini sangat membantu belajarnya. Instruksinya sangat jelas dan mudah diikuti.",
      author: "Budi S.",
      verified: true,
    },
    {
      id: 2,
      rating: 5,
      text: "Materi pembelajaran futuristik yang mudah dipahami anak-anak. Kualitas kit sangat solid dan tahan lama.",
      author: "Siti Aminah",
      verified: true,
    },
    {
      id: 3,
      rating: 5,
      text: "Pengalaman merakit yang luar biasa. Edukasi STEM terbaik yang pernah kami beli untuk si kecil.",
      author: "Andi W.",
      verified: true,
    },
    {
      id: 4,
      rating: 4,
      text: "Paket lengkap dan rapi. Panduan assembly sangat membantu. Anak saya berhasil merakit sendiri dalam 2 jam!",
      author: "Dewi R.",
      verified: true,
    },
    {
      id: 5,
      rating: 5,
      text: "Kualitas komponen premium, pengiriman cepat. Sangat direkomendasikan untuk semua orang tua!",
      author: "Hendra K.",
      verified: false,
    },
  ],
  reviewSummary: {
    average: 4.9,
    total: 128,
  },
  relatedProducts: [
    {
      id: "robo-kit-car",
      name: "Robo Kit Car",
      price: "Rp 450.000",
      rating: 5.0,
      reviewCount: "1.2k ulasan",
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAzp64I7KxJ2xLlnURX5aaowFMMGYPMOf7ef029lHOWRxVCGBsvly_bAPnQJsYI9XjwY6i5zy6rAjFiup8ZpJSe7jNBaBm7YB8duMQQ9Hz0_1GbIPHUrPKJl8nggSIevLh-lGEk4xCwN68_-VDnZ5ZNJEB6LA5a2Ke4nXBRR0zpgTqHQni06UOdSVQHuucsyRvxfvnOhokoIekMOMC2m8OLH0JYDKYGD7eLd1pRxg0hAsiAEv7b56_T",
      bgColorClass: "bg-accent-pink",
    },
    {
      id: "robo-kit-windmill",
      name: "Robo Kit Wind Mill",
      price: "Rp 320.000",
      rating: 4.9,
      reviewCount: "850 ulasan",
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDRaUv-8qSmAliwDPGA6O17bwlb8AU1S_-4s6CAsKtSREesa3H6H1oTvOjR3ot4A0tcrPGN-WLyHUa7A0Pf5vl0sBdu4SiYhGq6OMjWLOMTOKVyRUW7yK1rEGh9Fqm-k80t8_-YI1B3dEREGZjdhY96cI_LiUWAUAFI6HiK-1vG39fOYYmVD9-6b6x-28IpC4p198EbMqYmF8RJSDmq7vDb7B4jame75MJ-YQYatMyxa91_GRq8oCUi",
      bgColorClass: "bg-accent-soft-blue",
    },
    {
      id: "robotic-arm-pro",
      name: "Robotic Arm Pro",
      price: "Rp 850.000",
      rating: 4.8,
      reviewCount: "2.1k ulasan",
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAihi_QCJFiHnQKAr2hnRorulwJ1ynIttCOmpEsZEC_SYrif89M9E7toAZnk9yFxYKPXRzRs1hUvnKd0ioCTNROJyslt2vdzKZz8LtLg3njgRU4D5oti9SqhBdVxb6FbNAAioZzp-yAvCQtFxnygQq5io4gvUfu6NeIs_d1Gl6mAZNWruKXZ2zI-FSCPfOrpPSJRjvnD5qx-qW0k2LmoJM9uZFUA9kRggYnU7zhvct2MDzEBdY814SM",
      bgColorClass: "bg-accent-mint",
    },
    {
      id: "smart-home-starter",
      name: "Smart Home Starter",
      price: "Rp 550.000",
      rating: 5.0,
      reviewCount: "420 ulasan",
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAwEvnOVrqoO9FZOzzbjHU71OIEEs6m2fJrivInyEq9sGh62MFTCBunxqp0ZsU0qdg_pCcqD6DL71NKd7flxhPFxnC-1Eq_GE48zYbHWzXHbh1OtrlXAWAalsqVeUVdHTQrEUzDbcfWI7yRE0-01tzSnO0gYKmGZKg-c-IS9kp_svtgxhPtm2ErzbvU5ridVvqwm7RDuKXqLt8Cceedld9mCWqHYPCsxo6dZOj30ChpA_Tespr6oHiW",
      bgColorClass: "bg-accent-yellow",
    },
    {
      id: "robo-explorer",
      name: "Robo Explorer",
      price: "Rp 680.000",
      rating: 4.7,
      reviewCount: "310 ulasan",
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAgia76n4xdKR_ut-9v1-eLzW9Nxh9TbTF-WMqnFMYlzj85lO9Gn-R2HDc596ITfPFUrqa-LxS42EzQ-_dQeA1bnq8H7YoPIcLmjv8KM1VQ42F31Jd4G5KvB9NsD_iqul08fSmFzDhwDsmnTwD35F5RBtrhpvb4OvhtzMsXaJWDjXF2nfI_UYy0OoZislvwE6MAsxtiCqGBckNtd9wHAhfDOk_Hg72XJR2tFeOfeq3_qdBMUb5MI23d6IDrRF5CUr_LCVqPOCRV-ZnMTA",
      bgColorClass: "bg-accent-peach",
    },
  ],
};

// Type helpers derived from dummy data
type ProductComponent = (typeof DUMMY_PRODUCT.components)[number];
type ProductReview = (typeof DUMMY_PRODUCT.reviews)[number];
type RelatedProduct = (typeof DUMMY_PRODUCT.relatedProducts)[number];

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
function ProductInfoSection({ product }: { product: typeof DUMMY_PRODUCT }) {
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
    <div className="flex items-center gap-0.5 text-[#FFD700]" aria-hidden="true">
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
        min-w-[280px] md:min-w-[300px] max-w-[300px]
        bg-card rounded-xl p-6
        border-2 border-foreground neo-shadow
        flex flex-col gap-3
        snap-center
        transition-transform hover:-translate-y-0.5
      "
    >
      <ReviewStars rating={review.rating} />

      <p className="font-body text-sm text-foreground leading-relaxed flex-grow">
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
function UserReviewsSection({ product }: { product: typeof DUMMY_PRODUCT }) {
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
          <div className="font-heading font-black leading-none text-primary" style={{ fontSize: "72px", letterSpacing: "-0.03em" }}>
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

/** Full-bleed yellow carousel section with related products. */
function RelatedProductsSection({
  products,
}: {
  products: RelatedProduct[];
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -340 : 340,
      behavior: "smooth",
    });
  };

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
          {products.map((item) => (
            <div
              key={item.id}
              className="flex-none w-[260px] md:w-[300px] snap-start"
            >
              <ProductCard
                name={item.name}
                price={item.price}
                rating={item.rating}
                reviewCount={item.reviewCount}
                imageUrl={item.imageUrl}
                bgColorClass={item.bgColorClass}
                onDetailClick={() =>
                  console.log("Detail:", item.id)
                }
              />
            </div>
          ))}
        </div>

        {/* Footer: decorative line + nav buttons */}
        <div className="mt-10 flex justify-between items-center border-t-2 border-foreground pt-4">
          <div className="hidden md:block h-px bg-foreground flex-1 mr-6" />
          <div className="flex gap-3 ml-auto">
            <button
              onClick={() => scroll("left")}
              aria-label="Scroll kiri"
              className="
                w-12 h-12 rounded-full
                border-2 border-foreground
                flex items-center justify-center
                hover:bg-foreground hover:text-accent-yellow
                transition-colors
              "
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => scroll("right")}
              aria-label="Scroll kanan"
              className="
                w-12 h-12 rounded-full
                border-2 border-foreground
                flex items-center justify-center
                hover:bg-foreground hover:text-accent-yellow
                transition-colors
              "
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
  const product = DUMMY_PRODUCT;
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const handleDecrement = () => setQuantity((q) => Math.max(1, q - 1));
  const handleIncrement = () => setQuantity((q) => q + 1);

  return (
    <>
      <Navbar />
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
                  selectedImageIndex === idx
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
              src={
                selectedImageIndex < product.images.length
                  ? product.images[selectedImageIndex].src
                  : product.mainImage.src
              }
              alt={product.mainImage.alt}
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
                className="flex-1 rounded-full uppercase tracking-widest text-sm font-body font-bold"
                onClick={() =>
                  console.log("Add to cart:", product.name, quantity)
                }
              >
                Tambah Ke Keranjang
              </Button>

              {/* Wishlist */}
              <Button
                variant="accent-yellow"
                size="icon-lg"
                neo
                aria-label={
                  isWishlisted ? "Hapus dari wishlist" : "Tambah ke wishlist"
                }
                onClick={() => setIsWishlisted((w) => !w)}
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
    <RelatedProductsSection products={product.relatedProducts} />
    <Footer />
    </>
  );
}
