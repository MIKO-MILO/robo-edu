# RoboEdu — API Specification

**Base URL:** `https://api.roboedu.id/api/v1`
**Format:** JSON (`Content-Type: application/json`)
**Auth:** `Authorization: Bearer <token>` (JWT / session token)

> **Catatan sumber & asumsi.** Dokumen ini disusun berdasarkan `rest-api-standards-v2.md` (konvensi URL, format response, status code, security) dan diselaraskan dengan **skema database yang sudah ada di kodebase** (`0000_roboedu_initial_schema.sql`), bukan skema di Bab 25 PRD. Perbedaannya:
> - Pengiriman memakai tabel `shipment` + `shipment_tracking` terpisah (bukan kolom langsung di `order`), sehingga endpoint pengiriman didesain sebagai sub-resource dari order.
> - `audit_log` tersedia sebagai endpoint read-only admin (tidak ada di ERD PRD).
> - Struktur `complaints` mengikuti kolom kodebase (`subject`, `resolution`, `resolved_at`), bukan `contact_method_used` dari PRD.
> - `user.role` di kodebase hanya `CUSTOMER` / `ADMIN` (belum granular superadmin/admin_sales/admin_laporan seperti PRD Bab 5). Endpoint di bawah tetap memakai catatan role granular sebagai **rencana**, ditandai `*(role admin granular — TODO saat auth diimplementasikan)*`.
>
> Kalau Goldii ingin dokumen ini mengikuti PRD Bab 25 (kolom shipping langsung di `order`) alih-alih kodebase saat ini, beri tahu saya — ini salah satu dari 3 diskrepansi yang belum diputuskan, jadi lebih baik diselesaikan dulu sebelum tim frontend mulai konsumsi dokumen ini.

---

## 1. Konvensi Umum

Mengikuti `rest-api-standards-v2.md` secara penuh:

- URL: lowercase, kebab-case, noun, plural untuk collection (`/order-items`, bukan `/orderItems`).
- Versioning via path prefix: `/api/v1/...`.
- Field JSON: `snake_case`.
- Semua ID publik: **UUID v4** (`varchar(36)` di DB sudah sesuai — tidak ada auto-increment integer yang diekspos).
- Tanggal/waktu: ISO 8601 UTC (`2026-08-18T10:30:00Z`).
- Boolean: prefix jelas (`is_active`, `is_primary`).

### 1.1 Header Wajib

| Header | Wajib | Keterangan |
| --- | --- | --- |
| `Authorization` | Ya (kecuali endpoint publik) | `Bearer <token>` |
| `Content-Type` | Ya (untuk body) | `application/json` |
| `X-Request-ID` | Disarankan | UUID per-request, dipakai sebagai `trace_id` di error |
| `Idempotency-Key` | **Wajib** untuk `POST /orders`, `POST /checkout`, `POST /payments/*` | Mencegah duplikasi transaksi bila request diulang |

### 1.2 Format Response — Single Resource

```json
{
  "data": {
    "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "name": "Robo Kit Car",
    "created_at": "2026-08-18T10:30:00Z",
    "updated_at": "2026-08-18T10:30:00Z"
  }
}
```

### 1.3 Format Response — Collection

```json
{
  "data": [ { "id": "...", "name": "..." } ],
  "meta": {
    "current_page": 1,
    "per_page": 20,
    "total_pages": 5,
    "total_count": 100
  }
}
```

