# RoboEdu
 
**PRODUCT REQUIREMENT DOCUMENT**
*Dokumen Kebutuhan Produk — Website E-Commerce*
 
| Informasi | Keterangan |
| --- | --- |
| Nama Produk | RoboEdu |
| Jenis Platform | Website E-Commerce |
| Model Bisnis | Toko tunggal (single-store) |
| Target Pasar | Individual dan institusi |
| Wilayah | Indonesia; ekspansi internasional di masa depan |
| Frontend | Next.js + Tailwind CSS |
| Backend | Next.js + Drizzle ORM |
| Database | MySQL |
| Infrastruktur | Docker + Docker Compose, VPS, nginx (reverse proxy), Let's Encrypt (SSL) |
| Object Storage | MinIO (self-hosted) |
| Queue & Cache | Redis + BullMQ |
| Pembayaran | Midtrans |
| Email Service | Resend / SendGrid |
| Ekspedisi Awal | J&T (dengan abstraksi shipping provider) |
| Monitoring | Sentry (error tracking), UptimeRobot (uptime) |
| Status Dokumen | Dokumen kebutuhan produk / acuan pengembangan |
| Tanggal | Oktober 2026 (revisi membership) |
 
*Dokumen ini menjadi acuan utama dalam proses perancangan, pengembangan, pengujian, dan pengembangan lanjutan RoboEdu.*
 
---
 
## 1. Informasi Dokumen
 
| Bagian | Keterangan |
| --- | --- |
| Nama Produk | RoboEdu |
| Jenis Produk | Platform e-commerce |
| Bidang Bisnis | Penjualan kit robotika edukasi dan sparepart robot |
| Pengguna Utama | Customer, Member, Admin |
| Pasar Utama | Indonesia |
| Pasar Masa Depan | Internasional |
| Frontend | Next.js + Tailwind CSS |
| Backend | Next.js + Drizzle ORM |
| Database | MySQL |
| Infrastruktur | Docker, Docker Compose, VPS, nginx, Let's Encrypt |
| Object Storage | MinIO |
| Queue / Background Job | Redis + BullMQ |
| Payment Gateway | Midtrans |
| Email Service | Resend / SendGrid |
| Ekspedisi | J&T pada tahap awal, dengan desain provider abstraction agar dapat dikembangkan |
 
## 2. Gambaran Produk
 
RoboEdu adalah website e-commerce yang digunakan untuk menjual produk edukasi robotika, seperti robot kit dan sparepart robot. Platform ini ditujukan untuk pembeli individual maupun institusi seperti sekolah, lembaga pendidikan, komunitas, dan organisasi.
 
RoboEdu merupakan toko tunggal, sehingga seluruh produk yang tersedia berasal dari RoboEdu. Wilayah penjualan awal adalah Indonesia, dengan kemungkinan ekspansi ke pasar internasional pada tahap pengembangan berikutnya. Sebagian besar produk bersifat made-by-order (dibuat sesuai pesanan), sehingga konsep stok pada sistem ini berfungsi sebagai kuota/kapasitas produksi, bukan stok gudang tradisional.
 
### 2.1 Contoh Produk
 
- Robo Kit Car
- Robo Kit Wind Mill
- Dinamo Motor
### 2.2 Konsep Kategori Produk
 
Kategori digunakan untuk pengelompokan utama produk, sedangkan Product Type digunakan sebagai pengelompokan tambahan yang bersifat general dan fleksibel — dapat digunakan untuk tema (Kendaraan, Hewan, Energi), tingkatan (Basic/Pro), atau pengelompokan lain sesuai kebutuhan admin. Tidak ada pemisahan tabel Product Type dan Product Theme; keduanya cukup direpresentasikan dalam satu tabel `product_type`.
 
*Catatan desain produk: Kendaraan, Hewan, dan sejenisnya tidak langsung dianggap sebagai variant. Variant hanya digunakan jika satu produk memang memiliki beberapa pilihan berbeda, misalnya variasi warna (Merah/Biru) atau Basic/Pro.*
 
## 3. Tujuan Bisnis
 
- Menyediakan kanal penjualan online resmi untuk RoboEdu.
- Mempermudah pelanggan menemukan dan membeli produk robotika.
- Menyediakan sistem membership berbayar bulanan (paket Plus) yang memberi harga khusus member dan akses dropship, aktif langsung setelah pembayaran tanpa proses review admin.
- Menyediakan pengelolaan produk, stok, pesanan, customer, member, promosi, review, klaim garansi, dan laporan dalam satu sistem.
- Menyediakan pembayaran online melalui Midtrans dengan notifikasi receipt otomatis via email.
- Mempersiapkan sistem agar dapat menggunakan lebih dari satu penyedia ekspedisi di masa depan.
- Mempersiapkan fondasi untuk ekspansi penjualan ke luar Indonesia.
- Membangun infrastruktur yang portabel dan mudah di-deploy menggunakan containerization (Docker).
## 4. Pengguna Sistem
 
| Pengguna | Deskripsi | Kebutuhan Utama |
| --- | --- | --- |
| Customer Individual | Individu yang membeli produk untuk belajar, proyek, hobi, atau kebutuhan pribadi. | Mencari produk, membeli, membayar, melacak pesanan, memberikan review, dan mengajukan klaim garansi bila diperlukan. |
| Customer Institusi | Sekolah, lembaga pendidikan, komunitas, atau organisasi. | Menemukan produk, melakukan pembelian, dan melihat histori pesanan. Menggunakan data alamat standar (`user_address`) untuk kebutuhan pengiriman/invoice manual. |
| Member | Customer yang telah membeli paket membership Plus dan masa berlakunya belum berakhir. | Mendapatkan harga khusus member, dapat melakukan pembelian melalui sistem yang sama, dan dapat menggunakan pengiriman dropship. |
| Admin | Pengelola operasional RoboEdu. | Mengelola katalog, stok, pesanan, pengguna, member, promosi, review, klaim garansi, laporan, dan pengaturan. |
 
## 5. Role dan Hak Akses
 
Sistem menggunakan dua konsep yang berbeda: role (menentukan hak akses ke sistem) dan `membership_status` (menentukan status membership dalam hal harga dan benefit). Member bukan role terpisah — ia tetap berada pada role customer, dengan atribut `membership_status` dan `membership_expires_at` yang menentukan apakah harga khusus member dan akses dropship berlaku untuknya. Paket **Standar** adalah user biasa (`NOT_MEMBER`) dan paket **Plus** adalah membership berbayar (`MEMBER`).
 
| Fitur | Customer | Member | Admin |
| --- | --- | --- | --- |
| Melihat produk | ✓ | ✓ | ✓ |
| Search, filter, sorting | ✓ | ✓ | ✓ |
| Wishlist | ✓ | ✓ | — |
| Cart dan checkout | ✓ | ✓ | — |
| Harga normal | ✓ | — | ✓ |
| Harga member | — | ✓ selama membership aktif | Kelola |
| Beli / perpanjang membership Plus | ✓ | ✓ | — |
| Dropship | — | ✓ selama membership aktif | — |
| Riwayat pesanan | ✓ | ✓ | Kelola semua |
| Review | ✓ jika memenuhi syarat | ✓ jika memenuhi syarat | Moderasi |
| Klaim garansi | ✓ | ✓ | Tindak lanjut manual |
| Kelola produk | — | — | ✓ |
| Kelola stok | — | — | ✓ |
| Lihat daftar & riwayat membership | — | — | ✓ (read-only) |
| Voucher | — | — | ✓ |
| Laporan / settings | — | — | ✓ |
 
*Role internal admin dibagi menjadi tiga: superadmin, admin sales, dan admin laporan, disimpan pada kolom `role` di tabel `user` bersama nilai customer.*
 
## 6. Sistem Membership

Fitur yang sebelumnya disebut sistem reseller kini menjadi **sistem membership**. Customer tidak lagi mengajukan permohonan dan menunggu persetujuan admin. Customer cukup membayar paket membership bulanan (seperti layanan langganan Spotify atau YouTube) dan langsung menjadi member. Data pemohon diambil dari profil akun, sehingga tidak ada formulir pengajuan. Status membership disimpan sebagai atribut `membership_status` pada akun customer yang bersangkutan, bukan sebagai role akses terpisah.

### 6.1 Paket Membership

Hanya tersedia satu paket berbayar.

| Paket | Biaya | Keterangan |
| --- | --- | --- |
| Standar | Gratis | User biasa (`NOT_MEMBER`). Menggunakan harga normal dan tidak memiliki akses dropship. |
| Plus | Berbayar per bulan | Membership (`MEMBER`). Mendapatkan harga member dan akses dropship selama masa berlaku. Harga dan durasi periode paket dikonfigurasi admin pada Settings. |

### 6.2 Alur Membership

`Customer → Membuka /reseller → Beli Paket Plus → Konfirmasi ringkasan → Midtrans → Pembayaran dikonfirmasi webhook → membership_status = MEMBER → Benefit aktif sampai membership_expires_at`

Alur perpanjangan: `Member → Beli Paket Plus lagi (manual) → Webhook tervalidasi → Masa berlaku bertambah satu periode`

### 6.3 Status Membership

| Status | Keterangan |
| --- | --- |
| NOT_MEMBER | User menggunakan paket Standar: belum pernah membeli atau masa membership sudah berakhir. |
| MEMBER | User telah membayar paket Plus dan `membership_expires_at` belum terlewati. User mendapatkan harga member dan akses dropship. |

*Tidak ada status PENDING atau REJECTED pada user karena tidak ada proses pengajuan dan review. Status pembayaran yang belum selesai dicatat pada `membership_purchase` dan `payment` (lih. Bab 6.9 dan 25.1), bukan pada `user`.*

