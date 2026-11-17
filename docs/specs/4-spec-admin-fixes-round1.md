# Spec: Admin Fixes Round 1 — Lima Perbaikan Halaman Admin

> Status: **ready-for-agent**

---

## Problem Statement

Lima area di panel admin dan sisi guest belum berfungsi sebagaimana mestinya:

1. **Masa berlaku pembayaran** — Label di halaman Kelola Pembayaran masih "Masa Berlaku Order", padahal setting ini seharusnya berlaku untuk semua transaksi termasuk pembelian membership. Membership checkout saat ini masih menggunakan nilai hardcode 24 jam, tidak membaca setting dari database.

2. **Status order kurang lengkap** — Alur status PENDING → PROCESSING → SHIPPED → DELIVERED sudah ada di backend, tetapi tidak ada cara bagi pembeli untuk mengkonfirmasi bahwa paket sudah diterima. Akibatnya fitur pengajuan refund, complaint, dan review tidak memiliki titik masuk yang jelas di sisi user karena tidak ada tombol "Konfirmasi Penerimaan" maupun halaman form pengajuan complaint/pengembalian.

3. **Dashboard admin tidak menampilkan data** — Halaman dashboard menampilkan total revenue, jumlah pesanan, produk terlaris, dan produk stok menipis. KPI cards (total revenue dan jumlah pesanan) tidak tampil karena terjadi ketidakcocokan nama field antara respons API (`total_revenue`, `total_orders_all_time`) dengan yang diharapkan UI (`revenue_this_month`, `total_orders`). Selain itu API sama sekali tidak mengembalikan `top_products` dan `low_stock_products` sehingga kedua panel selalu menampilkan empty state.

4. **Mode pemeliharaan tidak berpengaruh ke guest** — Toggle "Aktifkan Mode Pemeliharaan" di halaman Settings tersimpan hanya sebagai local state, tidak dikirim ke database, dan tidak ada middleware yang membaca setting ini untuk memblokir akses guest ke halaman user.

5. **Halaman review: fitur hidden berlebihan, navigasi detail tidak ada** — Panel admin menyediakan toggle hide/show review (PUBLISHED/HIDDEN) beserta filter status HIDDEN yang tidak diperlukan. Tidak ada halaman detail review sehingga admin tidak bisa melihat konteks lengkap (order, user). Tombol "Buka Modal" hanya menampilkan sebagian informasi dalam dialog inline; "Baca selebihnya" menduplikasi fungsi modal.

---

## Urutan Status Order

Urutan lengkap siklus status order, dari codebase:

```
PENDING → PAID → PROCESSING → SHIPPED → DELIVERED → COMPLETED
                                    ↘                      ↘
                                  CANCELLED             REFUNDED
```

| Status | Pemicu | Oleh |
|---|---|---|
| `PENDING` | Order dibuat, menunggu bayar | Sistem (checkout) |
| `PAID` | Konfirmasi pembayaran dari Midtrans | Webhook Midtrans |
| `PROCESSING` | Admin memproses/menyiapkan barang | Admin |
| `SHIPPED` | Barang dikirim, resi diinput | Admin |
| `DELIVERED` | Barang tiba di tujuan (admin konfirmasi) | Admin |
| `COMPLETED` | Pembeli konfirmasi terima, atau auto-confirm 3×24 jam setelah DELIVERED | User / Sistem (cron) |
| `CANCELLED` | Pembayaran expired, atau dibatalkan admin | Sistem / Admin |
| `REFUNDED` | Refund selesai diproses | Admin |

Kapan fitur post-delivery ter-unlock:

| Fitur | Unlock mulai | Tetap tersedia di |
|---|---|---|
| Komplain | `DELIVERED` | `DELIVERED`, `COMPLETED` |
| Pengembalian | `DELIVERED` | `DELIVERED`, `COMPLETED` |
| Review | `COMPLETED` | `COMPLETED` |

---

## Solution

1. Rename label UI dan ubah `membership-transaction-service` untuk membaca `order_expires_hours` dari database, sama seperti yang dilakukan `transaction-service`.

