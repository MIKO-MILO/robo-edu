"use client";

import { PASTEL_VARIANTS } from "@/components/ui/filter-button";
import { WishlistAwareProductCard } from "@/components/user/wishlist/wishlist-aware-product-card";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface CarouselProductItem {
  id: number;
  name: string;
  category?: string;
  price: string;
  image: string;
}

interface ProductGridProps {
  products?: CarouselProductItem[];
}

const DEFAULT_PRODUCTS: CarouselProductItem[] = [
  { id: 1, name: "IoT Smart Walking Dog",      category: "Kids Toys", price: "Rp 450.000", image: "images/product.webp" },
  { id: 2, name: "Smart Servo Mechanical Cat", category: "Kids Toys", price: "Rp 520.000", image: "images/product2.webp" },
  { id: 3, name: "IoT Obstacle Avoiding Dino", category: "Kids Toys", price: "Rp 610.000", image: "images/product.webp" },
  { id: 4, name: "Bluetooth Racing Mech Bug",  category: "Kids Toys", price: "Rp 380.000", image: "images/product2.webp" },
  { id: 5, name: "Smart IoT Climbing Monkey",  category: "Kids Toys", price: "Rp 690.000", image: "images/product.webp" },
  { id: 6, name: "IoT Smart Walking Dog Extra",category: "Kids Toys", price: "Rp 450.000", image: "images/product2.webp" },
];

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * ProductGrid — renders landing page product showcase using the same
 * WishlistAwareProductCard component used in the catalog page.
 * No duplicated card code — single source of truth in components/ui/product-card.tsx.
 */
export default function ProductGrid({ products = DEFAULT_PRODUCTS }: ProductGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product, index) => (
        <WishlistAwareProductCard
          key={product.id}
          id={String(product.id)}
          name={product.name}
          price={product.price}
          imageUrl={`/${product.image}`}
          bgColorClass={PASTEL_VARIANTS[index % PASTEL_VARIANTS.length]}
        />
      ))}
    </div>
  );
}
