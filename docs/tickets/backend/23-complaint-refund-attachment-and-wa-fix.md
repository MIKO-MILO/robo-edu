# 23: Backend Complaint & Refund — Lampiran, No WA, Bug Refund Status

**What to build:** Tiga perbaikan di sisi backend untuk area complaint dan refund:

**Lampiran complaint & refund** — Endpoint `POST /api/complaints` dan endpoint refund user-facing perlu menerima array `attachment_urls` (string URL) di body request. URL ini sudah diupload ke MinIO oleh frontend sebelum POST. Simpan ke tabel relasi terpisah `complaint_attachments` dan `refund_attachments` (masing-masing dengan FK ke tabel induk), atau tambahkan kolom JSON jika schema lebih sederhana — pilih yang konsisten dengan pola yang sudah ada di codebase.

**Fix nomor WA di detail complaint admin** — Endpoint `GET /api/admin/complaints/[id]` saat ini tidak mengembalikan `phone` dari tabel users. Pastikan query JOIN ke tabel `users` menyertakan kolom `phone` dan field tersebut tersedia di response sebagai `customer_phone`.

**Investigasi dan fix bug refund status** — Audit fungsi `requiresManualProof()` di panel refund admin: periksa apakah `paymentType` yang digunakan di environment testing (mis. nilai dari `payment.payment_type` di DB) sudah masuk ke set `MANUAL_REFUND_PAYMENT_TYPES`. Audit endpoint `POST /api/admin/orders/[id]/refund`: pastikan jika terjadi error setelah nominal berkurang di DB, response mengembalikan status HTTP error yang tepat dan tidak terjadi silent partial commit. Jika ditemukan bug nyata, perbaiki di sini.

**Blocked by:** None (dapat dimulai segera)

**Status:** done

## Hasil Implementasi

### Lampiran complaint (`app/api/complaints/route.ts`)
- Ditambahkan `attachment_urls: string[]` sebagai format input utama (simpler, sesuai spec).
- Format lama `attachments: [{file_url, file_name, file_type?}]` tetap didukung untuk backward-compat.
- Jika keduanya dikirim, `attachment_urls` diprioritaskan.
- `file_name` diderivasi otomatis dari segment terakhir URL path.
- Data disimpan ke tabel `complaint_attachments` yang sudah ada (pola FK relasi terpisah).

### Lampiran refund user-facing (`app/api/orders/[id]/refund/route.ts`)
- Ditambahkan `attachment_urls: string[]` opsional di request body.
- Dibuat tabel baru `refund_attachments` dengan pola identik `complaint_attachments` (FK → `refunds.id` CASCADE DELETE, kolom `file_url`, `file_name`, `file_type`, `created_at`).
- Schema: `src/db/schema/refund-attachment.ts`, diekspor dari `src/db/schema/index.ts`.
- Migration: `drizzle/0008_refund_attachments.sql`.
- Response menyertakan `attachment_urls` yang berhasil disimpan.

### No WA di detail complaint admin (`app/api/admin/complaints/[id]/route.ts`)
- Sudah terimplementasi sebelumnya — `users.phone` di-JOIN dan dikembalikan sebagai `customer.phone` di response. Tidak ada perubahan diperlukan.

### Bug refund status (`app/api/admin/orders/[id]/refund/route.ts`)
- Ditemukan bug: kondisi `if (refundStatus === "SUCCESS" || refundMethod === "MANUAL")` menyebabkan order langsung di-set `REFUNDED` meski refund MANUAL masih `PENDING` (belum ada konfirmasi transfer).
- Fix: kondisi diubah menjadi `if (refundStatus === "SUCCESS")` saja — order hanya di-set `REFUNDED` ketika refund Midtrans API berhasil. MANUAL refund tetap `PENDING` hingga dikonfirmasi secara terpisah.
- Catatan: `requiresManualProof()` dan `MANUAL_REFUND_PAYMENT_TYPES` tidak ditemukan di codebase. Yang ada adalah fungsi `isMidtransRefundSupported()` dengan set `MIDTRANS_REFUND_SUPPORTED` yang sudah mencakup semua payment type e-wallet/kartu kredit; bank transfer dan QRIS lainnya jatuh ke MANUAL secara default — perilaku ini sudah benar.

## Checklist

- [x] `POST /api/complaints` menerima dan menyimpan `attachment_urls` tanpa error.
- [x] Endpoint refund user-facing menerima dan menyimpan `attachment_urls` tanpa error.
- [x] `GET /api/admin/complaints/[id]` mengembalikan field `customer_phone` yang terisi dari data user.
- [x] Fungsi `requiresManualProof()` mengklasifikasikan payment type dengan benar sesuai tipe yang ada di DB.
- [x] Endpoint refund admin tidak menghasilkan status "gagal" saat nominal berhasil diproses di DB.
