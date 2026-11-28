# 37: Toggle "tampilkan di landing" — admin vouchers & admin reviews

**What to build:** Di halaman manage voucher dan manage review yang sudah ada, tambahkan toggle per-item untuk menandai apakah item tersebut ditampilkan di landing page. Toggle ini yang mengisi tabel `landing_featured_vouchers` dan `landing_featured_reviews` (dari tiket 36).

**Blocked by:** 36 — DB schema & API: landing page CMS config

**Status:** ready-for-agent

## Vouchers (`/admin/vouchers`)

- Tambahkan kolom "Landing Page" di tabel daftar voucher, berisi toggle on/off per baris
- Toggle on: insert voucher ke `landing_featured_vouchers` dengan `sort_order` di akhir antrian
- Toggle off: hapus baris dari `landing_featured_vouchers`
- Jika sudah ada 6 voucher featured, toggle on harus diblokir — tampilkan tooltip/pesan: *"Maksimal 6 voucher dapat ditampilkan di landing page"*
- Hanya voucher dengan status aktif yang bisa di-toggle on; voucher non-aktif toggle-nya disabled
- State toggle harus sinkron dengan data dari `GET /api/admin/landing-config/vouchers`

## Reviews (`/admin/reviews`)

- Tambahkan kolom "Featured" di tabel daftar review, berisi toggle on/off per baris
- Perilaku insert/delete sama seperti vouchers
- Tidak ada batasan jumlah maksimal untuk review (berbeda dengan voucher)
- Hanya review dengan status `PUBLISHED` yang bisa di-toggle on

## Acceptance criteria

- [ ] Kolom toggle "Landing Page" muncul di tabel `/admin/vouchers`
- [ ] Toggle on voucher: data masuk ke `landing_featured_vouchers`, tampil di halaman landing publik
- [ ] Toggle off voucher: data dihapus dari `landing_featured_vouchers`, hilang dari halaman landing publik
- [ ] Toggle on diblokir dengan pesan jelas saat sudah ada 6 voucher featured
- [ ] Voucher non-aktif tidak bisa di-toggle on
- [ ] Kolom toggle "Featured" muncul di tabel `/admin/reviews`
- [ ] Toggle on/off review bekerja sesuai dengan tabel `landing_featured_reviews`
- [ ] Review non-PUBLISHED tidak bisa di-toggle on
- [ ] Perubahan toggle langsung terlihat di halaman landing publik
