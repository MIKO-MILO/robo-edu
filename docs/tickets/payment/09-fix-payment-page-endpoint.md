# 09: Fix payment page — fetch dari endpoint Core API yang benar + POST /orders/:id/payment/check

**What to build:** Halaman pembayaran `/payment/[orderId]` saat ini fetch data ke `GET /api/orders/:id/payment-info` (endpoint lama era Snap) sehingga `payment_instruction` selalu `null` dan instruksi pembayaran yang tampil adalah mock hardcode. Ticket ini mengganti fetch ke `GET /api/orders/:id/payment` (endpoint baru Core API) agar VA number, QR code, dan instruksi pembayaran asli dari Midtrans ditampilkan. Sekaligus membuat endpoint `POST /api/orders/:id/payment/check` yang sudah dipanggil oleh tombol "Cek Status Pembayaran" di UI tapi belum ada handler-nya — endpoint ini memanggil Midtrans `GET /v2/{midtrans_order_id}/status`, mensinkronkan status ke DB, dan mengembalikan status terbaru. Setelah ticket ini selesai, seluruh flow order end-to-end (checkout → instruksi bayar asli → webhook atau manual check → status update) berfungsi penuh.

**Blocked by:** None (dapat dimulai segera)

**Status:** ready-for-agent

- [ ] `payment-instruction-page.tsx` untuk konteks `"order"` fetch ke `GET /api/orders/:id/payment` bukan `/payment-info`; response shape keduanya kompatibel (field `order`, `payment`, `payment_instruction` sama).
- [ ] `POST /api/orders/:id/payment/check` dibuat: auth hanya pemilik order; panggil `coreApi.transaction.status(midtrans_order_id)` untuk attempt PENDING terakhir; jalankan pemetaan status yang sama dengan webhook (settlement/capture+accept → PAID, deny/cancel/failure → FAILED, expire → EXPIRED); update `payments` dan `orders` di DB; return `{ status, payment_instruction, expiry_time }`.
- [ ] Jika order tidak ditemukan atau bukan milik user → 404.
- [ ] Jika tidak ada attempt PENDING (sudah PAID/FAILED/EXPIRED) → return status saat ini tanpa memanggil Midtrans.
- [ ] Tombol "Cek Status Pembayaran" di halaman payment berfungsi dan memperbarui UI tanpa reload halaman.
- [ ] Polling otomatis (`/api/orders/:id/payment`) berhenti saat status terminal (PAID / FAILED / EXPIRED) tercapai.
