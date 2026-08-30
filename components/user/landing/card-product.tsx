"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

// ==========================================
// 1. TYPES & INTERFACES (Backend-Ready)
// ==========================================
export interface ProductItem {
  id: number;
  name: string;
  category: string;
  description: string;
  image: string;
  age: string;
  size: string;
  duration: string;
}

export interface ProductShowcaseProps {
  products?: ProductItem[];
}

const DEFAULT_PRODUCTS: ProductItem[] = [
  {
    id: 1,
    name: "IoT Smart Walking Dog",
    category: "IoT Robotics",
    description: "Robot anjing pintar yang bisa berjalan dan berekspresi menggunakan kontrol jarak jauh berbasis Wi-Fi.",
    image: "/images/foto.jpg",
    age: "8-12 Years",
    size: "24 Series",
    duration: "45 Mins",
  },
  {
    id: 2,
    name: "Smart Servo Mechanical Cat",
    category: "IoT Animals",
    description: "Merakit robot kucing interaktif dengan kendali sensor gerak dan servo motor via aplikasi smartphone.",
    image: "/images/foto.jpg",
    age: "9-14 Years",
    size: "28 Series",
    duration: "60 Mins",
  },
  {
    id: 3,
    name: "IoT Obstacle Avoiding Dino",
    category: "Smart Automation",
    description: "Dinosaurus robot pintar yang dapat mendeteksi rintangan dan bergerak otomatis dengan sensor ultrasonik.",
    image: "/images/foto.jpg",
    age: "10-15 Years",
    size: "32 Series",
    duration: "75 Mins",
  },
  {
    id: 4,
    name: "Bluetooth Racing Mech Bug",
    category: "IoT & Display",
    description: "Buggy robot serangga nirkabel yang gesit bergerak menggunakan kontrol Bluetooth dari ponsel.",
    image: "/images/foto.jpg",
    age: "7-12 Years",
    size: "20 Series",
    duration: "40 Mins",
  },
  {
    id: 5,
    name: "Smart IoT Climbing Monkey",
    category: "IoT Robotics",
    description: "Robot monyet cerdas yang dirancang khusus untuk memanjat tali dengan mekanisme servo berkecepatan tinggi.",
    image: "/images/foto.jpg",
    age: "11-15 Years",
    size: "35 Series",
    duration: "90 Mins",
  },
];

// ==========================================
// 2. SUB-COMPONENTS (Atomic Elements)
// ==========================================

// Atom: Background Gear Decoration
function GearDecoration() {
  return (
    <div className="absolute top-2 left-0 sm:top-4 sm:left-2 w-36 h-36 sm:w-48 sm:h-48 pointer-events-none select-none z-0 opacity-75 rotate-12 scale-x-[-1] -translate-x-6 sm:-translate-x-10">
      <Image
        src="/images/gear2.png"
        alt="Gear Decoration"
        fill
        className="object-contain"
        priority
      />
    </div>
  );
}

// Atom: Navigation Button
function NavButton({
  direction,
  onClick,
  ariaLabel,
  className = "",
}: {
  direction: "left" | "right";
  onClick: () => void;
  ariaLabel: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={`w-12 h-12 sm:w-14 sm:h-14 bg-card text-[#103B5E] rounded-full flex items-center justify-center shadow-lg transition-transform duration-200 hover:scale-105 cursor-pointer border-0 ${className}`}
    >
      {direction === "left" ? (
        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
      ) : (
        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
      )}
    </button>
  );
}

// Molecule: Product Card Specifications Pill
function ProductSpecsPill({
  age,
  size,
  duration,
  productName,
}: {
  age: string;
  size: string;
  duration: string;
  productName: string;
}) {
  return (
    <div className="bg-[#103B5E] text-[#DEECF8] rounded-full py-1.5 px-3 sm:p-2 flex items-center justify-between shadow-md shrink-0 w-full">
      <div className="grid grid-cols-3 divide-x divide-[#DEECF8]/20 flex-1 text-center px-1 min-w-0">
        <div className="truncate px-0.5">
          <span className="block text-[7px] sm:text-[8px] text-[#A7CDEC] font-medium">Age</span>
          <span className="text-[9px] sm:text-[10px] font-bold text-[#DEECF8] truncate block">{age}</span>
        </div>
        <div className="truncate px-0.5">
          <span className="block text-[7px] sm:text-[8px] text-[#A7CDEC] font-medium">Size</span>
          <span className="text-[9px] sm:text-[10px] font-bold text-[#DEECF8] truncate block">{size}</span>
        </div>
        <div className="truncate px-0.5">
          <span className="block text-[7px] sm:text-[8px] text-[#A7CDEC] font-medium">Duration</span>
          <span className="text-[9px] sm:text-[10px] font-bold text-[#DEECF8] truncate block">{duration}</span>
        </div>
      </div>

      <button
        type="button"
        aria-label={`Pesan ${productName}`}
        className="w-6 h-6 sm:w-7 sm:h-7 bg-accent text-[#3D2900] hover:bg-accent/90 rounded-full flex items-center justify-center shrink-0 ml-1.5 transition-transform duration-200 hover:scale-105 cursor-pointer shadow-sm border-0"
      >
        <ArrowRight className="w-3 h-3 text-[#3D2900]" />
      </button>
    </div>
  );
}

