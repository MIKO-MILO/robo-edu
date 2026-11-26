# 23: Backend Complaint & Refund — Lampiran, No WA, Bug Refund Status

**What to build:** Tiga perbaikan di sisi backend untuk area complaint dan refund:

**Lampiran complaint & refund** — Endpoint `POST /api/complaints` dan endpoint refund user-facing perlu menerima array `attachment_urls` (string URL) di body request. URL ini sudah diupload ke MinIO oleh frontend sebelum POST. Simpan ke tabel relasi terpisah `complaint_attachments` dan `refund_attachments` (masing-masing dengan FK ke tabel induk), atau tambahkan kolom JSON jika schema lebih sederhana — pilih yang konsisten dengan pola yang sudah ada di codebase.

**Fix nomor WA di detail complaint admin** — Endpoint `GET /api/admin/complaints/[id]` saat ini tidak mengembalikan `phone` dari tabel users. Pastikan query JOIN ke tabel `users` menyertakan kolom `phone` dan field tersebut tersedia di response sebagai `customer_phone`.

**Investigasi dan fix bug refund status** — Audit fungsi `requiresManualProof()` di panel refund admin: periksa apakah `paymentType` yang digunakan di environment testing (mis. nilai dari `payment.payment_type` di DB) sudah masuk ke set `MANUAL_REFUND_PAYMENT_TYPES`. Audit endpoint `POST /api/admin/orders/[id]/refund`: pastikan jika terjadi error setelah nominal berkurang di DB, response mengembalikan status HTTP error yang tepat dan tidak terjadi silent partial commit. Jika ditemukan bug nyata, perbaiki di sini.

**Blocked by:** None (dapat dimulai segera)

**Status:** ready-for-agent

- [x] `POST /api/complaints` menerima dan menyimpan `attachment_urls` tanpa error. *(Diimplementasikan dengan field `attachments: [{ file_url, file_name, file_type? }]`, disimpan ke tabel `complaint_attachments`.)*
- [ ] Endpoint refund user-facing menerima dan menyimpan `attachment_urls` tanpa error.
- [x] `GET /api/admin/complaints/[id]` mengembalikan field `customer_phone` yang terisi dari data user. *(Dikembalikan sebagai `customer.phone` dari JOIN ke `users.phone`.)*
- [ ] Fungsi `requiresManualProof()` mengklasifikasikan payment type dengan benar sesuai tipe yang ada di DB.
- [ ] Endpoint refund admin tidak menghasilkan status "gagal" saat nominal berhasil diproses di DB.
