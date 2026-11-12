# 03: POST /checkout — Core API, reservasi kuota atomik, payment_instruction

**What to build:** Endpoint checkout (POST /api/checkout) diubah total dari Snap ke Midtrans Core API. Customer mengirim payment_method, payment_channel, dan opsional payer_phone_number (wajib untuk OVO) di body request. Proses server-side (urutan atomik dan tidak boleh dipecah): (1) validasi stok setiap item dengan UPDATE product_variant SET stock = stock - qty WHERE stock >= qty — jika satu saja gagal, semua dikembalikan dan tolak dengan STOCK_INSUFFICIENT; (2) validasi maks 3 order PENDING milik user — tolak dengan PENDING_ORDER_LIMIT jika sudah 3; (3) buat order dengan expires_at = NOW() + order_expires_hours dari settings; (4) insert shipment status PENDING; (5) charge Midtrans Core API sesuai payment_method/payment_channel — midtrans_order_id = {order_number}-1; (6) simpan payment (attempt_number=1) dengan payment_instruction dari response Midtrans dan expiry_time yang tidak melewati order.expires_at; jika charge gagal: kembalikan kuota, set payment FAILED, kembalikan 422 PAYMENT_CHARGE_FAILED. Response 201 menyertakan payment.payment_instruction dan payment.expiry_time. Route lama POST /api/checkout/midtrans dipertahankan sebagai alias sementara yang meneruskan ke handler baru. Header Idempotency-Key wajib.

**Blocked by:** payment/01, payment/02, ackend/06 (checkout + shipment insert existing)

**Status:** done

- [x] Body request mencakup payment_method, payment_channel, payer_phone_number (wajib OVO); field lama (ddressId, shippingCost, oucherCode) tetap ada.
- [x] Reservasi stok dilakukan atomik (UPDATE ... WHERE stock >= qty); jika stok tidak cukup untuk salah satu item, seluruh order ditolak tanpa order yang terbuat.
- [x] Maks 3 order PENDING per user ditegakkan; ke-4 ditolak PENDING_ORDER_LIMIT.
- [x] order.expires_at diisi dari settings.order_expires_hours; tidak hardcode.
- [x] payment.midtrans_order_id = {order_number}-1 (percobaan pertama).
- [x] payment.payment_instruction diisi dari response Midtrans Core API dan disimpan di DB.
- [x] Jika charge Midtrans gagal: kuota dikembalikan, tidak ada order tersimpan, error PAYMENT_CHARGE_FAILED.
- [x] Route alias POST /api/checkout/midtrans masih bisa dipanggil (forward ke handler baru).
- [x] Idempotency-Key yang sama pada request kedua mengembalikan response pertama (idempoten).
- [x] Test: (a) stok berkurang atomik saat order dibuat, bukan saat PAID; (b) stok tidak berubah jika Midtrans charge gagal; (c) user ke-4 PENDING ditolak.
