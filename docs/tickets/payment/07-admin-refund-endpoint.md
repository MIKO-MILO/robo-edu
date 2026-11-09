# 07: POST /admin/orders/:id/refund + PATCH proof upload

**What to build:** Dua endpoint admin untuk memproses refund. POST /admin/orders/:id/refund (auth: admin): validasi total refund (amount baru + total refund sebelumnya) tidak melebihi payment.amount; jika payment_channel mendukung Refund API (kartu, gopay, shopeepay, qris, dana, ovo) → panggil Midtrans Refund API, simpan efund dengan method=MIDTRANS_API; jika tidak (bank_transfer/VA, alfamart, indomaret) → simpan efund dengan method=MANUAL, proof_url=null; jika estore_quota=true → kembalikan stok per order_item.quantity; catat ke udit_log; jika total semua refund order = payment.amount → set order.status=REFUNDED. PATCH /admin/orders/:id/refunds/:refundId/proof: upload file bukti transfer ke MinIO, update efund.proof_url. Hanya admin yang berwenang dapat memanggil kedua endpoint ini.

**Blocked by:** payment/05

**Status:** ready-for-agent

- [ ] Refund ditolak jika mount + existing_refunds_total > payment.amount dengan error REFUND_EXCEEDS_PAYMENT.
- [ ] Metode yang mendukung Refund API: Midtrans Refund API dipanggil; efund.method=MIDTRANS_API.
- [ ] Metode yang tidak mendukung (VA, toko): efund.method=MANUAL, proof_url=null (admin upload bukti terpisah).
- [ ] estore_quota=true: stok dikembalikan atomik per order_item; estore_quota=false: stok tidak berubah.
- [ ] Setiap refund dicatat di tabel efund dan udit_log.
- [ ] order.status=REFUNDED hanya jika total refund = payment.amount; refund sebagian tidak mengubah order status.
- [ ] PATCH .../proof: file diupload ke MinIO, efund.proof_url diperbarui; hanya bisa untuk refund dengan method=MANUAL.
- [ ] Endpoint hanya bisa dipanggil oleh admin; customer mendapat 403.
- [ ] Test: total refund melebihi payment ditolak; estore_quota=true mengembalikan stok; order REFUNDED hanya jika total = payment.
