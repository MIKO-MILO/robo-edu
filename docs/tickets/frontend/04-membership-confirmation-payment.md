# 04: Layar konfirmasi membership + pilihan metode pembayaran

**What to build:** Halaman /reseller sudah ada tombol "Beli Membership Plus". Tambahkan layar konfirmasi sebelum customer melanjutkan ke pembayaran: menampilkan ringkasan paket (nama, harga, durasi, tanggal berlaku yang akan didapat), data akun dari profil (nama/email/telepon, read-only), dan pilihan metode pembayaran (komponen dari ticket 01 di-reuse). Setelah submit, memanggil POST /checkout/membership dan mengarahkan customer ke /reseller/payment/[id] (halaman dari ticket 02). Selama backend membership checkout belum tersedia, gunakan mock response yang mengembalikan ID pembelian dummy.

**Blocked by:** rontend/01, rontend/02

**Status:** ready-for-agent

- [ ] Layar konfirmasi membership menampilkan: nama paket (Plus), harga snapshot, durasi (mis. "1 bulan"), tanggal mulai dan tanggal berakhir yang akan didapat.
- [ ] Data akun (nama, email, telepon) ditampilkan read-only dari session/profil yang sudah login.
- [ ] Pilihan metode pembayaran menggunakan komponen yang sama dengan ticket 01 (tidak ada duplikasi kode).
- [ ] Tombol submit mengirim POST /checkout/membership dengan payment_method dan payment_channel terpilih; jika OVO, sertakan payer_phone_number.
- [ ] Setelah submit berhasil, redirect ke /reseller/payment/[id].
- [ ] Jika user belum login dan menekan "Beli Membership Plus", redirect ke /login?redirect=/reseller.
- [ ] Jika user sudah berstatus MEMBER, tombol CTA di /reseller berubah menjadi "Perpanjang Membership" dan layar konfirmasi menampilkan informasi bahwa masa berlaku akan diperpanjang dari tanggal berakhir yang ada.
- [ ] Satu PENDING membership yang sudah ada: UI menampilkan opsi "Lanjutkan pembayaran yang ada" dengan link ke halaman pembayaran yang pending, bukan membuat pembelian baru.
- [ ] Voucher tidak ditampilkan di layar konfirmasi ini (sesuai PRD — voucher tidak berlaku untuk membership).
