# 11: Fix cart — ganti rekomendasi produk hardcode dengan data real dari DB

**What to build:** Halaman `/cart` memiliki seksi "You might like" yang menampilkan 4 produk hardcode dengan nama berbahasa Inggris, harga dalam USD, dan ID palsu (`"rec-1"`, `"rec-2"`, dll). Ketika user menekan "Add to Cart" pada produk rekomendasi ini, ID palsu dikirim ke `POST /api/cart` dan request gagal secara silent. Ticket ini mengganti array hardcode dengan produk real dari DB.

**Blocked by:** None (`GET /api/product` sudah ada)

**Status:** ready-for-agent

- [ ] Seksi rekomendasi di halaman `/cart` fetch produk dari `GET /api/product?limit=4&sort=newest` (atau strategi sederhana lain seperti random aktif / best seller).
- [ ] Produk yang sudah ada di cart tidak ditampilkan di rekomendasi (filter client-side berdasarkan `productId` yang sudah ada di cart).
- [ ] Tombol "Add to Cart" pada produk rekomendasi mengirim `variantId` yang valid ke `POST /api/cart`; jika produk memiliki lebih dari satu variant, pilih variant pertama yang aktif dan tersedia stoknya.
- [ ] Harga ditampilkan dalam Rupiah (IDR), bukan USD.
- [ ] Jika fetch gagal atau tidak ada produk, seksi rekomendasi disembunyikan (bukan tampilkan placeholder atau error).
- [ ] Loading skeleton ditampilkan selama fetch berlangsung.
