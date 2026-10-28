# Spec: Backend Completion — RoboEdu (Oktober 2026)

> Derived from `docs/backend-gap.md` and `docs/PRD-FINAL-LAST.md`.  
> Status: **ready-for-agent**

---

## Problem Statement

Backend RoboEdu saat ini hanya mengimplementasikan sekitar 40% dari kebutuhan yang didefinisikan di PRD-FINAL-LAST.md. Meskipun fondasi transaksi, autentikasi, dan produk sudah berfungsi, sejumlah fitur kritis—terutama sistem membership berbayar yang menggantikan model reseller lama—belum memiliki backend sama sekali. Frontend (post-merge commit `a79140e`) sudah selesai menggunakan mock data, namun tanpa backend yang sesuai, aplikasi tidak dapat digunakan secara nyata.

Gap paling kritis: seorang member yang melakukan checkout saat ini **selalu membayar harga normal**, bukan harga member, meskipun tampilan harga di frontend sudah benar. Schema database pun masih menggunakan paradigma "reseller" lama yang sudah dihapus dari PRD.

---

## Solution

Mengimplementasikan seluruh backend yang diperlukan dalam tiga fase berurutan berdasarkan prioritas bisnis:

1. **Fase 1 (Core)**: Migrasi schema DB + sistem membership berbayar + perbaikan harga member + insert shipments saat checkout
2. **Fase 2 (Admin)**: Dashboard, laporan, inventory, settings, dan penyempurnaan tracking pengiriman
3. **Fase 3 (Secondary)**: Klaim garansi, audit log, BullMQ queue, cron job membership

---

## User Stories

### Membership Berbayar (Fase 1)

1. Sebagai pelanggan, saya ingin melihat status keanggotaan saya (aktif/tidak aktif) beserta tanggal kedaluwarsa, agar saya tahu apakah saya masih mendapat harga member.
2. Sebagai pelanggan, saya ingin melihat riwayat pembelian paket membership saya, agar saya bisa melacak kapan saya berlangganan dan berapa yang saya bayar.
3. Sebagai pelanggan, saya ingin membeli Paket Plus via Midtrans Snap tanpa perlu menunggu persetujuan admin, agar keanggotaan saya langsung aktif setelah pembayaran berhasil.
4. Sebagai pelanggan yang sudah menjadi member, saya ingin melihat harga member (harga lebih murah) di halaman produk, agar saya bisa memutuskan produk mana yang ingin dibeli.
5. Sebagai pelanggan yang sudah menjadi member, saya ingin harga di keranjang belanja otomatis menggunakan harga member, agar saya tidak perlu khawatir salah membayar.
6. Sebagai pelanggan yang sudah menjadi member, saya ingin jumlah yang saya bayarkan di Midtrans benar-benar menggunakan harga member (bukan harga normal), agar benefit membership benar-benar saya rasakan.
7. Sebagai pelanggan member, saya ingin melakukan dropship (kirim ke alamat lain atas nama saya sebagai pengirim), agar saya bisa berjualan tanpa nama toko terlihat.
8. Sebagai admin, saya ingin melihat daftar semua member aktif beserta tanggal kedaluwarsa mereka, agar saya bisa memantau pertumbuhan keanggotaan.
9. Sebagai admin, saya ingin melihat detail satu member termasuk riwayat pembelian paket-nya, agar saya bisa memberikan dukungan jika ada masalah.
10. Sebagai sistem, saya ingin webhook Midtrans untuk pembelian membership ditangani secara terpisah dari webhook order produk, agar status keanggotaan diperbarui secara otomatis dan akurat.

### Harga Member di Backend (Fase 1)