// Molecule: Individual Product Card (Image-Dominant Layout)
function ProductCard({ product }: { product: ProductItem }) {
  return (
    <div className="relative bg-card p-4 sm:p-5 shadow-xl shadow-black/[0.04] hover:shadow-2xl transition-all duration-300 flex flex-col justify-between group rounded-[2rem] sm:rounded-[2.5rem] w-full max-w-[285px] sm:max-w-none mx-auto h-full">
      <div className="flex flex-col flex-1">
        {/* Area Gambar Diperbesar (Dominan) */}
        <div className="relative w-full h-44 sm:h-56 bg-muted overflow-hidden mb-3 rounded-[1.25rem] sm:rounded-[1.75rem] shrink-0">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover transform group-hover:scale-105 transition-transform duration-500"
          />
        </div>

        {/* Deskripsi dihapus, hanya menyisakan Judul & Kategori agar lebih ringkas */}
        <h3 className="font-heading text-sm sm:text-base font-bold text-foreground mb-0.5 line-clamp-1">
          {product.name}
        </h3>
        <span className="text-[10px] sm:text-[11px] font-semibold text-primary block mb-3 truncate">
          {product.category}
        </span>
      </div>

      <div className="mt-auto">
        <ProductSpecsPill
          age={product.age}
          size={product.size}
          duration={product.duration}
          productName={product.name}
        />
      </div>
    </div>
  );
}

// ==========================================
// 3. MAIN ORGANISM COMPONENT
// ==========================================
export default function ProductShowcase({ products = DEFAULT_PRODUCTS }: ProductShowcaseProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % products.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + products.length) % products.length);
  };

  const getVisibleProducts = (breakpoint: 'mobile' | 'tablet' | 'desktop') => {
    if (breakpoint === 'mobile') {
      return [products[currentIndex]];
    }
    const count = breakpoint === 'tablet' ? 2 : 3;
    const visible = [];
    for (let i = 0; i < count; i++) {
      const index = (currentIndex + i) % products.length;
      visible.push(products[index]);
    }
    return visible;
  };

  return (
    <section className="relative bg-background py-6 px-4 sm:px-6 overflow-hidden">
      <GearDecoration />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="relative px-0 sm:px-14">
          {/* Navigation Left */}
          <NavButton
            direction="left"
            onClick={handlePrev}
            ariaLabel="Previous slide"
            className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-20 hover:bg-card/90"
          />

          {/* Navigation Right */}
          <NavButton
            direction="right"
            onClick={handleNext}
            ariaLabel="Next slide"
            className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20 hover:bg-card/90"
          />

          {/* Product Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            {/* Mobile View: 1 produk */}
            <div className="block md:hidden w-full flex justify-center">
              <ProductCard product={products[currentIndex]} />
            </div>

            {/* Tablet View: 2 produk */}
            <div className="hidden md:contents lg:hidden">
              {getVisibleProducts('tablet').map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Desktop View: 3 produk */}
            <div className="hidden lg:contents">
              {getVisibleProducts('desktop').map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>

          {/* Horizontal Indicator Lines */}
          <div className="flex justify-center items-center gap-2 mt-8">
            {products.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setCurrentIndex(index)}
                aria-label={`Go to slide ${index + 1}`}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer border-0 ${
                  currentIndex === index
                    ? "w-10 bg-[#103B5E]"
                    : "w-4 bg-[#103B5E]/20 hover:bg-[#103B5E]/40"
                }`}
              />
            ))}
          </div>

          {/* Mobile & Tablet Navigation Controls */}
          <div className="flex md:hidden justify-center items-center gap-4 mt-6">
            <NavButton
              direction="left"
              onClick={handlePrev}
              ariaLabel="Previous slide"
              className="w-12 h-12 shadow-md"
            />
            <NavButton
              direction="right"
              onClick={handleNext}
              ariaLabel="Next slide"
              className="w-12 h-12 shadow-md"
            />
          </div>
        </div>
      </div>
    </section>
  );
}