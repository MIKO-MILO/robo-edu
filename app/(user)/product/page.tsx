import { HeroSection } from "@/components/user/products/hero-section";
import { SearchBar } from "@/components/user/products/search-bar";
import { CategoryFilterList } from "@/components/user/products/category-filter-list";
import { WishlistAwareProductCard } from "@/components/user/wishlist/wishlist-aware-product-card";
import { Pagination } from "@/components/ui/pagination";
import { PASTEL_VARIANTS } from "@/components/ui/filter-button";
import CarouselLogo from "@/components/user/carousel-logo";
import { getProducts } from "@/src/lib/api/product";

const CATEGORIES = [
  { id: "all", label: "Semua Produk" },
  { id: "robot-kit", label: "Robot Kit" },
  { id: "sensor", label: "Sensor" },
  { id: "controller", label: "Controller" },
  { id: "parts", label: "Parts" },
];

/** Format number ke Rupiah string (mis. 50000 -> "Rp50.000"). */
function formatPrice(price: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

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

  const result = await getProducts({
    page: currentPage,
    limit: itemsPerPage,
    search: searchQuery,
    category: activeCategory !== "all" ? activeCategory : undefined,
  });

  const products = result.data;
  const totalItems = result.pagination.total;
  const totalPages = result.pagination.totalPages;

  // Pagination Slice
  const startIndex = (currentPage - 1) * itemsPerPage;

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <HeroSection />

      {/* Logo Marquee */}
      <CarouselLogo />

      {/* Catalog Section */}
      <section
        id="katalog"
        className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col gap-8"
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
              {products.length}
            </span>{" "}
            dari{" "}
            <span className="font-semibold text-foreground">{totalItems}</span>{" "}
            produk
            {activeCategory !== "all" && (
              <span>
                {" "}
                di kategori{" "}
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
        {products.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
              {products.map((product, index) => (
                <WishlistAwareProductCard
                  key={product.id}
                  id={product.id}
                  slug={product.slug}
                  name={product.name}
                  price={formatPrice(product.price.min || 0)}
                  priceRaw={product.price.min || 0}
                  rating={5} // TODO(backend): Ambil dari review aggregator saat tersedia
                  reviewCount="0 ulasan" // TODO(backend): Ambil dari review count saat tersedia
                  imageUrl={product.image ?? "/images/placeholder-product.jpg"}
                  bgColorClass={
                    PASTEL_VARIANTS[
                      (startIndex + index) % PASTEL_VARIANTS.length
                    ]
                  }
                />
              ))}
            </div>

            {/* Pagination Component */}
            <Pagination currentPage={currentPage} totalPages={totalPages} />
          </>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
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