11. Sebagai pelanggan yang belum login, saya ingin melihat harga normal di halaman produk, agar saya tahu referensi harganya.
12. Sebagai pelanggan member yang sudah login, saya ingin API produk mengembalikan `member_price` selain harga normal, agar frontend dapat menampilkan keduanya dengan benar.
13. Sebagai sistem, saya ingin kalkulasi harga di `transaction-service` memeriksa status keanggotaan user yang sedang checkout sebelum menentukan harga satuan, agar integritas harga di transaksi terjamin dari sisi server.

### Pengiriman & Tracking (Fase 1)

14. Sebagai pelanggan, saya ingin status tracking pengiriman pesanan saya ditampilkan (kota, deskripsi, waktu), agar saya tahu posisi barang saya.
15. Sebagai admin, saya ingin mengisi nomor resi kurir saat mengubah status pesanan ke "Dikirim", agar pelanggan bisa melacak paket mereka.
16. Sebagai admin, saya ingin menambahkan checkpoint perjalanan paket secara manual, agar pelanggan mendapat informasi tracking yang akurat.
17. Sebagai sistem, saya ingin data shipment dibuat secara otomatis saat pesanan berhasil dibuat, agar admin tidak perlu membuat data shipment secara manual.

### Dashboard & Laporan Admin (Fase 2)

18. Sebagai admin, saya ingin melihat ringkasan bisnis di dashboard (total pesanan, total revenue, total customer, pending orders), agar saya dapat memantau kondisi toko secara sekilas.
19. Sebagai admin, saya ingin melihat laporan penjualan dengan filter rentang tanggal, agar saya bisa menganalisis performa penjualan per periode.
20. Sebagai admin, saya ingin melihat daftar produk terlaris berdasarkan jumlah terjual, agar saya bisa mengoptimalkan stok dan promosi.
21. Sebagai admin, saya ingin melihat daftar varian produk yang stoknya di bawah ambang batas, agar saya bisa segera melakukan restock.

### Pengaturan Admin (Fase 2)

22. Sebagai admin, saya ingin menyimpan informasi toko (nama, alamat, nomor telepon, email), agar data toko selalu up-to-date.
23. Sebagai admin, saya ingin mengkonfigurasi harga dan durasi Paket Membership Plus, agar saya bisa mengubah harga membership tanpa perlu deploy ulang.
24. Sebagai admin, saya ingin menyimpan konfigurasi pengiriman (berat minimum, biaya, provider default), agar sistem pengiriman bisa dikonfigurasi dari dashboard.

### Klaim Garansi (Fase 3)

25. Sebagai pelanggan, saya ingin mengajukan klaim garansi untuk produk yang sudah saya beli, agar saya mendapat bantuan jika produk bermasalah.
26. Sebagai pelanggan, saya ingin melampirkan foto bukti kerusakan saat mengajukan klaim garansi, agar proses klaim lebih mudah diverifikasi admin.
27. Sebagai pelanggan, saya ingin melihat status klaim garansi saya (menunggu/diproses/selesai/ditolak), agar saya tahu perkembangan proses klaim.
28. Sebagai admin, saya ingin melihat semua klaim garansi yang masuk beserta filternya (status, tanggal), agar saya bisa memprioritaskan penanganan.
29. Sebagai admin, saya ingin memperbarui status klaim dan menambahkan catatan resolusi, agar pelanggan mendapat respons yang jelas.

### Audit & Email Log (Fase 3)

30. Sebagai admin senior, saya ingin setiap tindakan kritis admin (ubah status order, moderasi review, update user) dicatat di audit log, agar ada jejak akuntabilitas yang bisa ditelusuri.
31. Sebagai admin, saya ingin melihat riwayat email yang terkirim dari sistem (receipt, reminder, reset password), agar saya bisa melakukan troubleshooting jika email tidak sampai.

### Background Jobs (Fase 3)

