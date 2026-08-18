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
| Tanggal | Agustus 2026 |
 
*Dokumen ini menjadi acuan utama dalam proses perancangan, pengembangan, pengujian, dan pengembangan lanjutan RoboEdu.*
 
---
 
## 1. Informasi Dokumen
 
| Bagian | Keterangan |
| --- | --- |
| Nama Produk | RoboEdu |
| Jenis Produk | Platform e-commerce |
| Bidang Bisnis | Penjualan kit robotika edukasi dan sparepart robot |
| Pengguna Utama | Customer, Reseller, Admin |
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
- Menyediakan sistem reseller dengan harga khusus setelah mendapatkan persetujuan admin.
- Menyediakan pengelolaan produk, stok, pesanan, customer, reseller, promosi, review, klaim garansi, dan laporan dalam satu sistem.
- Menyediakan pembayaran online melalui Midtrans dengan notifikasi receipt otomatis via email.
- Mempersiapkan sistem agar dapat menggunakan lebih dari satu penyedia ekspedisi di masa depan.
- Mempersiapkan fondasi untuk ekspansi penjualan ke luar Indonesia.
- Membangun infrastruktur yang portabel dan mudah di-deploy menggunakan containerization (Docker).
## 4. Pengguna Sistem
 
| Pengguna | Deskripsi | Kebutuhan Utama |
| --- | --- | --- |
| Customer Individual | Individu yang membeli produk untuk belajar, proyek, hobi, atau kebutuhan pribadi. | Mencari produk, membeli, membayar, melacak pesanan, memberikan review, dan mengajukan klaim garansi bila diperlukan. |
| Customer Institusi | Sekolah, lembaga pendidikan, komunitas, atau organisasi. | Menemukan produk, melakukan pembelian, dan melihat histori pesanan. Menggunakan data alamat standar (`user_address`) untuk kebutuhan pengiriman/invoice manual. |
| Reseller | Customer yang telah mendapatkan persetujuan admin sebagai reseller. | Mendapatkan harga khusus dan melakukan pembelian melalui sistem yang sama. |
| Admin | Pengelola operasional RoboEdu. | Mengelola katalog, stok, pesanan, pengguna, reseller, promosi, review, klaim garansi, laporan, dan pengaturan. |
 
## 5. Role dan Hak Akses
 
Sistem menggunakan dua konsep yang berbeda: role (menentukan hak akses ke sistem) dan `reseller_status` (menentukan status khusus dalam hal harga). Reseller bukan role terpisah — ia tetap berada pada role customer, dengan atribut `reseller_status` yang menentukan apakah harga khusus reseller berlaku untuknya.
 
| Fitur | Customer | Reseller | Admin |
| --- | --- | --- | --- |
| Melihat produk | ✓ | ✓ | ✓ |
| Search, filter, sorting | ✓ | ✓ | ✓ |
| Wishlist | ✓ | ✓ | — |
| Cart dan checkout | ✓ | ✓ | — |
| Harga normal | ✓ | — | ✓ |
| Harga reseller | — | ✓ setelah disetujui | Kelola |
| Riwayat pesanan | ✓ | ✓ | Kelola semua |
| Review | ✓ jika memenuhi syarat | ✓ jika memenuhi syarat | Moderasi |
| Klaim garansi | ✓ | ✓ | Tindak lanjut manual |
| Kelola produk | — | — | ✓ |
| Kelola stok | — | — | ✓ |
| Persetujuan reseller | — | — | ✓ |
| Voucher | — | — | ✓ |
| Laporan / settings | — | — | ✓ |
 
*Role internal admin dibagi menjadi tiga: superadmin, admin sales, dan admin laporan, disimpan pada kolom `role` di tabel `user` bersama nilai customer.*
 
## 6. Sistem Reseller
 
Reseller tidak langsung aktif setelah melakukan pendaftaran. Customer harus mengajukan status reseller dan menunggu persetujuan dari admin. Status ini disimpan sebagai atribut `reseller_status` pada akun customer yang bersangkutan, bukan sebagai role akses terpisah.
 
### 6.1 Alur Reseller
 
