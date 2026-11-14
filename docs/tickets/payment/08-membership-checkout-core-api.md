# 08: Membership checkout Core API (menggantikan Snap di backend/04)

**What to build:** Update POST /api/checkout/membership dari backend ticket 04 (yang sekarang menggunakan Snap) ke Midtrans Core API, mengikuti pola yang sama dengan ticket payment/03. Customer mengirim payment_method, payment_channel, opsional payer_phone_number. Proses: baca harga dan durasi dari settings; validasi satu user hanya boleh punya satu membership_purchase PENDING — jika sudah ada, kembalikan data purchase yang pending (bukan buat baru); buat membership_purchase (status PENDING) + payment (attempt_number=1); charge Midtrans Core API dengan midtrans_order_id = {purchase_number}-1; simpan payment_instruction. Retry menggunakan POST /membership-purchases/:id/payment/retry (analog dengan order retry dari ticket payment/04). Pembelian yang tidak ada percobaan PENDING lagi (semua FAILED/EXPIRED) menjadi EXPIRED — customer mulai baru. Webhook di ticket payment/05 sudah menangani sisi MBR-; ticket ini fokus pada sisi create.

**Blocked by:** payment/04, payment/05, ackend/01, ackend/04, ackend/11

**Status:** done (implemented via ticket payment/10)

- [x] POST /checkout/membership mengembalikan payment_instruction dan expiry_time (bukan snap_token).
- [x] Jika user sudah punya membership_purchase PENDING, endpoint mengembalikan data purchase yang ada (409 dengan body berisi purchase_id) — tidak membuat duplikat.
- [x] midtrans_order_id = {purchase_number}-1 untuk percobaan pertama.
- [x] Charge gagal: membership_purchase dan payment dibuat tapi FAILED — user dapat retry.
- [x] POST /membership-purchases/:id/payment/retry berfungsi analog dengan order retry (ticket payment/04): cancel lama, charge baru.
- [x] Pembelian tanpa percobaan PENDING aktif ditandai EXPIRED; GET /membership/me mencerminkan ini.
- [x] Voucher tidak diterima di endpoint ini (validasi server-side, tolak dengan error jika dikirim).
- [ ] Test: satu user satu PENDING membership ditegakkan; retry membership idempoten.

<!-- vers lengkap di ticket 10 -->