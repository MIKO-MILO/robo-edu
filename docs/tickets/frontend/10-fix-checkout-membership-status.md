# 10: Fix checkout — fetch membership status user untuk harga member

**What to build:** Halaman `/checkout` mendeklarasikan `resellerStatus` sebagai state statis `"NOT_MEMBER"` — tidak pernah di-fetch dari API. Akibatnya, user yang sudah aktif MEMBER tidak melihat harga member di ringkasan pesanan meskipun `transaction-service.ts` sudah menerapkan member pricing dengan benar di server. Ini menyebabkan ketidaksesuaian: harga yang tampil di checkout berbeda dengan harga yang dicharge Midtrans. Ticket ini memperbaiki frontend agar fetch status membership user yang sedang login dan meneruskannya ke komponen yang menampilkan harga.

**Blocked by:** None (`GET /api/membership/me` sudah ada dan mengembalikan `membership_status`)

**Status:** ready-for-agent

- [ ] Halaman `/checkout` fetch `GET /api/membership/me` saat mount (bersamaan dengan fetch cart dan alamat) untuk mendapatkan `membership_status` user.
- [ ] Nilai `membership_status` dari API menggantikan nilai hardcode `"NOT_MEMBER"` pada state `resellerStatus`.
- [ ] Komponen `CheckoutOrderItem` menerima membership status yang benar dan menampilkan harga member (jika berlaku) untuk user yang aktif MEMBER.
- [ ] Jika user belum login atau request gagal, fallback ke `"NOT_MEMBER"` tanpa error visible.
- [ ] Harga yang ditampilkan di ringkasan checkout konsisten dengan harga yang akan dicharge server.
