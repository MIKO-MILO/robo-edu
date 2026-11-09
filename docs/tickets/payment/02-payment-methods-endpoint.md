# 02: GET /payment-methods + konfigurasi metode di Settings

**What to build:** Endpoint publik GET /payment-methods yang membaca settings.payment_methods_config (JSON) dan mengembalikan daftar channel dengan flag is_active. Default seed: semua channel pada PRD §11.4 aktif. Admin dapat mengubah flag aktif/nonaktif per channel melalui PATCH /admin/settings yang sudah ada (backend ticket 11) dengan key payment_methods_config. Endpoint ini dipakai oleh frontend checkout dan layar konfirmasi membership. Juga tambahkan order_expires_hours ke dalam surface GET /admin/settings agar admin dapat melihat dan mengubahnya.

**Blocked by:** payment/01, ackend/11 (admin settings endpoint sudah ada)

**Status:** ready-for-agent

- [ ] GET /payment-methods mengembalikan array channel dengan method, channel, label, is_active; channel dengan is_active=false tidak muncul di response (difilter server-side).
- [ ] Response mencakup semua channel PRD §11.4: BCA, BNI, BRI, Mandiri, Permata, CIMB (VA); kartu; GoPay QRIS; ShopeePay QRIS; QRIS; Dana; OVO; Alfamart; Indomaret.
- [ ] Admin dapat mengubah payment_methods_config via PATCH /admin/settings; perubahan langsung tercermin di response GET /payment-methods tanpa restart.
- [ ] GET /admin/settings menyertakan order_expires_hours dalam response.
- [ ] Test: channel yang di-set is_active=false di settings tidak muncul di GET /payment-methods.