2. Tambahkan tombol "Konfirmasi Penerimaan Paket" di sisi user (halaman detail order dan halaman riwayat pesanan) yang memanggil endpoint baru `POST /api/orders/[id]/confirm-received`. Endpoint ini mengubah status order dari `DELIVERED` ke `COMPLETED`. Tombol "Ajukan Komplain" dan "Ajukan Pengembalian" tersedia mulai status `DELIVERED`; tombol "Tulis Ulasan" baru muncul setelah `COMPLETED`. Tambahkan cron sweep harian yang otomatis mengkonfirmasi order yang sudah 3×24 jam di status `DELIVERED` tanpa konfirmasi user. Halaman form komplain (`/profile/orders/[id]/complaint`) dan form pengembalian (`/profile/orders/[id]/refund`) dibuat dari awal.

3. Perbaiki API dashboard untuk mengembalikan field yang sesuai dengan kontrak tipe `AdminDashboardSummary`: `revenue_this_month`, `total_orders`, beserta data `top_products` dan `low_stock_products`.

4. Hubungkan toggle mode pemeliharaan ke backend: simpan sebagai setting `maintenance_mode` di database, tambahkan middleware Next.js yang memeriksa nilai setting ini dan me-redirect guest ke halaman `/maintenance`.

5. Di halaman review admin: hapus tombol hide/show, hapus filter status HIDDEN, hapus modal inline, ganti "Buka Modal" dengan tombol "Lihat Detail" yang me-redirect ke halaman `/admin/reviews/[id]`. Buat halaman dan API endpoint detail review yang menampilkan data review lengkap beserta info order dan user.

---

## User Stories

### Poin 1 — Masa Berlaku Pembayaran

1. Sebagai admin, saya ingin melihat label "Masa Berlaku Pembayaran" (bukan "Masa Berlaku Order") di halaman Kelola Pembayaran, agar tidak ada ambiguitas bahwa setting ini berlaku untuk semua transaksi.
2. Sebagai admin, saya ingin deskripsi setting menjelaskan bahwa batas waktu berlaku untuk semua transaksi (produk dan membership), agar saya tidak bingung mengapa membership tidak terpengaruh.
3. Sebagai pembeli yang membeli membership, saya ingin batas waktu pembayaran membership mengikuti nilai yang dikonfigurasi admin, bukan selalu 24 jam.

### Poin 2 — Konfirmasi Penerimaan, Auto-confirm, dan Form Post-Delivery

4. Sebagai pembeli, saya ingin melihat tombol "Konfirmasi Penerimaan Paket" pada pesanan berstatus DELIVERED di halaman detail order dan halaman riwayat pesanan, agar saya bisa menandai bahwa paket sudah saya terima.
5. Sebagai pembeli, setelah saya mengkonfirmasi penerimaan, saya ingin status pesanan berubah menjadi COMPLETED agar riwayat pesanan saya akurat.
6. Sebagai pembeli, saya ingin jika saya tidak mengkonfirmasi dalam 3×24 jam setelah status DELIVERED, sistem otomatis mengkonfirmasi pesanan saya, agar pesanan tidak tergantung selamanya di status DELIVERED.
7. Sebagai pembeli, saya ingin tombol "Tulis Ulasan" hanya muncul setelah pesanan berstatus COMPLETED, agar saya tidak bisa menulis ulasan untuk pesanan yang belum dikonfirmasi diterima.
8. Sebagai pembeli, saya ingin tombol "Ajukan Komplain" muncul di halaman detail order setelah pesanan berstatus DELIVERED (dan tetap tersedia di COMPLETED), yang mengarahkan saya ke halaman form pengajuan komplain.
9. Sebagai pembeli, saya ingin tombol "Ajukan Pengembalian" muncul di halaman detail order setelah pesanan berstatus DELIVERED (dan tetap tersedia di COMPLETED), yang mengarahkan saya ke halaman form pengajuan pengembalian (refund).
10. Sebagai pembeli, saya ingin mengisi form komplain dengan subjek, deskripsi, dan item produk yang bermasalah, lalu mengirimkannya ke backend yang sudah ada.
11. Sebagai pembeli, saya ingin mengisi form pengembalian dengan alasan dan item produk yang dikembalikan, lalu mengirimkannya ke backend yang sudah ada.
12. Sebagai admin, saya ingin melihat di detail order bahwa status COMPLETED tercatat dengan timestamp `completed_at`, agar riwayat perubahan status dapat dilacak.