### 6.4 Benefit Member

| Benefit | Keterangan |
| --- | --- |
| Harga member | Potongan harga melalui harga member pada produk dan variant (lih. Bab 6.5). |
| Dropship | Member dapat memesan dengan pengiriman langsung ke alamat pembeli akhir (lih. Bab 6.10). |

### 6.5 Aturan Harga Member

- Customer biasa (`NOT_MEMBER`) menggunakan harga normal.
- Member yang masa berlakunya belum berakhir menggunakan harga member.
- Admin dapat menentukan harga member untuk produk (termasuk override per variant bila diperlukan).
- Harga member berlaku di katalog, detail produk, cart, dan checkout sejak pembayaran membership dikonfirmasi.
- Server memeriksa `membership_status` dan `membership_expires_at` setiap kali menghitung harga, sehingga harga member tidak berlaku lagi tepat setelah masa berlaku berakhir.
- Harga yang benar-benar digunakan dalam transaksi harus disimpan pada order item sebagai snapshot (`price_snapshot`).
- Perubahan harga produk atau status membership setelah transaksi tidak boleh mengubah histori transaksi lama.

### 6.6 Halaman / Route Membership

Route `/reseller`, `/profile/reseller`, dan `/admin/resellers` tetap dipertahankan sebagai route membership. Route `/reseller/apply` dihapus.

| Route | Akses | Fungsi |
| --- | --- | --- |
| `/reseller` | Publik | Halaman informasi membership: perbandingan paket Standar dan Plus, manfaat (harga member dan dropship), harga paket, FAQ singkat, dan tombol beli "Beli Membership Plus" (menjadi "Perpanjang Membership" bagi member aktif). Tidak ada CTA pengajuan. |
| `/profile/reseller` | Customer login | Halaman membership: benefit, status, durasi, dan riwayat pembelian membership. |
| `/admin/resellers` | Admin | Daftar member dan pembelian membership. |
| `/admin/resellers/[id]` | Admin | Detail member beserta riwayat pembelian (read-only, tanpa aksi setuju/tolak). |

Aturan akses route:

- Pengguna yang belum login dan menekan tombol beli diarahkan ke `/login?redirect=/reseller`, lalu dikembalikan ke halaman membership setelah login berhasil.
- Item menu "Program Membership" ditambahkan pada navigasi profil (`/profile/my-profile`, `/profile/orders`, `/profile/settings`) dan link "Membership" ditambahkan pada footer.

### 6.7 Alur UX Pembelian Membership

Alur utama (happy path):

`Customer melihat CTA (navbar/footer/profil/halaman produk) → /reseller (baca manfaat & harga paket) → klik "Beli Membership Plus" → login bila diperlukan → layar konfirmasi (ringkasan paket, harga, durasi, serta nama/email/telepon dari profil, read-only) → bayar via Midtrans → halaman hasil pembayaran → /profile/reseller (status MEMBER dan durasi) → email receipt membership → harga member langsung aktif.`

Rincian layar:

- **Konfirmasi pembelian**: menampilkan paket Plus, harga, durasi periode, tanggal berlaku yang akan didapat, dan data akun dari profil (tanpa input tambahan).
- **Setelah pembayaran**: halaman hasil menampilkan status pembayaran. Status MEMBER hanya aktif setelah webhook Midtrans tervalidasi, bukan dari redirect browser.
- **Banner/badge global**: untuk MEMBER, badge "Harga Member" tampil pada kartu produk serta ringkasan cart dan checkout.

Edge case:

- Klik ganda saat membeli: dicegah melalui header `Idempotency-Key`.
- Satu user hanya boleh memiliki satu pembelian membership berstatus PENDING pada satu waktu; bila sudah ada, UI mengarahkan customer untuk melanjutkan pembayaran yang ada.
- Pembayaran gagal atau kedaluwarsa (FAILED/EXPIRED): status membership tidak berubah dan customer dapat mencoba membeli lagi.
- Webhook terlambat diterima: status MEMBER aktif saat webhook tervalidasi, dan halaman `/profile/reseller` menampilkan kondisi terbaru.
- Akun dengan `is_active = false`: pembelian ditolak dengan `403 FORBIDDEN`.

### 6.8 Tampilan `/profile/reseller`

Halaman hanya menampilkan benefit, status, dan riwayat; tidak ada form maupun data yang dikirim customer.

| Status | Tampilan di `/profile/reseller` | CTA | Efek ke harga |
| --- | --- | --- | --- |
| NOT_MEMBER | Ajakan bergabung dan ringkasan manfaat. | "Beli Membership Plus" menuju `/reseller` | Harga normal |
| MEMBER | Badge hijau "Member Aktif", paket Plus, tanggal mulai dan tanggal berakhir (`membership_expires_at`) beserta sisa hari, ringkasan benefit, dan tabel purchase history. | "Perpanjang Membership" dan "Lihat Produk" | Harga member tampil di katalog, detail produk, cart, dan checkout |

**Tabel purchase history** (ditampilkan untuk status MEMBER; berisi riwayat pembelian membership, diurutkan dari yang terbaru dengan pagination standar):

| Kolom | Sumber Data | Catatan |
| --- | --- | --- |
| Tanggal pembelian | `membership_purchase.created_at` | |
| Nomor pembelian | `membership_purchase.purchase_number` | |
| Paket | `membership_purchase.plan_name_snapshot` | Snapshot nama paket saat pembelian. |
| Periode berlaku | `starts_at` – `ends_at` | Kosong bila pembayaran belum dikonfirmasi. |
| Nominal | `membership_purchase.price_snapshot` | Snapshot harga saat pembelian, bukan harga paket terkini. |
| Metode pembayaran | `payment.payment_method` | |
| Status | `membership_purchase.status` | Badge: PENDING, PAID, FAILED, EXPIRED, REFUNDED. |

### 6.9 Pembelian, Masa Berlaku, dan Perpanjangan

- Satu pembelian memberi satu periode membership (1 bulan). Harga dan durasi periode diambil dari konfigurasi Settings dan disimpan sebagai snapshot pada `membership_purchase`.
- Setiap pembelian dicatat pada tabel `membership_purchase` dan dibayar melalui Midtrans. Pembayarannya dicatat pada tabel `payment` yang merujuk ke `membership_purchase_id` (bukan `order_id`), sehingga pembelian membership tidak tercampur dengan pesanan barang dan laporan penjualan produk (lih. Bab 11.3).
- Setelah pembayaran dikonfirmasi (PAID): `user.membership_status` menjadi `MEMBER` dan `user.membership_expires_at` diperbarui ke `ends_at`.
- **Perpanjangan bersifat manual**: member membeli paket Plus lagi. Bila dibeli saat membership masih aktif, periode baru dimulai dari `membership_expires_at` yang lama sehingga sisa masa berlaku tidak hangus. Bila membership sudah berakhir, periode baru dimulai saat pembayaran dikonfirmasi.
- **Kedaluwarsa**: job terjadwal BullMQ (harian) mengubah user `MEMBER` dengan `membership_expires_at` terlewati menjadi `NOT_MEMBER`. Perhitungan harga di server tetap memeriksa `membership_expires_at` secara langsung, sehingga keterlambatan job tidak memberi harga member secara gratis.
- **Dampak saat membership berakhir**: status kembali `NOT_MEMBER`, harga kembali normal (item di cart dihitung ulang), dan opsi dropship tidak tersedia. Order yang sudah dibuat tidak berubah (sesuai aturan snapshot pada 6.5).
- **Pengingat expired**: email dikirim pada H-7 dan H-3 sebelum `membership_expires_at` (lih. Bab 6.12).
- Voucher tidak berlaku untuk pembelian membership.
- Bila pembelian berstatus REFUNDED, masa berlaku dari pembelian tersebut dicabut dan `membership_expires_at` dihitung ulang.

### 6.10 Dropship

Dropship adalah benefit khusus member. Member menjual ulang produk RoboEdu kepada pembeli akhir, dan RoboEdu mengirim pesanan langsung ke pembeli akhir tersebut.

- **Hak akses**: hanya user `MEMBER` dengan masa berlaku aktif.
- **Checkout**: member mengaktifkan opsi "Kirim sebagai Dropship". Alamat tujuan adalah alamat pembeli akhir, yang dipilih atau dibuat pada buku alamat member (`user_address`, mis. label "Dropship – Nama Pembeli").
- **Pembayaran dan harga**: member yang membayar, menggunakan harga member. Ongkir dihitung ke alamat pembeli akhir.
- **Pengirim**: pada resi dan label paket, pengirim adalah nama dan nomor telepon member, bukan RoboEdu. Data ini disimpan sebagai snapshot pada order (`sender_name`, `sender_phone`).
- **Invoice**: invoice digital dan receipt hanya diberikan kepada member. Pembeli akhir tidak menerima dokumen apa pun dari RoboEdu (tidak ada invoice, surat jalan, atau email); informasi yang diterima pembeli akhir cukup resi paket yang berasal dari member.
- **Notifikasi order**: seluruh email dan notifikasi order dikirim ke member saja.
- **Admin**: halaman pesanan admin menandai order dropship dan menampilkan data pengirim, sehingga resi dan label paket dibuat atas nama member dan tidak ada dokumen berharga di dalam paket.
- **Membership berakhir**: opsi dropship tidak tersedia untuk order baru, sedangkan order dropship yang sudah dibuat tetap diproses.
- **Data**: `order.is_dropship`, `order.sender_name`, dan `order.sender_phone` (lih. Bab 25.4).

### 6.11 Alur Admin

Tidak ada proses review atau persetujuan. Admin hanya memantau.

