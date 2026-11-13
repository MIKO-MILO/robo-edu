# 10: Migrasi membership checkout ke Core API

**What to build:** `POST /api/checkout/membership` saat ini masih memanggil Midtrans Snap dan mengembalikan `snap_token`. Ticket ini menggantinya ke Midtrans Core API mengikuti pola yang sama dengan checkout order (payment/03). Customer mengirim `payment_method`, `payment_channel`, dan opsional `payer_phone_number` (wajib OVO) di body. Server memanggil `chargeCoreApi()`, menyimpan `payment_instruction` ke kolom `payments.paymentInstruction`, dan mengembalikan instruksi bayar asli. Juga dibuat `POST /api/membership-purchases/:id/payment/retry` untuk ganti metode / coba ulang — analog dengan `POST /api/orders/:id/payment/retry`. Setelah ticket ini selesai, halaman `/membership/payment/[purchaseId]` (yang sudah ada) menampilkan VA / QR asli dari Midtrans, dan webhook yang sudah ada (lookup by `midtrans_order_id`) langsung menangani aktivasi membership tanpa perubahan tambahan.

**Blocked by:** None (dapat dimulai segera)

**Status:** ready-for-agent

- [ ] `membership-transaction-service.ts` menerima `paymentMethod`, `paymentChannel`, `payerPhoneNumber` sebagai input; memanggil `chargeCoreApi()` menggantikan `getSnapClient()` + `snap.createTransaction()`.
- [ ] `payment.paymentInstruction` diisi dari response `chargeCoreApi()`, bukan disimpan di `rawResponse`.
- [ ] `payment.midtransOrderId` = `{purchaseNumber}-1` untuk percobaan pertama (konsisten dengan pola order).
- [ ] Jika user sudah punya `membership_purchase` PENDING → endpoint mengembalikan 409 dengan body `{ code: "PENDING_PURCHASE_EXISTS", purchase_id, purchase_number }` — tidak membuat duplikat.
- [ ] Jika charge Midtrans gagal → `membership_purchase` dan `payment` tetap terbuat dengan status `FAILED`; response 422 `PAYMENT_CHARGE_FAILED`.
- [ ] Response berubah dari `{ snap_token, redirect_url }` menjadi `{ purchase_id, purchase_number, payment_instruction, expiry_time, status }`.
- [ ] `POST /api/membership-purchases/:id/payment/retry` dibuat: validasi purchase PENDING dan belum expired; batalkan attempt PENDING lama via `cancelCoreApi()`; charge ulang dengan `midtransOrderId = {purchaseNumber}-{N+1}`; simpan attempt baru; idempoten via `Idempotency-Key` header.
- [ ] Halaman `/membership/payment/[purchaseId]` (konteks `"membership"`) fetch ke `GET /api/orders/:id/payment` — sesuaikan `payment-instruction-page.tsx` untuk konteks membership agar gunakan endpoint yang benar (bisa `GET /api/membership-purchases/:id/payment` atau route yang sudah ada, sesuai implementasi).
- [ ] `POST /api/membership/payment/check/:id` dibuat: analog dengan `POST /api/orders/:id/payment/check` — panggil Midtrans status, sync ke DB, return status terbaru.
