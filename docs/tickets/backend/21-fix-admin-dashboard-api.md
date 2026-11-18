# 21: Perbaiki API Dashboard Admin — field name, top products, low stock

**What to build:** Halaman dashboard admin menampilkan data kosong karena dua masalah: nama field di respons API tidak cocok dengan yang diharapkan UI (`total_revenue` vs `revenue_this_month`, `total_orders_all_time` vs `total_orders`), dan API sama sekali tidak mengembalikan `top_products` maupun `low_stock_products`. Ticket ini memperbaiki API dan UI secara bersamaan (keduanya harus selaras dalam satu implementasi karena perubahan nama field bersifat breaking).

**Yang diubah di API:**
- `revenue_this_month`: SUM `total` dari order dengan `paid_at` dalam kalender bulan ini (menggantikan `total_revenue` yang menghitung semua waktu)
- `total_orders`: COUNT semua order (menggantikan `total_orders_all_time`)
- `revenue_trend_percentage`: perbandingan persentase revenue bulan ini vs bulan lalu (null jika bulan lalu = 0)
- `top_products`: hingga 5 produk dengan total quantity terjual terbanyak dari order yang sudah dibayar bulan ini, disertai nama produk dan angka total terjual
- `low_stock_products`: product variants dengan stok di bawah batas (threshold default 5), limit 10, disertai nama produk dan nama variant

**Blocked by:** None (dapat dimulai segera)

**Status:** done

- [x] `GET /api/admin/dashboard` mengembalikan field `revenue_this_month` berisi total revenue dari order berbayar bulan ini.
- [x] Response mengembalikan field `total_orders` berisi COUNT semua order.
- [x] Response mengembalikan field `revenue_trend_percentage` (angka atau null).
- [x] Response mengembalikan array `top_products` dengan hingga 5 item, masing-masing berisi `product_id`, `name`, `total_sold`.
- [x] Response mengembalikan array `low_stock_products` dengan hingga 10 item, masing-masing berisi `product_id`, `name`, `variant_id` (opsional), `variant_name` (opsional), `stock`.
- [x] Kartu "Total Revenue" di halaman dashboard admin menampilkan angka nyata dari database.
- [x] Kartu "Jumlah Pesanan" menampilkan angka nyata dari database.
- [x] Panel "Produk Terlaris" menampilkan data produk nyata (bukan empty state) jika ada data penjualan bulan ini.
- [x] Panel "Stok Menipis" menampilkan data variant nyata (bukan empty state) jika ada stok yang rendah.