`/admin/resellers (daftar member dan pembelian; filter status MEMBER/NOT_MEMBER, pencarian, dan masa berlaku segera berakhir) → /admin/resellers/[id] (data user, status dan masa berlaku membership, riwayat pembelian membership, dan riwayat order) → hanya lihat (read-only)`

- Halaman detail tidak memiliki aksi setuju/tolak.
- Tidak ada antrean review dan tidak ada badge jumlah PENDING pada sidebar atau dashboard.
- Harga dan durasi paket Plus dikelola pada Settings (Bab 8).

### 6.12 Notifikasi Terkait Membership

| Event | Penerima | Kanal |
| --- | --- | --- |
| Pembelian membership berhasil (PAID) | Customer | Email receipt membership (berisi paket, periode berlaku, dan penjelasan benefit) |
| H-7 sebelum `membership_expires_at` | Member | Email pengingat disertai tautan perpanjang (`/reseller`) |
| H-3 sebelum `membership_expires_at` | Member | Email pengingat disertai tautan perpanjang (`/reseller`) |

Pengiriman email melalui BullMQ dan dicatat pada `email_log` (tipe `MEMBERSHIP_RECEIPT` dan `MEMBERSHIP_REMINDER`). Pengingat tidak dikirim bila member telah memperpanjang sehingga sisa masa berlaku lebih dari 7 hari (H-7) atau 3 hari (H-3), dan setiap pengingat hanya dikirim sekali per periode (`reminder_h7_sent_at` dan `reminder_h3_sent_at` pada `membership_purchase`). Tidak ada notifikasi untuk admin karena tidak ada proses persetujuan.

## 7. Fitur Customer
 
| Fitur | Kebutuhan |
| --- | --- |
| Register / Login | Customer dapat membuat akun, masuk, keluar, dan menggunakan sesi yang aman. |
| Homepage | Menampilkan hero section, kategori, produk unggulan, produk terlaris, video demo produk, testimoni orang tua/pendidik, FAQ, carousel logo institusi/mitra, dan informasi RoboEdu. |
| Katalog Produk | Menampilkan produk aktif berdasarkan kategori dan Product Type. |
| Search | Mencari produk berdasarkan nama, keyword, SKU, dan data katalog terkait. |
| Filter & Sorting | Filter berdasarkan kategori, harga, stok, product type, variant, rating; sorting berdasarkan terbaru, harga, popularitas, dan rating. |
| Detail Produk | Galeri foto produk multi-angle, component breakdown, highlight keunggulan & keamanan, harga (termasuk harga member bila relevan), deskripsi, stok, variant, rating, review, tombol Quick Buy, dan rekomendasi produk terkait. |
| Cart | Menambah produk (dengan variant bila ada), mengubah jumlah, menghapus item, menghitung subtotal, dan melihat produk rekomendasi cross-selling. Struktur cart terdiri dari satu cart per user dengan banyak cart_item. |
| Wishlist | Menyimpan produk untuk dibeli kemudian tanpa pengaturan jumlah/quantity, diakses melalui halaman terpisah maupun slide-over drawer dan floating action button. |
| Alamat | Menambah, mengubah, menghapus, dan menentukan alamat utama. Digunakan juga oleh customer institusi. |
| Checkout | Memilih alamat, ekspedisi, voucher, melihat ringkasan, dan melakukan pembayaran. |
| Pembayaran | Melakukan pembayaran menggunakan Midtrans. |
| Order Tracking | Melihat status pesanan, invoice digital, dan pelacakan kurir bertahap jika tersedia. |
| Review | Customer yang telah membeli produk (tervalidasi melalui order item) dapat memberikan rating dan ulasan, termasuk langsung dari kartu pesanan yang berstatus `COMPLETED`. |
| Klaim Garansi | Customer dapat mengajukan komplain terhadap produk yang telah dibeli, disertai kronologi dan lampiran foto/video. |
| Membership | Customer membeli paket membership Plus (bayar via Midtrans) dan langsung menjadi member tanpa formulir. Member mendapatkan harga member dan akses dropship, serta dapat melihat status, durasi, dan riwayat pembelian membership di `/profile/reseller`. |
| Notifikasi Email | Customer menerima email receipt otomatis setelah pembayaran berhasil dikonfirmasi. |
| Tentang Kami | Halaman profil brand, misi edukasi robotika, dan sertifikasi keamanan anak. |
| Kontak | Formulir masukan/pesan dan tautan media sosial resmi. |

### 7.1 Rincian Fitur Customer (Pembaruan Implementasi)

Poin-poin berikut merupakan penjabaran fitur customer yang telah diimplementasikan pada codebase dan melengkapi tabel di atas.

**1. Detail Produk (`/product/[slug]`)**

- **Galeri Foto Produk**: Tampilan foto utama interaktif dengan thumbnail strip multi-angle (tampilan dekat, tampak atas, perakitan). Galeri detail produk murni menggunakan foto produk; thumbnail Video Demo tidak digunakan pada galeri ini.
- **Component Breakdown ("Component Pada Produk")**: Menampilkan visual modul/komponen robot pembentuk kit (misal: mikrokontroler utama, sensor ultrasonik, modul modular) beserta fungsi ringkasnya.
- **Highlight Keunggulan & Keamanan**: Label edukatif ramah anak (BPA-free, Kid-Safe, rekomendasi pendidik).
- **Tombol "Beli Sekarang" (Quick Buy)**: Memungkinkan customer melakukan transaksi instan di samping tombol standar "Tambah Ke Keranjang".
- **Section Rekomendasi ("You Might Also Like")**: Carousel produk terkait di bagian bawah detail produk.

**2. Wishlist Interaktif**

Selain halaman terpisah, wishlist dilengkapi **Slide-over Drawer (Sidebar)** dan **Floating Action Button (FAB)** dengan indikator jumlah item realtime, sehingga pengguna dapat melihat atau menghapus item wishlist tanpa meninggalkan halaman belanja aktif.

**3. Halaman Riwayat Pesanan (`/profile/orders`)**

- **Modal Invoice Digital**: Customer dapat membuka dan mencetak/mengunduh faktur transaksi resmi.
- **Modal Pelacakan Kurir Interaktif**: Visualisasi timeline multi-step pelacakan paket dan riwayat perjalanan barang dari ekspedisi.
- **Modal Review Langsung**: Modal pop-up untuk memberikan rating bintang dan ulasan langsung dari kartu order pada status `COMPLETED`.
- **Filter Periode**: Pilihan rentang waktu histori pesanan (misal: 30 Hari Terakhir, 3 Bulan Terakhir, Tahun Berjalan).
- **Tab Status Ramah Pengguna**: Pengelompokan tab navigasi ("Semua", "Diproses", "Dikirim", "Selesai", "Dibatalkan") yang memetakan status teknis pesanan.

**4. Halaman Baru: Tentang Kami (`/about`)**

Menampilkan profil RoboEdu, misi edukasi robotika, sertifikasi aman anak (*Kid-Safe*), serta nilai-nilai inovasi STEM.

**5. Halaman Kontak Interaktif (`/contact`)**

Formulir pengiriman pesan/masukan langsung (`name`, `email`, `phone`, `subject`, `message`) serta kartu tautan media sosial interaktif (WhatsApp Support, Email, Instagram, YouTube).

**6. Homepage / Landing Page Interaktif**

Terdiri atas komponen: Video Demo produk bergerak, FAQ Accordion interaktif, Testimoni Orang Tua & Pendidik, serta Carousel Logo Institusi/Mitra. Video Demo hanya tampil sebagai showcase di homepage/landing page, bukan pada galeri detail produk.

**7. Keranjang Belanja (`/cart`)**

Menambahkan section cross-selling "Produk Rekomendasi" di bagian bawah tabel keranjang belanja.

## 8. Fitur Admin
 
| Modul | Kebutuhan |
| --- | --- |
| Dashboard | Revenue, jumlah pesanan, pesanan pending, produk terlaris, customer, dan stok menipis. |
| Produk | CRUD produk, harga normal, harga member, status, gambar, slug, dan informasi produk. |
| Kategori | CRUD kategori dan pengaturan status. |
| Product Type | Mengelola pengelompokan produk secara general dan fleksibel (tema, jenis, dsb). |
| Variant | Mengelola variant produk (mis. warna), termasuk harga dan stok per variant. |
| Inventory | Mengelola stok/kuota produksi, penambahan/pengurangan stok, dan monitoring stok rendah. |
| Pesanan | Melihat dan memproses pesanan, mengubah status fulfillment, dan mengelola informasi pengiriman. |
| Customer | Melihat, mencari, dan mengelola data customer serta histori pesanan. |
| Membership | Melihat daftar member, detail member, riwayat pembelian membership, dan masa berlaku (read-only, tanpa persetujuan/penolakan). |
| Voucher | Membuat dan mengelola voucher, jenis diskon, masa berlaku, dan batas penggunaan. |
| Review | Melihat, memoderasi, menyembunyikan, atau menghapus review yang tidak sesuai. |
| Klaim Garansi | Melihat pengajuan klaim, mengubah status, mencatat hasil tindak lanjut manual (WA/email). |
| Laporan | Laporan revenue, pesanan, produk terlaris, kategori, dan metrik penjualan. |
| Settings | Informasi toko, konfigurasi pembayaran, pengiriman, dan pengaturan umum, termasuk harga dan durasi paket membership Plus. |
 
## 9. Manajemen Produk
 
### 9.1 Data Produk
 
- Nama produk
- SKU / kode produk
- Kategori
- Product Type (opsional, general/fleksibel)
- Deskripsi
- Harga normal
- Harga member
- Jenis produk (ready stock / pre-order)
- Stok (berfungsi sebagai kuota produksi untuk produk made-by-order)
- Slug
- Status produk
- Gambar produk
- Variant (opsional, mis. warna — dengan harga dan stok sendiri)
- Spesifikasi teknis (menggunakan field standar/deskripsi pada produk, tanpa tabel spesifikasi terpisah karena spesifikasi tiap produk dapat berbeda-beda)
### 9.2 Status Produk
 
