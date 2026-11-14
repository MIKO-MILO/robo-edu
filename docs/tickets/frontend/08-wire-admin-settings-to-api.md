# 08: Wire admin settings page ke real API

**What to build:** Halaman `/admin/settings` memiliki empat tab (Identitas Toko, Pembayaran, Pengiriman, Umum) yang semuanya menggunakan nilai hardcode dan tombol "Simpan" yang hanya memanggil `setTimeout` tanpa mengirim data ke manapun. Backend `GET /api/admin/settings` dan `PATCH /api/admin/settings` sudah tersedia (backend ticket 11). Ticket ini menghubungkan setiap tab ke API nyata.

**Blocked by:** None (backend API sudah ada)

**Status:** ready-for-agent

- [ ] Semua tab settings melakukan `GET /api/admin/settings` saat mount dan mengisi form dengan nilai dari DB — bukan nilai hardcode.
- [ ] Tab Identitas Toko: submit memanggil `PATCH /api/admin/settings` dengan keys yang relevan (nama toko, tagline, alamat, kontak, email, sosial media); menampilkan toast sukses atau error.
- [ ] Tab Pembayaran: menampilkan konfigurasi Midtrans dan toggle aktif/nonaktif per channel pembayaran dari `payment_methods_config`; submit persist ke DB via `PATCH /api/admin/settings`.
- [ ] Tab Pengiriman: provider list fetch dari `GET /api/admin/settings` (key `shipping_default_provider_id`) dan `GET /api/shipping-providers`; perubahan provider default disimpan ke DB.
- [ ] Tab Umum: `order_expires_hours` dan setting lain diambil dari DB dan disimpan kembali ke DB saat submit.
- [ ] Tombol "Simpan" dinonaktifkan selama request berlangsung; menampilkan loading state.
- [ ] Perubahan `membership_plus_price` dan `membership_plus_duration_months` di Tab Pembayaran/Umum langsung tercermin di halaman konfirmasi membership tanpa restart.
