# RoboEdu — Backend Gap Analysis (Oktober 2026)
## Berdasarkan PRD-FINAL-LAST.md + Codebase Terbaru (post-merge a79140e)

> Analisis ini membandingkan apa yang sudah ada di **frontend** (termasuk update commit `a79140e`)
> dengan apa yang **tersedia di backend** (`app/api/`), mengacu pada `docs/PRD-FINAL-LAST.md`.

---

## LEGENDA STATUS

| Ikon | Arti |
|------|------|
| ✅ | Backend **sudah** tersedia dan terhubung ke frontend |
| ⚠️ | Backend **parsial** atau perlu penyesuaian |
| ❌ | Backend **belum ada** — frontend masih memakai mock data |
| 🔄 | Perlu **migrasi schema** database |

---

## 1. MODUL MEMBERSHIP (PRIORITAS TERTINGGI)

**Revisi PRD Oktober 2026**: Model "Reseller" (apply → review admin → approve/reject)
**diganti menjadi** "Membership Berbayar" (beli → Midtrans → otomatis aktif).

Frontend di commit `a79140e` **sudah selesai** untuk fitur ini:
- `/profile/reseller` — halaman status & riwayat pembelian
- `/reseller` — halaman info & pembelian Paket Plus
- `/admin/resellers` — halaman daftar member (mock)

| Kebutuhan | Endpoint Backend | Status |
|-----------|-----------------|--------|
| Lihat status membership + purchase history | `GET /api/membership/me` | ❌ Mock-only (`/api/mock-membership-me`) |
| Beli paket membership Plus via Midtrans | `POST /api/checkout/membership` | ❌ Belum ada |
| Webhook Midtrans untuk membership | Perbarui `POST /api/payments/midtrans/webhook` | ❌ Hanya handle order, bukan membership |
| Daftar member admin (read-only) | `GET /api/admin/resellers` | ❌ Belum ada (mock: `MOCK_ADMIN_RESELLERS`) |
| Detail member admin | `GET /api/admin/resellers/[id]` | ❌ Belum ada |

### Schema Database yang Diperlukan (Belum Ada):
- 🔄 Tabel **`membership_purchase`** (PRD §25.1): `purchase_number`, `price_snapshot`, `duration_months_snapshot`, `starts_at`, `ends_at`, `paid_at`, `reminder_h7_sent_at`, `reminder_h3_sent_at`
- 🔄 Kolom **`users`**: ganti `reseller_status`/`reseller_approved_at` → `membership_status` (`NOT_MEMBER`/`MEMBER`) + `membership_expires_at`
- 🔄 Kolom **`payments`**: tambah `membership_purchase_id` (nullable), buat `order_id` nullable
- 🔄 Kolom **`orders`**: `is_dropship`, `sender_name`, `sender_phone` untuk Dropship member (PRD §6.10)

---

## 2. HARGA MEMBER DI BACKEND (FR-010, §6.5)

Frontend menampilkan harga member berdasarkan mock status, tapi **backend tidak pernah
memperhitungkan harga member sama sekali**.

| Kebutuhan | Status |
|-----------|--------|
| `GET /api/product` — harga mempertimbangkan membership user yang login | ❌ Selalu harga normal |
| `GET /api/cart` — subtotal pakai `reseller_price_override` jika MEMBER aktif | ❌ Selalu harga normal |
| `POST /api/checkout/midtrans` — `transaction-service.ts` pakai harga member jika berlaku | ❌ Selalu pakai `productVariants.price` |

> [!CAUTION]
> Member yang checkout akan **selalu dibayarkan dengan harga normal**, bukan harga member,
> meskipun tampilan di frontend sudah benar. Ini adalah bug yang berdampak langsung ke revenue.

---

## 3. MODUL LAPORAN ADMIN (FR-014, §8)

Halaman `/admin/reports` **sudah lengkap** di frontend, memanggil:
- `adminService.getSalesReport()` → `GET /api/admin/reports/sales`
- `adminService.getTopProductsReport()` → `GET /api/admin/reports/top-products`

| Endpoint | Status |
|----------|--------|
| `GET /api/admin/reports/sales` | ❌ Tidak ada (HTTP 404) |
| `GET /api/admin/reports/top-products` | ❌ Tidak ada (HTTP 404) |
| `GET /api/admin/dashboard` | ❌ Tidak ada — frontend fallback ke hardcoded mock values |

---

## 4. MODUL KLAIM GARANSI / KOMPLAIN (FR-015, §17)

Frontend memiliki `/admin/complaints` dengan full UI (table, filter, stats, detail),
menggunakan `MOCK_ADMIN_COMPLAINTS` sebagai data source.