| Status | Keterangan |
| --- | --- |
| DRAFT | Produk sedang disiapkan dan belum dapat dibeli. |
| ACTIVE | Produk tampil di katalog dan dapat dibeli jika stok/kuota tersedia. |
| INACTIVE | Produk dinonaktifkan dan tidak ditampilkan sebagai produk aktif. |
| OUT_OF_STOCK | Stok/kuota produk habis. |
 
## 10. Cart dan Checkout
 
- Customer memilih produk (beserta variant bila ada) dan menambahkannya ke cart.
- Struktur data cart terdiri dari satu cart per user, dengan cart_item untuk tiap produk/variant yang ditambahkan.
- Customer memeriksa isi cart dan jumlah produk.
- Customer melanjutkan ke checkout.
- Customer memilih atau membuat alamat pengiriman.
- Khusus member, customer dapat mengaktifkan opsi dropship (kirim langsung ke alamat pembeli akhir); lihat Bab 6.10.
- Sistem menentukan harga berdasarkan status membership customer (harga member hanya untuk `MEMBER` yang masa berlakunya belum berakhir).
- Customer memilih metode/layanan pengiriman yang tersedia dari shipping provider yang aktif.
- Customer dapat memasukkan voucher jika tersedia.
- Sistem menghitung subtotal, ongkir, diskon, dan total pembayaran.
- Customer mengonfirmasi pesanan.
- Sistem membuat order dan transaksi pembayaran.
- Customer menyelesaikan pembayaran melalui Midtrans.
## 11. Pembayaran
 
Payment Gateway yang digunakan: Midtrans.
 
### 11.1 Alur Pembayaran
 
`Checkout → Membuat Order → Membuat Transaksi Midtrans → Customer Membayar → Notifikasi/Webhook Midtrans → Validasi Backend → Update Status Pembayaran dan Order → Job pengiriman email receipt dimasukkan ke antrian (BullMQ) → Email receipt terkirim ke customer.`
 
### 11.2 Status Pembayaran
 
| Status | Keterangan |
| --- | --- |
| PENDING | Pembayaran belum berhasil dikonfirmasi. |
| PAID | Pembayaran telah dikonfirmasi. |
| FAILED | Pembayaran gagal. |
| EXPIRED | Batas waktu pembayaran telah berakhir. |
| REFUNDED | Pembayaran telah dikembalikan. |
 
*Aturan penting: status pembayaran final tidak boleh hanya bergantung pada redirect browser customer. Konfirmasi pembayaran harus berasal dari mekanisme notifikasi/webhook Midtrans yang divalidasi oleh backend.*
 
### 11.3 Pembayaran Membership

Pembelian membership menggunakan Midtrans dengan mekanisme webhook yang sama seperti pembayaran order, tetapi tidak membuat `order`.

`Beli Paket Plus → Membuat membership_purchase (PENDING) → Membuat transaksi Midtrans (Idempotency-Key wajib) → Customer Membayar → Notifikasi/Webhook Midtrans → Validasi Backend → payment dan membership_purchase menjadi PAID → user.membership_status = MEMBER dan membership_expires_at diperbarui → Job email receipt membership dimasukkan ke antrian (BullMQ)`

- Tabel `payment` merujuk ke `membership_purchase_id` (dan `order_id` dikosongkan). Tepat satu dari keduanya harus terisi.
- Webhook membedakan jenis transaksi dari referensi yang terisi pada `payment`, lalu memperbarui order atau membership sesuai jenisnya.
- `purchase_number` pada `membership_purchase` digunakan sebagai referensi transaksi ke Midtrans.
- Aturan pada Bab 11.2 berlaku sama: status final tidak boleh hanya bergantung pada redirect browser, dan status MEMBER hanya aktif setelah webhook tervalidasi.
- Voucher tidak berlaku untuk pembelian membership.


## 12. Pengiriman
 
J&T menjadi ekspedisi pada tahap awal. Sistem menggunakan tabel `shipping_provider` terpisah, sehingga penyedia ekspedisi dapat ditambah atau diganti tanpa mengubah struktur inti pesanan. Data pengiriman per order dikelola pada tabel `shipment` beserta riwayat perjalanannya pada `shipment_tracking` (lih. Bab 25.4).
 
| Data | Keterangan |
| --- | --- |
| Shipping Provider | Referensi ke tabel `shipping_provider`, mis. J&T. |
| Shipping Service | Jenis layanan pengiriman yang dipilih, disimpan pada `shipment.service`. |
| Shipping Cost | Biaya pengiriman, disimpan pada `order.shipping_cost`. |
| Tracking Number | Nomor resi, disimpan pada `shipment.tracking_number`. |
| Status Pengiriman | Status pergerakan paket (`PENDING, PACKED, PICKED_UP, IN_TRANSIT, DELIVERED, FAILED`) pada `shipment.status`. |
| Shipment Tracking | Riwayat titik perjalanan paket (status, deskripsi, lokasi, waktu) pada `shipment_tracking`, ditampilkan sebagai modal pelacakan kurir interaktif di `/profile/orders`. |
| Shipped At / Delivered At | Waktu pesanan dikirim/diterima, dicatat baik pada `order` (milestone pesanan) maupun `shipment` (milestone pengiriman). |
| Pengirim (Dropship) | Untuk order dropship, nama dan telepon pengirim pada resi/label adalah milik member (`order.sender_name`, `order.sender_phone`), bukan RoboEdu (lih. Bab 6.10). |
 
## 13. Manajemen Pesanan
 
### 13.1 Siklus Pesanan
 
`PENDING → PAID → PROCESSING → SHIPPED → DELIVERED → COMPLETED`
 
Alur alternatif: `PENDING → CANCELLED` dan `PAID → REFUNDED`. Pembayaran gagal/expired ditangani pada status pembayaran.
 
### 13.2 Definisi Status
 
| Status | Definisi |
| --- | --- |
| PENDING | Order dibuat tetapi pembayaran belum dikonfirmasi. |
| PAID | Pembayaran telah berhasil dikonfirmasi. |
| PROCESSING | Admin sedang menyiapkan pesanan. |
| SHIPPED | Pesanan sudah dikirim dan nomor resi tersedia bila diberikan ekspedisi. |
| DELIVERED | Pesanan telah ditandai diterima. |
| COMPLETED | Siklus pesanan selesai. |
| CANCELLED | Pesanan dibatalkan sesuai aturan bisnis. |
| REFUNDED | Pesanan yang telah dibayar mendapatkan pengembalian dana. |
 
### 13.3 Snapshot Harga & Alamat Transaksi
 
Setiap order item harus menyimpan harga transaksi pada saat pembelian (`price_snapshot`), termasuk nama produk dan nama variant. Hal ini berlaku untuk harga normal maupun harga member, dan menjadi dasar validasi kelayakan review serta klaim garansi.

Selain itu, setiap order juga menyimpan snapshot alamat pengiriman lengkap (`recipient_name`, `recipient_phone`, `shipping_address`, `shipping_province`, `shipping_city`, `shipping_district`, `shipping_village`, `shipping_postal_code`) serta `voucher_code_snapshot` langsung pada tabel `order`, agar histori transaksi tidak berubah meskipun customer kemudian mengubah data alamat atau voucher yang bersangkutan sudah tidak berlaku (lih. Bab 25.4). Semua field pada halaman `/orders` dan `/orders/{id}` wajib bersumber dari field snapshot ini, bukan dari query langsung ke tabel produk/alamat.

Untuk order dropship, order juga menyimpan snapshot `is_dropship`, `sender_name`, dan `sender_phone`. Invoice digital hanya diperuntukkan bagi member (pemilik order) dan tidak dikirim ke pembeli akhir (lih. Bab 6.10).
 
## 14. Inventory / Stok
 
Sebagian besar produk RoboEdu bersifat made-by-order (dibuat sesuai pesanan), sehingga MVP menggunakan sistem stok sederhana yang berfungsi sebagai kuota/kapasitas produksi, bukan sebagai stok gudang fisik dalam arti tradisional.
 
- Setiap produk/variant yang dapat dijual memiliki jumlah stok (kuota), dikelola terpusat pada tingkat variant (lih. Bab 25.2).
- Admin dapat menambah atau mengurangi stok.
- Admin dapat melihat produk dengan stok rendah atau habis.
- Sistem harus mencegah quantity pembelian melebihi stok/kuota tersedia.
- Stok dikurangi setelah pembayaran berhasil dikonfirmasi.
*Riwayat pergerakan stok yang lebih detail (stock movement log) belum menjadi bagian MVP; direncanakan pada tahap pengembangan lanjutan. Lihat Bab 26.*
 
## 15. Voucher dan Promosi
 
Admin dapat membuat voucher dengan aturan yang dapat dikonfigurasi. Setiap pemakaian voucher dicatat sebagai histori (`voucher_usage`) untuk keperluan validasi batas penggunaan dan pelaporan.
 
| Data Voucher | Keterangan |
| --- | --- |
| Kode voucher | Unik, digunakan customer saat checkout. |
| Jenis diskon | PERCENTAGE atau FIXED_AMOUNT. |
| Nilai diskon | Nominal atau persentase sesuai jenis diskon. |
| Minimum pembelian | Syarat minimum subtotal agar voucher dapat digunakan. |
| Maksimum potongan | Batas maksimum nominal diskon (relevan untuk jenis PERCENTAGE). |
| Batas penggunaan | Jumlah maksimum voucher dapat digunakan secara keseluruhan. |
| Tanggal mulai dan berakhir | Masa berlaku voucher. |
| Status aktif/nonaktif | Menentukan apakah voucher dapat digunakan. |
 
