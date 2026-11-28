# 30: DB schema & API — landing page CMS config

**What to build:** Fondasi data dan API untuk seluruh fitur CMS landing page. Buat tabel-tabel baru di DB, endpoint admin untuk baca/tulis config, dan ganti semua hardcode di `app/(user)/page.tsx` agar membaca dari DB.

**Blocked by:** None

**Status:** ✅ done

---

## Implementasi (sudah selesai)

### Stack & tooling

- **ORM:** Drizzle ORM (`drizzle-orm/mysql2`) — bukan Prisma
- **DB:** MySQL via `mysql2/promise` pool, client di `src/db/index.ts`
- **Migrasi:** `drizzle-kit`, output SQL di `drizzle/`, file schema di `src/db/schema/`
- **Validasi:** Manual (fungsi validator per-field yang mengembalikan `string[]`), **bukan Zod**
- **Auth guard:** `requireAdmin()` dari `src/lib/auth/require-admin.ts` — semua endpoint admin wajib memanggil ini di baris pertama

---

## Schema DB

### File migrasi

**`drizzle/0009_landing_page_cms.sql`** — membuat ketiga tabel baru.

### `landing_page_config` → `src/db/schema/landing-config.ts`

Singleton row (`id = "singleton"`). Semua konten teks landing page disimpan sebagai kolom JSON terpisah.

| kolom | tipe Drizzle | keterangan |
|---|---|---|
| `id` | `varchar(36)` PK | selalu `"singleton"` |
| `hero` | `json` | `LandingHeroConfig` |
| `about` | `json` | `LandingAboutConfig` |
| `info_cards` | `json` | `LandingInfoCardsConfig` (array 4 item) |
| `marquee` | `json` | `LandingMarqueeConfig` |
| `video_demo` | `json` | `LandingVideoDemoConfig` |
| `faq` | `json` | `LandingFAQConfig` |
| `created_at` | `datetime` | auto `CURRENT_TIMESTAMP` |
| `updated_at` | `datetime` | auto `CURRENT_TIMESTAMP` |

Skema JSON masing-masing kolom didokumentasikan sebagai komentar di `src/db/schema/landing-config.ts`. Semua TypeScript interfaces dan nilai default terpusat di **`src/lib/landing/defaults.ts`**.

> **Catatan:** `LANDING_CONFIG_ID = "singleton"` adalah konstanta yang dipakai di semua tempat yang menyentuh tabel ini.

### `landing_featured_vouchers` → `src/db/schema/landing-featured-voucher.ts`

| kolom | tipe | keterangan |
|---|---|---|
| `id` | varchar(36) PK | UUID |
| `voucher_id` | FK → `vouchers.id` CASCADE | |
| `sort_order` | int, default 0 | urutan tampil di landing |
| `created_at` | datetime | auto |

Index: `lfv_voucher_id_idx`, `lfv_sort_order_idx`. Constraint max 6 baris di-enforce di API layer (bukan DB constraint).

### `landing_featured_reviews` → `src/db/schema/landing-featured-review.ts`

| kolom | tipe | keterangan |
|---|---|---|
| `id` | varchar(36) PK | UUID |
| `review_id` | FK → `reviews.id` CASCADE | |
| `sort_order` | int, default 0 | urutan tampil di landing |
| `created_at` | datetime | auto |

Index: `lfr_review_id_idx`, `lfr_sort_order_idx`.

---

## API Endpoints

Semua endpoint admin diamankan dengan `requireAdmin()`. Response format konsisten:
- **Success:** `{ success: true, data: ... }`
- **Error:** `{ success: false, message: "..." }` dengan HTTP status yang sesuai

### Config utama

#### `GET /api/admin/landing-config`
**File:** `app/api/admin/landing-config/route.ts`

Kembalikan seluruh config. Jika baris belum ada di DB, kembalikan `DEFAULT_LANDING_CONFIG` (bukan 404).

#### `PUT /api/admin/landing-config`
**File:** `app/api/admin/landing-config/route.ts`

Partial upsert — hanya field yang dikirim yang di-update. Jika baris belum ada, insert dengan merge ke `DEFAULT_LANDING_CONFIG` untuk field yang tidak dikirim.

Validasi per-section: `validateHero`, `validateAbout`, `validateInfoCards`, `validateMarquee`, `validateVideoDemo`, `validateFAQ`. Error → HTTP 422.

### Voucher ordering

#### `GET /api/admin/landing-config/vouchers`
**File:** `app/api/admin/landing-config/vouchers/route.ts`

Daftar featured voucher diurutkan by `sort_order`. Response include nested `voucher` object (kode, nama, tipe/nilai diskon, tanggal berlaku, `is_active`).

#### `POST /api/admin/landing-config/vouchers`
**File:** `app/api/admin/landing-config/vouchers/route.ts`

Body: `{ voucher_id: string, sort_order?: number }`. Validasi: limit 6 (HTTP 422), voucher exists (HTTP 404), no duplicate (HTTP 409). `sort_order` default = `MAX(sort_order) + 1`.

#### `PUT /api/admin/landing-config/vouchers/reorder`
**File:** `app/api/admin/landing-config/vouchers/reorder/route.ts`

Body: `[{ id: string, sort_order: number }, ...]`. Batch update `sort_order` via `Promise.all`.

#### `DELETE /api/admin/landing-config/vouchers/:id`
**File:** `app/api/admin/landing-config/vouchers/[id]/route.ts`

