# 27: Stok Habis — Filter Rekomendasi, Blokir Add to Cart, & Tampilan Cart Item

**What to build:** Tiga perilaku terkait stok habis yang belum ditangani:

**1. Filter "You Might Like" di halaman cart**
Produk dengan stok 0 tidak boleh muncul di section rekomendasi "You Might Like". Saat ini produk stok habis tetap ditampilkan (hanya ada badge "Habis" kecil) dan tombol tambah ke keranjangnya masih bisa diklik. Perbaiki dengan memfilter produk stok 0 dari array `recommendations` sebelum dirender. Tombol "Add to Cart" di card rekomendasi juga harus di-disable saat `prod.stock === 0` (konsisten dengan behavior di halaman katalog).

**2. Blokir Add to Cart di product card halaman katalog**
`ProductCard` sudah mendukung prop `outOfStock` yang men-disable tombol, dan halaman katalog sudah mengoper `outOfStock={product.stock === 0}`. Verifikasi ini berjalan benar end-to-end: produk dengan stok 0 tidak boleh bisa ditambahkan ke keranjang dari product card manapun (katalog, search result, dsb). Jika ada titik masuk lain yang belum memakai prop ini, tambahkan.

**3. Tampilan cart item stok habis**
Field `stock` sudah tersedia di setiap `CartItemDto` (dari `GET /api/cart`) tapi tidak dipakai di UI cart. Produk yang sudah terlanjur masuk cart sebelum stoknya habis perlu ditampilkan dengan visual berbeda: tampilan abu-abu/muted, badge/teks "Stok Habis", semua tombol aksi (tambah/kurangi qty, tambah ke wishlist) di-disable — kecuali tombol hapus yang tetap aktif agar user bisa menghapusnya dari cart. Produk ini tidak boleh ikut di-checkout. Pastikan logika perhitungan subtotal dan tombol "Checkout" memperhitungkan item stok habis (tidak dihitung di total, atau checkout diblokir selama masih ada item stok habis di cart).

Backend `POST /api/cart` tidak perlu diubah dalam ticket ini — validasi stok saat checkout sudah menjadi tanggung jawab alur checkout.

**Blocked by:** None (dapat dimulai segera)

**Status:** done

- [x] Produk dengan stok 0 tidak muncul di section "You Might Like" halaman cart.
- [x] Tombol "Add to Cart" di card rekomendasi "You Might Like" ter-disable saat `stock === 0`.
- [x] Product card di halaman katalog tidak bisa diklik untuk add to cart saat stok 0 (verifikasi end-to-end).
- [x] Item di cart dengan `stock === 0` ditampilkan abu-abu dengan label "Stok Habis".
- [x] Tombol tambah/kurangi quantity dan wishlist ter-disable pada item stok habis.
- [x] Tombol hapus pada item stok habis tetap aktif.
- [x] Item stok habis tidak dihitung dalam subtotal, atau tombol Checkout diblokir selama ada item stok habis.