| Endpoint | Status |
|----------|--------|
| `POST /api/complaints` — customer ajukan klaim | ❌ Tidak ada |
| `GET /api/complaints` — list klaim milik customer | ❌ Tidak ada |
| `GET /api/admin/complaints` — list semua klaim (admin) | ❌ Tidak ada (mock) |
| `GET /api/admin/complaints/[id]` — detail klaim | ❌ Tidak ada |
| `PATCH /api/admin/complaints/[id]` — update status + resolution | ❌ Tidak ada |

> [!NOTE]
> Tabel `complaints` dan `complaint_attachments` **sudah ada di schema DB**,
> tapi zero API endpoint yang mengaksesnya.

---

## 5. MODUL PENGIRIMAN / RESI / TRACKING (FR-020, §12)

Frontend memiliki `order-tracking-modal.tsx` dan form input resi di admin order detail.
`GET /api/admin/orders/[id]` dan `GET /api/orders/[id]` sudah melakukan JOIN ke `shipments`.

| Kebutuhan | Status |
|-----------|--------|
| Insert baris `shipments` saat checkout | ❌ `transaction-service.ts` tidak pernah insert ke `shipments` |
| Admin simpan `tracking_number` saat SHIPPED | ⚠️ `PATCH /api/admin/orders/[id]/status` ada, tapi **tidak menyimpan resi** ke `shipments` |
| Admin tambah checkpoint tracking kurir | ❌ Tidak ada endpoint untuk insert ke `shipment_tracking` |
| API mengembalikan data shipment & tracking | ✅ Query sudah ada di kedua endpoint GET order detail |

> [!WARNING]
> Data tracking di frontend akan **selalu `null`** karena baris `shipments` tidak pernah dibuat
> saat checkout. Schema dan query sudah siap, tapi tidak ada data yang masuk.

---

## 6. PENGATURAN ADMIN — SETTINGS (§8)

Frontend `/admin/settings` punya 4 tab (Store Info, Payment, Shipping, General) dengan
form yang sudah lengkap — tapi `handleSave()` saat ini hanya `setTimeout` palsu.

| Endpoint | Status |
|----------|--------|
| `GET /api/admin/settings` | ❌ Tidak ada |
| `PATCH /api/admin/settings` | ❌ Tidak ada |

> Tidak ada tabel `settings` di schema DB. Perlu didesain terlebih dahulu:
> key-value store atau kolom terstruktur (termasuk harga & durasi Membership Plus).

---

## 7. DASHBOARD ADMIN & INVENTORY LOW-STOCK (FR-009, §14)

| Endpoint | Status |
|----------|--------|
| `GET /api/admin/dashboard` | ❌ Tidak ada — halaman pakai hardcoded fallback numbers |
| `GET /api/admin/inventory/low-stock` | ❌ Tidak ada (`adminService.getLowStockInventory()` → 404) |

---

## 8. AUDIT LOG & EMAIL LOG (FR-017, §25.9)

| Endpoint | Status |
|----------|--------|
| `GET /api/admin/audit-log` | ❌ Tidak ada |
| `GET /api/admin/email-log` | ❌ Tidak ada |
| Pencatatan ke `audit_log` saat admin melakukan aksi | ❌ Tidak ada sama sekali di route handler manapun |

---

## 9. BACKGROUND JOB / QUEUE (§18, §19.4)

PRD §11.1 dan §18 mensyaratkan email receipt dikirim via BullMQ, bukan synchronous.

| Fitur | Status |
|-------|--------|
| BullMQ Queue Worker untuk email | ❌ `bullmq` & `ioredis` ada di `package.json` tapi zero implementasi |
| Email receipt order dikirim via queue | ❌ Dikirim langsung (synchronous) di webhook handler |
| Email receipt membership dikirim via queue | ❌ Belum ada sama sekali |
| Cron job harian: expire membership → NOT_MEMBER | ❌ Belum ada |
| Cron job H-7 & H-3: email reminder membership | ❌ Belum ada |

---

## 10. ENDPOINT YANG SUDAH ADA DI BACKEND ✅

