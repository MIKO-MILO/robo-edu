# RoboEdu Design & System Specification

Dokumen ini menjelaskan tujuan, arsitektur visual, struktur data, dan panduan desain untuk pengembangan antarmuka (UI) serta logika pada platform **RoboEdu**.

---

## 1. Tujuan Codebase & Model Bisnis

RoboEdu adalah website e-commerce **single-store** yang menjual **kit robotika edukasi dan sparepart robot** untuk pasar Indonesia, ditujukan bagi pembeli:
- **Individual** (hobi, siswa, akademisi, pengembang pribadi)
- **Institusi** (sekolah, lembaga pendidikan, komunitas, organisasi)

### Karakteristik & Aturan Utama:
- **Made-By-Order Quota:** Sebagian besar produk bersifat *made-by-order* (dibuat berdasarkan pesanan). Oleh karena itu, konsep **stock** di platform ini berfungsi sebagai **kuota/kapasitas kapasitas produksi harian/mingguan**, bukan inventaris gudang fisik tradisional.
- **Mekanisme Reseller:** Status reseller disimpan sebagai properti akun customer (`reseller_status` = `"APPROVED"`), bukan role terpisah. Customer dengan status ini berhak mendapatkan akses `reseller_price` alih-alih `price` normal.
- **Toko Tunggal (Single-Store):** Seluruh produk dikelola langsung oleh RoboEdu sendiri. Tidak ada merchant atau multi-vendor pihak ketiga.

---

## 2. Struktur Data & Layout Native (Native Shape)

Desain halaman dan alur antarmuka harus dibentuk berdasarkan relasi data asli dalam sistem:

### A. Harga & Stok di Tingkat Variant
Tabel `product` **tidak memiliki kolom harga atau stok**. Semua harga (`price`, `reseller_price`) dan kuota kapasitas (`stock`) didefinisikan pada tingkat **Variant (`ProductVariant`)**.
- **Implikasi UI:** Halaman detail produk wajib menyediakan kontrol pemilihan variant sebelum memunculkan/memperbarui harga dan tombol pembelian. Desain tidak boleh berasumsi adanya harga default produk tanpa melacak variant yang terpilih.

### B. Siklus Pesanan & Pembayaran
Siklus data order dan payment mengikuti alur berikut:
- **Order Status:** `PENDING` → `PAID` → `PROCESSING` → `SHIPPED` → `DELIVERED` → `COMPLETED` (atau `CANCELLED` / `REFUNDED`).
- **Payment Status:** `PENDING` → `PAID` → `FAILED` / `EXPIRED` / `REFUNDED` (melalui verifikasi webhook Midtrans).
- **Implikasi UI:** Halaman tracking pesanan harus menampilkan visualisasi garis waktu (*timeline*) yang akurat sesuai dengan urutan status ini.

### C. Klaim Garansi & Keluhan (Complaints)
Pengajuan klaim garansi oleh customer memerlukan form pengisian subjek, kronologi masalah, serta lampiran media (foto/video).
- **Status Keluhan:** `OPEN` → `IN_REVIEW` → `RESOLVED` → `REJECTED`.

---

## 3. Identitas Visual & Token Desain (Branding System)

Gaya visual RoboEdu mengadopsi tema **Neo-brutalism** dengan kontras tinggi, garis border tebal, warna-warna pastel yang cerah, serta efek shadow keras tanpa efek blur.