32. Sebagai sistem, saya ingin email receipt order dikirim via antrian (BullMQ) setelah webhook Midtrans selesai diproses, agar webhook tidak pernah timeout dan email tidak pernah duplikat karena retry.
33. Sebagai sistem, saya ingin setiap hari ada cron job yang mengecek membership yang sudah kedaluwarsa dan mengubah statusnya ke `NOT_MEMBER`, agar status keanggotaan selalu akurat.
34. Sebagai sistem, saya ingin email pengingat perpanjangan membership dikirim 7 hari dan 3 hari sebelum kedaluwarsa, agar member punya cukup waktu untuk memperbarui keanggotaan.

---

## Implementation Decisions

### Schema Database

**Tabel `membership_purchase` (baru)**
- Kolom: `id`, `purchase_number` (unique, generated), `user_id` (FK users), `payment_id` (FK payments), `price_snapshot`, `duration_months_snapshot`, `starts_at`, `ends_at`, `paid_at`, `reminder_h7_sent_at` (nullable), `reminder_h3_sent_at` (nullable), `created_at`
- `purchase_number` mengikuti format yang sama dengan `order_number` (prefix `MBR-` + timestamp + random)

**Migrasi tabel `users`**
- Ganti kolom `reseller_status` (ENUM `NOT_RESELLER`/`RESELLER`/`PENDING`) → `membership_status` (ENUM `NOT_MEMBER`/`MEMBER`)
- Ganti kolom `reseller_approved_at` → `membership_expires_at` (DATETIME nullable)
- Migrasi data: `NOT_RESELLER` → `NOT_MEMBER`, `RESELLER` → `MEMBER`

**Migrasi tabel `payments`**
- Buat `order_id` nullable (saat ini `NOT NULL`)
- Tambah `membership_purchase_id` (FK ke `membership_purchase`, nullable)
- Constraint: harus ada tepat satu dari `order_id` atau `membership_purchase_id`

**Migrasi tabel `orders`**
- Tambah `is_dropship` (BOOLEAN, default false)
- Tambah `sender_name` (VARCHAR nullable) — nama pengirim untuk dropship
- Tambah `sender_phone` (VARCHAR nullable) — telepon pengirim untuk dropship

**Tabel `settings` (baru)**
- Model key-value store: `key` (VARCHAR PK), `value` (TEXT), `updated_at`
- Seed awal: `membership_plus_price`, `membership_plus_duration_months`, `store_name`, `store_phone`, `store_email`, `store_address`

### API Contracts

**`GET /api/membership/me`**
- Auth: wajib login (customer)
- Response: `{ status, expires_at, days_remaining, purchase_history: [...] }`
- Sumber: query ke `users` + join ke `membership_purchase`

**`POST /api/checkout/membership`**
- Auth: wajib login (customer)
- Body: `{ package: "PLUS" }` (satu-satunya paket yang tersedia)
- Proses: baca harga dari `settings`, buat `membership_purchase` (status pending), buat `payments` (status pending), panggil Midtrans Snap, kembalikan `snap_token` dan `redirect_url`
- Harga dibaca dari DB `settings.membership_plus_price`, bukan hardcode

**`POST /api/payments/midtrans/webhook` (diperbarui)**
- Tambahkan logika: jika `order_id` di payload Midtrans mengandung prefix `MBR-`, proses sebagai pembelian membership
- Jika pembayaran membership sukses: update `membership_purchase.paid_at`, update `users.membership_status = MEMBER`, hitung dan simpan `users.membership_expires_at = paid_at + duration_months`

**`GET /api/product` dan `GET /api/product/[slug]` (diperbarui)**
- Jika ada session aktif dan user adalah MEMBER, sertakan `member_price` di setiap varian produk (ambil dari `product_variants.reseller_price_override`)
- Jika tidak ada session atau bukan member, `member_price` = null (tidak dikembalikan)

**`GET /api/cart` (diperbarui)**
- Jika user adalah MEMBER aktif, hitung subtotal menggunakan `reseller_price_override` (jika ada)
- Kembalikan field tambahan `is_member_price: boolean` per item cart