`Customer → Mengajukan Reseller → PENDING → Admin melakukan review → APPROVED / REJECTED`
 
### 6.2 Status Reseller
 
| Status | Keterangan |
| --- | --- |
| NOT_RESELLER | User merupakan customer biasa dan belum memiliki pengajuan reseller. |
| PENDING | User telah mengajukan reseller dan menunggu pemeriksaan admin. |
| APPROVED | Pengajuan disetujui. User mendapatkan akses harga reseller. |
| REJECTED | Pengajuan ditolak. User tetap menjadi customer biasa. |
 
### 6.3 Aturan Harga Reseller
 
- Customer biasa menggunakan harga normal.
- Reseller yang telah disetujui menggunakan harga reseller.
- Admin dapat menentukan harga reseller untuk produk (termasuk override per variant bila diperlukan).
- Harga yang benar-benar digunakan dalam transaksi harus disimpan pada order item sebagai snapshot.
- Perubahan harga produk setelah transaksi tidak boleh mengubah histori transaksi lama.
## 7. Fitur Customer
 
| Fitur | Kebutuhan |
| --- | --- |
| Register / Login | Customer dapat membuat akun, masuk, keluar, dan menggunakan sesi yang aman. |
| Homepage | Menampilkan kategori, produk unggulan, produk terlaris, promosi, dan informasi RoboEdu. |
| Katalog Produk | Menampilkan produk aktif berdasarkan kategori dan Product Type. |
| Search | Mencari produk berdasarkan nama, keyword, SKU, dan data katalog terkait. |
| Filter & Sorting | Filter berdasarkan kategori, harga, stok, product type, variant, rating; sorting berdasarkan terbaru, harga, popularitas, dan rating. |
| Detail Produk | Menampilkan foto, nama, harga, harga reseller bila relevan, deskripsi, stok, variant, rating, dan review. |
| Cart | Menambah produk (dengan variant bila ada), mengubah jumlah, menghapus item, dan menghitung subtotal. Struktur cart terdiri dari satu cart per user dengan banyak cart_item. |
| Wishlist | Menyimpan produk untuk dibeli kemudian, tanpa pengaturan jumlah/quantity. |
| Alamat | Menambah, mengubah, menghapus, dan menentukan alamat utama. Digunakan juga oleh customer institusi. |
| Checkout | Memilih alamat, ekspedisi, voucher, melihat ringkasan, dan melakukan pembayaran. |
| Pembayaran | Melakukan pembayaran menggunakan Midtrans. |
| Order Tracking | Melihat status pesanan dan informasi tracking jika tersedia. |
| Review | Customer yang telah membeli produk (tervalidasi melalui order item) dapat memberikan rating dan ulasan. |
| Klaim Garansi | Customer dapat mengajukan komplain terhadap produk yang telah dibeli, disertai kronologi dan lampiran foto/video. |
| Notifikasi Email | Customer menerima email receipt otomatis setelah pembayaran berhasil dikonfirmasi. |
 
## 8. Fitur Admin
 
| Modul | Kebutuhan |
| --- | --- |
| Dashboard | Revenue, jumlah pesanan, pesanan pending, produk terlaris, customer, dan stok menipis. |
| Produk | CRUD produk, harga normal, harga reseller, status, gambar, slug, dan informasi produk. |
| Kategori | CRUD kategori dan pengaturan status. |
| Product Type | Mengelola pengelompokan produk secara general dan fleksibel (tema, jenis, dsb). |
| Variant | Mengelola variant produk (mis. warna), termasuk harga dan stok per variant. |
| Inventory | Mengelola stok/kuota produksi, penambahan/pengurangan stok, dan monitoring stok rendah. |
| Pesanan | Melihat dan memproses pesanan, mengubah status fulfillment, dan mengelola informasi pengiriman. |
| Customer | Melihat, mencari, dan mengelola data customer serta histori pesanan. |
| Reseller | Melihat pengajuan, menyetujui/menolak, dan mengelola status reseller. |
| Voucher | Membuat dan mengelola voucher, jenis diskon, masa berlaku, dan batas penggunaan. |
| Review | Melihat, memoderasi, menyembunyikan, atau menghapus review yang tidak sesuai. |
| Klaim Garansi | Melihat pengajuan klaim, mengubah status, mencatat hasil tindak lanjut manual (WA/email). |
| Laporan | Laporan revenue, pesanan, produk terlaris, kategori, dan metrik penjualan. |
| Settings | Informasi toko, konfigurasi pembayaran, pengiriman, dan pengaturan umum. |
 
