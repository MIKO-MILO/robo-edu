# 14: Fix admin customers — tombol export CSV yang benar-benar download file

**What to build:** Halaman `/admin/customers` memiliki tombol "Export CSV" yang saat ini hanya menampilkan `alert("Data pelanggan berhasil diunduh sebagai file CSV.")` tanpa menghasilkan atau mendownload file apapun. Ticket ini menggantinya dengan export yang nyata.

**Blocked by:** None

**Status:** ready-for-agent

- [ ] Tombol "Export CSV" mengambil semua data pelanggan yang sesuai filter aktif saat ini (search query, reseller filter, status filter) dari `GET /api/admin/users` tanpa pagination (atau dengan limit besar).
- [ ] Data dikonversi ke format CSV di client-side: kolom minimal mencakup Nama, Email, Telepon, Status, Membership Status, Tanggal Daftar.
- [ ] File didownload otomatis dengan nama `pelanggan-roboedu-{tanggal}.csv`.
- [ ] Tombol menampilkan loading state selama fetch berlangsung dan tidak bisa ditekan ganda.
- [ ] Jika data kosong (tidak ada pelanggan yang cocok filter), tombol tetap berfungsi dan menghasilkan file CSV dengan hanya header kolom.
