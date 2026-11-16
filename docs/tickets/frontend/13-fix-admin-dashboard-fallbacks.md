# 13: Fix admin dashboard — hapus hardcode fallback, tampilkan proper empty/error state

**What to build:** Halaman `/admin/dashboard` sudah fetch data dari `GET /api/admin/dashboard`, tetapi semua KPI dan list produk memiliki fallback ke nilai hardcode (`revenue ?? 15450000`, `totalOrders ?? 128`, dll beserta daftar produk fiktif). Akibatnya ketika API gagal atau DB kosong, dashboard tampak seolah ada data padahal tidak — menyembunyikan masalah. Ticket ini mengganti fallback numerik hardcode dengan empty state dan error state yang proper.

**Blocked by:** None

**Status:** done

- [x] KPI cards (revenue, total orders, pending orders, total customers, revenue trend) menampilkan `0` atau `—` sebagai nilai kosong yang valid ketika API mengembalikan `null` / `undefined` — bukan nilai hardcode seperti `15450000` atau `128`.
- [x] List "Top Produk" menampilkan empty state ("Belum ada data penjualan") ketika API mengembalikan array kosong — bukan 5 produk fiktif.
- [x] List "Low Stock" menampilkan empty state ("Semua stok aman") ketika API mengembalikan array kosong — bukan 3 variant fiktif.
- [x] Jika request API gagal (network error, 500), tampilkan error state dengan tombol "Coba Lagi" — bukan data hardcode yang terlihat valid.
- [x] Perilaku saat loading tetap menggunakan skeleton yang sudah ada; hanya fallback data hardcode yang dihapus.

## Implementation notes

**Files changed:**
- `app/(admin)/admin/dashboard/page.tsx` — semua KPI di-derive dari API response dengan `?? 0` / `?? null`; tidak ada angka hardcode. Revenue card menampilkan `"—"` saat nilai 0. Error state full-panel dengan `AlertTriangleIcon` + tombol "Coba Lagi" (memanggil `refetch()`). Stat-card grid dan panel Top Produk/Low Stock dibungkus `{!isError && (…)}` sehingga tersembunyi saat error.
- `components/admin/dashboard/top-products-card.tsx` — render path: loading → skeletons; `products.length === 0` → empty state `PackageCheck` + "Belum ada data penjualan"; otherwise → map data nyata.
- `components/admin/dashboard/low-stock-card.tsx` — render path: loading → skeletons; `items.length === 0` → empty state `ShieldAlert` + "Semua Stok Aman!"; otherwise → map data nyata.

**Skeletons:**
- Suspense fallback di `AdminDashboardPage` menampilkan `Skeleton` untuk heading, 4 stat cards, dan 2 detail panels.
- In-component: `isLoading` → `animate-pulse` divs di stat grid, 5 pulse rows di TopProductsCard, 4 pulse rows di LowStockCard.
