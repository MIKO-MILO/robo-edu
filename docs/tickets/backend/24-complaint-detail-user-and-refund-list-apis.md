# 24: API Detail Komplain User & Daftar Refund Admin

**What to build:** Dua endpoint baru untuk mendukung halaman yang belum ada:

**API detail komplain user** — `GET /api/complaints/[complaintId]`: mengembalikan detail satu komplain milik user yang sedang login. Response berisi: status komplain, subjek, deskripsi, lampiran, nama produk, nomor order, tanggal pengajuan, dan history perubahan status (jika ada tabel audit/log untuk itu). Validasi kepemilikan: user hanya bisa mengakses komplain miliknya sendiri.

**API daftar komplain user** — `GET /api/complaints`: mengembalikan semua komplain milik user yang sedang login, diurutkan terbaru dulu. Dipakai untuk halaman list di profil.

**API daftar refund admin** — `GET /api/admin/refunds`: mengembalikan semua record refund lintas order dengan pagination. Setiap record berisi: ID refund, nomor order, nama customer, nominal, metode (MANUAL/MIDTRANS_API), status, tanggal. Filter opsional: status, tanggal. Hanya dapat diakses admin.

**API detail refund user** — `GET /api/orders/[id]/refund/[refundId]`: mengembalikan detail satu pengajuan refund milik user, termasuk status, nominal, metode, URL bukti transfer (jika ada), dan tanggal.

**Blocked by:** None (dapat dimulai segera)

**Status:** ready-for-agent

- [ ] `GET /api/complaints/[complaintId]` mengembalikan detail komplain milik user yang login; return 403 jika bukan miliknya.
- [x] `GET /api/complaints` mengembalikan daftar komplain milik user yang login.
- [ ] `GET /api/admin/refunds` mengembalikan daftar semua refund dengan pagination; hanya dapat diakses admin.
- [ ] `GET /api/orders/[id]/refund/[refundId]` mengembalikan detail refund; return 403 jika order bukan milik user.
- [ ] Semua endpoint mengembalikan 401 jika tidak ada sesi valid.
