import { HeroSection } from "@/components/user/products/hero-section";
import { SearchBar } from "@/components/user/products/search-bar";
import { CategoryFilterList } from "@/components/user/products/category-filter-list";
import { ProductCard } from "@/components/ui/product-card";
import { Pagination } from "@/components/ui/pagination";
import { PASTEL_VARIANTS } from "@/components/ui/filter-button";
import CarouselLogo from "@/components/user/carousel-logo";
import type { ProductListItem } from "@/types";

const CATEGORIES = [
  { id: "all", label: "Semua" },
  { id: "robot-kit", label: "Robot Kit" },
  { id: "sparepart", label: "Sparepart" },
  { id: "elektronik", label: "Elektronik" },
  { id: "energi", label: "Energi" },
  { id: "kendaraan", label: "Kendaraan" },
];

interface DummyProduct
  extends Pick<
    ProductListItem,
    "id" | "name" | "slug" | "status" | "primary_image_url" | "rating_average"
  > {
  price: string;
  reviewCount: string;
  categoryId: string;
}

const DUMMY_PRODUCTS: DummyProduct[] = [
  {
    id: "1",
    name: "Rubber Band Helicopter Kit",
    slug: "rubber-band-helicopter-kit",
    status: "ACTIVE",
    categoryId: "kendaraan",
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
    categoryId: "energi",
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
    categoryId: "kendaraan",
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
    categoryId: "energi",
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
    categoryId: "sparepart",
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
    categoryId: "elektronik",
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
    categoryId: "elektronik",
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
    categoryId: "elektronik",
    primary_image_url:
      "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=400&q=80",
    rating_average: 4.8,
    price: "Rp18.000",
    reviewCount: "3.2k ulasan",
  },
  {
    id: "9",
    name: "Robo Buddy Smart Kit",
    slug: "robo-buddy-smart-kit",
    status: "ACTIVE",
    categoryId: "robot-kit",
    primary_image_url:
      "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&q=80",
    rating_average: 4.9,
    price: "Rp250.000",
    reviewCount: "410 ulasan",
  },
  {
    id: "10",
    name: "Crawler Robot Chassis Tank",
    slug: "crawler-robot-chassis-tank",
    status: "ACTIVE",
    categoryId: "robot-kit",
    primary_image_url:
      "https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=400&q=80",
    rating_average: 4.7,
    price: "Rp160.000",
    reviewCount: "530 ulasan",
  },
  {
    id: "11",
    name: "Servo Motor Micro SG90",
    slug: "servo-motor-micro-sg90",
    status: "ACTIVE",
    categoryId: "sparepart",
    primary_image_url:
      "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&q=80",
    rating_average: 4.6,
    price: "Rp15.000",
    reviewCount: "4.1k ulasan",
  },
  {
    id: "12",
    name: "Battery Pack 18650 Holder",
    slug: "battery-pack-18650-holder",
    status: "ACTIVE",
    categoryId: "sparepart",
    primary_image_url:
      "https://images.unsplash.com/photo-1619725002198-6a689b72f41d?w=400&q=80",
    rating_average: 4.8,
    price: "Rp12.000",
    reviewCount: "1.5k ulasan",
  },
];

type ProductsPageProps = {
  searchParams: Promise<{
    search?: string;
    category?: string;
    page?: string;
  }>;
};

export default async function ProductsPage(props: ProductsPageProps) {
  const searchParams = await props.searchParams;
  const searchQuery = searchParams.search || "";
  const activeCategory = searchParams.category || "all";
  const currentPage = Math.max(1, Number(searchParams.page) || 1);
  const itemsPerPage = 8;

  // Filter produk berdasarkan Search dan Category (Server-side rendering logic)
  const filteredProducts = DUMMY_PRODUCTS.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      activeCategory === "all" || product.categoryId === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const totalItems = filteredProducts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Pagination Slice
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <HeroSection />

      {/* Logo Marquee */}
      <CarouselLogo />

      {/* Catalog Section */}
      <section
        id="katalog"
        className="w-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col gap-8"
      >
        {/* Search Bar (Client Component synced with URL SearchParams) */}
        <SearchBar />

        {/* Category Filter Pills (Client Component synced with URL SearchParams) */}
        <CategoryFilterList
          categories={CATEGORIES}
          activeCategory={activeCategory}
        />

        {/* Result Count & Page Info */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <p className="text-sm text-muted-foreground font-body">
            Menampilkan{" "}
            <span className="font-semibold text-foreground">
              {paginatedProducts.length}
            </span>{" "}
            dari{" "}
            <span className="font-semibold text-foreground">
              {totalItems}
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

          {totalPages > 1 && (
            <span className="text-xs text-muted-foreground font-body">
              Halaman {currentPage} dari {totalPages}
            </span>
          )}
        </div>

        {/* Product Grid */}
        {paginatedProducts.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
              {paginatedProducts.map((product, index) => (
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
                  bgColorClass={
                    PASTEL_VARIANTS[
                      (startIndex + index) % PASTEL_VARIANTS.length
                    ]
                  }
                />
              ))}
            </div>

            {/* Pagination Component */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
            />
          </>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <span className="text-6xl" role="img" aria-label="Tidak ditemukan">
              🔍
            </span>
            <h2 className="font-heading font-bold text-xl text-foreground">
              Produk tidak ditemukan
            </h2>
            <p className="text-muted-foreground font-body max-w-xs">
              Coba kata kunci lain atau pilih kategori yang berbeda.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
