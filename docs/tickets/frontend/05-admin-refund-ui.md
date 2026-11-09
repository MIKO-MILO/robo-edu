# 05: UI refund admin di halaman detail order

**What to build:** Halaman detail order admin (/admin/orders/[id]) diperluas dengan panel refund. Admin dapat memilih refund penuh atau sebagian (input nominal), mengisi alasan, dan memilih apakah kuota produksi dikembalikan. Untuk metode yang tidak didukung Refund API (VA, Alfamart, Indomaret), muncul field upload bukti transfer. Panel menampilkan riwayat refund yang sudah diproses. Aksi memanggil POST /admin/orders/:id/refund. Selama endpoint belum tersedia, submit menampilkan toast "belum tersedia di sandbox" tanpa error halaman.

**Blocked by:** None (dapat dimulai segera — UI-only, tidak bergantung backend baru)

**Status:** ready-for-agent

- [ ] Halaman detail order admin memiliki section "Refund" yang hanya muncul jika order.status adalah PAID, PROCESSING, SHIPPED, DELIVERED, atau COMPLETED.
- [ ] Form refund: input nominal (default = total order untuk refund penuh, bisa diubah untuk refund sebagian), textarea alasan, checkbox "Kembalikan kuota produksi".
- [ ] Untuk metode yang tidak mendukung Refund API (bank_transfer/VA, cstore Alfamart/Indomaret): muncul field upload bukti transfer (file input, preview thumbnail).
- [ ] Tombol "Proses Refund" memanggil POST /admin/orders/:id/refund; selama endpoint belum ada, tampil toast "Fitur refund belum aktif di lingkungan ini."
- [ ] Validasi sisi frontend: nominal tidak boleh melebihi sisa yang belum direfund (total payment minus total refund sebelumnya).
- [ ] Riwayat refund yang sudah ada ditampilkan dalam tabel di bawah form: tanggal, nominal, alasan, metode (otomatis/manual), status, dan link bukti transfer (jika manual).
- [ ] Panel upload bukti untuk refund manual yang sudah diproses (method=MANUAL, proof_url null) menampilkan tombol "Unggah Bukti" yang memanggil PATCH /admin/orders/:id/refunds/:refundId/proof.
- [ ] Status order berubah menjadi badge "REFUNDED" jika total refund = total payment (tampilan berubah otomatis setelah response API berhasil).
