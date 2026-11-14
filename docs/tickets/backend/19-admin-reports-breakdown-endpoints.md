# 19: Endpoint breakdown laporan — metode pembayaran, status pesanan, kategori penjualan

**What to build:** Halaman `/admin/reports` sudah fetch data chart penjualan dan top produk dari API nyata, tetapi tiga section masih menggunakan data hardcode: breakdown metode pembayaran (QRIS 42%, Transfer Bank 35%, dll), breakdown status pesanan (Completed 85%, dll), dan breakdown penjualan per kategori. KPI `growth_percentage` dan `repeat_customer_rate` juga konstanta statis. Ticket ini membuat tiga endpoint baru yang dihitung dari data transaksi nyata di DB.

**Blocked by:** None (dapat dimulai segera)

**Status:** ready-for-agent

- [ ] `GET /api/admin/reports/payment-methods` mengembalikan breakdown jumlah transaksi dan revenue per `payment_type` / `payment_channel` untuk range tanggal yang diberikan; hanya order dengan `paid_at IS NOT NULL` yang dihitung.
- [ ] `GET /api/admin/reports/order-status` mengembalikan count dan total amount per status order (`PENDING`, `PAID`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `COMPLETED`, `CANCELLED`, `REFUNDED`) untuk range tanggal yang diberikan.
- [ ] `GET /api/admin/reports/category-sales` mengembalikan total unit terjual dan revenue per kategori produk (join `order_items` → `products` → `categories`) untuk range tanggal yang diberikan; hanya dari order yang sudah PAID.
- [ ] Ketiga endpoint mendukung query params `start_date` dan `end_date`; default ke bulan berjalan jika tidak disertakan.
- [ ] Ketiga endpoint dilindungi `requireAdmin`.
- [ ] `growth_percentage` dihitung sebagai persentase perubahan revenue periode ini vs periode sebelumnya yang setara (mis. bulan ini vs bulan lalu); endpoint `GET /api/admin/reports/sales` diperluas untuk menyertakan field ini.
- [ ] Halaman `/admin/reports` mengganti array hardcode dengan data dari ketiga endpoint baru; loading state ditampilkan selama fetch.