### Poin 3 — Dashboard Data

13. Sebagai admin, saya ingin kartu "Total Revenue" menampilkan total pendapatan bulan ini dari order yang sudah dibayar, bukan nilai kosong.
14. Sebagai admin, saya ingin kartu "Jumlah Pesanan" menampilkan total akumulasi order yang masuk, bukan nilai kosong.
15. Sebagai admin, saya ingin panel "Produk Terlaris" menampilkan hingga 5 produk dengan volume penjualan tertinggi bulan ini, berdasarkan data order items nyata dari database.
16. Sebagai admin, saya ingin panel "Stok Menipis" menampilkan produk dan varian dengan stok di bawah batas tertentu, berdasarkan data inventory nyata.
17. Sebagai admin, saya ingin persentase tren revenue (perbandingan bulan ini vs bulan lalu) tampil di kartu revenue, agar saya bisa menilai pertumbuhan bisnis.

### Poin 4 — Mode Pemeliharaan

18. Sebagai admin, saya ingin toggle "Mode Pemeliharaan" tersimpan ke database saat saya klik "Simpan Perubahan", agar setting tidak hilang setelah halaman di-refresh.
19. Sebagai admin, saat saya membuka kembali halaman Settings, saya ingin toggle menampilkan kondisi tersimpan di database, bukan selalu OFF.
20. Sebagai admin, saya ingin saat mode pemeliharaan diaktifkan, semua halaman user (non-admin) menampilkan halaman pesan "Website dalam pemeliharaan" kepada pengunjung yang belum login sebagai admin.
21. Sebagai admin, saya ingin tetap bisa mengakses panel admin (`/admin/*`) meski mode pemeliharaan aktif, agar saya tidak terkunci dari sistem.
22. Sebagai pengunjung, saya ingin melihat pesan yang jelas bahwa website sedang dalam pemeliharaan dan tidak mencoba menggunakan halaman yang rusak.

### Poin 5 — Halaman Review Admin

23. Sebagai admin, saya ingin tabel review tidak memiliki tombol hide/show, agar moderasi cukup dengan menghapus review yang melanggar ketentuan.
24. Sebagai admin, saya ingin tabel review tidak menampilkan kolom status PUBLISHED/HIDDEN, agar tampilan tabel lebih bersih.
25. Sebagai admin, saya ingin filter "Status" (VISIBLE/HIDDEN) dihilangkan dari toolbar.
26. Sebagai admin, saya ingin tombol "Lihat Detail" di baris review mengarahkan saya ke halaman `/admin/reviews/[id]`, bukan membuka modal inline.
27. Sebagai admin, di halaman detail review saya ingin melihat: nama produk, nama user, email user, rating, isi komentar, tanggal review, dan nomor order terkait.
28. Sebagai admin, saya ingin di halaman detail review ada tombol "Hapus Review" agar saya tetap bisa menghapus review yang melanggar ketentuan.

---

## Implementation Decisions

### Poin 1 — Masa Berlaku Pembayaran

- Rename label di komponen `PaymentSection`: section heading dari "Masa Berlaku Order" menjadi "Masa Berlaku Pembayaran", deskripsi diperbarui agar menyebutkan bahwa setting berlaku untuk transaksi produk dan membership.
- Nama key database (`order_expires_hours`) dan nama field di `SETTING_SPECS` tidak diubah — hanya label UI yang berubah, untuk menghindari migrasi database.
- `membership-transaction-service` diubah untuk membaca `order_expires_hours` via `getSetting()` saat membuat transaksi membership, menggantikan konstanta `MEMBERSHIP_EXPIRY_HOURS = 24` yang hardcode.
- Fallback tetap 24 jam jika key tidak ada di database (sama dengan perilaku `transaction-service`).

