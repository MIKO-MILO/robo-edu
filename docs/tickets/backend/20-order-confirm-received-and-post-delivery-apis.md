# 20: Konfirmasi Penerimaan Order — endpoint, perketat review API, refund user endpoint, cron auto-confirm

**What to build:** Backend saat ini tidak memiliki cara bagi user untuk mengkonfirmasi penerimaan paket, API review menerima status yang terlalu longgar, dan belum ada endpoint refund yang bisa dipanggil user. Ticket ini membangun seluruh lapisan backend yang dibutuhkan sebelum UI post-delivery dapat dibuat.

Empat hal yang dibangun dalam satu ticket ini karena semuanya berkaitan dengan transisi status DELIVERED → COMPLETED dan gating fitur post-delivery:

1. **Endpoint konfirmasi penerimaan** — `POST /api/orders/[id]/confirm-received`: user-facing, harus login, order harus milik user, status harus `DELIVERED`. Mengubah status ke `COMPLETED` dan mengisi `completed_at`. Idempoten: jika sudah `COMPLETED`, kembalikan 200 tanpa error.

2. **Perketat API review** — `POST /api/reviews`: ubah validasi status order dari `DELIVERED | COMPLETED` menjadi hanya `COMPLETED`. Pembeli harus mengkonfirmasi penerimaan sebelum dapat menulis ulasan.

3. **Endpoint refund user-facing** — buat endpoint yang dapat dipanggil user untuk mengajukan pengembalian barang. Menerima order dengan status `DELIVERED` atau `COMPLETED`. Endpoint ini menjadi target submit dari form pengembalian di frontend.

4. **Cron auto-confirm** — fungsi `runOrderAutoConfirm` yang melakukan sweep harian: semua order berstatus `DELIVERED` dengan `delivered_at` lebih dari 3 hari lalu secara otomatis diubah ke `COMPLETED` dan diisi `completed_at`. Daftarkan di worker scheduler mengikuti pola cron yang sudah ada (harian, jam 02:00 WIB). Fungsi ini idempoten.

**Blocked by:** None (dapat dimulai segera)

**Status:** ready-for-agent

- [ ] `POST /api/orders/[id]/confirm-received` tersedia, mengubah status DELIVERED → COMPLETED, mengisi `completed_at`, dan idempoten untuk status yang sudah COMPLETED.
- [ ] `POST /api/reviews` menolak order berstatus `DELIVERED` dengan pesan error yang jelas; hanya menerima `COMPLETED`.
- [ ] Endpoint refund user-facing tersedia dan menerima order berstatus `DELIVERED` atau `COMPLETED`.
- [ ] Fungsi `runOrderAutoConfirm` tersedia di layer cron, mengubah order DELIVERED yang sudah > 3 hari ke COMPLETED secara idempoten.
- [ ] Cron auto-confirm terdaftar di worker dan berjalan harian.
- [ ] API `POST /api/complaints` tidak diubah — sudah benar menerima `DELIVERED`.
