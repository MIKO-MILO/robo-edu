# 40: CMS Landing Page — voucher & review ordering

**What to build:** Di halaman `/admin/landing-page`, tambahkan dua panel untuk mengatur urutan tampil voucher dan review di landing page. Data yang ditampilkan hanya item yang sudah di-toggle "featured" dari halaman manage voucher/review (tiket 37).

**Blocked by:** 37 — Toggle "tampilkan di landing": admin vouchers & admin reviews | 38 — CMS Landing Page: editor Hero, About, InfoCards, Marquee

**Status:** ✅ done

## Panel: Urutan Voucher

- Tampilkan daftar voucher yang sudah ditandai "tampilkan di landing" (dari `landing_featured_vouchers`)
- Tiap item menampilkan: nama voucher, kode (jika ada), nilai diskon, tanggal berlaku
- Drag & drop untuk mengubah urutan (`sort_order`)
- Perubahan urutan disimpan via `PUT /api/admin/landing-config/vouchers/reorder`
- Jika belum ada voucher featured, tampilkan empty state dengan link ke halaman manage vouchers
- Informasikan batas maksimal 6 voucher di panel ini (misalnya counter "3 / 6")

## Panel: Urutan Review

- Tampilkan daftar review yang sudah ditandai "featured" (dari `landing_featured_reviews`)
- Tiap item menampilkan: nama user, cuplikan komentar (truncated), rating bintang
- Drag & drop untuk mengubah urutan
- Perubahan urutan disimpan via `PUT /api/admin/landing-config/reviews/reorder`
- Jika belum ada review featured, tampilkan empty state dengan link ke halaman manage reviews

## Perilaku DiskonPromo di halaman publik

Mode tampilan ditentukan otomatis berdasarkan jumlah voucher featured:
- 0 voucher: section DiskonPromo disembunyikan
- 1 voucher: tampilan single ticket
- 2 voucher: tampilan multi card (2 card sejajar, tanpa arrow)
- 3–6 voucher: tampilan multi card dengan arrow navigasi carousel

## Acceptance criteria

- [x] Panel urutan voucher menampilkan semua voucher dari `landing_featured_vouchers` terurut by `sort_order`
- [x] Drag & drop voucher menyimpan urutan baru; urutan baru langsung terlihat di halaman publik
- [x] Counter "N / 6" tampil di panel voucher
- [x] Empty state voucher muncul dengan link ke `/admin/vouchers` jika belum ada featured voucher
- [x] Panel urutan review bekerja sama seperti panel voucher
- [x] Empty state review muncul dengan link ke `/admin/reviews` jika belum ada featured review
- [x] Halaman publik: 0 voucher → DiskonPromo tersembunyi; 1 → single; 2 → multi tanpa arrow; 3+ → multi dengan arrow

## Implementasi

### File baru
- `components/admin/landing/vouchers-order-section.tsx` — panel drag & drop urutan voucher, counter N/6, empty state
- `components/admin/landing/reviews-order-section.tsx` — panel drag & drop urutan review, empty state

### File diubah
- `hooks/admin/landing-config/use-landing-featured.ts` — tambah tipe detail (`FeaturedVoucherDetail`, `FeaturedReviewDetail`), tambah `useReorderFeaturedVouchers()` dan `useReorderFeaturedReviews()` mutations
- `app/(admin)/admin/landing-page/page.tsx` — tambah dua tab: "Vouchers" dan "Reviews"
- `app/(user)/page.tsx` — 0 voucher → `DiskonPromo` tidak dirender; 1 → "single"; 2+ → "multi" (carousel otomatis aktif di komponen saat ≥3)

### Drag & drop
Menggunakan HTML5 Drag and Drop API native (tanpa library eksternal). State urutan lokal untuk responsivitas optimistik — perubahan visually terjadi segera, lalu disimpan ke server via `PUT /api/admin/landing-config/[vouchers|reviews]/reorder`.
