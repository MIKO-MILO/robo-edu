"use client";

import { useState } from "react";
import { Search } from "lucide-react";

import { HeroSection } from "@/components/user/catalog/hero-section";
import { FilterButton } from "@/components/user/catalog/filter-button";
import { ProductCard } from "@/components/user/catalog/product-card";
import type { ProductListItem } from "@/types";

// ---------------------------------------------------------------------------
// Dummy data — will be replaced by real API calls (GET /products)
// Typed against ProductListItem from @/types/catalog.ts
// ---------------------------------------------------------------------------

const CATEGORIES = [
  { id: "all", label: "Semua" },
  { id: "robot-kit", label: "Robot Kit" },
  { id: "sparepart", label: "Sparepart" },
  { id: "elektronik", label: "Elektronik" },
  { id: "energi", label: "Energi" },
  { id: "kendaraan", label: "Kendaraan" },
];

/**
 * bgColorClass cycles through the pastel accent colours defined in globals.css
 * (--color-accent-*). Maps to Tailwind utility classes added via @theme.
 */
const CARD_BG_CLASSES = [
  "bg-accent-pink",
  "bg-accent-soft-blue",
  "bg-accent-peach",
  "bg-accent-green",
  "bg-accent-yellow",
  "bg-accent-blue",
  "bg-accent-orange",
  "bg-accent-purple",
];

interface DummyProduct
  extends Pick<
    ProductListItem,
    "id" | "name" | "slug" | "status" | "primary_image_url" | "rating_average"
  > {
  price: string;
  reviewCount: string;
}

