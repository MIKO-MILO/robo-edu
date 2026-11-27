# 29: Fix Product Listing Rating — Status Case Mismatch

**What to build:** Query agregat rating di endpoint `GET /api/product` (halaman listing produk) saat ini menggunakan lowercase `'published'` di CASE statement SQL, sedangkan nilai sesungguhnya di database adalah uppercase `"PUBLISHED"`. Meskipun MySQL biasanya case-insensitive untuk string comparison, perilaku ini tidak reliable dan akan menyebabkan review yang di-hidden masih terhitung dalam rating agregat ketika fitur hide/visible aktif dipakai.

Tiket ini memastikan filter status review di product listing konsisten dengan nilai enum `ReviewStatus` yang digunakan di seluruh codebase.

**Blocked by:** None (dapat dimulai segera)

**Status:** done

- [x] File `app/api/product/route.ts` baris ~150-160 (agregat `ratingAvg` dan `reviewCount`) menggunakan uppercase `'PUBLISHED'` alih-alih lowercase `'published'`
- [x] Tidak ada perubahan di file lain — ini hanya bug fix 2 baris di satu query
- [x] Review yang di-HIDDEN tidak lagi terhitung dalam rating/reviewCount di card produk listing

