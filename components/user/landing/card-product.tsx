"use client";

import Image from"next/image";
import ProductCarousel from"@/components/user/landing/product-carousel";

// ==========================================
// SUB-COMPONENTS
// ==========================================

// Custom Arrow SVG yang disesuaikan
function CurvedArrowSVG({ className ="" }: { className?: string }) {
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
 {/* Gambar Mainan Kiri (images/toys.webp) */}
 <div className="hidden sm:block absolute top-24 sm:-left-4 md:-left-12 lg:-left-16 xl:left-10 w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 pointer-events-none select-none z-0 -rotate-12 transition-transform opacity-100">
 <Image
 src="/images/toys.webp"
 alt="Toy Decoration Left"
 fill
 className="object-contain"
 priority
 />
 </div>

 {/* Gambar Mainan Kanan (images/toy.webp) - Posisi lg disesuaikan agar tidak terlalu ke kiri */}
 <div className="hidden sm:block absolute sm:-top-2 sm:-right-8 md:-right-16 lg:-right-12 xl:right-10 sm:w-36 sm:h-36 md:w-40 md:h-40 lg:w-48 lg:h-48 xl:w-56 xl:h-56 pointer-events-none select-none z-50 opacity-100">
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
 <section className="relative bg-background pt-4 pb-12 sm:pt-6 lg:pt-8 px-4 sm:px-10 overflow-x-clip">
 {/* Hiasan Mainan Kiri & Kanan */}
 <SideToyDecorations />

 <div className="max-w-6xl mx-auto relative z-10">

 {/* HEADER SECTION */}
 <div className="text-center pt-2 sm:pt-4 lg:pt-6 mb-8 sm:mb-10">
 <SectionLabel text="Produk Terbaru" />
 <h2 className="font-heading text-xl sm:text-2xl lg:text-3xl font-extrabold text-foreground tracking-tight leading-snug">
 Koleksi Mainan &amp; Robot IoT <span className="text-foreground">Pilihan Terbaik</span>
 </h2>
 </div>

 {/* CAROUSEL PRODUK */}
 

<ProductCarousel />

 </div>
 </section>
 );
}