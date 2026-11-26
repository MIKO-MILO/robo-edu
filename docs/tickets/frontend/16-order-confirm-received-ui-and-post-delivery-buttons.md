# 16: UI Konfirmasi Penerimaan + Tombol Post-Delivery di Halaman Order User

**What to build:** Pembeli saat ini tidak bisa mengkonfirmasi bahwa paket sudah diterima, dan tidak ada tombol untuk mengakses fitur post-delivery (komplain, pengembalian, ulasan) dari halaman order. Ticket ini menambahkan tombol "Konfirmasi Penerimaan Paket" di dua tempat sekaligus, serta mengatur kapan tombol post-delivery muncul berdasarkan status order.

Halaman detail order (`/profile/orders/[id]`): tambahkan banner/tombol "Konfirmasi Penerimaan Paket" yang muncul hanya saat status `DELIVERED`. Setelah diklik dan berhasil, optimistic update status ke `COMPLETED`. Saat status `DELIVERED` atau `COMPLETED`, tampilkan tombol "Ajukan Komplain" dan "Ajukan Pengembalian" (link ke sub-halaman form masing-masing). Saat status `COMPLETED`, tambahkan tombol "Tulis Ulasan".

Halaman riwayat pesanan (OrderCard): tambahkan tombol "Konfirmasi Penerimaan" untuk order berstatus `DELIVERED`. Tombol "Tulis Ulasan" yang saat ini muncul di `DELIVERED | COMPLETED` diperketat menjadi hanya `COMPLETED`.

**Blocked by:** 20 — Backend endpoint `confirm-received` harus tersedia sebelum tombol ini bisa diimplementasikan

**Status:** ready-for-agent

- [x] Tombol "Konfirmasi Penerimaan Paket" muncul di halaman detail order saat status `DELIVERED`, tidak muncul di status lain.
- [x] Klik konfirmasi memanggil `POST /api/orders/[id]/confirm-received`; setelah sukses status terupdate ke `COMPLETED` secara optimistic.
- [x] Tombol "Konfirmasi Penerimaan" juga muncul di OrderCard (halaman riwayat) untuk status `DELIVERED`.
- [x] Tombol "Ajukan Komplain" dan "Ajukan Pengembalian" muncul di halaman detail order saat status `DELIVERED` atau `COMPLETED`.
- [x] Tombol "Tulis Ulasan" di halaman detail order dan OrderCard hanya muncul saat status `COMPLETED` (tidak lagi `DELIVERED`).
- [x] State loading dan error handling ditangani dengan baik pada tombol konfirmasi.