*Setiap penggunaan voucher dicatat dengan detail user, order, dan nominal diskon yang didapat pada saat itu — sehingga sistem dapat menghitung jumlah pemakaian dan mencegah voucher digunakan melebihi batas.*
 
## 16. Review Produk
 
- Customer hanya dapat memberikan review terhadap produk yang benar-benar dibeli, divalidasi melalui relasi ke order item yang bersangkutan.
- Review diberikan setelah order memenuhi kondisi yang ditentukan, direkomendasikan setelah status COMPLETED.
- Review dapat terdiri dari rating dan komentar.
- Admin dapat melakukan moderasi (menampilkan atau menyembunyikan review).
- Rating produk dapat digunakan dalam filter dan sorting.
## 17. Klaim Garansi
 
RoboEdu menyediakan mekanisme klaim garansi semi-manual. Customer mengajukan komplain melalui website, kemudian admin melakukan tindak lanjut secara manual di luar sistem.
 
### 17.1 Alur Klaim Garansi
 
`Customer memilih order item yang bermasalah → Customer menuliskan kronologi kejadian dan melampirkan foto/video → Sistem menyimpan pengajuan dengan status OPEN → Admin meninjau pengajuan → Admin menghubungi customer secara manual melalui WhatsApp atau email aktif yang telah diisi customer saat pembelian → Admin memperbarui status pengajuan (IN_REVIEW, RESOLVED, atau REJECTED) beserta catatan tindak lanjut (`resolution`).`
 
### 17.2 Data yang Dibutuhkan
 
- Order item yang diklaim (untuk validasi kelayakan klaim).
- Subjek dan kronologi/deskripsi kejadian dari customer.
- Lampiran foto dan/atau video (dapat lebih dari satu berkas per pengajuan).
- Status pengajuan, catatan tindak lanjut (`resolution`), dan waktu penyelesaian (`resolved_at`).
## 18. Notifikasi Email
 
Sistem mengirimkan email receipt secara otomatis kepada customer setelah pembayaran berhasil dikonfirmasi, menggunakan mekanisme antrian (queue) agar proses pengiriman tidak menghambat respons terhadap webhook Midtrans.
 
- Email dikirim melalui layanan pihak ketiga (Resend atau SendGrid).
- Pengiriman dijalankan sebagai background job melalui Redis + BullMQ, dengan mekanisme retry otomatis apabila pengiriman gagal.
- Status setiap pengiriman email (`PENDING/SENT/FAILED`) dicatat oleh sistem pada `email_log`, beserta `subject` email yang dikirim, untuk keperluan audit dan troubleshooting.
- Selain email receipt order, sistem mengirim email terkait membership (receipt pembelian membership serta pengingat H-7 dan H-3 sebelum masa berlaku berakhir) dengan mekanisme yang sama; lihat Bab 6.12.
## 19. Infrastruktur dan Teknologi Pendukung
 
### 19.1 Containerization
 
Seluruh service (aplikasi, database, storage, proxy) dijalankan sebagai container menggunakan Docker dan diorkestrasi dengan Docker Compose pada satu VPS. Setiap service production menggunakan restart policy `unless-stopped`, sehingga container otomatis pulih dari crash namun tidak menyala sendiri jika dimatikan secara sengaja.
 
### 19.2 Reverse Proxy dan SSL
 
nginx berfungsi sebagai reverse proxy yang menerima seluruh request dari internet dan meneruskannya ke aplikasi Next.js. Sertifikat SSL/HTTPS menggunakan Let's Encrypt, yang menjadi syarat wajib agar webhook Midtrans dapat diterima dengan aman.
 
### 19.3 Object Storage
 
MinIO digunakan sebagai object storage self-hosted untuk menyimpan berkas seperti gambar produk dan lampiran klaim garansi.
 
### 19.4 Queue dan Background Job
 
Redis dan BullMQ digunakan untuk memproses tugas yang berjalan di latar belakang, seperti pengiriman email receipt dan pengingat membership, serta job terjadwal harian yang mengembalikan membership kedaluwarsa menjadi NOT_MEMBER, sehingga proses utama (mis. webhook pembayaran) dapat merespons dengan cepat tanpa menunggu tugas tersebut selesai.
 
### 19.5 Monitoring dan Logging
 
- Error tracking menggunakan Sentry agar tim dapat mengetahui error di production secara langsung.
- Uptime monitoring menggunakan UptimeRobot.
- Logging aplikasi menggunakan Pino dengan format terstruktur (JSON), mencakup level DEBUG, INFO, WARN, dan ERROR. Data sensitif (password, token) tidak boleh dicatat ke dalam log.
### 19.6 Backup
 
- Database MySQL di-backup secara terjadwal menggunakan `mysqldump` melalui cron job.
- Berkas pada MinIO direplikasi ke lokasi backup terpisah menggunakan MinIO Client (`mc mirror`).
### 19.7 Manajemen Secrets
 
- Seluruh kredensial (database, Midtrans, email service) disimpan sebagai environment variable, tidak pernah dicatat langsung dalam kode maupun masuk ke dalam version control (Git).
- Development menggunakan file `.env` lokal yang diisi dari template `.env.example`.
- Production menyimpan file `.env` langsung di VPS dengan pembatasan akses (permission ketat).
### 19.8 Migration Database
 
Perubahan struktur database dikelola melalui migration Drizzle ORM. Migration digenerate dari perubahan schema, direview, dicatat dalam version control, dan dijalankan secara manual pada saat proses deploy — bukan berjalan otomatis di background — untuk menjaga kontrol atas perubahan struktur data di production.
 
## 20. Alur Pengguna
 
### 20.1 Alur Pembelian Customer
 
`Browse Produk → Detail Produk → Add to Cart → Checkout → Alamat → Pengiriman → Voucher (opsional) → Review Order → Midtrans → Pembayaran Berhasil → Email Receipt Terkirim → Processing → Shipped → Delivered → Completed → Review`
 
### 20.2 Alur Pembelian Membership
 
`Customer → Beli Paket Plus → Bayar via Midtrans → Webhook tervalidasi → MEMBER → Customer memperoleh harga member dan akses dropship`
 
### 20.3 Alur Pemrosesan Admin
 
`PAID → PROCESSING → Menyiapkan barang → SHIPPED + Resi → DELIVERED → COMPLETED`
 
### 20.4 Alur Klaim Garansi
 
`Customer mengajukan komplain (subjek + kronologi + foto/video) → Status OPEN → Admin review → Admin hubungi customer manual via WA/email → Status diperbarui (IN_REVIEW/RESOLVED/REJECTED) beserta resolution`
 
### 20.5 Alur Perpanjangan Membership

`Member → Menerima email pengingat H-7 / H-3 → Beli Paket Plus lagi → Webhook tervalidasi → Masa berlaku bertambah satu periode → Jika tidak diperpanjang: setelah membership_expires_at, status kembali NOT_MEMBER dan harga kembali normal`

### 20.6 Alur Dropship

`Member (aktif) → Pilih produk → Cart → Checkout → Aktifkan "Kirim sebagai Dropship" → Pilih/buat alamat pembeli akhir → Pengiriman → Bayar dengan harga member → Admin memproses dan membuat resi atas nama member → Pesanan sampai ke pembeli akhir tanpa dokumen dari RoboEdu`


## 21. Struktur Halaman / Route
 
### 21.1 Customer
 
- `/` — Homepage / Landing page interaktif
- `/product` — Katalog produk & filter
- `/product/[slug]` — Detail produk, rincian komponen, & ulasan
- `/cart` — Keranjang belanja & rekomendasi produk
- `/checkout` — Alur checkout & pembayaran
- `/about` — Profil brand, nilai STEM, & sertifikasi keamanan anak
- `/contact` — Formulir masukan & kontak media sosial
- `/reseller` — Informasi membership & pembelian paket Plus
- `/login` & `/register` — Halaman autentikasi
- `/profile/my-profile` — Data akun pribadi & manajemen alamat
- `/profile/orders` — Riwayat pesanan (dengan modal invoice, tracking, & review)
- `/profile/orders/[id]` — Detail lengkap pesanan spesifik
- `/profile/reseller` — Benefit, status, durasi, & riwayat pembelian membership
- `/profile/settings` — Pengaturan preferensi akun
### 21.2 Admin
 
- `/admin`
- `/admin/products`
- `/admin/categories`
- `/admin/product-types`
- `/admin/inventory`
- `/admin/orders`
- `/admin/customers`
- `/admin/resellers` — Daftar member & pembelian membership
- `/admin/resellers/[id]` — Detail member (read-only)
- `/admin/vouchers`
- `/admin/reviews`
- `/admin/complaints`
- `/admin/reports`
- `/admin/settings`
## 22. Kebutuhan Fungsional
 
