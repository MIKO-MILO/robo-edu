# 27: Dedicated upload endpoints untuk review & complaint images

**What to build:** Dua endpoint upload terpisah menggantikan pola generic `POST /api/upload/minio` (yang menyimpan ke `uploads/{uuid}` tanpa subfolder domain): `POST /api/upload/review-image` dan `POST /api/upload/complaint-image`. Masing-masing memerlukan sesi user yang login, memvalidasi tipe dan ukuran file, lalu memanggil storage utility dari tiket 26.

Selain itu, form review yang sudah ada di halaman orders user saat ini sudah mengupload file tapi masih ke endpoint generic — perlu dimigrasi ke endpoint baru ini.

**Blocked by:** 26 — storage utilities harus ada dulu sebelum endpoint bisa memanggil fungsi upload yang benar

**Status:** done

- [x] `POST /api/upload/review-image` menerima `multipart/form-data` dengan field `file`, memerlukan sesi user login, memvalidasi tipe (JPEG/PNG/WEBP/GIF) dan ukuran (maks 5 MB), upload via `saveReviewImage()`, return `{ url }` sebagai path relatif
- [x] `POST /api/upload/complaint-image` menerima `multipart/form-data` dengan field `file`, memerlukan sesi user login, memvalidasi tipe (JPEG/PNG/WEBP/GIF/PDF) dan ukuran (maks 10 MB), upload via `saveComplaintImage()`, return `{ url }` sebagai path relatif
- [x] Kedua endpoint menolak request tanpa sesi user yang valid (401)
- [x] Form review di halaman orders user (`app/(user)/profile/orders/[id]/review/page.tsx`) dimigrasi dari `POST /api/upload/minio` ke `POST /api/upload/review-image`
- [x] File key yang tersimpan di MinIO mengikuti pola `reviews/{reviewId}/{uuid}.ext` dan `complaints/{complaintId}/{uuid}.ext` — tidak ada lagi file review/complaint yang masuk ke `uploads/`

> **Catatan:** Karena upload terjadi sebelum review/complaint ID tersedia, subfolder ID tidak digunakan. Key MinIO cukup `reviews/{uuid}.ext` dan `complaints/{uuid}.ext` — prefix domain sudah cukup untuk isolasi akses dan lifecycle policy, tanpa subfolder per-entity.