Hapus entry dari `landing_featured_vouchers` by `id` (bukan `voucher_id`). HTTP 404 jika tidak ditemukan.

### Review ordering

#### `GET /api/admin/landing-config/reviews`
**File:** `app/api/admin/landing-config/reviews/route.ts`

Daftar featured review diurutkan by `sort_order`. Response include nested `review` object (userName dari `users.name`, rating, comment, status, created_at).

#### `POST /api/admin/landing-config/reviews`
**File:** `app/api/admin/landing-config/reviews/route.ts`

Body: `{ review_id: string, sort_order?: number }`. Validasi: review exists (HTTP 404), no duplicate (HTTP 409). `sort_order` default = `MAX(sort_order) + 1`.

#### `PUT /api/admin/landing-config/reviews/reorder`
**File:** `app/api/admin/landing-config/reviews/reorder/route.ts`

Identik dengan vouchers/reorder.

> **Gap:** `DELETE /api/admin/landing-config/reviews/:id` belum ada. Berbeda dengan vouchers, belum ada endpoint untuk menghapus individual featured review — hanya bisa via cascade saat review-nya dihapus. Ini perlu ditambah jika admin UI butuh tombol "hapus dari featured".

---

## Wiring ke halaman publik

**`app/(user)/page.tsx`** adalah async Server Component yang fetch semua data secara parallel:

```ts
const [config, featuredVouchers, featuredReviews] = await Promise.all([
  getLandingConfig(),    // singleton row dari landing_page_config
  getFeaturedVouchers(), // join landingFeaturedVouchers ↔ vouchers
  getFeaturedReviews(),  // join landingFeaturedReviews ↔ reviews ↔ users
]);
```

Ditambah satu fetch produk terbaru: `getProducts({ limit: 6, sort: "newest" })`.

### Fallback chain

| Fungsi | Fallback |
|---|---|
| `getLandingConfig()` | Jika baris tidak ada → `DEFAULT_LANDING_CONFIG` dari `src/lib/landing/defaults.ts` |
| `getFeaturedVouchers()` | Jika kosong → `[]` → `DiskonPromo` pakai `DEFAULT_PROMOS` internal komponen |
| `getFeaturedReviews()` | Jika `landingFeaturedReviews` kosong → query otomatis top-rated reviews (PUBLISHED, rating ≥ 4, limit 8) → jika gagal → `[]` → `Testimoni` pakai `FALLBACK_REVIEWS` internal |

### Props mapping ke komponen

| Komponen | Props dari config |
|---|---|
| `HeroSection` | `config.hero.*` (5 field) |
| `ICardsInfo` | `config.about.*` (badgeLabel, titleMain, titleHighlight, description, features) |
| `InfoCardsList` | `config.infoCards` di-merge ke `DEFAULT_INFO_CARD_ITEMS` — icons & CSS rotation tetap dari kode |
| `TextMarquee` | ⚠️ **Belum terhubung** — komponen tidak menerima props, teks marquee masih hard-coded dalam SVG `textPath` di komponen |
| `DiskonPromo` | `featuredVouchers` (dari `landingFeaturedVouchers` join `vouchers`) |
| `VideoDemo` | `config.videoDemo.*` (title, description, videoSrc). `thumbnailSrc` tidak di-pass — komponen pakai default `/images/foto.jpg` |
| `Testimoni` | `featuredReviews` (dari `landingFeaturedReviews` join `reviews` join `users`) |
| `FAQ` | `config.faq.*` (title, description, items). `promoBanner` di-transform ke `faqPromoData` dengan `highlightText` di-hardcode ke `"Sekarang!"` |

---

## Acceptance criteria

- [x] Migrasi DB berhasil membuat ketiga tabel baru (`drizzle/0009_landing_page_cms.sql`)
- [x] `GET /api/admin/landing-config` mengembalikan data lengkap; jika belum ada baris di DB, kembalikan nilai default (bukan 404)
- [x] `PUT /api/admin/landing-config` menyimpan perubahan dan mengembalikan data terbaru
- [x] `GET /api/admin/landing-config/vouchers` mengembalikan daftar terurut by `sort_order`
- [x] `PUT /api/admin/landing-config/vouchers/reorder` mengupdate urutan dengan benar
- [x] Endpoint voucher menolak insert jika sudah ada 6 featured voucher (HTTP 422)
- [x] API review ordering bekerja sama seperti voucher ordering
- [x] `app/(user)/page.tsx` membaca config dari DB; perubahan via API langsung terlihat di halaman publik tanpa redeploy
- [x] Fallback ke nilai default aktif jika baris config belum ada

## Item yang belum selesai / perlu tindak lanjut

- [x] `DELETE /api/admin/landing-config/reviews/:id` — ditambahkan di `app/api/admin/landing-config/reviews/[id]/route.ts`, pola identik dengan DELETE vouchers
- [x] `TextMarquee` disambungkan ke DB — komponen sekarang menerima `items?: string[]`, fallback ke `DEFAULT_ITEMS` jika kosong; `page.tsx` meneruskan `config.marquee.items`
- [x] `thumbnailSrc` VideoDemo CMS-managed — ditambahkan ke `LandingVideoDemoConfig` interface dan `DEFAULT_VIDEO_DEMO` di `defaults.ts`; `page.tsx` meneruskan `config.videoDemo.thumbnailSrc`