| ID | Area | Kebutuhan | Prioritas |
| --- | --- | --- | --- |
| FR-001 | Autentikasi | User dapat register, login, logout, dan menggunakan sesi yang aman. | WAJIB |
| FR-002 | Katalog | Customer dapat melihat produk aktif dan kategori. | WAJIB |
| FR-003 | Search | Customer dapat mencari produk. | WAJIB |
| FR-004 | Filter | Customer dapat melakukan filter dan sorting. | WAJIB |
| FR-005 | Cart | Customer dapat menambah, mengubah, dan menghapus item cart/cart_item. | WAJIB |
| FR-006 | Checkout | Customer dapat memilih alamat, pengiriman, voucher, dan membuat order. | WAJIB |
| FR-007 | Pembayaran | Sistem terintegrasi dengan Midtrans dan memproses notifikasi pembayaran. | WAJIB |
| FR-008 | Pesanan | Customer dan admin dapat melihat/mengelola status order. | WAJIB |
| FR-009 | Inventory | Admin dapat mengelola stok dan sistem mencegah stok negatif. | WAJIB |
| FR-010 | Membership | Sistem memberikan harga member kepada user berstatus MEMBER yang masa berlakunya belum berakhir. | WAJIB |
| FR-011 | Wishlist | Customer dapat menyimpan produk untuk dibeli kemudian. | SEBAIKNYA |
| FR-012 | Voucher | Admin dapat mengelola voucher dan sistem memvalidasinya saat checkout. | SEBAIKNYA |
| FR-013 | Review | Customer yang memenuhi syarat dapat memberikan review. | SEBAIKNYA |
| FR-014 | Laporan | Admin dapat melihat laporan penjualan dan performa produk. | WAJIB |
| FR-015 | Klaim Garansi | Customer dapat mengajukan klaim garansi dan admin dapat menindaklanjutinya. | SEBAIKNYA |
| FR-016 | Notifikasi Email | Sistem mengirim email receipt otomatis setelah pembayaran berhasil. | WAJIB |
| FR-017 | Audit Trail | Sistem mencatat setiap tindakan kritis admin ke dalam `audit_log`. | SEBAIKNYA |
| FR-018 | Formulir Kontak | Sistem menyediakan formulir pesan publik untuk pertanyaan dan saran pelanggan. | SEBAIKNYA |
| FR-019 | Invoice Digital | Sistem dapat menampilkan ringkasan faktur digital terperinci untuk pesanan yang telah dibayar. | WAJIB |
| FR-020 | Tracking Pengiriman Multi-Point | Sistem mendukung riwayat catatan perjalanan kurir bertahap (`shipment_tracking`). | SEBAIKNYA |
| FR-021 | Wishlist Drawer & Quick Action | Sistem menyediakan antarmuka drawer interaktif untuk akses cepat ke item wishlist tanpa navigasi penuh. | SEBAIKNYA |
| FR-022 | Membership | Customer dapat membeli paket membership Plus melalui Midtrans dan langsung menjadi member tanpa formulir maupun review admin. | WAJIB |
| FR-023 | Membership | Customer dapat melihat benefit, status, durasi, dan riwayat pembelian membership (purchase history). | WAJIB |
| FR-024 | Membership | Admin dapat melihat daftar member, detail member, dan riwayat pembelian membership (read-only). | SEBAIKNYA |
| FR-025 | Membership | Sistem mengembalikan status ke NOT_MEMBER dan harga normal saat masa berlaku berakhir, serta mendukung perpanjangan manual. | WAJIB |
| FR-026 | Membership | Sistem mengirim email pengingat H-7 dan H-3 sebelum membership berakhir serta email receipt pembelian membership. | SEBAIKNYA |
| FR-027 | Dropship | Member dapat checkout dengan pengiriman langsung ke alamat pembeli akhir; invoice hanya untuk member dan pembeli akhir tidak menerima dokumen dari RoboEdu. | SEBAIKNYA |
 
## 23. Kebutuhan Non-Fungsional
 
| Area | Kebutuhan |
| --- | --- |
| Performa | Halaman utama dan API harus dibuat efisien dan menghindari query database yang tidak diperlukan. |
| Keamanan | Password di-hash dengan aman, otorisasi dilakukan di server, dan endpoint admin dilindungi. |
| Pembayaran | Webhook/notification Midtrans divalidasi di backend. |
| Integritas Data | Harga dan total transaksi disimpan sebagai snapshot pada order. |
| Masa Berlaku Membership | Status dan harga member divalidasi di server terhadap `membership_expires_at` pada setiap perhitungan harga, tidak hanya bergantung pada job penjadwal. |
| Skalabilitas | Integrasi pembayaran dan pengiriman dibuat terpisah dari logika order utama; ekspedisi menggunakan provider abstraction. |
| Ketersediaan | Aplikasi berjalan dalam container Docker dengan restart policy otomatis, backup terjadwal, dan monitoring uptime. |
| Responsif | Website customer dan admin harus nyaman digunakan pada desktop, tablet, dan mobile. |
| Maintainability | Logika bisnis, akses database, dan tampilan dipisahkan secara terstruktur. |
| Audit | Aktivitas penting admin dan perubahan status order dapat ditelusuri melalui logging terstruktur maupun `audit_log`. |
| Observability | Error di production dapat terdeteksi melalui error tracking (Sentry) dan log terstruktur (Pino). |
 
## 24. Persyaratan Keamanan
 
- Authentication dan authorization wajib dilakukan di sisi server.
- Role, `membership_status`, dan `membership_expires_at` harus divalidasi untuk setiap operasi yang relevan.
- Password tidak boleh disimpan dalam bentuk plaintext.
- Seluruh secret (Midtrans, database, email service) disimpan menggunakan environment variable, tidak masuk ke version control.
- Endpoint webhook pembayaran harus melakukan validasi keamanan yang sesuai.
- Semua input dari user harus divalidasi.
- Query database harus menggunakan mekanisme aman/parameterized melalui Drizzle ORM.
- Perubahan harga, stok, order, pembelian dan perubahan status membership, dan status klaim garansi dicatat dalam log.
- Data pribadi customer hanya dapat diakses oleh pihak yang berwenang.
- File `.env` pada production dibatasi aksesnya (permission ketat) dan tidak pernah di-commit ke Git.
## 25. ERD Final
 
Struktur data berikut menjadi acuan final untuk pembuatan schema Drizzle ORM dan migration database, dikelompokkan per modul, dan telah diselaraskan dengan skema aktual pada codebase (`0000_roboedu_initial_schema.sql`).
 
### 25.1 Modul User & Akses
 
**user**
 
| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| id | PK | |
| name | VARCHAR | |
| email | VARCHAR, UNIQUE | |
| password_hash | VARCHAR | |
| phone | VARCHAR | |
| role | ENUM | superadmin, admin_sales, admin_laporan, customer |
| membership_status | ENUM | NOT_MEMBER, MEMBER |
| membership_expires_at | TIMESTAMP, NULLABLE | Waktu masa berlaku membership berakhir; NULL bila belum pernah menjadi member |
| is_active | BOOLEAN | Menentukan apakah akun dapat digunakan untuk login |
| last_login_at | TIMESTAMP, NULLABLE | Waktu login terakhir |
| created_at / updated_at | TIMESTAMP | |
 
**user_address** *(Digunakan juga untuk pembeli institusi.)*
 
| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| id | PK | |
| user_id | FK -> user | |
| label | VARCHAR | mis. Rumah, Kantor/Sekolah |
| recipient_name | VARCHAR | |
| phone | VARCHAR | |
| address_line | TEXT | |
| city / province / postal_code | VARCHAR | |
| is_primary | BOOLEAN | |
| created_at / updated_at | TIMESTAMP | |
 
**membership_purchase** *(Menyimpan setiap pembelian membership paket Plus dan menjadi sumber purchase history — lih. Bab 6.8 dan 6.9. Status yang digunakan untuk logika harga tetap `user.membership_status` dan `user.membership_expires_at`.)*

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| id | PK | |
| purchase_number | VARCHAR, UNIQUE | Nomor pembelian; dipakai sebagai referensi transaksi ke Midtrans |
| user_id | FK -> user | |
| plan_name_snapshot | VARCHAR | Snapshot nama paket (Plus) |
| price_snapshot | DECIMAL | Snapshot harga paket saat pembelian |
| duration_months_snapshot | INT | Snapshot durasi periode (bulan) |
| status | ENUM | PENDING, PAID, FAILED, EXPIRED, REFUNDED |
| starts_at | TIMESTAMP, NULLABLE | Awal masa berlaku; diisi saat PAID |
| ends_at | TIMESTAMP, NULLABLE | Akhir masa berlaku; diisi saat PAID |
| paid_at | TIMESTAMP, NULLABLE | |
| reminder_h7_sent_at | TIMESTAMP, NULLABLE | Penanda pengingat H-7 sudah dikirim |
| reminder_h3_sent_at | TIMESTAMP, NULLABLE | Penanda pengingat H-3 sudah dikirim |
| created_at / updated_at | TIMESTAMP | |


### 25.2 Modul Katalog Produk

*Catatan: kolom `base_reseller_price` dan `reseller_price_override` tetap digunakan sebagai harga member (nama kolom tidak diubah agar tidak memerlukan migrasi nama kolom).*
 
**category**
 
| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| id | PK | |
| name | VARCHAR | |
| slug | VARCHAR, UNIQUE | |
| status | ENUM | ACTIVE, INACTIVE |
| created_at / updated_at | TIMESTAMP | |
 
**product_type** *(Tabel general/fleksibel untuk pengelompokan tambahan.)*
 
| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| id | PK | |
| name | VARCHAR | |
| slug | VARCHAR, UNIQUE | |
| status | ENUM | ACTIVE, INACTIVE |
| created_at / updated_at | TIMESTAMP | |
 
**product**
 
| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| id | PK | |
| category_id | FK -> category | |
| product_type_id | FK -> product_type, NULLABLE | |
| name | VARCHAR | |
| slug | VARCHAR, UNIQUE | |
| sku | VARCHAR | |
| description | TEXT | |
| base_price | DECIMAL | |
| base_reseller_price | DECIMAL | |
| product_kind | ENUM | READY_STOCK, PRE_ORDER |
| status | ENUM | DRAFT, ACTIVE, INACTIVE, OUT_OF_STOCK |
| created_at / updated_at | TIMESTAMP | |
 
**product_variant** *(Digunakan untuk variasi produk, mis. warna. Harga dan kuota kapasitas dikelola terpusat pada tingkat variant.)*
 
| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| id | PK | |
| product_id | FK -> product | |
| sku | VARCHAR, UNIQUE | |
| variant_name | VARCHAR | mis. Merah, Biru |
| price_override | DECIMAL, NULLABLE | Harga normal khusus variant |
| reseller_price_override | DECIMAL, NULLABLE | Harga member khusus variant |
| stock | INT | kuota/kapasitas produksi |
| status | ENUM | DRAFT, ACTIVE, INACTIVE, OUT_OF_STOCK |
| created_at / updated_at | TIMESTAMP | |
 
**product_image**
 
| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| id | PK | |
| product_id | FK -> product | |
| variant_id | FK -> product_variant, NULLABLE | |
| image_url | VARCHAR | disimpan di MinIO |
| is_primary | BOOLEAN | |
| sort_order | INT | |
| created_at | TIMESTAMP | |
 
### 25.3 Modul Cart & Wishlist
 
**cart**
 
| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| id | PK | |
| user_id | FK -> user, UNIQUE | |
| created_at / updated_at | TIMESTAMP | |
 
**cart_item**
 
| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| id | PK | |
| cart_id | FK -> cart | |
| product_id | FK -> product | |
| variant_id | FK -> product_variant, NULLABLE | |
| quantity | INT | |
| created_at / updated_at | TIMESTAMP | |
 
**wishlist** *(Tanpa kolom quantity.)*
 
| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| id | PK | |
| user_id | FK -> user | |
| product_id | FK -> product | |
| variant_id | FK -> product_variant, NULLABLE | |
| created_at | TIMESTAMP | |
 
### 25.4 Modul Order, Pembayaran & Pengiriman
 
**shipping_provider**
 
| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| id | PK | |
| name | VARCHAR | mis. J&T |
| is_active | BOOLEAN | |
| created_at / updated_at | TIMESTAMP | |
 
**order** *(Menyimpan snapshot alamat pengiriman & kode voucher secara langsung, agar histori transaksi tidak berubah bila data alamat profil atau voucher berubah/tidak berlaku lagi — lih. Bab 13.3.)*
 
| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| id | PK | |
| order_number | VARCHAR, UNIQUE | |
| user_id | FK -> user | |
| address_id | FK -> user_address | |
| voucher_id | FK -> voucher, NULLABLE | |
| subtotal | DECIMAL | |
| discount_amount | DECIMAL | |
| shipping_cost | DECIMAL | |
| total | DECIMAL | |
| voucher_code_snapshot | VARCHAR, NULLABLE | Snapshot kode voucher yang dipakai |
| status | ENUM | PENDING, PAID, PROCESSING, SHIPPED, DELIVERED, COMPLETED, CANCELLED, REFUNDED |
| recipient_name | VARCHAR | Snapshot nama penerima |
| recipient_phone | VARCHAR | Snapshot nomor telepon penerima |
| shipping_address | VARCHAR | Snapshot alamat lengkap |
| shipping_province / shipping_city / shipping_district | VARCHAR | Snapshot wilayah pengiriman |
| shipping_village | VARCHAR, NULLABLE | Snapshot kelurahan/desa |
| shipping_postal_code | VARCHAR, NULLABLE | Snapshot kode pos |
| is_dropship | BOOLEAN | Menandai order dropship (default false) |
| sender_name | VARCHAR, NULLABLE | Snapshot nama pengirim (member) untuk order dropship |
| sender_phone | VARCHAR, NULLABLE | Snapshot nomor telepon pengirim (member) untuk order dropship |
| paid_at / shipped_at / delivered_at / completed_at / cancelled_at | TIMESTAMP, NULLABLE | Milestone waktu siklus pesanan |
| created_at / updated_at | TIMESTAMP | |
 
**order_item** *(Menyimpan snapshot harga & nama produk/variant.)*
 
| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| id | PK | |
| order_id | FK -> order | |
| product_id | FK -> product | |
| variant_id | FK -> product_variant, NULLABLE | |
| product_name_snapshot | VARCHAR | |
| variant_name_snapshot | VARCHAR, NULLABLE | |
| price_snapshot | DECIMAL | |
| quantity | INT | |
| subtotal | DECIMAL | |
| created_at | TIMESTAMP | |
 
**payment** *(Terpisah dari order untuk menangani multiple percobaan pembayaran. Dapat merujuk ke order atau ke membership_purchase; tepat satu dari `order_id` atau `membership_purchase_id` harus terisi.)*
 
| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| id | PK | |
| order_id | FK -> order, NULLABLE, UNIQUE | Terisi untuk pembayaran pesanan barang |
| membership_purchase_id | FK -> membership_purchase, NULLABLE, UNIQUE | Terisi untuk pembayaran membership |
| midtrans_transaction_id | VARCHAR | |
| payment_method | VARCHAR | |
| amount | DECIMAL | |
| status | ENUM | PENDING, PAID, FAILED, EXPIRED, REFUNDED |
| paid_at | TIMESTAMP, NULLABLE | |
| raw_response | JSON | payload webhook Midtrans |
| created_at / updated_at | TIMESTAMP | |
 
**shipment** *(Tabel mandiri, dipisahkan dari kolom pengiriman di `order`.)*
 
| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| id | PK | |
| order_id | FK -> order, UNIQUE | |
| shipping_provider_id | FK -> shipping_provider | |
| service | VARCHAR, NULLABLE | Jenis layanan pengiriman yang dipilih |
| tracking_number | VARCHAR, NULLABLE | Nomor resi |
| status | ENUM/VARCHAR | PENDING, PACKED, PICKED_UP, IN_TRANSIT, DELIVERED, FAILED |
| shipped_at / delivered_at | TIMESTAMP, NULLABLE | |
| created_at / updated_at | TIMESTAMP | |
 
**shipment_tracking** *(Riwayat titik perjalanan paket; satu shipment dapat memiliki banyak entri tracking.)*
 
| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| id | PK | |
| shipment_id | FK -> shipment | |
| status | VARCHAR | |
| description | VARCHAR, NULLABLE | |
| location | VARCHAR, NULLABLE | |
| occurred_at | TIMESTAMP | Waktu kejadian tracking |
| created_at | TIMESTAMP | |
 
### 25.5 Modul Voucher
 
**voucher**
 
| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| id | PK | |
| code | VARCHAR, UNIQUE | |
| name | VARCHAR | |
| description | TEXT | |
| discount_type | ENUM | PERCENTAGE, FIXED_AMOUNT |
| discount_value | DECIMAL | |
| minimum_purchase | DECIMAL | |
| maximum_discount | DECIMAL | |
| usage_limit | INT | |
| used_count | INT | |
| start_at / end_at | TIMESTAMP | |
| is_active | BOOLEAN | |
| created_at / updated_at | TIMESTAMP | |
 
**voucher_usage** *(Mencatat histori pemakaian voucher.)*
 
| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| id | PK | |
| voucher_id | FK -> voucher | |
| user_id | FK -> user | |
| order_id | FK -> order | |
| discount_amount | DECIMAL | |
| used_at | TIMESTAMP | |
 
### 25.6 Modul Review
 
**review** *(Direlasikan ke order_item untuk validasi kelayakan review.)*
 
| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| id | PK | |
| order_item_id | FK -> order_item | |
| user_id | FK -> user | |
| product_id | FK -> product | |
| rating | INT | |
| comment | TEXT | |
| status | ENUM | VISIBLE, HIDDEN |
| created_at / updated_at | TIMESTAMP | |
 
### 25.7 Modul Klaim Garansi
 
**complaints**
 
| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| id | PK | |
| order_item_id | FK -> order_item | |
| user_id | FK -> user | |
| subject | VARCHAR | Judul singkat klaim |
| description | TEXT | kronologi dari customer |
| status | ENUM/VARCHAR | OPEN, IN_REVIEW, RESOLVED, REJECTED |
| resolution | TEXT, NULLABLE | Catatan tindak lanjut admin |
| resolved_at | TIMESTAMP, NULLABLE | Waktu klaim diselesaikan |
| created_at / updated_at | TIMESTAMP | |
 
**complaint_attachments** *(Satu komplain dapat memiliki banyak foto/video.)*
 
| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| id | PK | |
| complaint_id | FK -> complaints | |
| file_url | VARCHAR | disimpan di MinIO |
| file_type | ENUM | PHOTO, VIDEO |
| created_at | TIMESTAMP | |
 
### 25.8 Modul Notifikasi Email
 
**email_log**
 
| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| id | PK | |
| order_id | FK -> order, NULLABLE | |
| membership_purchase_id | FK -> membership_purchase, NULLABLE | |
| user_id | FK -> user | |
| email_type | ENUM | RECEIPT, MEMBERSHIP_RECEIPT, MEMBERSHIP_REMINDER, OTHER |
| email | VARCHAR | Alamat email penerima |
| subject | VARCHAR | Subjek email yang dikirim |
| status | ENUM | PENDING, SENT, FAILED |
| sent_at | TIMESTAMP, NULLABLE | |
| created_at | TIMESTAMP | |
 
### 25.9 Modul Admin — Audit Log
 
**audit_log** *(Mencatat aktivitas operasional admin untuk keperluan audit trail — lih. FR-017.)*
 
| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| id | PK | |
| actor_id | FK -> user | Admin yang melakukan aksi |
| action | VARCHAR | Nama aksi yang dilakukan |
| target_type | VARCHAR | Jenis entitas target (mis. `product`, `order`) |
| target_id | VARCHAR/UUID | ID entitas target |
| description | TEXT, NULLABLE | Deskripsi tambahan aksi |
| metadata | JSON, NULLABLE | Detail tambahan (payload sebelum/sesudah perubahan, dsb.) |
| created_at | TIMESTAMP | |
 
