# 11: Halaman konfirmasi membership + pilihan metode pembayaran

**What to build:** Halaman `/membership` saat ini hanya static marketing — tombol "Beli Membership Plus" tidak memiliki alur konfirmasi atau pemilihan metode bayar. Ticket ini menambahkan layar konfirmasi yang muncul saat user menekan tombol tersebut: menampilkan ringkasan paket (nama, harga dari `GET /api/admin/settings`, durasi, estimasi tanggal berlaku), data akun read-only dari session, dan komponen pilihan metode pembayaran yang di-reuse dari checkout. Setelah user memilih metode dan submit, memanggil `POST /api/checkout/membership` lalu redirect ke `/membership/payment/[purchaseId]`. Handle semua edge case: belum login, sudah MEMBER (perpanjang), sudah ada PENDING purchase.

**Blocked by:** payment/10 (membership checkout Core API harus sudah mengembalikan `payment_instruction`, bukan `snap_token`)

**Status:** ready-for-agent

- [ ] Tombol "Beli Membership Plus" di halaman `/membership` membuka layar konfirmasi (bisa modal atau halaman `/membership/confirm`).
- [ ] Layar konfirmasi menampilkan: nama paket (Plus), harga yang diambil dari `GET /api/admin/settings` (key `membership_plus_price`), durasi (key `membership_plus_duration_months`), dan estimasi tanggal mulai + tanggal berakhir.
- [ ] Data akun user (nama, email, telepon) ditampilkan read-only dari session/profil.
- [ ] Komponen pilihan metode pembayaran di-reuse dari checkout (bukan duplikasi kode baru); fetch dari `GET /api/payment-methods`.
- [ ] Tombol submit mengirim `POST /api/checkout/membership` dengan `payment_method`, `payment_channel`, dan `payer_phone_number` (jika OVO); dinonaktifkan selama belum ada metode yang dipilih.
- [ ] Setelah submit berhasil → redirect ke `/membership/payment/[purchaseId]`.
- [ ] Jika user belum login → redirect ke `/login?redirect=/membership`.
- [ ] Jika user sudah berstatus `MEMBER` aktif → tombol CTA berubah menjadi "Perpanjang Membership"; layar konfirmasi menampilkan info bahwa masa berlaku akan diperpanjang dari tanggal berakhir yang ada.
- [ ] Jika API mengembalikan 409 `PENDING_PURCHASE_EXISTS` → tampilkan opsi "Lanjutkan pembayaran yang ada" dengan link ke `/membership/payment/[purchase_id]`, bukan membuat purchase baru.
- [ ] Harga yang ditampilkan selalu dari `settings` DB — jika admin ubah harga, layar konfirmasi langsung mencerminkan harga baru tanpa redeploy.
