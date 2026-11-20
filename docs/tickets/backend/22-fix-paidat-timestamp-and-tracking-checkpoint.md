# 22: Fix Timestamp paidAt & Sederhanakan Checkpoint Pengiriman

**What to build:** Dua perbaikan di sisi backend/API:

**Fix `paidAt` timestamp** — Di handler Midtrans webhook, field `paidAt` pada order saat ini kemungkinan menggunakan waktu server (`new Date()`) bukan waktu transaksi aktual dari Midtrans. Pastikan `paidAt` diisi dari `transaction_time` di payload notifikasi Midtrans (parse string ISO ke Date). Jika `transaction_time` tidak hadir di payload, fallback ke `new Date()`. Periksa juga handler yang sama di endpoint payment check (polling frontend) agar konsisten.

**Sederhanakan checkpoint tracking** — Endpoint `POST /api/admin/orders/[id]/tracking` saat ini menerima field `timestamp` opsional dari body request. Ubah perilakunya: jika `timestamp` tidak disertakan, gunakan `new Date()` server-side (perilaku ini mungkin sudah ada — pastikan). Tidak ada perubahan schema DB. Perubahan ini mempersiapkan frontend untuk menghapus field picker waktu dari form.

**Blocked by:** None (dapat dimulai segera)

**Status:** done

> **Catatan implementasi:** Setelah investigasi kode, semua perilaku yang diminta sudah terimplementasi dengan benar sebelum ticket ini dikerjakan. Tidak ada perubahan kode yang diperlukan.
>
> - `handleOrderWebhook` (`app/api/payments/midtrans/webhook/route.ts`) sudah menggunakan `body.transaction_time` untuk `timestamp` dengan fallback `new Date()`.
> - `POST /api/orders/[id]/payment/check` sudah menggunakan `midtransStatus.transaction_time` dengan fallback `new Date()`.
> - `POST /api/admin/orders/[id]/tracking` sudah menggunakan `new Date()` di branch `else` ketika `body.timestamp` tidak disertakan.

- [x] `paidAt` pada order yang baru dibayar menggunakan `transaction_time` dari payload Midtrans, bukan waktu server saat webhook diterima.
- [x] Jika `transaction_time` tidak hadir di payload, `paidAt` fallback ke waktu server (`new Date()`).
- [x] Endpoint `POST /api/admin/orders/[id]/tracking` menggunakan `new Date()` ketika `timestamp` tidak disertakan di body.
- [x] Tidak ada perubahan schema database.