## 9. Manajemen Produk
 
### 9.1 Data Produk
 
- Nama produk
- SKU / kode produk
- Kategori
- Product Type (opsional, general/fleksibel)
- Deskripsi
- Harga normal
- Harga reseller
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
- Sistem menentukan harga berdasarkan status customer/reseller.
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
 
## 12. Pengiriman
 
J&T menjadi ekspedisi pada tahap awal. Sistem menggunakan tabel `shipping_provider` terpisah, sehingga penyedia ekspedisi dapat ditambah atau diganti tanpa mengubah struktur inti pesanan.
 
| Data | Keterangan |
| --- | --- |
| Shipping Provider | Referensi ke tabel `shipping_provider`, mis. J&T. |
| Shipping Service | Jenis layanan pengiriman yang dipilih. |
| Shipping Cost | Biaya pengiriman. |
| Tracking Number | Nomor resi. |
| Shipped At | Waktu pesanan dikirim. |
| Delivered At | Waktu pesanan dinyatakan diterima. |
 
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
 
### 13.3 Snapshot Harga Transaksi
 
Setiap order item harus menyimpan harga transaksi pada saat pembelian (`price_snapshot`), termasuk nama produk dan nama variant. Hal ini berlaku untuk harga normal maupun harga reseller, dan menjadi dasar validasi kelayakan review serta klaim garansi.
 
## 14. Inventory / Stok
 
Sebagian besar produk RoboEdu bersifat made-by-order (dibuat sesuai pesanan), sehingga MVP menggunakan sistem stok sederhana yang berfungsi sebagai kuota/kapasitas produksi, bukan sebagai stok gudang fisik dalam arti tradisional.
 
- Setiap produk/variant yang dapat dijual memiliki jumlah stok (kuota).
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
 
`Customer memilih order item yang bermasalah → Customer menuliskan kronologi kejadian dan melampirkan foto/video → Sistem menyimpan pengajuan dengan status SUBMITTED → Admin meninjau pengajuan → Admin menghubungi customer secara manual melalui WhatsApp atau email aktif yang telah diisi customer saat pembelian → Admin memperbarui status pengajuan (IN_REVIEW, RESOLVED, atau REJECTED) beserta catatan tindak lanjut.`
 
### 17.2 Data yang Dibutuhkan
 
- Order item yang diklaim (untuk validasi kelayakan klaim).
- Kronologi/deskripsi kejadian dari customer.
- Lampiran foto dan/atau video (dapat lebih dari satu berkas per pengajuan).
- Status pengajuan dan catatan internal admin.
## 18. Notifikasi Email
 
Sistem mengirimkan email receipt secara otomatis kepada customer setelah pembayaran berhasil dikonfirmasi, menggunakan mekanisme antrian (queue) agar proses pengiriman tidak menghambat respons terhadap webhook Midtrans.
 
- Email dikirim melalui layanan pihak ketiga (Resend atau SendGrid).
- Pengiriman dijalankan sebagai background job melalui Redis + BullMQ, dengan mekanisme retry otomatis apabila pengiriman gagal.
- Status setiap pengiriman email dicatat oleh sistem untuk keperluan audit dan troubleshooting.
## 19. Infrastruktur dan Teknologi Pendukung
 
### 19.1 Containerization
 
Seluruh service (aplikasi, database, storage, proxy) dijalankan sebagai container menggunakan Docker dan diorkestrasi dengan Docker Compose pada satu VPS. Setiap service production menggunakan restart policy `unless-stopped`, sehingga container otomatis pulih dari crash namun tidak menyala sendiri jika dimatikan secara sengaja.
 
