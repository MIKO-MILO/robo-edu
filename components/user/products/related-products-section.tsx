"use client";

import React, { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/ui/product-card";
import { useWishlist } from "@/contexts/wishlist-context";
import { useCart } from "@/contexts/cart-context";
import type { Product } from "@/types/product";

export interface ApiProductItem {
  id: string;
  name: string;
  slug: string;
  price: { min: number | null; max?: number | null };
  image?: string | null;
  stock?: number;
}

const BG_COLORS = [
  "bg-accent-pink",
  "bg-accent-soft-blue",
  "bg-accent-mint",
  "bg-accent-yellow",
  "bg-accent-peach",
  "bg-accent-purple",
];

export function RelatedProductsSection({
  products,
}: {
  products: (ApiProductItem | Product)[];
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { isWishlisted, toggleItem: toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -340 : 340,
      behavior: "smooth",
    });
  };

  if (!products || products.length === 0) return null;

  return (
    <section
      aria-label="Produk Yang Mungkin Kamu Suka"
      className="w-full bg-accent-sky py-16 px-4 md:px-16 relative overflow-hidden"
    >
      <div className="max-w-5xl mx-auto">
        {/* Section heading di kiri */}
<div className="mb-12 flex flex-col items-start text-left w-full">
  <h2
    className="font-heading font-black text-2xl md:text-4xl uppercase tracking-tighter text-accent-yellow mb-0"
    style={{ letterSpacing: "-0.06em" }}
  >
    You Might Also Like...
  </h2>

  {/* Container SVG di kiri & dipanjangkan */}
  <div className="w-full flex justify-start -mt-2">
    <svg
      width="480"
      height="44"
      viewBox="0 0 152 35"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="overflow-visible text-accent-yellow w-80 sm:w-[440px] md:w-[500px] lg:w-[540px] max-w-full h-auto"
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
          className="flex gap-6 overflow-x-auto pb-4 pt-2 snap-x snap-mandatory"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {products.map((item, idx) => (
            <div
              key={item.id}
              className="flex-none w-[260px] md:w-[300px] snap-start"
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
                outOfStock={item.stock === 0}
                isWishlisted={isWishlisted(item.id)}
                onWishlistClick={() =>
                  toggleWishlist({
                    product_id: item.id,
                    product_name: item.name,
                    product_slug: item.slug,
                    image_url: item.image ?? "/images/placeholder-product.jpg",
                    base_price: item.price.min ?? 0,
                    in_stock: item.stock !== 0,
                  })
                }
                onAddToCart={() =>
                  addToCart({ productId: item.id, quantity: 1 })
                }
              />
            </div>
          ))}
        </div>

        {/* Footer: nav buttons */}
      <div className="mt-10 flex justify-end items-center">
  <div className="flex gap-3">
    <button
      type="button"
      onClick={() => scroll("left")}
      aria-label="Scroll kiri"
      className="w-14 h-14 rounded-full bg-accent-yellow text-secondary flex items-center justify-center hover:brightness-95 transition cursor-pointer"
    >
      <ChevronLeft size={22} />
    </button>
    <button
      type="button"
      onClick={() => scroll("right")}
      aria-label="Scroll kanan"
      className="w-14 h-14 rounded-full bg-accent-yellow text-secondary flex items-center justify-center hover:brightness-95 transition cursor-pointer"
    >
      <ChevronRight size={22} />
    </button>
  </div>
</div>
      </div>
    </section>
  );
}