### Poin 2 — Konfirmasi Penerimaan, Auto-confirm, Form Post-Delivery

**Endpoint konfirmasi:**
- Tambahkan `POST /api/orders/[id]/confirm-received` (user-facing, harus login, order harus milik user, status harus `DELIVERED`). Endpoint mengubah status ke `COMPLETED`, mengisi `completed_at = NOW()`. Idempoten: jika sudah `COMPLETED`, kembalikan 200 tanpa error.

**UI konfirmasi:**
- Di halaman detail order user (`/profile/orders/[id]`), tambahkan banner/tombol "Konfirmasi Penerimaan Paket" yang muncul hanya saat `status === "DELIVERED"`. Setelah sukses, optimistic update status ke `COMPLETED` dan tampilkan tombol post-delivery.
- Di `OrderCard` (halaman riwayat pesanan), tambahkan tombol yang sama untuk status `DELIVERED`.
- Tombol "Tulis Ulasan" diubah dari muncul saat `DELIVERED | COMPLETED` menjadi hanya `COMPLETED`.

**Auto-confirm cron:**
- Tambahkan fungsi `runOrderAutoConfirm(db)` di `src/lib/cron/` yang melakukan query: `UPDATE orders SET status='COMPLETED', completed_at=NOW() WHERE status='DELIVERED' AND delivered_at < NOW() - INTERVAL 3 DAY`.
- Daftarkan sebagai cron harian di `src/workers/index.ts` mengikuti pola `scheduleDailyUtc` yang sudah ada (misalnya jam 02:00 WIB = 19:00 UTC).

**Gating fitur per status:**
- Tombol "Ajukan Komplain" dan "Ajukan Pengembalian": muncul saat `status === "DELIVERED" || status === "COMPLETED"`.
- Tombol "Tulis Ulasan": muncul hanya saat `status === "COMPLETED"`.
- API `POST /api/complaints` sudah benar — menerima `DELIVERED` dan `COMPLETED` tetap valid karena `COMPLETED` adalah kelanjutan dari `DELIVERED`.
- API `POST /api/reviews`: perlu diperketat dari `DELIVERED | COMPLETED` menjadi `COMPLETED` saja.
- API refund user-facing (endpoint baru): menerima `DELIVERED | COMPLETED`.

**Form komplain (halaman baru):**
- Buat halaman `app/(user)/profile/orders/[id]/complaint/page.tsx`.
- Form berisi: pilih item produk (dari order items), input subjek (reason), textarea deskripsi. Submit ke `POST /api/complaints` yang sudah ada.
- Hanya dapat diakses jika status order `DELIVERED` atau `COMPLETED`. Jika bukan, redirect ke halaman detail order.
- Desain menggunakan komponen yang sudah ada (Button, Input, dsb) mengikuti desain sistem codebase — terapkan prinsip DRY, KISS, YAGNI; buat atomic component baru hanya jika memang tidak ada yang bisa dipakai ulang.

**Form pengembalian (halaman baru):**
- Buat halaman `app/(user)/profile/orders/[id]/refund/page.tsx`.
- Form berisi: pilih item produk, alasan pengembalian, deskripsi detail. Submit ke endpoint refund user-facing yang perlu dibuat di backend (menerima `DELIVERED | COMPLETED`).
- Hanya dapat diakses jika status order `DELIVERED` atau `COMPLETED`. Jika bukan, redirect ke halaman detail order.
- Desain mengikuti prinsip yang sama dengan form komplain.

**Tombol di halaman detail order:**
- Saat status `DELIVERED` atau `COMPLETED`: tampilkan tombol "Ajukan Komplain" (link ke `./complaint`) dan "Ajukan Pengembalian" (link ke `./refund`).
- Saat status `COMPLETED`: tambahkan tombol "Tulis Ulasan". Ketiga tombol muncul di area yang tepat pada layout halaman detail yang sudah ada, tidak memerlukan section baru yang besar.

### Poin 3 — Dashboard API