### 19.2 Reverse Proxy dan SSL
 
nginx berfungsi sebagai reverse proxy yang menerima seluruh request dari internet dan meneruskannya ke aplikasi Next.js. Sertifikat SSL/HTTPS menggunakan Let's Encrypt, yang menjadi syarat wajib agar webhook Midtrans dapat diterima dengan aman.
 
### 19.3 Object Storage
 
MinIO digunakan sebagai object storage self-hosted untuk menyimpan berkas seperti gambar produk dan lampiran klaim garansi.
 
### 19.4 Queue dan Background Job
 
Redis dan BullMQ digunakan untuk memproses tugas yang berjalan di latar belakang, seperti pengiriman email receipt, sehingga proses utama (mis. webhook pembayaran) dapat merespons dengan cepat tanpa menunggu tugas tersebut selesai.
 
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
 
### 20.2 Alur Pengajuan Reseller
 
`Customer → Ajukan Reseller → PENDING → Admin Review → APPROVED / REJECTED → Jika APPROVED, customer memperoleh harga reseller`
 
### 20.3 Alur Pemrosesan Admin
 
`PAID → PROCESSING → Menyiapkan barang → SHIPPED + Resi → DELIVERED → COMPLETED`
 
### 20.4 Alur Klaim Garansi
 
`Customer mengajukan komplain (kronologi + foto/video) → Status SUBMITTED → Admin review → Admin hubungi customer manual via WA/email → Status diperbarui (IN_REVIEW/RESOLVED/REJECTED)`
 
## 21. Struktur Halaman / Route
 
### 21.1 Customer
 
- `/`
- `/products`
- `/products/[slug]`
- `/categories/[slug]`
- `/search`
- `/cart`
- `/checkout`
- `/wishlist`
- `/orders`
- `/orders/[id]`
- `/orders/[id]/complaint`
- `/profile`
- `/profile/address`
- `/login`
- `/register`
- `/contact`
### 21.2 Admin
 
- `/admin`
- `/admin/products`
- `/admin/categories`
- `/admin/product-types`
- `/admin/inventory`
- `/admin/orders`
- `/admin/customers`
- `/admin/resellers`
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
| FR-010 | Reseller | Admin dapat menyetujui/menolak reseller dan reseller memperoleh harga khusus. | WAJIB |
| FR-011 | Wishlist | Customer dapat menyimpan produk untuk dibeli kemudian. | SEBAIKNYA |
| FR-012 | Voucher | Admin dapat mengelola voucher dan sistem memvalidasinya saat checkout. | SEBAIKNYA |
| FR-013 | Review | Customer yang memenuhi syarat dapat memberikan review. | SEBAIKNYA |
| FR-014 | Laporan | Admin dapat melihat laporan penjualan dan performa produk. | WAJIB |
| FR-015 | Klaim Garansi | Customer dapat mengajukan klaim garansi dan admin dapat menindaklanjutinya. | SEBAIKNYA |
| FR-016 | Notifikasi Email | Sistem mengirim email receipt otomatis setelah pembayaran berhasil. | WAJIB |
 
## 23. Kebutuhan Non-Fungsional
 
| Area | Kebutuhan |
| --- | --- |
| Performa | Halaman utama dan API harus dibuat efisien dan menghindari query database yang tidak diperlukan. |
| Keamanan | Password di-hash dengan aman, otorisasi dilakukan di server, dan endpoint admin dilindungi. |
| Pembayaran | Webhook/notification Midtrans divalidasi di backend. |
| Integritas Data | Harga dan total transaksi disimpan sebagai snapshot pada order. |
| Skalabilitas | Integrasi pembayaran dan pengiriman dibuat terpisah dari logika order utama; ekspedisi menggunakan provider abstraction. |
| Ketersediaan | Aplikasi berjalan dalam container Docker dengan restart policy otomatis, backup terjadwal, dan monitoring uptime. |
| Responsif | Website customer dan admin harus nyaman digunakan pada desktop, tablet, dan mobile. |
| Maintainability | Logika bisnis, akses database, dan tampilan dipisahkan secara terstruktur. |
| Audit | Aktivitas penting admin dan perubahan status order dapat ditelusuri melalui logging terstruktur. |
| Observability | Error di production dapat terdeteksi melalui error tracking (Sentry) dan log terstruktur (Pino). |
 
