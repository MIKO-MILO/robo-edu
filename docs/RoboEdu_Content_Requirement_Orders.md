# Content Requirement — Halaman Orders

**Scope:** `/orders` (list) dan `/orders/{id}` (detail)
**Sumber data:** `order`, `order_item`, `payment`, `shipment`, `shipment_tracking` (lihat `0000_roboedu_initial_schema.sql` dan `api.md` §10–12)
**Status:** Draft untuk briefing tim FE — menunggu keputusan diskrepansi shipment (lihat `api.md` §18.1)

---

## 1. `/orders` — Halaman Riwayat Pesanan

**Tujuan halaman:** Customer bisa melihat semua transaksi yang pernah dibuat, dan cepat tahu mana yang butuh tindakan (misal belum bayar).

### 1.1 Navigasi Status (Tabs/Filter)

| Tab UI | Filter `order.status` |
| --- | --- |
| Semua | — (tanpa filter) |
| Diproses | `PENDING`, `PAID`, `PROCESSING` |
| Dikirim | `SHIPPED` |
| Selesai | `DELIVERED`, `COMPLETED` |
| Dibatalkan | `CANCELLED`, `REFUNDED` |

> **Catatan penting:** Tab "Diproses" adalah gabungan tiga status asli (`PENDING`/`PAID`/`PROCESSING`). Badge status di tiap card **tetap harus granular** (menampilkan status asli, bukan nama tab), supaya customer yang order-nya belum dibayar tidak keliru dikira sudah dibayar dan sedang disiapkan.

### 1.2 Konten per Card Order

| Field | Sumber Data | Catatan |
| --- | --- | --- |
| Nomor order | `order.order_number` | Ditampilkan ke customer, bukan `order.id` (UUID) |
| Tanggal pemesanan | `order.created_at` | Format tanggal lokal (bukan ISO mentah) |
| Status | `order.status` | Badge warna: kuning = `PENDING`, biru = `PAID`/`PROCESSING`, ungu = `SHIPPED`, hijau = `DELIVERED`/`COMPLETED`, merah = `CANCELLED`/`REFUNDED` |
| Preview produk | `order_item.product_name_snapshot` (item pertama) | Jika item > 1, tampilkan "+N produk lainnya" |
| Total pembayaran | `order.total` | |
| Tombol aksi | Berdasarkan `order.status` (lihat 1.3) | Aksi mengikuti status asli, bukan nama tab |

### 1.3 Tombol Aksi per Status Asli

| Status Asli | Aksi Tersedia |
| --- | --- |
| `PENDING` | "Bayar Sekarang", "Batalkan", "Lihat Detail" |
| `PAID` / `PROCESSING` | "Lihat Detail" saja |
| `SHIPPED` | "Lihat Detail" (+ info tracking ringkas jika ada) |
| `DELIVERED` / `COMPLETED` | "Beri Ulasan" (opsional "Beli Lagi"), "Lihat Detail" |
| `CANCELLED` / `REFUNDED` | "Lihat Detail" saja |

### 1.4 Elemen Tambahan

- **Empty state** — saat belum pernah order, atau saat filter tab tertentu kosong (misal tab "Dibatalkan" tidak ada isinya).
- **Pagination** — histori order tidak boleh di-load semua sekaligus dalam satu request.

### 1.5 Di Luar Scope Halaman Ini

Detail item lengkap, info pengiriman, dan info pembayaran detail **tidak** ditampilkan di list — semua itu didorong ke halaman detail (`/orders/{id}`). List hanya menampilkan ringkasan.

---

## 2. `/orders/{id}` — Halaman Detail Pesanan

**Tujuan halaman:** Customer bisa melihat seluruh informasi satu transaksi spesifik, dan melakukan aksi lanjutan (klaim garansi, review, dsb) bila memenuhi syarat.

### 2.1 Header / Status

| Field | Sumber Data | Catatan |
| --- | --- | --- |
| Nomor order | `order.order_number` | |
| Tanggal | `order.created_at` | |
| Status stepper/timeline | `order.status` | Visualisasi progres: Pending → Dibayar → Diproses → Dikirim → Diterima → Selesai. Status asli, bukan nama tab. |

