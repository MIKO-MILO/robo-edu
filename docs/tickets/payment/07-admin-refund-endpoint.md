# 07: POST /admin/orders/:id/refund + PATCH proof upload

**What to build:** Dua endpoint admin untuk memproses refund. POST /admin/orders/:id/refund (auth: admin): validasi total refund (amount baru + total refund sebelumnya) tidak melebihi payment.amount; jika payment_channel mendukung Refund API (kartu, gopay, shopeepay, qris, dana, ovo) → panggil Midtrans Refund API, simpan refund dengan method=MIDTRANS_API; jika tidak (bank_transfer/VA, alfamart, indomaret) → simpan refund dengan method=MANUAL, proof_url=null; jika restore_quota=true → kembalikan stok per order_item.quantity; catat ke audit_log; jika total semua refund order = payment.amount → set order.status=REFUNDED. PATCH /admin/orders/:id/refunds/:refundId/proof: upload file bukti transfer ke MinIO, update refund.proof_url. Hanya admin yang berwenang dapat memanggil kedua endpoint ini.

**Blocked by:** payment/05

**Status:** done

- [x] Refund ditolak jika amount + existing_refunds_total > payment.amount dengan error REFUND_EXCEEDS_PAYMENT.
- [x] Metode yang mendukung Refund API: Midtrans Refund API dipanggil; refund.method=MIDTRANS_API.
- [x] Metode yang tidak mendukung (VA, toko): refund.method=MANUAL, proof_url=null (admin upload bukti terpisah).
- [x] restore_quota=true: stok dikembalikan atomik per order_item; restore_quota=false: stok tidak berubah.
- [x] Setiap refund dicatat di tabel refund dan audit_log.
- [x] order.status=REFUNDED hanya jika total refund = payment.amount; refund sebagian tidak mengubah order status.
- [x] PATCH .../proof: file diupload ke MinIO, refund.proof_url diperbarui; hanya bisa untuk refund dengan method=MANUAL.
- [x] Endpoint hanya bisa dipanggil oleh admin; customer mendapat 403.
- [x] Test: total refund melebihi payment ditolak; restore_quota=true mengembalikan stok; order REFUNDED hanya jika total = payment.
