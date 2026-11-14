# 02: Halaman pembayaran Core API — instruksi dinamis per metode

**What to build:** Ganti halaman /payment/[orderId] yang sekarang membuka Snap popup menjadi halaman pembayaran kustom RoboEdu. Halaman menampilkan instruksi yang berbeda-beda berdasarkan payment_channel yang tersimpan di data order/payment. Data instruksi diambil dari payment.payment_instruction (JSON dari backend). Selama backend Core API belum tersedia, halaman menggunakan mock payment_instruction berdasarkan payment_channel yang di-hardcode per skenario — sehingga setiap layout instruksi bisa dikerjakan, dipreview, dan ditest secara visual sebelum backend siap. Komponen halaman ini juga dipakai untuk /reseller/payment/[id] (membership) — cukup prop context: "order" | "membership" yang mengubah redirect setelah PAID.

**Blocked by:** None (dapat dimulai segera)

**Status:** ready-for-agent

- [x] Route /payment/[orderId] menampilkan halaman pembayaran kustom (bukan Snap popup). Semua kode Snap (snap.js, window.snap.pay) dihapus dari halaman ini.
- [x] Layout instruksi VA (non-Mandiri): nomor VA + kode bank, tombol salin, badge status, hitung mundur.
- [x] Layout instruksi VA Mandiri (echannel): kode perusahaan + kode bayar (dua kode terpisah), tombol salin masing-masing.
- [x] Layout instruksi toko (cstore): kode pembayaran, nama toko (Alfamart / Indomaret), tombol salin.
- [x] Layout QR (GoPay, ShopeePay, QRIS): gambar QR, tombol "Buka Aplikasi" (hanya pada perangkat mobile, link deeplink).
- [x] Layout Dana: tombol "Bayar dengan Dana" (deeplink redirect).
- [x] Layout OVO: instruksi "Periksa notifikasi push di aplikasi OVO", hitung mundur 60 detik.
- [x] Layout kartu (3DS): area iframe/redirect 3DS (placeholder UI — konten dari Midtrans diembed saat backend tersedia).
- [x] Setiap layout menampilkan: nominal (tombol salin), badge status (PENDING/PAID/FAILED/EXPIRED), hitung mundur berbasis expiry_time.
- [x] Tombol "Cek Status" tersedia di semua layout — memanggil POST /orders/:id/payment/check (jika belum ada: tombol ada tapi menampilkan toast "belum tersedia").
- [x] Polling otomatis tiap 3–5 detik; berhenti saat status PAID/FAILED/EXPIRED.
- [x] Setelah PAID: redirect ke /profile/orders/:id (order) atau /profile/membership (membership). <!-- diganti dari /profile/reseller sesuai instruksi -->
- [x] Halaman hanya bisa diakses user pemilik transaksi — API GET /orders/:id/payment-info mengembalikan 404 jika bukan pemilik; halaman menampilkan error state dan link kembali ke /profile/orders.
- [x] Gaya visual mengikuti neo-brutalism yang sudah ada (border, hard shadow, font Unbounded/Outfit, palet warna PRD §32).
- [x] Route /membership/payment/[purchaseId] menggunakan komponen halaman yang sama (wrapper tipis dengan context="membership"). <!-- diganti dari /reseller/payment/[id] sesuai instruksi -->