## 24. Persyaratan Keamanan
 
- Authentication dan authorization wajib dilakukan di sisi server.
- Role dan `reseller_status` harus divalidasi untuk setiap operasi yang relevan.
- Password tidak boleh disimpan dalam bentuk plaintext.
- Seluruh secret (Midtrans, database, email service) disimpan menggunakan environment variable, tidak masuk ke version control.
- Endpoint webhook pembayaran harus melakukan validasi keamanan yang sesuai.
- Semua input dari user harus divalidasi.
- Query database harus menggunakan mekanisme aman/parameterized melalui Drizzle ORM.
- Perubahan harga, stok, order, approval reseller, dan status klaim garansi dicatat dalam log.
- Data pribadi customer hanya dapat diakses oleh pihak yang berwenang.
- File `.env` pada production dibatasi aksesnya (permission ketat) dan tidak pernah di-commit ke Git.
## 25. ERD Final
 
Struktur data berikut menjadi acuan final untuk pembuatan schema Drizzle ORM dan migration database, dikelompokkan per modul.
 
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
| reseller_status | ENUM | NOT_RESELLER, PENDING, APPROVED, REJECTED |
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
 
### 25.2 Modul Katalog Produk
 
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
 
**product_variant** *(Digunakan untuk variasi produk, mis. warna.)*
 
| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| id | PK | |
| product_id | FK -> product | |
| sku | VARCHAR, UNIQUE | |
| variant_name | VARCHAR | mis. Merah, Biru |
| price_override | DECIMAL, NULLABLE | |
| reseller_price_override | DECIMAL, NULLABLE | |
| stock | INT | kuota/kapasitas produksi |
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
| code | VARCHAR | |
| is_active | BOOLEAN | |
| created_at / updated_at | TIMESTAMP | |
 
**order**
 
| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| id | PK | |
| user_id | FK -> user | |
| order_number | VARCHAR, UNIQUE | |
| address_id | FK -> user_address | |
| shipping_provider_id | FK -> shipping_provider | |
| shipping_service | VARCHAR | |
| shipping_cost | DECIMAL | |
| subtotal | DECIMAL | |
| discount_amount | DECIMAL | |
| total | DECIMAL | |
| voucher_id | FK -> voucher, NULLABLE | |
| status | ENUM | PENDING, PAID, PROCESSING, SHIPPED, DELIVERED, COMPLETED, CANCELLED, REFUNDED |
| tracking_number | VARCHAR, NULLABLE | |
| shipped_at / delivered_at | TIMESTAMP, NULLABLE | |
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
 
**payment** *(Terpisah dari order untuk menangani multiple percobaan pembayaran.)*
 
| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| id | PK | |
| order_id | FK -> order | |
| midtrans_transaction_id | VARCHAR | |
| payment_method | VARCHAR | |
| amount | DECIMAL | |
| status | ENUM | PENDING, PAID, FAILED, EXPIRED, REFUNDED |
| paid_at | TIMESTAMP, NULLABLE | |
| raw_response | JSON | payload webhook Midtrans |
| created_at / updated_at | TIMESTAMP | |
 
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
| description | TEXT | kronologi dari customer |
| status | ENUM | SUBMITTED, IN_REVIEW, RESOLVED, REJECTED |
| contact_method_used | VARCHAR, NULLABLE | |
| admin_notes | TEXT, NULLABLE | |
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
| user_id | FK -> user | |
| email_type | ENUM | RECEIPT, OTHER |
| recipient_email | VARCHAR | |
| status | ENUM | SENT, FAILED |
| sent_at | TIMESTAMP, NULLABLE | |
| created_at | TIMESTAMP | |
 
## 26. MVP dan Roadmap
 
