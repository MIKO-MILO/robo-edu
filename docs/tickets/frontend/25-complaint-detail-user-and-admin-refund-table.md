# 25: Halaman Detail Komplain User + Tabel Refund Admin + Detail Refund User

**What to build:** Tiga halaman baru untuk melengkapi alur komplain dan refund:

**Detail komplain user** — Halaman `/profile/orders/[id]/complaint/[complaintId]` yang menampilkan detail satu komplain: status (dengan badge warna), subjek, deskripsi lengkap, lampiran (gallery foto/link dokumen), nama produk, tanggal pengajuan. Jika ada history perubahan status, tampilkan sebagai timeline kecil. Halaman ini dapat diakses dari halaman detail order atau dari daftar komplain di profil. Tambahkan pula halaman daftar komplain di profil user: `/profile/complaints` yang menampilkan semua komplain dengan status dan link ke detail masing-masing. Tambahkan link "Komplain Saya" ke menu navigasi profil.

**Tabel refund admin** — Halaman `/admin/refunds` menampilkan tabel semua pengajuan refund lintas order. Kolom: Nomor Order, Customer, Nominal, Metode (badge Otomatis/Manual), Status (badge), Tanggal. Setiap baris memiliki link ke halaman detail order terkait. Sertakan filter status dan pagination.

**Detail refund user** — Halaman `/profile/orders/[id]/refund/[refundId]` yang menampilkan status refund, nominal, metode pembayaran, tanggal pengajuan, dan URL bukti transfer jika tersedia. Dapat diakses dari halaman detail order.

**Blocked by:** 24-complaint-detail-user-and-refund-list-apis (semua endpoint harus tersedia sebelum halaman bisa dibangun)

**Status:** ready-for-agent

- [ ] Halaman `/profile/orders/[id]/complaint/[complaintId]` menampilkan detail komplain dengan semua field yang relevan.
- [ ] Halaman `/profile/complaints` menampilkan daftar komplain milik user yang login.
- [ ] Link "Komplain Saya" tersedia di navigasi profil user.
- [ ] Halaman `/admin/refunds` menampilkan tabel semua refund dengan pagination dan filter status.
- [ ] Setiap baris tabel refund admin memiliki link ke detail order terkait.
- [ ] Halaman `/profile/orders/[id]/refund/[refundId]` menampilkan status dan detail refund user.
- [ ] Semua halaman baru menggunakan desain yang konsisten dengan sistem desain yang sudah ada.