**`POST /api/checkout/midtrans` → `transaction-service` (diperbarui)**
- Sebelum menghitung total, cek `users.membership_status == MEMBER && membership_expires_at > now()`
- Jika ya, gunakan `reseller_price_override` (jika tidak null) sebagai harga satuan
- Setelah insert order berhasil, juga insert satu baris ke tabel `shipments` dengan `provider_id` dari body request, status `PENDING`

**`PATCH /api/admin/orders/[id]/status` (diperbarui)**
- Tambah field opsional `tracking_number` dan `provider_id` di request body
- Jika status baru adalah `SHIPPED` dan `tracking_number` diberikan: update `shipments.tracking_number`, `shipments.shipped_at`, `shipments.status = SHIPPED`

**`POST /api/admin/orders/[id]/tracking` (baru)**
- Auth: admin
- Body: `{ location, description, timestamp? }`
- Insert baris ke `shipment_tracking`

**`GET /api/admin/dashboard` (baru)**
- Agregasi dari DB: total orders (bulan ini & all time), total revenue, total customers, pending orders, recent orders (5 terakhir)

**`GET /api/admin/reports/sales` (baru)**
- Query params: `from`, `to` (ISO date)
- Agregasi order PAID per hari/minggu/bulan, total revenue, jumlah transaksi

**`GET /api/admin/reports/top-products` (baru)**
- Query params: `from`, `to`, `limit` (default 10)
- Agregasi dari `order_items` JOIN `products`, diurutkan by total terjual DESC

**`GET /api/admin/inventory/low-stock` (baru)**
- Query: `product_variants` di mana `stock <= low_stock_threshold` (threshold bisa dari settings)
- Response: daftar varian beserta nama produk dan stok saat ini

**`GET/PATCH /api/admin/settings` (baru)**
- GET: kembalikan semua settings sebagai flat object
- PATCH: body partial object, update hanya keys yang dikirim

**`GET /api/admin/resellers` (baru)**
- Daftar user dengan `membership_status = MEMBER`, paginated
- Include: nama, email, `membership_expires_at`, total `membership_purchase`

**`GET /api/admin/resellers/[id]` (baru)**
- Detail satu member: profile lengkap + semua `membership_purchase` miliknya

**`POST /api/complaints` (baru)**
- Auth: customer
- Body: `{ order_item_id, reason, description, attachments?: File[] }`
- Validasi: `order_item_id` harus milik user yang login dan statusnya DELIVERED

**`GET /api/complaints` (baru)**
- Auth: customer
- Kembalikan semua klaim milik user yang login

**`GET /api/admin/complaints` (baru)**
- Auth: admin, paginated, filterable by status

**`GET /api/admin/complaints/[id]` (baru)**
- Auth: admin, detail klaim + attachments

**`PATCH /api/admin/complaints/[id]` (baru)**
- Auth: admin
- Body: `{ status, resolution_note? }`

**`GET /api/admin/audit-log` (baru)**
- Auth: admin, paginated, filterable by action type dan admin user

**`GET /api/admin/email-log` (baru)**
- Auth: admin, paginated

### Konsistensi Autentikasi Admin

- Buat shared helper `requireAdmin(request)` di `src/lib/auth/require-admin.ts` yang diberi reuse di semua route admin
- Helper ini menggabungkan validasi session cookie dan mock token (untuk kompatibilitas backward)
- Semua route admin yang ada diganti dari implementasi inline masing-masing ke helper ini

### BullMQ Queue & Cron

