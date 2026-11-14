# 13: Fix admin dashboard — hapus hardcode fallback, tampilkan proper empty/error state

**What to build:** Halaman `/admin/dashboard` sudah fetch data dari `GET /api/admin/dashboard`, tetapi semua KPI dan list produk memiliki fallback ke nilai hardcode (`revenue ?? 15450000`, `totalOrders ?? 128`, dll beserta daftar produk fiktif). Akibatnya ketika API gagal atau DB kosong, dashboard tampak seolah ada data padahal tidak — menyembunyikan masalah. Ticket ini mengganti fallback numerik hardcode dengan empty state dan error state yang proper.

**Blocked by:** None

**Status:** ready-for-agent

- [ ] KPI cards (revenue, total orders, pending orders, total customers, revenue trend) menampilkan `0` atau `—` sebagai nilai kosong yang valid ketika API mengembalikan `null` / `undefined` — bukan nilai hardcode seperti `15450000` atau `128`.
- [ ] List "Top Produk" menampilkan empty state ("Belum ada data penjualan") ketika API mengembalikan array kosong — bukan 5 produk fiktif.
- [ ] List "Low Stock" menampilkan empty state ("Semua stok aman") ketika API mengembalikan array kosong — bukan 3 variant fiktif.
- [ ] Jika request API gagal (network error, 500), tampilkan error state dengan tombol "Coba Lagi" — bukan data hardcode yang terlihat valid.
- [ ] Perilaku saat loading tetap menggunakan skeleton yang sudah ada; hanya fallback data hardcode yang dihapus.