### 1.4 Format Error

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "trace_id": "req-9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    "details": [
      { "field": "email", "message": "Email format is invalid" }
    ]
  }
}
```

### 1.5 Query Parameter Standar

| Parameter | Fungsi | Contoh |
| --- | --- | --- |
| `page`, `limit` | Pagination | `?page=2&limit=20` |
| `sort` | Sorting, `-` untuk desc | `?sort=-created_at` |
| `search` | Full-text search | `?search=robo+kit` |
| `fields` | Field selection | `?fields=id,name,base_price` |
| filter spesifik per-resource | Lihat tiap bagian | `?status=ACTIVE` |

### 1.6 Status Code

Standar dari `rest-api-standards-v2.md`: `200/201/204` untuk sukses; `400/401/403/404/409/422/429` untuk client error; `500/502/503` untuk server error. Tidak diulang per-endpoint kecuali ada perilaku khusus.

### 1.7 Role & Akses

Role saat ini di DB: `CUSTOMER`, `ADMIN`. Status reseller (`reseller_status`) terpisah dari `role` (lih. PRD Bab 5–6) — middleware harus memeriksa keduanya secara independen. Tabel role di tiap bagian di bawah memakai label berikut:

- **Public** — tidak perlu token.
- **Customer** — token milik user dengan `role=CUSTOMER`.
- **Owner** — Customer, dibatasi hanya pada data miliknya sendiri (`user_id` cocok dengan token).
- **Admin** — token milik user dengan `role=ADMIN`.

---

## 2. Autentikasi — `/auth`

| Method | Endpoint | Akses | Deskripsi |
| --- | --- | --- | --- |
| POST | `/auth/register` | Public | Registrasi customer baru |
| POST | `/auth/login` | Public | Login, mengembalikan token + refresh token |
| POST | `/auth/logout` | Owner | Invalidasi sesi/token aktif |
| POST | `/auth/refresh` | Public (refresh token di body) | Perbarui access token |
| GET | `/auth/me` | Owner | Profil user yang sedang login |

**Request — `POST /auth/register`**
```json
{ "name": "Budi Santoso", "email": "budi@example.com", "password": "Secr3t!2026", "phone": "081234567890" }
```

**Response `201`**
```json
{
  "data": {
    "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "name": "Budi Santoso",
    "email": "budi@example.com",
    "role": "CUSTOMER",
    "reseller_status": "NOT_RESELLER",
    "created_at": "2026-08-18T10:30:00Z"
  }
}
```

**Response — `POST /auth/login` (`200`)**
```json
{
  "data": {
    "access_token": "eyJhbGciOi...",
    "refresh_token": "eyJhbGciOi...",
    "expires_in": 3600,
    "user": { "id": "...", "name": "Budi Santoso", "role": "CUSTOMER", "reseller_status": "NOT_RESELLER" }
  }
}
```

Error khusus: `401 UNAUTHORIZED` (kredensial salah), `409 CONFLICT` (email sudah terdaftar saat register).

---

## 3. User & Alamat — `/users`

| Method | Endpoint | Akses | Deskripsi |
| --- | --- | --- | --- |
| GET | `/users/me` | Owner | Detail profil sendiri |
| PATCH | `/users/me` | Owner | Update nama/telepon (bukan email/password) |
| PATCH | `/users/me/password` | Owner | Ganti password |
| GET | `/users/me/addresses` | Owner | List alamat milik user |
| POST | `/users/me/addresses` | Owner | Tambah alamat |
| GET | `/users/me/addresses/{id}` | Owner | Detail alamat |
| PATCH | `/users/me/addresses/{id}` | Owner | Update alamat |
| DELETE | `/users/me/addresses/{id}` | Owner | Hapus alamat |
| PATCH | `/users/me/addresses/{id}/set-primary` | Owner | Jadikan alamat utama |
| GET | `/admin/users` | Admin | List semua user (filter `role`, `reseller_status`, `search`) |
| GET | `/admin/users/{id}` | Admin | Detail user + histori order ringkas |
| PATCH | `/admin/users/{id}/status` | Admin | Aktif/nonaktifkan user (`is_active`) |

**Body — `POST /users/me/addresses`**
```json
{
  "label": "Rumah",
  "recipient_name": "Budi Santoso",
  "phone": "081234567890",
  "address": "Jl. Merdeka No. 10",
  "province": "Jawa Timur",
  "city": "Malang",
  "district": "Klojen",
  "village": "Kauman",
  "postal_code": "65119",
  "is_primary": true
}
```

---

## 4. Kategori — `/categories`

| Method | Endpoint | Akses | Deskripsi |
| --- | --- | --- | --- |
| GET | `/categories` | Public | List kategori aktif (`?is_active=true` default untuk non-admin) |
| GET | `/categories/{slug}` | Public | Detail kategori |
| POST | `/admin/categories` | Admin | Buat kategori |
| PATCH | `/admin/categories/{id}` | Admin | Update kategori |
| DELETE | `/admin/categories/{id}` | Admin | Hapus (soft — set `is_active=false` jika masih dipakai produk) |

---

## 5. Product Type — `/product-types`

| Method | Endpoint | Akses | Deskripsi |
| --- | --- | --- | --- |
| GET | `/product-types` | Public | List product type aktif |
| GET | `/product-types/{slug}` | Public | Detail |
| POST | `/admin/product-types` | Admin | Buat |
| PATCH | `/admin/product-types/{id}` | Admin | Update |
| DELETE | `/admin/product-types/{id}` | Admin | Hapus/soft-delete |

---

## 6. Produk — `/products`

| Method | Endpoint | Akses | Deskripsi |
| --- | --- | --- | --- |
| GET | `/products` | Public | Katalog produk aktif. Filter: `category`, `product_type`, `min_price`, `max_price`, `status` (admin only), `rating_min`; sort: `-created_at`, `price`, `-popularity`, `-rating`; `search` untuk nama/SKU |
| GET | `/products/{slug}` | Public | Detail produk (termasuk `variants[]`, `images[]`, harga reseller bila token reseller APPROVED) |
| POST | `/admin/products` | Admin | Buat produk (status default `DRAFT`) |
| PATCH | `/admin/products/{id}` | Admin | Update produk |
| DELETE | `/admin/products/{id}` | Admin | Nonaktifkan produk |
| PATCH | `/admin/products/{id}/status` | Admin | Ubah status (`DRAFT/ACTIVE/INACTIVE/OUT_OF_STOCK`) |
| GET | `/products/{id}/variants` | Public | List variant produk |
| POST | `/admin/products/{id}/variants` | Admin | Tambah variant |
| PATCH | `/admin/product-variants/{id}` | Admin | Update variant (harga, stok, status) |
| DELETE | `/admin/product-variants/{id}` | Admin | Hapus variant |
| GET | `/products/{id}/images` | Public | List gambar produk |
| POST | `/admin/products/{id}/images` | Admin | Upload gambar (`multipart/form-data`, disimpan ke MinIO) |
| DELETE | `/admin/product-images/{id}` | Admin | Hapus gambar |
| PATCH | `/admin/product-images/{id}/reorder` | Admin | Ubah `sort_order` / `is_primary` |

**Response — `GET /products/{slug}` (`200`, ringkas)**
```json
{
  "data": {
    "id": "b7e6c1f0-...",
    "name": "Robo Kit Car",
    "slug": "robo-kit-car",
    "sku": "RKC-001",
    "category": { "id": "...", "name": "Robot Kit", "slug": "robot-kit" },
    "product_type": { "id": "...", "name": "Kendaraan", "slug": "kendaraan" },
    "description": "...",
    "status": "ACTIVE",
    "price": { "base_price": 450000, "reseller_price": 400000, "currency": "IDR" },
    "variants": [
      { "id": "...", "variant_name": "Merah", "sku": "RKC-001-RED", "price": 450000, "reseller_price": 400000, "stock": 12, "status": "ACTIVE" }
    ],
    "images": [
      { "id": "...", "image_url": "https://cdn.roboedu.id/products/rkc-001-1.jpg", "is_primary": true, "sort_order": 0 }
    ],
    "rating": { "average": 4.8, "count": 23 },
    "created_at": "2026-06-01T02:00:00Z",
    "updated_at": "2026-08-10T09:12:00Z"
  }
}
```

> Catatan: `reseller_price` hanya ditampilkan jika `reseller_status = APPROVED` pada token yang memanggil; selain itu field disembunyikan sesuai `19.7`/`24` PRD (data harga khusus tidak untuk publik).

---

## 7. Cart — `/cart`

Cart bersifat **satu per user** (`cart.user_id UNIQUE`), jadi tidak perlu `{id}` di path level cart.

| Method | Endpoint | Akses | Deskripsi |
| --- | --- | --- | --- |
| GET | `/cart` | Owner | Ambil (atau auto-buat) cart milik user beserta `cart_items[]` dan subtotal |
| POST | `/cart/items` | Owner | Tambah item ke cart |
| PATCH | `/cart/items/{id}` | Owner | Ubah `quantity` |
| DELETE | `/cart/items/{id}` | Owner | Hapus item dari cart |
| DELETE | `/cart` | Owner | Kosongkan cart |

**Body — `POST /cart/items`**
```json
{ "product_id": "b7e6c1f0-...", "variant_id": "c9a1e2b3-...", "quantity": 2 }
```

Validasi server: `quantity` tidak boleh melebihi `stock` variant/produk (FR-005, US-002) → error `422 STOCK_INSUFFICIENT` bila melebihi.

---

## 8. Wishlist — `/wishlist`

| Method | Endpoint | Akses | Deskripsi |
| --- | --- | --- | --- |
| GET | `/wishlist` | Owner | List wishlist milik user |
| POST | `/wishlist` | Owner | Tambah produk ke wishlist (tanpa quantity) |
| DELETE | `/wishlist/{id}` | Owner | Hapus item wishlist |

**Body — `POST /wishlist`**
```json
{ "product_id": "b7e6c1f0-..." }
```

---

## 9. Voucher — `/vouchers`

| Method | Endpoint | Akses | Deskripsi |
| --- | --- | --- | --- |
| POST | `/vouchers/validate` | Owner | Validasi kode voucher terhadap subtotal cart saat ini (cek `minimum_purchase`, `usage_limit`, masa berlaku, `is_active`) |
| GET | `/admin/vouchers` | Admin | List voucher |
| POST | `/admin/vouchers` | Admin | Buat voucher |
| GET | `/admin/vouchers/{id}` | Admin | Detail + ringkasan `voucher_usage` |
| PATCH | `/admin/vouchers/{id}` | Admin | Update voucher |
| DELETE | `/admin/vouchers/{id}` | Admin | Nonaktifkan voucher |
| GET | `/admin/vouchers/{id}/usages` | Admin | Histori pemakaian voucher |

**Body — `POST /vouchers/validate`**
```json
{ "code": "ROBOEDU10" }
```

**Response `200`**
```json
{
  "data": {
    "code": "ROBOEDU10",
    "discount_type": "PERCENTAGE",
    "discount_value": 10,
    "estimated_discount": 45000,
    "is_valid": true
  }
}
```

---

## 10. Checkout & Order — `/orders`, `/checkout`

| Method | Endpoint | Akses | Deskripsi |
| --- | --- | --- | --- |
| POST | `/checkout/summary` | Owner | Hitung subtotal, ongkir, diskon, total **tanpa** membuat order (preview sebelum konfirmasi) |
| POST | `/orders` | Owner | Buat order dari cart + inisiasi transaksi Midtrans. **Wajib `Idempotency-Key`** |
| GET | `/orders` | Owner | Riwayat order milik user (filter `status`) |
| GET | `/orders/{id}` | Owner | Detail order + `order_items[]`, `payment`, `shipment` |
| PATCH | `/orders/{id}/cancel` | Owner | Batalkan order (hanya jika status `PENDING`) |
| GET | `/admin/orders` | Admin | List semua order (filter `status`, `user_id`, rentang tanggal) |
| GET | `/admin/orders/{id}` | Admin | Detail order (admin view) |
| PATCH | `/admin/orders/{id}/status` | Admin | Ubah status fulfillment (`PROCESSING/SHIPPED/DELIVERED/COMPLETED/CANCELLED/REFUNDED`) |
| POST | `/admin/orders/{id}/shipment` | Admin | Input data pengiriman (provider, service, no. resi) → membuat/mengupdate `shipment` |
| POST | `/admin/shipments/{id}/trackings` | Admin | Tambah entri tracking manual (`shipment_tracking`) |

**Body — `POST /orders`**
```json
{
  "address_id": "d2f6e5a1-...",
  "shipping_provider_id": "8f1c2b3a-...",
  "shipping_service": "REG",
  "voucher_code": "ROBOEDU10"
}
```

**Response `201`**
```json
{
  "data": {
    "id": "e1a2b3c4-...",
    "order_number": "RE-20260818-0001",
    "status": "PENDING",
    "subtotal": 450000,
    "discount_amount": 45000,
    "shipping_cost": 20000,
    "total": 425000,
    "order_items": [
      {
        "id": "...",
        "product_id": "b7e6c1f0-...",
        "variant_id": "c9a1e2b3-...",
        "product_name_snapshot": "Robo Kit Car",
        "variant_name_snapshot": "Merah",
        "price_snapshot": 450000,
        "quantity": 1,
        "subtotal": 450000
      }
    ],
    "payment": {
      "midtrans_redirect_url": "https://app.sandbox.midtrans.com/snap/v3/redirection/...",
      "status": "PENDING"
    },
    "created_at": "2026-08-18T10:30:00Z"
  }
}
```

Error khusus: `422 STOCK_INSUFFICIENT`, `422 VOUCHER_INVALID`, `409 CONFLICT` bila `Idempotency-Key` sudah dipakai dengan payload berbeda.

---

## 11. Pembayaran — `/payments`

Konfirmasi status pembayaran **wajib** lewat webhook Midtrans yang divalidasi backend, bukan redirect browser (PRD 11.2, 23-Pembayaran).

| Method | Endpoint | Akses | Deskripsi |
| --- | --- | --- | --- |
| POST | `/payments/midtrans/webhook` | **Server-to-server** (signature Midtrans, bukan Bearer token) | Menerima notifikasi status transaksi dari Midtrans |
| GET | `/orders/{id}/payment` | Owner | Cek status pembayaran order |
| GET | `/admin/payments` | Admin | List semua transaksi pembayaran (filter `status`) |
| GET | `/admin/payments/{id}` | Admin | Detail transaksi termasuk `raw_response` |

**Body webhook (dari Midtrans, contoh ringkas)**
```json
{
  "order_id": "RE-20260818-0001",
  "transaction_id": "a1e2c3d4-...",
  "transaction_status": "settlement",
  "fraud_status": "accept",
  "payment_type": "gopay",
  "gross_amount": "425000.00"
}
```

Alur server: validasi signature Midtrans → update `payment.status` → update `order.status` → enqueue job BullMQ `send-receipt-email` → response `200 { "data": { "received": true } }`.

Endpoint webhook **tidak** memakai response envelope error standar untuk hal-hal yang divalidasi Midtrans sendiri; namun tetap mengembalikan `401` jika signature tidak valid, dicatat di `audit_log` dan Pino log terstruktur.

---

## 12. Pengiriman — `/shipping-providers`

| Method | Endpoint | Akses | Deskripsi |
| --- | --- | --- | --- |
| GET | `/shipping-providers` | Public | List provider aktif (untuk pilihan checkout) |
| POST | `/admin/shipping-providers` | Admin | Tambah provider |
| PATCH | `/admin/shipping-providers/{id}` | Admin | Update / nonaktifkan provider |
| GET | `/orders/{id}/shipment` | Owner | Detail pengiriman order (provider, resi, status, `trackings[]`) |

---

## 13. Review — `/reviews`

| Method | Endpoint | Akses | Deskripsi |
| --- | --- | --- | --- |
| GET | `/products/{id}/reviews` | Public | List review yang `status=PUBLISHED` untuk produk tsb |
| POST | `/reviews` | Owner | Buat review; server validasi `order_item_id` benar milik user & order sudah `COMPLETED` |
| PATCH | `/reviews/{id}` | Owner | Edit rating/komentar milik sendiri |
| DELETE | `/reviews/{id}` | Owner | Hapus review sendiri |
| GET | `/admin/reviews` | Admin | List semua review (filter `status`) |
| PATCH | `/admin/reviews/{id}/status` | Admin | Moderasi (`PUBLISHED`/hidden) |

**Body — `POST /reviews`**
```json
{ "order_item_id": "f1a2b3c4-...", "rating": 5, "comment": "Kualitas bagus, anak saya senang belajar robotika." }
```

Error khusus: `422 REVIEW_NOT_ELIGIBLE` jika `order_item` belum `COMPLETED` atau bukan milik user, `409 CONFLICT` jika `order_item_id` sudah pernah direview (`review.order_item_id` UNIQUE).

---

## 14. Klaim Garansi — `/complaints`

| Method | Endpoint | Akses | Deskripsi |
| --- | --- | --- | --- |
| GET | `/complaints` | Owner | Riwayat klaim milik user |
| POST | `/complaints` | Owner | Ajukan klaim (status awal `OPEN`, mengikuti kodebase; PRD menyebut `SUBMITTED` — perlu diselaraskan) |
| GET | `/complaints/{id}` | Owner | Detail klaim + `attachments[]` |
| POST | `/complaints/{id}/attachments` | Owner | Upload lampiran foto/video (`multipart/form-data` → MinIO) |
| GET | `/admin/complaints` | Admin | List semua klaim (filter `status`) |
| PATCH | `/admin/complaints/{id}` | Admin | Update status + `resolution` (tindak lanjut manual WA/email) |

**Body — `POST /complaints`**
```json
{ "order_item_id": "f1a2b3c4-...", "subject": "Motor dinamo tidak berputar", "description": "Setelah dirakit, motor tidak menyala saat diberi daya..." }
```

---

## 15. Reseller — `/reseller`

| Method | Endpoint | Akses | Deskripsi |
| --- | --- | --- | --- |
| POST | `/reseller/apply` | Owner | Ajukan status reseller (`reseller_status` → `PENDING`) |
| GET | `/reseller/status` | Owner | Cek status pengajuan reseller sendiri |
| GET | `/admin/reseller-applications` | Admin | List user dengan `reseller_status=PENDING` |
| PATCH | `/admin/users/{id}/reseller-status` | Admin | Setujui/tolak (`APPROVED`/`REJECTED`), set `reseller_approved_at` |

---

## 16. Admin — Dashboard, Laporan, Log

| Method | Endpoint | Akses | Deskripsi |
| --- | --- | --- | --- |
| GET | `/admin/dashboard` | Admin | Ringkasan revenue, order pending, produk terlaris, stok menipis |
| GET | `/admin/reports/sales` | Admin | Laporan penjualan (filter rentang tanggal, `group_by=day/week/month`) |
| GET | `/admin/reports/top-products` | Admin | Produk/kategori terlaris |
| GET | `/admin/inventory/low-stock` | Admin | Produk/variant dengan stok di bawah ambang batas |
| GET | `/admin/audit-log` | Admin *(disarankan superadmin — lih. catatan role granular di §1.7)* | Log aktivitas admin (`actor_id`, `action`, `target_type`, `target_id`) |
| GET | `/admin/email-log` | Admin | Status pengiriman email (filter `status=SENT/FAILED`, `type`) |
| GET | `/admin/settings` | Admin | Pengaturan toko/payment/shipping |
| PATCH | `/admin/settings` | Admin | Update pengaturan |

---

## 17. Kode Error Umum

| Code | Status | Konteks |
| --- | --- | --- |
| `VALIDATION_ERROR` | 422 | Input tidak lolos validasi |
| `UNAUTHORIZED` | 401 | Token tidak ada/invalid/expired |
| `FORBIDDEN` | 403 | Role/`reseller_status` tidak mengizinkan akses |
| `NOT_FOUND` | 404 | Resource tidak ditemukan |
| `CONFLICT` | 409 | Duplikasi data / idempotency key bentrok |
| `STOCK_INSUFFICIENT` | 422 | Quantity melebihi stok/kuota |
| `VOUCHER_INVALID` | 422 | Voucher expired/limit/minimum tidak terpenuhi |
| `REVIEW_NOT_ELIGIBLE` | 422 | Order item belum memenuhi syarat review |
| `RATE_LIMITED` | 429 | Melebihi batas request |
| `INTERNAL_ERROR` | 500 | Error tak terduga di server |

Semua error di atas mengikuti amplop `error` pada §1.4 dan wajib menyertakan `trace_id`.

---

## 18. Hal yang Perlu Diputuskan Sebelum Implementasi

1. **Model shipment**: dokumen ini pakai tabel `shipment`/`shipment_tracking` terpisah (sesuai kodebase). Kalau keputusan akhirnya ikut PRD (kolom langsung di `order`), endpoint §12 dan bagian `orders/{id}` di §10 perlu direvisi.
2. **Status klaim garansi**: kodebase pakai `OPEN`, PRD pakai `SUBMITTED/IN_REVIEW/RESOLVED/REJECTED` — perlu satu sumber kebenaran sebelum FE dibangun.
3. **Role granular admin** (`superadmin`/`admin_sales`/`admin_laporan`): belum ada di enum `role` kodebase (`CUSTOMER`/`ADMIN` saja). Endpoint admin di dokumen ini untuk sementara diperlakukan sebagai satu role `Admin`.

Setelah tiga hal ini diputuskan, dokumen ini bisa diperbarui supaya konsisten dengan `schema.ts` dan PRD final.
