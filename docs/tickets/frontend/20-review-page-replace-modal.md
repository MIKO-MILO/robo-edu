# 20: Halaman Ulasan Produk — Ganti Modal dengan Halaman Dedikasi

**What to build:** Saat ini form ulasan produk muncul di dalam modal Dialog yang sulit ditemukan dan hanya menampilkan satu produk per tampilan. Ticket ini mengganti modal tersebut dengan halaman `/profile/orders/[id]/review` yang menampilkan semua produk dari satu order sekaligus dalam satu form multi-section. Setiap section mewakili satu produk; item yang sudah pernah direview ditampilkan dengan badge "Sudah Diulas" dan field-nya di-disable. User bisa upload foto sebagai lampiran ulasan (maks 10 MB per file, maks 5 file, format `image/*`). File diupload ke endpoint MinIO terlebih dahulu sebelum POST review, URL hasilnya disertakan di body. Setelah semua ulasan tersubmit, tampilkan toast sukses lalu redirect ke halaman detail order. Tombol "Tulis Ulasan" di halaman detail order diarahkan ke halaman baru ini (bukan membuka modal).

Backend perlu menerima array `image_urls` di body `POST /api/reviews` dan menyimpannya ke tabel `review_images` (tabel baru dengan FK ke `reviews.id`). Jika tabel belum ada, buat migration-nya.

**Blocked by:** None (dapat dimulai segera)

**Status:** ready-for-agent

- [ ] Halaman `/profile/orders/[id]/review` dapat diakses dan menampilkan semua item dari order tersebut.
- [ ] Setiap item yang belum direview menampilkan form rating bintang dan textarea komentar.
- [ ] Item yang sudah direview sebelumnya ditampilkan dengan badge "Sudah Diulas" dan field di-disable.
- [ ] User dapat memilih dan mengupload foto (maks 5 file, maks 10 MB/file) per item.
- [ ] Submit form mengirim ulasan beserta URL foto ke `POST /api/reviews`.
- [ ] Setelah sukses, tampil toast sukses dan halaman redirect ke detail order.
- [ ] Tombol "Tulis Ulasan" di detail order mengarah ke halaman baru ini, bukan membuka modal.
- [ ] Modal `OrderReviewModal` lama tidak lagi digunakan dari halaman detail order.
- [ ] Backend menyimpan `image_urls` ke tabel `review_images` tanpa error.
