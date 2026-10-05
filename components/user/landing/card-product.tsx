"use client";

import Image from "next/image";
import ProductCarousel from "@/components/user/landing/product-carousel";

// ==========================================
// SUB-COMPONENTS
// ==========================================

// Custom Arrow SVG yang disesuaikan
function CurvedArrowSVG({ className = "" }: { className?: string }) {
  return (
    <svg
      width="477"
      height="205"
      viewBox="0 0 477 205"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M26.9974 0C26.9974 13.5283 10.6085 88.3099 2.41406 124.01L90.9141 140.92"
        stroke="currentColor"
        strokeWidth="20"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2.41406 124.008C2.41406 124.008 98.8292 34.4932 169.581 45.0975C264.431 59.3137 260.819 206.898 356.414 202.929C418.68 200.343 474.414 124.012 474.414 124.012"
        stroke="currentColor"
        strokeWidth="20"
        strokeLinecap="round"
      />
    </svg>
  );
}

// Atom: Section Label
function SectionLabel({ text }: { text: string }) {
  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3 mb-2">
      {/* Panah Kiri */}
      <CurvedArrowSVG className="w-6 sm:w-10 h-auto text-[#C0392B]" />

      <span className="font-body text-xs sm:text-sm font-bold text-[#C0392B] tracking-wide uppercase">
        {text}
      </span>

      {/* Panah Kanan */}
      <CurvedArrowSVG className="w-6 sm:w-10 h-auto text-[#C0392B] scale-x-[-1]" />
    </div>
  );
}

// Atom: Side Toy Decorations (Kiri & Kanan)
function SideToyDecorations() {
  return (
    <>
      {/* Gambar Mainan Kiri (images/toy2.webp) - Lebih ke bawah & condong ke kiri (-rotate-12) */}
      <div className="absolute top-20 left-4 sm:top-28 sm:left-12 md:left-20 lg:left-28 w-28 h-28 sm:w-40 sm:h-40 md:w-52 md:h-52 pointer-events-none select-none z-0 -rotate-12 transition-transform">
        <Image
          src="/images/toy2.webp"
          alt="Toy Decoration Left"
          fill
          className="object-contain"
          priority
        />
      </div>

      {/* Gambar Mainan Kanan (images/toy.webp) */}
      <div className="absolute top-1 right-1 sm:top-2 sm:right-8 md:right-16 lg:right-24 w-36 h-36 sm:w-52 sm:h-52 md:w-72 md:h-72 pointer-events-none select-none z-0">
        <Image
          src="/images/toy.webp"
          alt="Toy Decoration Right"
          fill
          className="object-contain"
          priority
        />
      </div>
    </>
  );
}

// ==========================================
// MAIN ORGANISM COMPONENT
// ==========================================
export default function ProductShowcase() {
  return (
    <section className="relative bg-background py-12 px-4 sm:px-10 overflow-hidden">
      {/* Hiasan Mainan Kiri & Kanan */}
      <SideToyDecorations />

      <div className="max-w-6xl mx-auto relative z-10">

        {/* HEADER SECTION */}
        <div className="text-center pt-8 sm:pt-12 mb-8 sm:mb-10">
          <SectionLabel text="Produk Terbaru" />
          <h2 className="font-heading text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#3D2900] tracking-tight leading-snug">
            Koleksi Mainan &amp; Robot IoT <span className="text-[#3D2900]">Pilihan Terbaik</span>
          </h2>
        </div>

        {/* CAROUSEL PRODUK */}
        

<ProductCarousel />

      </div>
    </section>
  );
}