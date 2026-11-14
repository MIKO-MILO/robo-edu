# 12: Fix halaman membership — harga dan durasi dari DB, CTA dinamis per status user

**What to build:** Halaman `/membership` adalah halaman marketing statis — harga membership (`Rp 500.000 / 6 bulan`) dan harga produk contoh hardcode di komponen. Jika admin mengubah harga via `/admin/settings`, halaman ini tidak mencerminkan perubahan tersebut. Selain itu, tombol CTA "Beli Membership Plus" tidak mempertimbangkan status membership user yang sedang login. Ticket ini menghubungkan halaman ke data nyata.

**Blocked by:** None (`GET /api/admin/settings` sudah expose `membership_plus_price` dan `membership_plus_duration_months`; `GET /api/membership/me` sudah ada)

**Status:** ready-for-agent

- [ ] Komponen harga membership (`MembershipSection` / `ResellerPricingSection`) fetch harga dan durasi dari `GET /api/admin/settings` (key `membership_plus_price` dan `membership_plus_duration_months`) bukan nilai hardcode.
- [ ] Harga ditampilkan sesuai nilai di DB; jika fetch gagal, tampilkan skeleton atau teks "Hubungi kami" sebagai fallback — bukan harga statis yang bisa misleading.
- [ ] Jika user sudah login dan berstatus `MEMBER` aktif, tombol CTA berubah menjadi "Perpanjang Membership" (bukan "Beli Membership Plus").
- [ ] Jika user belum login, tombol CTA tetap ada dan redirect ke `/login?redirect=/membership` saat diklik.
- [ ] Tanggal berlaku estimasi (mulai hari ini + durasi dari settings) ditampilkan di dekat harga sebagai social proof / informasi.
