# 01: Tambah pilihan metode pembayaran di halaman checkout

**What to build:** Halaman checkout (/checkout) diperluas dengan step "Pilih Metode Pembayaran" sebelum tombol submit. Customer memilih satu metode dari daftar yang di-fetch dari GET /payment-methods. Untuk OVO, muncul field input nomor HP OVO setelah metode dipilih. UI mengikuti gaya neo-brutalism yang sudah ada di halaman checkout (border 2px #3D2900, hard shadow, font Unbounded/Outfit). Data method yang dipilih disimpan di state dan dikirim bersama body POST /checkout saat submit. Selama backend GET /payment-methods belum tersedia, gunakan daftar metode hardcode lokal (static fallback) agar frontend bisa dikerjakan dan dipreview secara independen — switch ke live API cukup dengan menghapus fallback.

**Blocked by:** None (dapat dimulai segera)

**Status:** ready-for-agent

- [ ] Halaman checkout memiliki section "Metode Pembayaran" yang menampilkan daftar pilihan (VA: BCA, BNI, BRI, Mandiri, Permata, CIMB; kartu; GoPay QRIS; ShopeePay QRIS; QRIS umum; Dana; OVO; Alfamart; Indomaret).
- [ ] Setiap pilihan menampilkan ikon metode (logo bank/e-wallet) dan label yang jelas.
- [ ] Memilih OVO memunculkan input nomor HP OVO secara inline.
- [ ] Metode yang dipilih dan nomor HP OVO (jika relevan) tersimpan di state dan dimasukkan ke body request saat submit.
- [ ] Tombol submit dinonaktifkan jika belum ada metode yang dipilih.
- [ ] Daftar metode di-fetch dari GET /payment-methods jika endpoint tersedia; jika tidak (404 / network error), fallback ke daftar hardcode lokal tanpa error yang terlihat user.
- [ ] Komponen pilihan metode responsif dan konsisten secara visual dengan komponen checkout yang sudah ada.