| Tahap | Ruang Lingkup |
| --- | --- |
| MVP / Tahap 1 | Autentikasi, homepage, katalog, search/filter, detail produk, kategori, cart & cart_item, alamat, checkout, Midtrans, email receipt otomatis, struktur pengiriman/J&T, order management, stok sederhana (kuota), customer management, approval reseller, dan harga reseller. |
| Tahap 2 | Wishlist, voucher/promo, review, klaim garansi, laporan penjualan, dan dashboard admin yang lebih lengkap. |
| Tahap 3 | Multi-ekspedisi, reseller bertingkat, pembelian institusi/B2B lebih formal, pengiriman internasional, riwayat pergerakan stok yang lebih detail (stock movement log), analitik lanjutan, dan integrasi tambahan. |
 
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
- Middleware pengecekan role (customer/admin) dan reseller_status
- Uji login sebagai admin dan customer dummy
### Tahap 4 — Integrasi Eksternal
 
- MinIO — uji upload file dummy
- Midtrans — sandbox mode, uji transaksi hingga menerima webhook
- Redis + BullMQ — uji job sederhana berjalan di worker
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
| US-004 | Sebagai reseller, saya ingin mendapatkan harga khusus. | Jika reseller_status APPROVED, sistem menggunakan harga reseller pada transaksi. |
| US-005 | Sebagai admin, saya ingin menyetujui pengajuan reseller. | Saat admin menyetujui pengajuan PENDING, reseller_status menjadi APPROVED dan harga reseller tersedia. |
| US-006 | Sebagai admin, saya ingin mengelola stok agar ketersediaan produk akurat. | Stok berkurang setelah pembayaran berhasil dan tidak boleh menjadi negatif. |
| US-007 | Sebagai customer, saya ingin melihat status pesanan agar dapat mengetahui proses pengiriman. | Detail order menampilkan status dan informasi resi jika tersedia. |
| US-008 | Sebagai customer, saya ingin memberikan review setelah membeli produk. | Customer hanya dapat me-review produk yang memiliki order_item dengan status pembelian yang sah. |
| US-009 | Sebagai customer, saya ingin mengajukan klaim garansi atas produk yang bermasalah. | Customer dapat mengisi kronologi dan mengunggah foto/video; pengajuan tersimpan dengan status SUBMITTED. |
| US-010 | Sebagai admin, saya ingin menindaklanjuti klaim garansi. | Admin dapat mengubah status klaim dan mencatat metode kontak yang digunakan (WA/email). |
 
## 29. Metrik Keberhasilan
 
- Persentase checkout yang berhasil diselesaikan.
- Persentase pembayaran berhasil.
- Persentase order yang selesai.
- Nilai rata-rata transaksi (Average Order Value).
- Total revenue bulanan.
- Persentase pembelian ulang.
- Jumlah reseller aktif.
- Produk dan kategori terlaris.
- Persentase cart yang ditinggalkan.
- Frekuensi produk stok/kuota rendah atau habis.
- Waktu rata-rata penyelesaian klaim garansi.
- Tingkat keberhasilan pengiriman email receipt.
## 30. Pengembangan Masa Depan
 
- Penjualan internasional dan pengiriman lintas negara.
- Integrasi beberapa penyedia ekspedisi.
- Tingkatan harga reseller.
- Sistem pembelian khusus institusi/B2B yang lebih formal (termasuk invoice otomatis).
- Riwayat pergerakan stok yang lebih detail (stock movement log).
- Analitik penjualan lanjutan.
- Notifikasi WhatsApp.
- Metode pembayaran tambahan.
- Peningkatan observability (mis. Grafana Loki untuk log terpusat) seiring pertumbuhan skala sistem.
## 31. Catatan Pengembangan
 
PRD ini digunakan sebagai sumber kebenaran pada level produk. ERD pada Bab 25 telah diselaraskan dengan seluruh requirement yang telah disepakati. Tahap berikutnya adalah menentukan kontrak API, struktur route, aturan validasi, desain UI, dan acceptance test.
 
*Urutan pengembangan yang disarankan: PRD → User Flow → Business Rules → ERD Final → Setup Infrastruktur → API Specification → UI/UX → Development → Testing → Deployment.*
 
---
*RoboEdu — Dokumen Kebutuhan Produk*
 