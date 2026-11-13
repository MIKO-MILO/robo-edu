# 04: POST /orders/:id/payment/retry + GET /orders/:id/payment (diperluas)

**What to build:** Dua endpoint untuk mendukung ganti metode dan coba ulang dari halaman pembayaran. POST /orders/:id/payment/retry (wajib Idempotency-Key): validasi order masih PENDING dan expires_at belum lewat; validasi belum mencapai 5 percobaan; batalkan percobaan PENDING yang ada via Midtrans Cancel API; tandai percobaan lama FAILED; charge Midtrans dengan midtrans_order_id baru ({order_number}-{attempt_number}); simpan percobaan baru dengan payment_instruction dan expiry_time yang tidak melewati sisa order.expires_at. Jika order sudah PAID: 409 ORDER_ALREADY_PAID. GET /orders/:id/payment (diperluas): mengembalikan percobaan terakhir yang aktif (PENDING) atau percobaan final terakhir (PAID/FAILED/EXPIRED), bersama payment_instruction dan order.expires_at — dipakai halaman pembayaran untuk polling.

**Blocked by:** payment/03

**Status:** done

- [x] POST /orders/:id/payment/retry membatalkan percobaan PENDING lama di Midtrans (Cancel API) sebelum membuat charge baru.
- [x] midtrans_order_id percobaan baru selalu unik (berbeda dari semua percobaan sebelumnya).
- [x] Percobaan ke-6 ditolak dengan error MAX_ATTEMPTS_REACHED.
- [x] Order yang sudah melewati expires_at mengembalikan 409 ORDER_EXPIRED.
- [x] GET /orders/:id/payment mengembalikan payment_instruction, payment_channel, expiry_time, status, dan order.expires_at.
- [x] Idempotency-Key yang sama pada retry request kedua mengembalikan percobaan yang sudah dibuat (idempoten, tidak double-charge).
- [x] Test: percobaan ke-6 ditolak; percobaan PENDING sebelumnya berstatus FAILED setelah retry berhasil; midtrans_order_id unik di setiap percobaan.
