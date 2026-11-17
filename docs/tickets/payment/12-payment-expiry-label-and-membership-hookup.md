# 12: Masa Berlaku Pembayaran — rename label UI + hubungkan membership ke setting

**What to build:** Saat ini halaman Kelola Pembayaran menampilkan label "Masa Berlaku Order" yang ambigu, dan membership checkout menggunakan nilai hardcode 24 jam bukan membaca setting dari database. Ticket ini memperbaiki keduanya: rename label UI agar jelas berlaku untuk semua transaksi, dan ubah service membership agar membaca `order_expires_hours` dari database saat membuat transaksi membership — sama persis dengan yang sudah dilakukan order produk.

**Blocked by:** None (dapat dimulai segera)

**Status:** ready-for-agent

- [ ] Label section di halaman Kelola Pembayaran berubah dari "Masa Berlaku Order" menjadi "Masa Berlaku Pembayaran".
- [ ] Deskripsi di bawah label menjelaskan bahwa setting berlaku untuk semua transaksi: pembelian produk maupun membership.
- [ ] Membership transaction service membaca `order_expires_hours` dari database saat menghitung `expires_at` transaksi membership — bukan lagi nilai hardcode 24 jam.
- [ ] Fallback tetap 24 jam jika key `order_expires_hours` tidak ada di database.
- [ ] Tidak ada perubahan pada nama key database, nama field di SETTING_SPECS, atau skema tabel.