- Inisialisasi queue `email-queue` menggunakan Redis (via `ioredis`) di `src/lib/queue/email-queue.ts`
- Inisialisasi queue `membership-cron` untuk scheduled job di `src/lib/queue/membership-cron.ts`
- Worker email: handle job types `order-receipt`, `membership-receipt`, `membership-reminder-h7`, `membership-reminder-h3`
- Cron job harian (setiap pukul 01:00): query users di mana `membership_expires_at < now()` dan `membership_status = MEMBER`, batch update ke `NOT_MEMBER`
- Cron job harian: query `membership_purchase` di mana `ends_at` dalam 7 atau 3 hari ke depan dan `reminder_h7_sent_at`/`reminder_h3_sent_at` masih null, enqueue email reminder
- Worker dijalankan sebagai proses terpisah (`src/workers/index.ts`), bukan di dalam Next.js handler

---

## Testing Decisions

**Apa yang membuat test baik di codebase ini:**
- Test harus menguji perilaku dari luar (response status, body JSON, state di DB), bukan implementasi internal
- Setiap test harus berjalan terhadap DB test yang di-seed secara deterministik (bukan mock DB)
- Test webhook harus menggunakan payload Midtrans nyata (hasil capture dari Midtrans sandbox)

**Modul yang perlu ditest:**

- `transaction-service` — test bahwa harga member digunakan saat user berstatus MEMBER, dan harga normal saat bukan member. Test bahwa baris `shipments` selalu dibuat.
- `membership checkout flow` — test end-to-end: POST checkout/membership → cek `membership_purchase` dibuat dengan status pending → simulasikan webhook Midtrans sukses → cek `users.membership_status = MEMBER` dan `membership_expires_at` dihitung benar.
- `webhook handler` — test idempotensi: kirim notifikasi yang sama dua kali, pastikan membership tidak diaktifkan dua kali.
- `admin reports` — test bahwa query agregasi menghasilkan angka yang benar dibanding seed data.
- `membership cron` — unit test fungsi expire: beri user dengan `membership_expires_at` di masa lalu, pastikan statusnya berubah ke `NOT_MEMBER`.

**Prior art untuk test:**
- Pattern test yang ada di `__tests__/` (jika sudah ada) atau gunakan Playwright untuk e2e flow checkout yang sudah ada sebagai referensi struktur.

---

## Out of Scope

- **Integrasi kurir real-time** (JNE, JNT, Sicepat): tracking diisi manual oleh admin, bukan otomatis dari API kurir.
- **Multi-currency atau multi-bahasa**: harga selalu IDR, UI dalam Bahasa Indonesia.
- **Refund / pembatalan membership**: tidak ada di PRD, user membeli sekali dan menikmati sampai kedaluwarsa.
- **Multiple paket membership** (Basic, Pro, dll): hanya satu paket aktif (Plus). Harga dan durasinya dikonfigurasi via admin settings.
- **Notifikasi push / SMS**: hanya email yang digunakan untuk komunikasi ke pelanggan.
- **Two-factor authentication (2FA)**: autentikasi saat ini cukup dengan password.
- **Migrasi data reseller lama**: asumsi tidak ada data reseller yang perlu dipertahankan (field lama di-drop, bukan di-convert).

---

## Further Notes

- **Urutan migrasi penting**: lakukan migrasi schema DB (Fase 1.1) sebelum mengerjakan endpoint apapun, karena semua endpoint Fase 1 bergantung pada schema baru.
- **Settings sebagai sumber kebenaran harga membership**: harga Paket Plus tidak boleh di-hardcode di manapun di kode. Selalu baca dari tabel `settings`.
- **Backward compatibility `reseller_status`**: setelah migrasi, kode lama yang masih mereferensikan `reseller_status` atau `reseller_approved_at` harus di-update serentak agar tidak ada TypeScript error. Cari dengan ripgrep sebelum mulai migrasi.
- **BullMQ membutuhkan Redis**: pastikan environment variable `REDIS_URL` tersedia di semua environment (dev, staging, production) sebelum mengaktifkan worker.
- **Deployment worker**: worker BullMQ perlu entry point terpisah (`npm run worker`) yang dijalankan bersamaan dengan `npm run dev` atau sebagai process terpisah di production (misalnya Railway worker service).