### 2.2 Daftar Produk yang Dibeli

| Field | Sumber Data | Catatan |
| --- | --- | --- |
| Nama produk & variant | `order_item.product_name_snapshot`, `order_item.variant_name_snapshot` | **Wajib snapshot** — bukan join ke tabel `product`/`product_variant` saat ini |
| Harga saat dibeli | `order_item.price_snapshot` | Tidak berubah walau harga produk di katalog berubah setelahnya |
| Jumlah | `order_item.quantity` | |
| Subtotal per item | `order_item.subtotal` | |

> **Prinsip snapshot (PRD §13.3):** Semua data produk/harga di halaman ini harus berasal dari field snapshot yang disimpan saat transaksi dibuat — tidak boleh query real-time ke tabel katalog produk.

### 2.3 Ringkasan Pembayaran

| Field | Sumber Data | Catatan |
| --- | --- | --- |
| Subtotal | `order.subtotal` | |
| Diskon | `order.discount_amount` | Sertakan kode voucher jika dipakai (`order.voucher_code_snapshot`) |
| Ongkos kirim | `order.shipping_cost` | |
| Total akhir | `order.total` | |
| Metode pembayaran | `payment.payment_type` | |
| Status pembayaran | `payment.status` | `PENDING`/`PAID`/`FAILED`/`EXPIRED`/`REFUNDED` |

### 2.4 Info Pengiriman

| Field | Sumber Data | Catatan |
| --- | --- | --- |
| Kurir & layanan | `shipment.shipping_provider_id` → nama provider, `shipment.service` | Misal "J&T — Regular" |
| Nomor resi | `shipment.tracking_number` | Tampilkan hanya jika sudah ada |
| Riwayat perjalanan paket | `shipment_tracking[]` | Opsional, tergantung seberapa detail yang ingin ditampilkan ke customer |
| Alamat pengiriman | `order.shipping_address`, `shipping_province`, dst. | Snapshot alamat saat order dibuat |

> **Catatan diskrepansi:** Struktur ini mengikuti kodebase (`shipment`/`shipment_tracking` sebagai tabel terpisah). Jika keputusan akhir mengikuti PRD Bab 25 (kolom shipping langsung di `order`), field di atas perlu direvisi. Lihat `api.md` §18.1.

### 2.5 Alamat Penerima

| Field | Sumber Data | Catatan |
| --- | --- | --- |
| Nama penerima | `order.recipient_name` | Snapshot — bukan referensi live ke `user_address` |
| Nomor telepon | `order.recipient_phone` | |
| Alamat lengkap | `order.shipping_address`, `shipping_province`, `shipping_city`, `shipping_district`, `shipping_village`, `shipping_postal_code` | Tetap tampil meski alamat asli di profil sudah diubah/dihapus |

### 2.6 Aksi Berdasarkan Status Asli Order

| Status Asli | Aksi Tersedia |
| --- | --- |
| `PENDING` | Bayar ulang, Batalkan |
| `PAID` / `PROCESSING` / `SHIPPED` | Tidak ada aksi lanjutan — hanya info tracking |
| `DELIVERED` / `COMPLETED` | Ajukan klaim garansi per item, Beri ulasan per item |
| Semua status | "Hubungi Kami" / bantuan (opsional) |

---

## 3. Prinsip Umum yang Wajib Dipatuhi Tim FE

1. **Snapshot principle** — Semua data produk, harga, dan alamat pada halaman order tidak boleh diambil dari data live (`product`, `product_variant`, `user_address`). Wajib menggunakan field snapshot pada `order` dan `order_item`.
2. **Status asli vs nama tab** — Tab navigasi di `/orders` adalah pengelompokan UI saja. Badge status dan logika tombol aksi di card/detail harus tetap mengacu ke `order.status` yang sebenarnya, bukan nama tab tempat order tersebut muncul.
3. **Mock-first strategy** — Struktur mock data untuk `getOrders()` dan `getOrderById(id)` harus mengikuti shape response API di `api.md` §10, termasuk field snapshot, agar transisi ke API asli nanti tidak memerlukan perubahan struktur di komponen.
