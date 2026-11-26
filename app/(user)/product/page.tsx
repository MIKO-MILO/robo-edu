import { HeroSection } from "@/components/user/products/hero-section";
import { CategoryFilterList } from "@/components/user/products/category-filter-list";
import { WishlistAwareProductCard } from "@/components/user/wishlist/wishlist-aware-product-card";
import { Pagination } from "@/components/ui/pagination";
import { PASTEL_VARIANTS } from "@/components/ui/filter-button";
import CarouselLogo from "@/components/user/carousel-logo";
import { getProducts } from "@/src/lib/api/product";
import { db } from "@/src/db";
import { categories } from "@/src/db/schema";
import { eq, asc } from "drizzle-orm";

/** Format number ke Rupiah string (mis. 50000 -> "Rp50.000"). */
function formatPrice(price: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

/** Format review count ke string tampilan. */
function formatReviewCount(count: number | null): string {
  if (!count) return "Belum ada ulasan";
  return `${count} ulasan`;
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
  const itemsPerPage = 9;

  // ─── Fetch categories dari DB (hanya yang aktif) ──────────────────────────
  const dbCategories = await db
    .select({ id: categories.id, name: categories.name, slug: categories.slug })
    .from(categories)
    .where(eq(categories.isActive, true))
    .orderBy(asc(categories.name));

  const CATEGORIES = [
    { id: "all", label: "Semua Produk" },
    ...dbCategories.map((c) => ({ id: c.slug, label: c.name })),
  ];

  // ─── Fetch produk ─────────────────────────────────────────────────────────
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
      {/* Hero Section dengan Search Bar di bawah deskripsi */}
      <HeroSection />

      {/* Catalog Section dengan Menu di Kiri & Produk di Kanan */}
      <section
        id="katalog"
        className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12"
      >
        <div className="flex flex-col md:flex-row items-start gap-8 lg:gap-10">
          {/* Kolom Kiri: Menu Kategori Vertikal (Sidebar) */}
          <aside className="w-full md:w-56 lg:w-64 shrink-0">
            <div className="md:sticky md:top-24 space-y-3.5">
              <h2 className="font-heading font-bold text-base sm:text-lg text-foreground tracking-tight hidden md:block">
                Kategori
              </h2>
              <CategoryFilterList
                categories={CATEGORIES}
                activeCategory={activeCategory}
              />
            </div>
          </aside>

          {/* Kolom Kanan: Daftar Produk 3 Card per Baris */}
          <div className="flex-1 min-w-0 w-full flex flex-col gap-6">
            {/* Product Grid: 3 card ke samping / 3 kolom */}
            {products.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                  {products.map((product, index) => (
                    <WishlistAwareProductCard
                      key={product.id}
                      id={product.id}
                      slug={product.slug}
                      name={product.name}
                      price={formatPrice(product.price.min || 0)}
                      priceRaw={product.price.min || 0}
                      rating={product.rating_avg ?? 0}
                      reviewCount={formatReviewCount(product.review_count)}
                      imageUrl={product.image ?? "/images/placeholder-product.jpg"}
                      outOfStock={product.stock === 0}
                      bgColorClass={
                        PASTEL_VARIANTS[
                          (startIndex + index) % PASTEL_VARIANTS.length
                        ]
                      }
                    />
                  ))}
                </div>

                {/* Bagian Bawah Card: Info Produk & Pagination (tanpa garis horizontal) */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-6">
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

                  {/* Pagination Component */}
                  <Pagination currentPage={currentPage} totalPages={totalPages} />
                </div>
              </>
            ) : (
              /* Empty State */
              <div className="flex flex-col items-center justify-center py-20 gap-4 text-center bg-card/40 rounded-2xl border border-dashed border-border/60 p-8">
                <h2 className="font-heading font-bold text-xl text-foreground">
                  Produk tidak ditemukan
                </h2>
                <p className="text-muted-foreground font-body max-w-xs text-sm">
                  Coba kata kunci lain atau pilih kategori yang berbeda.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
