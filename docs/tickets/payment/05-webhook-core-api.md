# 05: Webhook Core API — multi-attempt, idempotensi, fraud, order CANCELLED

**What to build:** Webhook handler POST /payments/midtrans/webhook diubah total untuk mendukung multi-attempt dan semua skenario Core API. Identifikasi jenis transaksi dari midtrans_order_id (prefix RE- = order, MBR- = membership). Lookup payment berdasarkan midtrans_order_id (bukan order_number seperti sebelumnya). Pemetaan status: settlement atau capture + fraud_status=accept → PAID idempoten; capture + fraud_status=challenge → tahan PENDING, kirim alert admin (Sentry); deny/cancel/failure → FAILED; expire → EXPIRED; efund → REFUNDED. Skenario khusus: jika webhook PAID untuk order yang sudah CANCELLED → set payment.status=PAID, pertahankan order.status=CANCELLED, kirim alert Sentry dengan detail untuk refund manual; chargeback → catat ke udit_log, kirim alert Sentry, tidak ubah order. Semua efek samping idempoten: cek apakah payment dengan midtrans_order_id ini sudah pernah diproses ke status final sebelum melakukan update. Validasi signature Midtrans wajib.

**Blocked by:** payment/01, payment/03

**Status:** ready-for-agent

- [ ] Lookup payment berdasarkan midtrans_order_id; bukan berdasarkan order_number.
- [ ] settlement dan capture+accept → payment.status=PAID; jika order masih PENDING → order.status=PAID; email receipt di-enqueue ke BullMQ.
- [ ] capture+challenge → payment tetap PENDING; alert dikirim ke admin (mock Sentry di test).
- [ ] deny/cancel/failure → payment.status=FAILED.
- [ ] expire → payment.status=EXPIRED.
- [ ] Webhook PAID untuk order.status=CANCELLED → payment PAID, order tetap CANCELLED, alert Sentry dengan pesan refund manual.
- [ ] Chargeback (	ransaction_status=chargeback) → catat udit_log, alert Sentry, order tidak berubah.
- [ ] Notifikasi yang sama (sama midtrans_order_id + sama status final) dikirim dua kali → tidak ada double update, tidak ada double email, response tetap 200.
- [ ] Signature Midtrans yang tidak valid → 401, dicatat di log.
- [ ] Test: idempotensi (notifikasi settlement dua kali → email terkirim sekali), webhook PAID untuk order CANCELLED, fraud challenge, chargeback.
