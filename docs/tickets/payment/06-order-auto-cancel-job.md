# 06: BullMQ — order-auto-cancel + payment-reconcile jobs

**What to build:** Dua job baru di worker BullMQ (bergabung dengan worker yang sudah ada dari backend ticket 17). Job order-auto-cancel terjadwal setiap 5 menit: query order WHERE status=PENDING AND expires_at < NOW(); untuk setiap order yang ditemukan: batalkan percobaan PENDING yang tersisa di Midtrans via Cancel API; update semua payment PENDING → EXPIRED; kembalikan stok setiap order_item.quantity ke product_variant.stock secara atomik; set order.status=CANCELLED dan order.cancelled_at=NOW(). Job payment-reconcile dipicu per payment PENDING yang melewati expiry_time (delay job saat payment dibuat, dengan jeda +70 detik untuk OVO, +2 menit untuk metode lain): panggil Get Transaction Status Midtrans, sinkronisasi status ke payment. Pastikan kedua job idempoten: order yang sudah CANCELLED tidak di-proses lagi; payment yang sudah PAID tidak di-revert.

**Blocked by:** payment/05, ackend/17 (BullMQ worker sudah jalan)

**Status:** ready-for-agent

- [ ] Job order-auto-cancel berjalan setiap 5 menit; order PENDING yang expires_at < NOW() menjadi CANCELLED.
- [ ] Pembatalan membatalkan percobaan PENDING di Midtrans Cancel API sebelum update status DB.
- [ ] Stok dikembalikan atomik per order_item.
- [ ] Job idempoten: order yang sudah CANCELLED dilewati tanpa error.
- [ ] Job payment-reconcile memanggil Get Transaction Status Midtrans dan mensinkronkan status payment; OVO dijadwalkan +70 detik, metode lain +2 menit dari expiry_time.
- [ ] Test: seed order PENDING dengan expires_at di masa lalu, jalankan job, verifikasi order CANCELLED + stok kembali + payment PENDING → EXPIRED.