## 26. MVP dan Roadmap
 
| Tahap | Ruang Lingkup |
| --- | --- |
| MVP / Tahap 1 | Autentikasi, homepage, katalog, search/filter, detail produk, kategori, cart & cart_item, alamat, checkout, Midtrans, email receipt otomatis, struktur pengiriman/J&T, order management, stok sederhana (kuota), customer management, pembelian membership Plus via Midtrans (tanpa formulir dan tanpa review admin), masa berlaku & perpanjangan manual, email pengingat H-7/H-3, dan harga member. |
| Tahap 2 | Wishlist, voucher/promo, review, klaim garansi, laporan penjualan, dashboard admin yang lebih lengkap, dan dropship untuk member. |
| Tahap 3 | Multi-ekspedisi, tingkatan paket membership, pembelian institusi/B2B lebih formal, pengiriman internasional, riwayat pergerakan stok yang lebih detail (stock movement log), analitik lanjutan, dan integrasi tambahan. |
 
## 27. Checklist Setup Awal Pengembangan
 
Urutan berikut disusun agar fondasi (infrastruktur, database, autentikasi, integrasi eksternal) siap terlebih dahulu sebelum development frontend dimulai.
 
### Tahap 0 — Repository & Environment Dasar
 
- Inisialisasi Git repository + `.gitignore` (.env, node_modules, dsb.)
- Struktur folder project (app/, docker/, nginx/)
- Buat `.env.example` (template kosong, tanpa credential asli)
### Tahap 1 — Infrastruktur (Docker Compose)
 
- Buat `docker-compose.yml` dengan service: mysql, redis, minio, nginx, app
- Pastikan seluruh container dapat berjalan dan saling terkoneksi
- Setup nginx reverse proxy dasar (SSL menyusul via Let's Encrypt)
### Tahap 2 — Database Foundation
 
- ERD final disepakati (lihat Bab 25)
- Setup Drizzle ORM + koneksi ke MySQL
- Generate & jalankan migration awal
- Seed data dummy (admin user, kategori, produk contoh)
### Tahap 3 — Autentikasi & Otorisasi
 
- Setup login/register, hashing password, session/JWT
- Middleware pengecekan role (customer/admin) dan membership_status dan masa berlaku (`membership_expires_at`)
- Uji login sebagai admin dan customer dummy
### Tahap 4 — Integrasi Eksternal
 
- MinIO — uji upload file dummy
- Midtrans — sandbox mode, uji transaksi hingga menerima webhook
- Redis + BullMQ — uji job sederhana dan job terjadwal (pengingat/kedaluwarsa membership) berjalan di worker
- Email service (Resend/SendGrid) — uji kirim email dummy
### Tahap 5 — Mulai Development Frontend
 
- Layout dasar (header, footer, navigasi) + halaman autentikasi
- Katalog produk
- Cart & checkout
- Modul lain sesuai skala prioritas MVP
## 28. User Story dan Acceptance Criteria
 
| ID | User Story | Kriteria Penerimaan |
| --- | --- | --- |
| US-001 | Sebagai customer, saya ingin mencari produk agar dapat menemukan produk robotika dengan cepat. | Ketika keyword dimasukkan, sistem menampilkan produk relevan dan tidak menampilkan produk nonaktif. |
| US-002 | Sebagai customer, saya ingin menambahkan produk ke cart agar dapat membeli beberapa produk. | Jika stok/kuota mencukupi, produk, variant, dan jumlah yang benar masuk ke cart_item. |
| US-003 | Sebagai customer, saya ingin membayar melalui Midtrans agar dapat menyelesaikan pembelian. | Jika pembayaran berhasil, webhook tervalidasi, order berubah menjadi PAID, dan email receipt terkirim. |
| US-004 | Sebagai member, saya ingin mendapatkan harga khusus. | Jika `membership_status` MEMBER dan `membership_expires_at` belum terlewati, sistem menggunakan harga member pada transaksi. |
| US-005 | Sebagai customer, saya ingin membeli membership Plus agar langsung menjadi member. | Setelah pembayaran dikonfirmasi webhook, `membership_status` menjadi MEMBER dan `membership_expires_at` terisi, tanpa formulir dan tanpa review admin. |
| US-006 | Sebagai admin, saya ingin mengelola stok agar ketersediaan produk akurat. | Stok berkurang setelah pembayaran berhasil dan tidak boleh menjadi negatif. |
| US-007 | Sebagai customer, saya ingin melihat status pesanan agar dapat mengetahui proses pengiriman. | Detail order menampilkan status dan informasi resi jika tersedia. |
| US-008 | Sebagai customer, saya ingin memberikan review setelah membeli produk. | Customer hanya dapat me-review produk yang memiliki order_item dengan status pembelian yang sah. |
| US-009 | Sebagai customer, saya ingin mengajukan klaim garansi atas produk yang bermasalah. | Customer dapat mengisi kronologi dan mengunggah foto/video; pengajuan tersimpan dengan status OPEN. |
| US-010 | Sebagai admin, saya ingin menindaklanjuti klaim garansi. | Admin dapat mengubah status klaim dan mencatat catatan tindak lanjut (`resolution`) beserta metode kontak yang digunakan (WA/email). |
| US-011 | Sebagai member, saya ingin melihat status dan durasi membership saya. | `/profile/reseller` menampilkan status MEMBER, paket, tanggal mulai dan berakhir, serta benefit; untuk NOT_MEMBER menampilkan ajakan bergabung dan ringkasan manfaat. |
| US-012 | Sebagai member, saya ingin melihat riwayat pembelian membership. | `/profile/reseller` menampilkan tabel purchase history (tanggal, nomor, paket, periode, nominal, metode bayar, status) berdasarkan snapshot pembelian. |
| US-013 | Sebagai member, saya ingin diingatkan sebelum membership berakhir dan dapat memperpanjang. | Email pengingat dikirim H-7 dan H-3; perpanjangan manual menambah masa berlaku dari `membership_expires_at` yang lama; setelah berakhir status kembali NOT_MEMBER dan harga normal. |
| US-014 | Sebagai admin, saya ingin melihat daftar dan detail member. | `/admin/resellers` dan `/admin/resellers/[id]` menampilkan data member dan riwayat pembelian secara read-only, tanpa aksi setuju/tolak. |
| US-015 | Sebagai member, saya ingin memesan dengan dropship. | Order dikirim ke alamat pembeli akhir dengan nama member sebagai pengirim; invoice hanya untuk member dan pembeli akhir tidak menerima dokumen dari RoboEdu. |
 
## 29. Metrik Keberhasilan
 
- Persentase checkout yang berhasil diselesaikan.
- Persentase pembayaran berhasil.
- Persentase order yang selesai.
- Nilai rata-rata transaksi (Average Order Value).
- Total revenue bulanan.
- Persentase pembelian ulang.
- Jumlah member aktif.
- Tingkat perpanjangan membership.
- Produk dan kategori terlaris.
- Persentase cart yang ditinggalkan.
- Frekuensi produk stok/kuota rendah atau habis.
- Waktu rata-rata penyelesaian klaim garansi.
- Tingkat keberhasilan pengiriman email receipt.
## 30. Pengembangan Masa Depan
 
- Penjualan internasional dan pengiriman lintas negara.
- Integrasi beberapa penyedia ekspedisi.
- Tingkatan paket membership (paket tambahan di atas Plus).
- Perpanjangan otomatis (auto-renew) untuk membership.
- Sistem pembelian khusus institusi/B2B yang lebih formal (termasuk invoice otomatis).
- Riwayat pergerakan stok yang lebih detail (stock movement log).
- Analitik penjualan lanjutan.
- Notifikasi WhatsApp.
- Metode pembayaran tambahan.
- Peningkatan observability (mis. Grafana Loki untuk log terpusat) seiring pertumbuhan skala sistem.
## 31. Catatan Pengembangan
 
PRD ini digunakan sebagai sumber kebenaran pada level produk. ERD pada Bab 25 telah diselaraskan dengan seluruh requirement yang telah disepakati. Tahap berikutnya adalah menentukan kontrak API, struktur route, aturan validasi, desain UI, dan acceptance test.
 
*Urutan pengembangan yang disarankan: PRD → User Flow → Business Rules → ERD Final → Setup Infrastruktur → API Specification → UI/UX → Development → Testing → Deployment.*

*Revisi Oktober 2026: fitur reseller diganti menjadi membership berbayar bulanan (paket Standar dan Plus). Pengajuan reseller, formulir, dan review admin dihapus; ditambahkan pembelian membership, purchase history, pengingat masa berlaku, dan dropship. Perubahan ini perlu diselaraskan ke `api.md`, `reseller_todo.md`, dan schema database.*

## 32. Desain Visual & Branding

Spesifikasi berikut mengacu pada `docs/DESIGN.md` dan menjadi acuan konsistensi visual seluruh halaman customer maupun admin.

### 32.1 Gaya Desain

Neo-brutalism ramah anak: kontras tinggi, garis border tebal `2px #3D2900`, dan hard shadow tanpa blur `4px 4px 0px #3D2900` pada komponen interaktif utama (tombol, kartu produk, modal).

### 32.2 Palet Warna

| Peran | Warna |
| --- | --- |
| Latar belakang | Krem pastel hangat `#F3EFE4` |
| Brand utama | Biru `#2483D0` |
| Aksen pastel | Yellow, Soft Blue, Green, Pink, Orange, Peach |

### 32.3 Tipografi

| Elemen | Font |
| --- | --- |
| Judul (heading) | `Unbounded` |
| Teks tubuh (body) | `Outfit` |

---
*RoboEdu — Dokumen Kebutuhan Produk*
 