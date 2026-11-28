# 36: DB schema & API — landing page CMS config

**What to build:** Fondasi data dan API untuk seluruh fitur CMS landing page. Buat tabel-tabel baru di DB, endpoint admin untuk baca/tulis config, dan ganti semua hardcode di `app/(user)/page.tsx` agar membaca dari DB.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

## Skema DB baru

### `landing_page_config`
Satu baris saja (singleton). Menyimpan semua konten teks landing page sebagai JSON column atau kolom per-field. Mencakup:
- **Hero**: headline, deskripsi, label CTA utama, URL CTA utama, label CTA sekunder
- **About (ICardsInfo)**: badge label, judul (main + highlight), deskripsi, 4 feature checklist (label tiap item)
- **InfoCardsList**: judul & deskripsi untuk masing-masing 4 kartu fitur
- **TextMarquee**: array item teks berjalan (bisa tambah/hapus)
- **VideoDemo**: judul, deskripsi, URL YouTube
- **FAQ**: judul section, deskripsi section, promo banner (judul prefix, deskripsi, 4 foto URL), array Q&A (question + answer, bisa tambah/hapus/reorder)

### `landing_featured_vouchers`
| kolom | tipe | keterangan |
|---|---|---|
| `id` | PK | |
| `voucher_id` | FK → vouchers | |
| `sort_order` | int | urutan tampil di landing |
| `created_at` | timestamp | |

Constraint: max 6 baris aktif. Voucher yang di-toggle "tampilkan di landing" (tiket 37) akan insert ke sini; toggle off akan delete barisnya.

### `landing_featured_reviews`
| kolom | tipe | keterangan |
|---|---|---|
| `id` | PK | |
| `review_id` | FK → reviews | |
| `sort_order` | int | urutan tampil di landing |
| `created_at` | timestamp | |

## API Endpoints

### Config utama
- `GET /api/admin/landing-config` — kembalikan seluruh config (dengan fallback ke nilai default jika baris belum ada)
- `PUT /api/admin/landing-config` — upsert config, validasi semua field, kembalikan config terbaru

### Voucher ordering
- `GET /api/admin/landing-config/vouchers` — daftar voucher yang di-featured, diurutkan by `sort_order`, include data voucher (kode, nama, nilai diskon)
- `PUT /api/admin/landing-config/vouchers/reorder` — terima array `[{ id, sort_order }]`, update urutan
- `DELETE /api/admin/landing-config/vouchers/:id` — hapus dari featured (sama efeknya dengan toggle off)

### Review ordering
- `GET /api/admin/landing-config/reviews` — daftar review yang di-featured, diurutkan by `sort_order`, include data review (userName, comment, rating)
- `PUT /api/admin/landing-config/reviews/reorder` — terima array `[{ id, sort_order }]`, update urutan

## Wiring ke halaman publik

`app/(user)/page.tsx` saat ini hardcode semua props ke komponen landing. Setelah tiket ini selesai:
- Fetch `landing_page_config` di server component, pass hasilnya sebagai props ke tiap section
- Fetch `landing_featured_vouchers` untuk `DiskonPromo` (mengganti `DEFAULT_PROMOS`)
- Fetch `landing_featured_reviews` untuk `Testimoni` (mengganti `FALLBACK_REVIEWS`)
- Jika baris config belum ada di DB (fresh install), semua komponen tetap fallback ke nilai default yang sudah ada di masing-masing komponen

## Acceptance criteria

- [ ] Migrasi DB berhasil membuat ketiga tabel baru
- [ ] `GET /api/admin/landing-config` mengembalikan data lengkap; jika belum ada baris di DB, kembalikan nilai default (bukan 404)
- [ ] `PUT /api/admin/landing-config` menyimpan perubahan dan mengembalikan data terbaru
- [ ] `GET /api/admin/landing-config/vouchers` mengembalikan daftar terurut by `sort_order`
- [ ] `PUT /api/admin/landing-config/vouchers/reorder` mengupdate urutan dengan benar
- [ ] Endpoint voucher menolak insert jika sudah ada 6 featured voucher (HTTP 422)
- [ ] API review ordering bekerja sama seperti voucher ordering
- [ ] `app/(user)/page.tsx` membaca config dari DB; perubahan via API langsung terlihat di halaman publik tanpa redeploy
- [ ] Fallback ke nilai default aktif jika baris config belum ada
