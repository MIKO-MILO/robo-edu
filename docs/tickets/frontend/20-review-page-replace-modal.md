# 20: Halaman Ulasan Produk — Ganti Modal dengan Halaman Dedikasi

**What to build:** Saat ini form ulasan produk muncul di dalam modal Dialog yang sulit ditemukan dan hanya menampilkan satu produk per tampilan. Ticket ini mengganti modal tersebut dengan halaman `/profile/orders/[id]/review` yang menampilkan semua produk dari satu order sekaligus dalam satu form multi-section. Setiap section mewakili satu produk; item yang sudah pernah direview ditampilkan dengan badge "Sudah Diulas" dan field-nya di-disable. User bisa upload foto sebagai lampiran ulasan (maks 10 MB per file, maks 5 file, format `image/*`). File diupload ke endpoint MinIO terlebih dahulu sebelum POST review, URL hasilnya disertakan di body. Setelah semua ulasan tersubmit, tampilkan toast sukses lalu redirect ke halaman detail order. Tombol "Tulis Ulasan" di halaman detail order diarahkan ke halaman baru ini (bukan membuka modal).

Backend perlu menerima array `image_urls` di body `POST /api/reviews` dan menyimpannya ke tabel `review_images` (tabel baru dengan FK ke `reviews.id`). Jika tabel belum ada, buat migration-nya.

**Blocked by:** None (dapat dimulai segera)

**Status:** done

- [x] Halaman `/profile/orders/[id]/review` dapat diakses dan menampilkan semua item dari order tersebut.
- [x] Setiap item yang belum direview menampilkan form rating bintang dan textarea komentar.
- [x] Item yang sudah direview sebelumnya ditampilkan dengan badge "Sudah Diulas" dan field di-disable.
- [x] User dapat memilih dan mengupload foto (maks 5 file, maks 10 MB/file) per item.
- [x] Submit form mengirim ulasan beserta URL foto ke `POST /api/reviews`.
- [x] Setelah sukses, tampil toast sukses dan halaman redirect ke detail order.
- [x] Tombol "Tulis Ulasan" di detail order mengarah ke halaman baru ini, bukan membuka modal.
- [x] Modal `OrderReviewModal` lama tidak lagi digunakan dari halaman detail order.
- [x] Backend menyimpan `image_urls` ke tabel `review_images` tanpa error.

## Implementasi

**File baru:**
- `app/(user)/profile/orders/[id]/review/page.tsx` — halaman review multi-section
- `src/db/schema/review-image.ts` — skema tabel `review_images`

**File diubah:**
- `app/(user)/profile/orders/[id]/page.tsx` — tombol "Tulis Ulasan" diganti jadi `<Link>` ke `/profile/orders/[id]/review`, `OrderReviewModal` dihapus
- `app/api/reviews/route.ts` — terima `image_urls[]`, bulk-insert ke `review_images` setelah insert review
- `app/api/orders/[id]/route.ts` — tambah field `already_reviewed` per item (query ke tabel `reviews`)
- `src/db/schema/index.ts` — export `review-image`
- `src/db/relations/review.ts` — tambah relasi `images` (reviews → reviewImages) dan `reviewImagesRelations`

**Dependency:** `sonner` di-install (`npm install sonner`) karena belum ada di `node_modules`.