- Perbaiki `GET /api/admin/dashboard` untuk mengembalikan response yang cocok dengan interface `AdminDashboardSummary`:
  - `revenue_this_month` (bukan `total_revenue`) — SUM dari `orders.total` di mana `paid_at` berada dalam kalender bulan ini
  - `total_orders` (bukan `total_orders_all_time`) — COUNT semua order
  - `pending_orders` — tetap sama
  - `total_customers` — tetap sama
  - `revenue_trend_percentage` — selisih persentase revenue bulan ini vs bulan lalu (null jika bulan lalu = 0)
  - `top_products` — hingga 5 produk dengan `SUM(quantity)` terbesar dari `order_items` JOIN `orders` di mana `paid_at` bulan ini, disertai nama produk dan total_sold
  - `low_stock_products` — product variants dengan `stock <= threshold` (default threshold 5 jika tidak ada nilai lain), limit 10, disertai nama produk dan nama variant
- Field lama yang sudah ada (`total_orders_all_time`, `total_orders_this_month`, `recent_orders`) dapat dipertahankan atau dihapus; tidak dipakai UI.

### Poin 4 — Mode Pemeliharaan

- Tambahkan `maintenance_mode` ke `SETTING_SPECS` di `app/api/admin/settings/route.ts` dengan kind `"string"`, nilai valid `"true"` atau `"false"`. Tidak ada migrasi database — settingsnya flat key-value.
- Di `GeneralSection`, fetch setting saat mount via `GET /api/admin/settings` dan inisialisasi state toggle dari nilai `maintenance_mode`. Simpan ke database saat "Simpan Perubahan" ditekan via `PATCH /api/admin/settings`.
- Tambahkan `middleware.ts` di root Next.js. Karena middleware berjalan di Edge Runtime dan tidak bisa query Drizzle (Node.js only), middleware membaca status pemeliharaan via `fetch` ke endpoint internal `GET /api/maintenance-status` dengan `cache: 'no-store'`.
- Tambahkan endpoint `GET /api/maintenance-status` — dapat diakses tanpa auth, mengembalikan `{ active: boolean }`. Dibuat sesederhana mungkin (KISS).
- Middleware menginspeksi path: jika `maintenance_mode` aktif dan path bukan `/admin/*`, `/api/*`, atau `/maintenance`, redirect ke `/maintenance`. Admin session (cookie/token yang menandakan role admin) dikecualikan dari redirect.
- Buat halaman `app/maintenance/page.tsx` tanpa layout user/admin. Desain menggunakan komponen UI yang ada di codebase (Button, font-heading, neo-shadow, dll) — tampilan konsisten dengan sistem desain proyek. Konten: logo/nama toko, pesan pemeliharaan, estimasi atau pesan bahwa akan segera kembali. Tidak perlu membuat atomic component baru; manfaatkan token desain (className utility) yang sudah ada.

### Poin 5 — Halaman Detail Review

- Hapus `onToggleStatus` dan handler `handleToggleStatus` dari `app/(admin)/admin/reviews/page.tsx`.
- Hapus kolom `status` dan kolom aksi hide/show dari `ReviewTable`.
- Hapus filter status dari toolbar (opsi VISIBLE/HIDDEN).
- Hapus `Dialog` modal inline dari `ReviewTable`.
- Hapus tombol "Baca selebihnya" / "Buka Modal" dari cell komentar; truncate tetap ada tapi tanpa expand toggle.
- Ganti tombol aksi dengan satu tombol "Lihat Detail" yang melakukan `router.push("/admin/reviews/" + row.id)`.
- Buat `GET /api/admin/reviews/[id]` — mengambil data review + join ke `order_items`, `orders`, `products`, `users` untuk mendapatkan: semua field review, nama produk, nama user, email user, nomor order terkait.
- Buat halaman `app/(admin)/admin/reviews/[id]/page.tsx` — menampilkan card dengan data di atas + tombol "Hapus Review" (memanggil `DELETE /api/admin/reviews/[id]` yang sudah ada) + tombol kembali ke daftar review.
- API `PATCH /api/admin/reviews/[id]/status` dibiarkan ada di backend tapi tidak lagi dipanggil dari UI.

---

## Testing Decisions