| Endpoint | Keterangan |
|----------|-----------|
| `POST /api/auth/register` | Register customer |
| `POST /api/auth/login` | Login + session cookie |
| `POST /api/auth/logout` | Logout |
| `GET /api/auth/me` | Profil user aktif |
| `POST /api/auth/forgot-password` | Kirim email reset password |
| `POST /api/auth/reset-password` | Reset password |
| `GET /api/cart` | Lihat isi cart |
| `POST /api/cart` | Tambah item ke cart |
| `PATCH /api/cart/[id]` | Update kuantitas item |
| `DELETE /api/cart/[id]` | Hapus item dari cart |
| `GET /api/product` | Daftar produk (paginated) |
| `GET /api/product/[slug]` | Detail produk |
| `GET /api/wishlist` | Daftar wishlist |
| `POST /api/wishlist` | Tambah ke wishlist |
| `DELETE /api/wishlist/[id]` | Hapus dari wishlist |
| `POST /api/vouchers/validate` | Validasi voucher (dry-run) |
| `POST /api/checkout/midtrans` | Buat order + Midtrans Snap token |
| `POST /api/payments/midtrans/webhook` | Webhook Midtrans (order only) |
| `GET /api/orders` | Riwayat pesanan customer |
| `GET /api/orders/[id]` | Detail pesanan + shipment + tracking |
| `POST /api/reviews` | Submit review |
| `GET /api/reviews/featured` | Review unggulan (landing page) |
| `POST /api/contact` | Kirim pesan kontak |
| `GET /api/shipping-providers` | Daftar provider pengiriman aktif |
| `GET /api/profile` | Data profil user |
| `PATCH /api/profile` | Update profil |
| `POST /api/profile/avatar` | Upload avatar |
| `GET/POST /api/profile/addresses` | Daftar & tambah alamat |
| `PATCH/DELETE /api/profile/addresses/[id]` | Edit & hapus alamat |
| `GET/POST /api/admin/products` | Manajemen produk |
| `GET/PATCH/DELETE /api/admin/products/[id]` | Detail/edit/hapus produk |
| `GET/POST /api/admin/vouchers` | Manajemen voucher |
| `GET/PATCH/DELETE /api/admin/vouchers/[id]` | Detail/edit/hapus voucher |
| `GET /api/admin/vouchers/[id]/usages` | Histori pemakaian voucher |
| `GET /api/admin/orders` | Daftar pesanan (admin) |
| `GET /api/admin/orders/[id]` | Detail pesanan + shipment (admin) |
| `PATCH /api/admin/orders/[id]/status` | Update status pesanan |
| `GET /api/admin/users` | Daftar customer (admin) |
| `GET/PATCH /api/admin/users/[id]` | Detail/edit customer |
| `PATCH /api/admin/users/[id]/status` | Aktif/nonaktifkan akun |
| `GET /api/admin/reviews` | Daftar review (admin) |
| `PATCH /api/admin/reviews/[id]/status` | Moderasi review |
| `GET /api/admin/categories` | Manajemen kategori |
| `GET /api/admin/product-types` | Manajemen product type |

---

## RINGKASAN PRIORITAS PENGERJAAN

### 🔴 Prioritas 1 — Core Business (Blokir Revenue / Data Integrity)

1. **Migrasi schema DB** — tabel `membership_purchase`, update kolom `users`, update `payments`, tambah kolom dropship di `orders`
2. **Harga member di backend** — perbarui `transaction-service.ts`, `/api/product`, `/api/cart`
3. **Endpoint membership** — `GET /api/membership/me`, `POST /api/checkout/membership`, perbarui webhook
4. **Insert `shipments` saat checkout** — tambahkan ke `transaction-service.ts`

### 🟡 Prioritas 2 — Halaman Frontend Sudah Ada, Backend Belum

5. `GET /api/admin/dashboard` — Dashboard admin (hardcoded fallback saat ini)
6. `GET /api/admin/reports/sales` + `/top-products` — Laporan admin
7. `GET /api/admin/inventory/low-stock` — Stok menipis
8. Perbarui `PATCH /api/admin/orders/[id]/status` — simpan `tracking_number` ke `shipments`
9. Endpoint insert checkpoint tracking kurir (`shipment_tracking`)
10. `GET/PATCH /api/admin/settings` + desain & migrasi tabel `settings` di DB

### 🟢 Prioritas 3 — Fitur Sekunder PRD

11. Endpoint klaim garansi customer (`POST/GET /api/complaints`)
12. Endpoint admin klaim garansi (`GET/PATCH /api/admin/complaints`)
13. `GET /api/admin/audit-log` + pencatatan audit di tiap admin route handler
14. `GET /api/admin/email-log`
15. **BullMQ worker** + queue untuk email receipt order & membership
16. **Cron job** expire membership + reminder H-7/H-3
17. Endpoint admin resellers (`GET /api/admin/resellers`, `GET /api/admin/resellers/[id]`)
18. Endpoint dropship checkout (input `is_dropship`, `sender_name`, `sender_phone`)