Semua token visual dideklarasikan di [app/globals.css](file:///d:/goldipekael/robo-edu/app/globals.css):

### A. Palet Warna (Color System)
- **Background Utama:** `#F3EFE4` (menggunakan nuansa krem pastel hangat)
- **Foreground & Border:** `#3D2900` (warna coklat tua gelap untuk kontras tinggi)
- **Primary Brand (Action & Link):**
  - Base: `#2483D0` (Primary Blue)
  - Hover: `#1F6FB1`
  - Active: `#195C92`
  - Text di atas Primary: `#DEECF8`
- **Secondary:** `#3D2900` (Text/Heading utama)
- **Muted/Passive Background:** `#ECEAE6`
- **Muted Foreground (Teks Sekunder/Caption):** `#8F8267`

### B. Aksen Warna Pastel (Accent Colors)
Digunakan khusus untuk elemen kartu produk, tag kategori, badge, dan ornamen dekoratif:
- Yellow: `#FFF37E`
- Purple: `#A3B1FF`
- Soft Blue: `#C9E9F6`
- Blue: `#8ED8FF`
- Green: `#A9E8AE`
- Pink: `#FFC0DD`
- Orange: `#FFD9A0`
- Peach: `#FFAFA3`
- Butter: `#FAF1CA`

### C. Tipografi (Typography)
- **Font Heading (Judul):** `var(--font-heading)` (`Unbounded` - sans-serif)
- **Font Body (Paragraf/Tombol):** `var(--font-body)` (`Outfit` - sans-serif)

### D. Shadow & Border Custom
- **Standard Shadow (`neo-shadow`):** Hard shadow `4px 4px 0px 0px #3D2900`
- **Hover Shadow (`neo-shadow-hover`):** Efek translasi saat di-hover `translate(2px, 2px)` dan shadow mengecil menjadi `2px 2px 0px 0px #3D2900`
- **Icon Shadow (`neo-shadow-icon`):** Hard shadow kecil `2px 2px 0px 0px #3D2900`
- **Borders:** Semua border kontainer atau komponen menggunakan border-width `border-2` (atau minimal `border`) dengan warna `border-border` (`#3D2900`).

---

## 4. Pola Komponen & Konten Riil

Saat mendesain halaman, pengembang dilarang menggunakan data placeholder/asal-asalan. UI harus merefleksikan data riil dari sistem:

### A. Konten & Tagline Contoh (dari README & Kode)
- **Tagline Utama:** `"BUILD. LEARN. CREATE."`
- **Judul Hero:** `"Bring Your Ideas to Life!"`
- **Deskripsi Hero:** *"Temukan berbagai kit eksperimen dan mainan edukatif yang dirancang untuk memicu rasa ingin tahu serta kreativitas si kecil."*
- **Contoh Produk Riil:**
  - *Robo Kit Car* (Kategori: Kit Robotika)
  - *Robo Kit Wind Mill* (Kategori: Kit Robotika)
  - *Dinamo Motor* (Kategori: Sparepart)
- **Metode Pembayaran (Payment Icons):** BCA, BNI, BRI, Mandiri, Dana, Gopay, LinkAja, ShopeePay (SPay), Google Pay, QRIS.

### B. Pola Tombol (`Button`)
Gunakan komponen [`Button`](file:///d:/goldipekael/robo-edu/components/ui/button.tsx) dengan konfigurasi bawaan `neo={true}` untuk menghasilkan style neo-brutalist secara konsisten.
- Tombol Utama: `variant="primary"` atau `variant="secondary"`
- Tombol Aksen: `variant="accent-pink"`, `variant="accent-yellow"`, dll.
- Tombol Aksi Kecil/Card: `variant="card"`

### C. Pola Kartu Produk (`ProductCard`)
Implementasikan kartu produk seperti pada [`product-card.tsx`](file:///d:/goldipekael/robo-edu/components/user/products/product-card.tsx) yang memadukan latar warna pastel (`bg-accent-pink`, dsb.), gambar berbingkai coklat tua, informasi rating bintang, dan tombol aksi "Product Detail".

---

## 5. File & Lokasi Penting

- **Kebutuhan Sistem:** [docs/PRD.md](file:///d:/goldipekael/robo-edu/docs/PRD.md)
- **Spesifikasi API:** [docs/api.md](file:///d:/goldipekael/robo-edu/docs/api.md)
- **Standar REST API:** [docs/rest-api-standards-v2.md](file:///d:/goldipekael/robo-edu/docs/rest-api-standards-v2.md)
- **Konfigurasi Style Utama:** [app/globals.css](file:///d:/goldipekael/robo-edu/app/globals.css)
- **Tipe Data TS:**
  - [types/catalog.ts](file:///d:/goldipekael/robo-edu/types/catalog.ts) (Category, Product, Variant, Image)
  - [types/enums.ts](file:///d:/goldipekael/robo-edu/types/enums.ts) (Role, Reseller Status, Product Status, Order Status, Payment Status)
  - [types/common.ts](file:///d:/goldipekael/robo-edu/types/common.ts) (Primitive Types, API Responses)