const DUMMY_PRODUCTS: DummyProduct[] = [
  {
    id: "1",
    name: "Rubber Band Helicopter Kit",
    slug: "rubber-band-helicopter-kit",
    status: "ACTIVE",
    // Unsplash: toy helicopter / craft kit
    primary_image_url:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80",
    rating_average: 4.8,
    price: "Rp50.000",
    reviewCount: "1.2k ulasan",
  },
  {
    id: "2",
    name: "Robo Kit Wind Mill",
    slug: "robo-kit-wind-mill",
    status: "ACTIVE",
    // Unsplash: wind turbine model
    primary_image_url:
      "https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=400&q=80",
    rating_average: 4.9,
    price: "Rp75.000",
    reviewCount: "987 ulasan",
  },
  {
    id: "3",
    name: "Robo Kit Car — Merah",
    slug: "robo-kit-car-merah",
    status: "ACTIVE",
    // Unsplash: toy car / remote control car
    primary_image_url:
      "https://images.unsplash.com/photo-1594787317083-7c7d3e1e34cd?w=400&q=80",
    rating_average: 5.0,
    price: "Rp120.000",
    reviewCount: "3.4k ulasan",
  },
  {
    id: "4",
    name: "Solar Panel Mini Starter",
    slug: "solar-panel-mini-starter",
    status: "ACTIVE",
    // Unsplash: solar panel
    primary_image_url:
      "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&q=80",
    rating_average: 4.7,
    price: "Rp95.000",
    reviewCount: "654 ulasan",
  },
  {
    id: "5",
    name: "Dinamo Motor DC 3-6V",
    slug: "dinamo-motor-dc-3-6v",
    status: "ACTIVE",
    // Unsplash: electric motor / gear
    primary_image_url:
      "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&q=80",
    rating_average: 4.6,
    price: "Rp25.000",
    reviewCount: "2.1k ulasan",
  },
  {
    id: "6",
    name: "Arduino Starter Kit Basic",
    slug: "arduino-starter-kit-basic",
    status: "ACTIVE",
    // Unsplash: arduino / circuit board
    primary_image_url:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=80",
    rating_average: 4.9,
    price: "Rp185.000",
    reviewCount: "890 ulasan",
  },
  {
    id: "7",
    name: "LED Strip Colour Pack",
    slug: "led-strip-colour-pack",
    status: "ACTIVE",
    // Unsplash: LED lights
    primary_image_url:
      "https://images.unsplash.com/photo-1563396983906-b3795482a59a?w=400&q=80",
    rating_average: 4.5,
    price: "Rp35.000",
    reviewCount: "1.8k ulasan",
  },
  {
    id: "8",
    name: "Sensor Ultrasonik HC-SR04",
    slug: "sensor-ultrasonik-hc-sr04",
    status: "ACTIVE",
    // Unsplash: electronics components
    primary_image_url:
      "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=400&q=80",
    rating_average: 4.8,
    price: "Rp18.000",
    reviewCount: "3.2k ulasan",
  },
];

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default function CatalogPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Client-side filter — replace with server-side query params for real API
  const filteredProducts = DUMMY_PRODUCTS.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    // Category filter is a stub until real category_id data is wired in
    return matchesSearch;
  });

  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <HeroSection />

      {/* Catalog Section */}
      <section
        id="katalog"
        className="w-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col gap-8"
      >
        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 border-2 border-foreground rounded-2xl p-4 bg-card shadow-[4px_4px_0px_0px_#3D2900]">
          <label
            htmlFor="catalog-search"
            className="font-heading font-bold text-foreground text-lg whitespace-nowrap"
          >
            What you&apos;re up for?
          </label>
          <div className="flex flex-1 items-center gap-2 bg-background rounded-xl border border-border px-4 py-2">
            <Search className="w-5 h-5 text-muted-foreground shrink-0" />
            <input
              id="catalog-search"
              type="search"
              placeholder="Cari kit, sparepart, atau komponen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground text-sm font-body"
            />
          </div>
          <button
            type="submit"
            className="bg-foreground text-background font-semibold font-body px-6 py-2.5 rounded-xl border-2 border-foreground neo-shadow neo-shadow-hover transition-all duration-100 active:scale-95"
          >
            Search
          </button>
        </div>

        {/* Category Filter Pills */}
        <div
          role="group"
          aria-label="Filter kategori"
          className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1"
        >
          {CATEGORIES.map((cat) => (
            <FilterButton
              key={cat.id}
              isActive={activeCategory === cat.id}
              onClick={() => setActiveCategory(cat.id)}
              aria-pressed={activeCategory === cat.id}
            >
              {cat.label}
            </FilterButton>
          ))}
        </div>

        {/* Result Count */}
        <p className="text-sm text-muted-foreground font-body">
          Menampilkan{" "}
          <span className="font-semibold text-foreground">
            {filteredProducts.length}
          </span>{" "}
          produk
          {activeCategory !== "all" && (
            <span>
              {" "}di kategori{" "}
              <span className="font-semibold text-foreground">
                {CATEGORIES.find((c) => c.id === activeCategory)?.label}
              </span>
            </span>
          )}
        </p>

        {/* Product Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {filteredProducts.map((product, index) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                price={product.price}
                rating={product.rating_average ?? 5.0}
                reviewCount={product.reviewCount}
                imageUrl={
                  product.primary_image_url ??
                  "/images/placeholder-product.jpg"
                }
                bgColorClass={CARD_BG_CLASSES[index % CARD_BG_CLASSES.length]}
                onDetailClick={() => {
                  // TODO: router.push(`/catalog/${product.slug}`)
                  console.log("Go to detail:", product.slug);
                }}
                onWishlistClick={() => {
                  // TODO: call POST /wishlist API
                  console.log("Add to wishlist:", product.id);
                }}
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <span
              className="text-6xl"
              role="img"
              aria-label="Tidak ditemukan"
            >
              🔍
            </span>
            <h2 className="font-heading font-bold text-xl text-foreground">
              Produk tidak ditemukan
            </h2>
            <p className="text-muted-foreground font-body max-w-xs">
              Coba kata kunci lain atau pilih kategori yang berbeda.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setActiveCategory("all");
              }}
              className="mt-2 px-6 py-2.5 rounded-full border-2 border-foreground bg-card font-semibold font-body text-sm neo-shadow neo-shadow-hover transition-all active:scale-95"
            >
              Reset Filter
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
