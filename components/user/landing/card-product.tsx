
"use client";

import Image from "next/image";
import ProductCarousel from "@/components/user/landing/product-carousel";

import type { CarouselProductItem } from "@/components/user/landing/product-carousel";

export type ProductItem = CarouselProductItem;

// ==========================================
// SUB-COMPONENTS
// ==========================================

// Atom: Section Label
function SectionLabel({ text }: { text: string }) {
  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3 mb-2">
      <span className="font-body text-base sm:text-lg font-bold text-promo-red tracking-wide uppercase">
        {text}
      </span>
    </div>
  );
}

// ==========================================
// Side Toy Decorations
// ==========================================

function SideToyDecorations() {
  return (
    <>
      {/* Gambar Mainan Kiri (toy3.webp) */}
      <div
        className="
          hidden sm:block absolute
          -top-2 sm:top-0 lg:-top-2
          sm:-left-20 md:-left-20 lg:-left-24 xl:-left-32
          w-24 h-24
          sm:w-32 sm:h-32
          md:w-[7.2rem] md:h-[7.2rem]
          lg:w-40 lg:h-40
          xl:w-44 xl:h-44
          2xl:w-52 2xl:h-52
          pointer-events-none select-none
          z-30
        "
      >
        <Image
          src="/images/toy3.webp"
          alt="Toy Decoration Left"
          fill
          className="object-contain drop-shadow-md"
          priority
        />
      </div>

      {/* Gambar Mainan Kanan (toy1.webp) */}
      <div
        className="
          hidden sm:block absolute
          top-4 sm:top-6 md:top-1 lg:top-4
          sm:-right-12 md:-right-24 lg:-right-16 xl:-right-20
          w-28 h-28
          sm:w-36 sm:h-36
          md:w-24 md:h-24
          lg:w-44 lg:h-44
          xl:w-48 xl:h-48
          2xl:w-60 2xl:h-60
          pointer-events-none select-none
          z-30
        "
      >
        <Image
          src="/images/toy1.webp"
          alt="Toy Decoration Right"
          fill
          className="object-contain drop-shadow-md"
          priority
        />
      </div>
    </>
  );
}

// ==========================================
// MAIN ORGANISM COMPONENT
// ==========================================

export interface ProductShowcaseProps {
  products?: CarouselProductItem[];
}

export default function ProductShowcase({
  products,
}: ProductShowcaseProps) {
  return (
    <section className="relative bg-background pt-4 pb-12 sm:pt-6 lg:pt-8 px-4 sm:px-10 overflow-x-clip">
      <div className="max-w-6xl mx-auto relative">

        {/* Hiasan Mainan Kiri & Kanan */}
        <SideToyDecorations />

        {/* HEADER SECTION */}
        <div className="text-center pt-2 sm:pt-4 lg:pt-6 mb-8 sm:mb-10 relative z-10">
          <SectionLabel text="Produk Terbaru" />

          <h2 className="font-heading text-xl sm:text-2xl lg:text-3xl font-extrabold text-foreground tracking-tight leading-snug">
            Koleksi Mainan &amp; Robot IoT{" "}
            <span className="text-foreground">
              Pilihan Terbaik
            </span>
          </h2>
        </div>

        {/* CAROUSEL PRODUK */}
        <div className="relative z-10">
          <ProductCarousel products={products} />
        </div>

      </div>
    </section>
  );
}
