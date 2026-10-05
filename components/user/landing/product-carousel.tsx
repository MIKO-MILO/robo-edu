"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

// ==========================================
// TYPES (Backend-Ready)
// ==========================================
export interface CarouselProductItem {
  id: number;
  name: string;
  price: string;
  image: string;
}

interface ProductCarouselProps {
  products?: CarouselProductItem[];
}

const DEFAULT_CAROUSEL_PRODUCTS: CarouselProductItem[] = [
  {
    id: 1,
    name: "IoT Smart Walking Dog",
    price: "Rp 450.000",
    image: "images/product.webp",
  },
  {
    id: 2,
    name: "Smart Servo Mechanical Cat",
    price: "Rp 520.000",
    image: "images/product2.webp",
  },
  {
    id: 3,
    name: "IoT Obstacle Avoiding Dino",
    price: "Rp 610.000",
    image: "images/product.webp",
  },
  {
    id: 4,
    name: "Bluetooth Racing Mech Bug",
    price: "Rp 380.000",
    image: "images/product2.webp",
  },
  {
    id: 5,
    name: "Smart IoT Climbing Monkey",
    price: "Rp 690.000",
    image: "images/product.webp",
  },
];

const VISIBLE_COUNT = 3;

// ==========================================
// MAIN COMPONENT
// ==========================================
export default function ProductCarousel({ products = DEFAULT_CAROUSEL_PRODUCTS }: ProductCarouselProps) {
  const [startIndex, setStartIndex] = useState(0);

  const handlePrev = () => {
    setStartIndex((prev) => (prev - 1 + products.length) % products.length);
  };

  const handleNext = () => {
    setStartIndex((prev) => (prev + 1) % products.length);
  };

  // Build visible products (wraps around)
  const visibleProducts = Array.from(
    { length: VISIBLE_COUNT },
    (_, i) => products[(startIndex + i) % products.length]
  );

  const totalDots = products.length - VISIBLE_COUNT + 1;

  return (
    <div className="relative w-full">
      {/* Carousel Row */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Left Arrow */}
        <button
          type="button"
          onClick={handlePrev}
          aria-label="Produk sebelumnya"
          className="shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-[#7C3AED] text-white flex items-center justify-center shadow-lg hover:bg-[#6D28D9] transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer z-10"
        >
          <ChevronLeft className="w-7 h-7 sm:w-8 sm:h-8 stroke-[2.5]" />
        </button>

        {/* Product Cards Grid */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleProducts.map((product, idx) => (
            <div
              key={`${product.id}-${idx}`}
              className="border-2 border-[#7C3AED] hover:border-[#6D28D9] rounded-2xl p-5 flex flex-col items-center text-center justify-between gap-4 group transition-all duration-300 hover:-translate-y-1"
            >
              {/* Product Image Container */}
              <div className="relative w-full aspect-square max-w-[240px] mx-auto overflow-visible p-2 flex items-center justify-center">
                <div className="relative w-full h-full">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    unoptimized
                    className="object-contain filter drop-shadow-xl group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
              </div>

              {/* Product Info */}
              <div className="flex flex-col items-center gap-1.5 w-full">
                {/* Product Name */}
                <p className="font-heading font-bold text-base sm:text-lg text-[#3D2900] leading-snug line-clamp-2 px-1">
                  {product.name}
                </p>

                {/* Price */}
                <p className="font-heading font-extrabold text-lg sm:text-xl text-[#18598D]">
                  {product.price}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Right Arrow */}
        <button
          type="button"
          onClick={handleNext}
          aria-label="Produk selanjutnya"
          className="shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-[#7C3AED] text-white flex items-center justify-center shadow-lg hover:bg-[#6D28D9] transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer z-10"
        >
          <ChevronRight className="w-7 h-7 sm:w-8 sm:h-8 stroke-[2.5]" />
        </button>
      </div>

      {/* Dot Indicators */}
      <div className="flex justify-center items-center gap-2 mt-8">
        {Array.from({ length: Math.max(totalDots, 1) }).map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setStartIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`rounded-full transition-all duration-300 cursor-pointer border-0 ${
              startIndex === i
                ? "w-6 h-2.5 bg-[#7C3AED]"
                : "w-2.5 h-2.5 bg-[#7C3AED]/30 hover:bg-[#7C3AED]/60"
            }`}
          />
        ))}
      </div>
    </div>
  );
}