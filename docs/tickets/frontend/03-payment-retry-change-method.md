# 03: Tombol "Ganti Metode" dan "Coba Lagi" di halaman pembayaran

**What to build:** Tambahkan mekanisme retry dan ganti metode ke halaman pembayaran (dari ticket 02). Saat percobaan berstatus PENDING, tampil tombol "Ganti Metode" yang membuka modal pilih metode (sama dengan komponen di checkout dari ticket 01). Saat percobaan FAILED atau EXPIRED dan order belum melewati expires_at, tampil tombol "Coba Lagi". Kedua aksi memanggil POST /orders/:id/payment/retry dengan metode baru. Selama backend retry belum tersedia, tombol ada namun memanggil endpoint mock yang mengembalikan payment_instruction baru berdasarkan metode yang dipilih — sehingga flow UI sepenuhnya dapat dipreview.

**Blocked by:** rontend/02

**Status:** done

- [x] Tombol "Ganti Metode" muncul saat payment.status = PENDING; tombol "Coba Lagi" muncul saat status FAILED atau EXPIRED selama order.expires_at belum terlewati.
- [x] Kedua tombol menghilang (atau dinonaktifkan) setelah order melewati expires_at atau setelah 5 percobaan tercapai.
- [x] Menekan "Ganti Metode" membuka modal pilihan metode yang sama dengan di checkout (komponen dari ticket 01 di-reuse).
- [x] Setelah memilih metode baru dan mengonfirmasi, halaman memanggil POST /orders/:id/payment/retry dan memperbarui tampilan instruksi dengan payment_instruction baru tanpa reload halaman.
- [x] Saat request retry sedang berlangsung, tombol dalam keadaan loading dan tidak bisa ditekan ganda.
- [x] Jika backend mengembalikan 409 ORDER_ALREADY_PAID: tampil pesan "Pesanan sudah dibayar" dan redirect ke detail order.
- [x] Jika backend mengembalikan error batas percobaan tercapai: sembunyikan tombol retry dan tampil pesan "Batas percobaan pembayaran telah tercapai."
- [x] Header Idempotency-Key baru dikirim setiap kali retry dipanggil.