Proyek ini belum memiliki test suite yang sudah dijalankan secara rutin; implementasi mengikuti pola pengujian manual via browser yang sudah digunakan di tickets sebelumnya. Kriteria passing manual:

- **Poin 1**: Ubah setting masa berlaku pembayaran di admin → buat transaksi membership → cek `membership_transactions.expires_at` di DB berubah sesuai setting (bukan selalu +24 jam).
- **Poin 2a (konfirmasi)**: Buat order → admin set status ke DELIVERED → buka halaman detail order sebagai user → tombol "Konfirmasi Penerimaan" dan tombol "Ajukan Komplain"/"Ajukan Pengembalian" muncul → klik konfirmasi → status berubah COMPLETED → tombol "Tulis Ulasan" muncul.
- **Poin 2b (auto-confirm)**: Set `delivered_at` order ke 4 hari lalu di DB → jalankan fungsi cron secara manual → status berubah ke COMPLETED.
- **Poin 2c (form)**: Dari order berstatus DELIVERED, klik "Ajukan Komplain" → redirect ke halaman form → isi dan submit → data masuk ke tabel `complaints` di DB. Sama untuk pengembalian. Dari order berstatus COMPLETED, tombol yang sama tetap tersedia dan berfungsi.
- **Poin 3**: Buka `/admin/dashboard` di browser — semua 4 stat cards menampilkan angka (bukan `—` atau 0 jika memang ada data), panel Produk Terlaris dan Stok Menipis menampilkan data nyata.
- **Poin 4**: Admin aktifkan mode pemeliharaan → simpan → buka browser incognito (guest) → akses `/` → redirect ke `/maintenance`. Admin tetap bisa akses `/admin`. Nonaktifkan → guest kembali bisa akses `/`.
- **Poin 5**: Buka `/admin/reviews` → tidak ada kolom Status, tidak ada tombol hide → klik "Lihat Detail" → redirect ke `/admin/reviews/[id]` dengan data review lengkap.

---

## Out of Scope

- Notifikasi email ke pembeli saat mode pemeliharaan diaktifkan.
- Fitur "jadwalkan pemeliharaan" (waktu mulai/selesai otomatis).
- Audit trail untuk penghapusan review.
- Pagination atau filter di halaman detail review.
- Upload foto/lampiran di form komplain dan pengembalian (backend sudah mendukung attachment, tapi UI form tidak menyertakan file upload pada spec ini).
- Perubahan schema database (tidak ada migrasi baru yang diperlukan).

---

## Further Notes

- Perubahan nama field API dashboard (poin 3) bersifat **breaking terhadap UI saat ini** — UI mengharapkan `revenue_this_month` tapi API mengembalikan `total_revenue`. Perbaikan harus dilakukan bersamaan di API dan UI dalam satu implementasi.
- Middleware maintenance (poin 4) perlu hati-hati dengan caching: `fetch` ke `/api/maintenance-status` di dalam middleware harus menggunakan `cache: 'no-store'` agar perubahan setting langsung terlihat tanpa perlu restart server.
- Untuk poin 5, `PATCH /api/admin/reviews/[id]/status` yang sudah ada tidak perlu dihapus dari codebase — cukup tidak dipanggil dari UI. Ini mempertahankan fleksibilitas jika di masa depan ada kebutuhan moderasi programatik.
- API `POST /api/complaints` sudah menerima `DELIVERED` — tidak perlu diubah. API `POST /api/reviews` perlu diperketat dari `DELIVERED | COMPLETED` menjadi `COMPLETED` saja. API refund user-facing (endpoint baru) perlu menerima `DELIVERED | COMPLETED`.
- Auto-confirm cron (poin 2) mengikuti pola `runOrderAutoCancel` yang sudah ada: query langsung ke DB, idempoten, log ke konsol.
- Halaman form komplain dan pengembalian dibuat di bawah route `/profile/orders/[id]/` agar konsisten dengan struktur halaman profil yang sudah ada. Terapkan DRY — reuse komponen UI yang ada; KISS — form sesederhana mungkin sesuai field yang diterima backend; YAGNI — tidak perlu fitur draft, preview, atau multi-step.
