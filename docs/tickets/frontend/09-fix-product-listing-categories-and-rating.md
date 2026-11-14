# 09: Fix product listing — kategori dari DB dan rating/review count dari aggregator

**What to build:** Halaman `/product` memiliki dua data yang hardcode: (1) filter pill kategori adalah array statis `["robot-kit", "sensor", "controller", "parts"]` yang tidak mencerminkan kategori real di DB; (2) setiap kartu produk menampilkan `rating={5}` dan `reviewCount="0 ulasan"` statis dengan komentar `TODO(backend)`. Ticket ini mengganti keduanya dengan data nyata.

**Blocked by:** None (endpoint `GET /api/admin/categories` sudah ada; review data sudah ada di tabel `reviews`)

**Status:** ready-for-agent

- [ ] Filter pill kategori di halaman `/product` di-fetch dari `GET /api/admin/categories` (atau endpoint publik yang setara); menampilkan hanya kategori yang aktif; "Semua Produk" tetap ada sebagai opsi pertama.
- [ ] Endpoint `GET /api/product` diperluas untuk menyertakan `rating_avg` (rata-rata rating, 1 desimal) dan `review_count` (jumlah review PUBLISHED) per produk; dihitung via subquery atau join ke tabel `reviews`.
- [ ] Kartu produk di halaman listing menampilkan rating dan review count dari data API — bukan nilai hardcode `5` dan `"0 ulasan"`.
- [ ] Jika produk belum punya review sama sekali, tampilkan `rating=0` dan `"Belum ada ulasan"` (atau sembunyikan bintang — konsisten dengan desain yang ada).
- [ ] Perubahan di `GET /api/product` backward-compatible: field baru nullable sehingga tidak break halaman lain yang sudah konsumsi endpoint ini.
