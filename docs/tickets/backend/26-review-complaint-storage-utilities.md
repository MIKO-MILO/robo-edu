# 26: Storage utilities untuk review & complaint images

**What to build:** Dua fungsi storage baru yang sejajar dengan `saveProductImage()` yang sudah ada: satu untuk review images dan satu untuk complaint attachments. Masing-masing mengupload ke MinIO dengan prefix subfolder yang sesuai domain (`reviews/` dan `complaints/`), beserta fungsi cleanup-nya untuk delete.

Pola yang sudah berjalan untuk produk (`product-images/{productId}/{uuid}.ext`) menjadi acuan — cukup replikasi polanya untuk dua domain baru.

**Blocked by:** None (can start immediately)

**Status:** done

- [x] `saveReviewImage(reviewId, file)` mengupload ke key `reviews/{reviewId}/{uuid}.{ext}` dan return `{ key, url }` dengan URL relatif `/api/images/reviews/{reviewId}/{uuid}.ext`
- [x] `saveComplaintImage(complaintId, file)` mengupload ke key `complaints/{complaintId}/{uuid}.{ext}` dan return `{ key, url }` dengan URL relatif `/api/images/complaints/{complaintId}/{uuid}.ext`
- [x] `removeReviewImage(keyOrUrl)` dan `removeComplaintImage(keyOrUrl)` yang toleran terhadap key, path relatif, maupun URL absolut (sejajar dengan `removeProductImage`)
- [x] Semua fungsi ada di file storage terpisah sesuai domain (`src/lib/storage/review-images.ts` dan `src/lib/storage/complaint-images.ts`)
- [x] Fungsi-fungsi tersebut hanya berjalan di server (tandai `import "server-only"`)
