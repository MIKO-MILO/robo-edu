# Spec: Midtrans Core API — Custom Payment UI, Multi-Attempt Payments & Refunds (November 2026)

> Disintesis dari revisi PRD November 2026 (docs/prd-final-last-bgt.md §11, §11.3–11.8, §13.1, §14, §15, §25.4).  
> Spec ini mencakup perubahan yang **belum ada** di 1-spec-backend-completion.md.  
> Status: **ready-for-agent**

---

## Problem Statement

Revisi PRD November 2026 mengganti integrasi Midtrans dari Snap (popup, satu percobaan per order) menjadi **Midtrans Core API dengan antarmuka pembayaran kustom milik RoboEdu**. Perubahan ini memperkenalkan tiga invariant baru yang belum ada di skema database atau backend saat ini:

1. **Custom payment UI**: customer memilih metode pembayaran *sebelum* submit order, lalu diarahkan ke halaman pembayaran RoboEdu (bukan popup Snap). Backend harus menyimpan instruksi pembayaran per percobaan dan menyediakan endpoint untuk mengelola metode aktif.
2. **Multi-attempt payments**: satu order dapat memiliki beberapa percobaan pembayaran (maks 5), masing-masing dengan midtrans_order_id unik. Skema payment saat ini memiliki order_id UNIQUE dan 	ransaction_id UNIQUE — keduanya melanggar invariant baru ini.
3. **Order expires_at + tabel efund**: order memiliki batas waktu sendiri (terpisah dari percobaan), dan refund dicatat sebagai entitas terpisah (penuh maupun sebagian) — keduanya belum ada di skema.

Tanpa perubahan ini, order yang gagal bayar pertama kali tidak bisa dicoba ulang, tidak ada batas waktu pembayaran, dan refund tidak bisa dicatat secara granular.

---

## Solution

Migrasi skema database dan tambah/ubah API endpoints sehingga:

- Backend menerima pilihan metode bayar dari customer sebelum order dibuat, melakukan charge ke Midtrans Core API, dan menyimpan instruksi pembayaran (VA number, QR, kode toko) sebagai data terstruktur.
- Satu order dapat memiliki beberapa percobaan pembayaran; percobaan lama dibatalkan di Midtrans saat customer mengganti metode.
- Order punya expires_at (24 jam default); job terjadwal membatalkan order PENDING yang melewati batas waktu dan mengembalikan kuota.
- Refund (penuh/sebagian) dicatat di tabel efund terpisah, dapat diproses via Refund API Midtrans atau dicatat manual (VA/toko).
- Kuota produksi direservasi atomik saat order dibuat, bukan saat PAID.

---

## User Stories

### Metode Pembayaran & Halaman Pembayaran

1. Sebagai customer, saya ingin melihat daftar metode pembayaran yang aktif sebelum checkout, agar saya bisa memilih metode yang tersedia untuk saya gunakan.
2. Sebagai customer, saya ingin memilih metode pembayaran (VA, kartu, QRIS, Dana, OVO, Alfamart, Indomaret) pada halaman checkout, agar pembayaran langsung dimulai dengan metode yang saya inginkan.
3. Sebagai customer yang memilih OVO, saya ingin mengisi nomor HP OVO di halaman checkout sebelum submit, agar notifikasi push pembayaran dikirim ke nomor yang benar.
4. Sebagai customer, setelah submit order, saya ingin diarahkan ke halaman pembayaran yang menampilkan nominal, instruksi spesifik (nomor VA / QR / kode toko), status, dan hitung mundur waktu, agar saya tahu persis cara menyelesaikan pembayaran.
5. Sebagai customer yang memilih Virtual Account, saya ingin melihat nomor VA dan kode bank (atau kode perusahaan + kode bayar untuk Mandiri), agar saya bisa mentransfer ke nomor yang tepat.
6. Sebagai customer yang memilih QRIS/GoPay/ShopeePay, saya ingin melihat gambar QR dan tombol buka aplikasi di perangkat mobile, agar saya bisa scan atau langsung buka aplikasi dompet digital.
7. Sebagai customer yang memilih Dana, saya ingin diarahkan ke aplikasi Dana via deeplink setelah submit, agar pembayaran bisa selesai di dalam aplikasi Dana.
8. Sebagai customer yang memilih kartu kredit/debit, saya ingin mengisi form kartu kustom dengan verifikasi 3DS, agar data kartu saya tidak pernah melewati server RoboEdu.
9. Sebagai customer, saya ingin tombol "Cek Status" di halaman pembayaran yang langsung merekonsiliasi status ke Midtrans, agar saya tidak harus menunggu polling otomatis bila sudah selesai membayar.
10. Sebagai customer, saya ingin halaman pembayaran menampilkan tutorial cara bayar sesuai metode yang dipilih (ATM, mobile banking, kasir), agar saya tidak bingung menyelesaikan pembayaran.
11. Sebagai customer, saya ingin status pembayaran di halaman pembayaran diperbarui otomatis (polling tiap 3-5 detik) dan berhenti saat status final, agar saya tahu tanpa harus menekan refresh.
12. Sebagai customer, setelah pembayaran berhasil, saya ingin diarahkan ke halaman hasil pembayaran (detail order atau /profile/reseller untuk membership), agar saya mendapat konfirmasi yang jelas.

### Ganti Metode & Coba Ulang

13. Sebagai customer, jika percobaan pembayaran pertama saya gagal atau kedaluwarsa, saya ingin dapat mencoba lagi dengan metode yang sama atau berbeda tanpa harus checkout ulang, agar saya tidak kehilangan isi cart dan data order.
14. Sebagai customer, saya ingin tombol "Ganti Metode" tersedia selama percobaan masih PENDING, agar saya bisa beralih metode jika berubah pikiran.
15. Sebagai customer, saya ingin tombol "Coba Lagi" tersedia setelah percobaan FAILED atau EXPIRED selama order belum melewati expires_at, agar saya punya kesempatan bayar ulang.
16. Sebagai sistem, saya ingin percobaan pembayaran yang berstatus PENDING dibatalkan di Midtrans (via Cancel API) sebelum percobaan baru dibuat, agar tidak terjadi double payment.
17. Sebagai sistem, saya ingin setiap percobaan pembayaran menggunakan midtrans_order_id yang unik (turunan order_number + nomor percobaan), agar Midtrans bisa menerima charge baru meskipun charge sebelumnya belum final.
18. Sebagai sistem, saya ingin maksimal 5 percobaan pembayaran per order, agar endpoint charge tidak dapat disalahgunakan.
19. Sebagai sistem, saya ingin batas waktu percobaan tidak melewati sisa waktu order.expires_at, agar percobaan tidak aktif setelah order dibatalkan.

### Order expires_at & Pembatalan Otomatis

20. Sebagai sistem, saya ingin setiap order PENDING memiliki expires_at (default 24 jam dari Settings), agar order tidak menahan kuota selamanya.
21. Sebagai sistem, saya ingin job terjadwal BullMQ membatalkan order PENDING yang melewati expires_at, mengembalikan kuota yang direservasi, dan membatalkan percobaan PENDING yang tersisa di Midtrans.
22. Sebagai sistem, saya ingin percobaan yang FAILED atau EXPIRED **tidak** langsung membatalkan order, agar customer masih bisa mencoba lagi sampai expires_at.
23. Sebagai sistem, saya ingin satu user dibatasi maksimal 3 order PENDING pada satu waktu, agar tidak ada penahanan kuota dengan order palsu.
24. Sebagai sistem, jika webhook PAID diterima untuk order yang sudah CANCELLED, saya ingin payment tetap dicatat PAID (order tidak berubah) dan alert dikirim ke admin, agar uang tidak hilang diam-diam.

### Reservasi Kuota Atomik

25. Sebagai sistem, saya ingin kuota produksi direservasi saat order **dibuat** (bukan saat PAID) dengan query atomik (UPDATE ... WHERE stock >= n), agar tidak ada kondisi balapan stok.
26. Sebagai sistem, jika kuota tidak mencukupi saat checkout, saya ingin order ditolak dengan pesan jelas tanpa order yang terbuat, agar customer tahu segera.
27. Sebagai sistem, saya ingin kuota dikembalikan otomatis saat order CANCELLED (termasuk pembatalan otomatis karena expires_at).

### Refund

28. Sebagai admin, saya ingin memproses refund penuh atau sebagian dari halaman detail order, agar dana bisa dikembalikan ke customer.
29. Sebagai admin, saya ingin sistem otomatis memproses refund via Refund API Midtrans untuk metode yang didukung (kartu, GoPay, ShopeePay, Dana, OVO, QRIS), agar tidak perlu transfer manual.
30. Sebagai admin, untuk metode yang tidak didukung Refund API (VA, Alfa Group, Indomaret), saya ingin dapat mencatat refund manual beserta bukti transfer (upload ke MinIO), agar histori refund tetap terdokumentasi di sistem.
31. Sebagai admin, saya ingin memilih apakah kuota produksi dikembalikan saat memproses refund, agar produk made-by-order yang sudah dibuat tidak menambah stok keliru.
32. Sebagai sistem, saya ingin order berstatus REFUNDED hanya jika total refund sama dengan total pembayaran; refund sebagian tidak mengubah status order.
33. Sebagai sistem, saya ingin setiap refund dicatat di tabel efund dan udit_log, agar ada jejak akuntabilitas.
34. Sebagai admin, saya ingin menerima alert (Sentry/email) saat ada chargeback kartu dari Midtrans, agar saya bisa segera menindaklanjuti via dashboard Midtrans.

### Pembayaran Membership (Core API)

35. Sebagai customer, saya ingin memilih metode pembayaran pada layar konfirmasi membership sebelum submit, agar alur membership konsisten dengan alur order.
36. Sebagai customer, setelah submit pembelian membership, saya ingin diarahkan ke halaman pembayaran yang sama dengan order (komponen yang sama), agar pengalaman bayar konsisten.
37. Sebagai sistem, saya ingin pembelian membership menggunakan mekanisme multi-attempt yang sama dengan order (maks 5 percobaan, cancel sebelum buat baru), agar idempoten dan tidak double-charge.
38. Sebagai sistem, saya ingin pembelian membership yang kedaluwarsa (tidak ada percobaan PENDING lagi) menjadi EXPIRED, dan customer memulai pembelian baru, bukan melanjutkan yang lama.
39. Sebagai sistem, saya ingin satu user hanya boleh memiliki satu pembelian membership PENDING pada satu waktu, agar tidak ada double purchase.

### Kelola Metode Pembayaran (Admin)

40. Sebagai admin, saya ingin mengaktifkan atau menonaktifkan metode pembayaran per channel dari halaman Settings, agar metode yang bermasalah bisa dimatikan tanpa deploy ulang.
41. Sebagai admin, saya ingin mengatur batas waktu order default (expires_at) dari Settings, agar bisa disesuaikan dengan kebutuhan operasional.

---

## Implementation Decisions

### Migrasi Schema Database

**Tabel payment — perombakan besar**

Schema saat ini: order_id NOT NULL UNIQUE, 	ransaction_id UNIQUE — tidak mendukung multi-attempt.

Setelah migrasi:
- order_id menjadi nullable (FK ke order)
- membership_purchase_id ditambahkan (nullable, FK ke membership_purchase)
- Constraint: tepat satu dari keduanya harus terisi (CHECK constraint atau enforced di aplikasi)
- UNIQUE(order_id) dan UNIQUE(transaction_id) dihapus
- Tambah kolom: ttempt_number INT (nomor percobaan ke-1, 2, dst), midtrans_order_id VARCHAR UNIQUE (ID unik ke Midtrans, turunan order_number + attempt), payment_method VARCHAR (tipe Midtrans: bank_transfer, credit_card, gopay, qris, dll), payment_channel VARCHAR (channel spesifik: bca, bni, bri, mandiri, gopay, shopeepay, ovo, dana, alfamart, indomaret), payment_instruction JSON NULLABLE (data instruksi untuk halaman pembayaran: VA number, QR URL, store code, 3DS URL), payer_phone_number VARCHAR NULLABLE (nomor HP untuk OVO)
- Rename 	ransaction_id → midtrans_transaction_id (hanya terisi saat Midtrans mengonfirmasi)
- Tambah index: (order_id, attempt_number), (membership_purchase_id, attempt_number)

**Tabel order — tambah kolom baru**

- expires_at TIMESTAMP NOT NULL — batas waktu pembayaran order (default 24 jam sejak dibuat, dari Settings)
- is_dropship BOOLEAN DEFAULT FALSE
- sender_name VARCHAR NULLABLE — snapshot nama pengirim untuk dropship
- sender_phone VARCHAR NULLABLE — snapshot telepon pengirim untuk dropship

**Tabel efund — baru**

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | PK | UUID |
| payment_id | FK payment | Percobaan pembayaran PAID yang dikembalikan |
| order_id | FK order, NULLABLE | |
| membership_purchase_id | FK membership_purchase, NULLABLE | |
| mount | DECIMAL | Nominal refund |
| eason | TEXT | Alasan refund |
| method | ENUM(MIDTRANS_API, MANUAL) | |
| proof_url | VARCHAR NULLABLE | Bukti transfer manual (MinIO) |
| estore_quota | BOOLEAN DEFAULT FALSE | Pilihan admin |
| processed_by | FK user | Admin yang memproses |
| created_at | TIMESTAMP | |

**Tabel settings — tambah keys**

Keys baru (key-value store):
- payment_methods_config — JSON flag aktif/nonaktif per channel
- order_expires_hours — batas waktu order default dalam jam

**Tabel membership_purchase** — sudah terdefinisi di spec 1; tidak berubah. Multi-attempt payment berlaku sama.

### API Contracts

**GET /payment-methods** (baru, public)

Mengembalikan daftar metode pembayaran yang aktif berdasarkan flag di Settings. Digunakan oleh checkout dan layar konfirmasi membership.

`
Response 200:
{ "data": [
    { "method": "bank_transfer", "channel": "bca", "label": "BCA Virtual Account", "is_active": true },
    { "method": "gopay", "channel": "gopay", "label": "GoPay QRIS", "is_active": true },
    ...
] }
`

**POST /checkout (sebelumnya POST /checkout/midtrans)** — diubah

Request body diperluas:
`
{
  "address_id": "...",
  "shipping_provider_id": "...",
  "shipping_service": "REG",
  "voucher_code": "ROBOEDU10",   // opsional
  "payment_method": "bank_transfer",
  "payment_channel": "bca",
  "payer_phone_number": "081..."  // wajib jika channel = ovo
}
`

Proses sisi server (urutan atomik):
1. Validasi stok per item (UPDATE product_variant SET stock = stock - n WHERE stock >= n) — jika gagal, tolak dengan STOCK_INSUFFICIENT
2. Validasi maks 3 order PENDING per user
3. Buat order dengan status PENDING dan expires_at = now() + order_expires_hours
4. Insert shipment dengan status PENDING
5. Charge ke Midtrans Core API sesuai payment_method + payment_channel
6. Simpan payment (attempt_number=1) dengan payment_instruction dari response Midtrans
7. Jika charge gagal: tandai payment sebagai FAILED, kembalikan kuota, kembalikan error 422 PAYMENT_CHARGE_FAILED

Response 201 mencakup payment.payment_instruction (data untuk halaman pembayaran) dan payment.expiry_time.

**GET /orders/:id/payment** (diperluas)

Mengembalikan attempt terakhir yang aktif (PENDING) atau final terakhir. Digunakan halaman pembayaran untuk polling status.

**POST /orders/:id/payment/retry** (baru)

Buat percobaan pembayaran baru. Dipanggil saat customer menekan "Ganti Metode" atau "Coba Lagi".

`
Body: { "payment_method": "...", "payment_channel": "...", "payer_phone_number": "..." }
`

Proses:
1. Validasi order masih PENDING dan expires_at belum lewat
2. Validasi maksimal 5 percobaan belum tercapai
3. Batalkan percobaan PENDING yang ada via Midtrans Cancel API
4. Tandai percobaan lama FAILED
5. Charge Midtrans dengan midtrans_order_id baru (order_number + attempt_number)
6. Simpan percobaan baru

Jika order sudah PAID: return 409 ORDER_ALREADY_PAID.

Header Idempotency-Key wajib.

**POST /orders/:id/payment/check** (baru)

Tombol "Cek Status" — panggil Get Transaction Status Midtrans, update payment.status, kembalikan status terbaru.

**POST /admin/orders/:id/refund** (baru)

`
Body: {
  "payment_id": "...",
  "amount": 150000,
  "reason": "Produk cacat",
  "restore_quota": false
}
`

Proses:
1. Validasi total refund tidak melebihi payment.amount
2. Jika payment.payment_channel mendukung Refund API: panggil Midtrans Refund API, simpan efund dengan method = MIDTRANS_API
3. Jika tidak mendukung: simpan efund dengan method = MANUAL (admin upload bukti transfer terpisah)
4. Catat ke udit_log
5. Jika estore_quota: kembalikan stok per order_item.quantity
6. Jika total semua refund order = payment.amount: update order.status = REFUNDED

**PATCH /admin/orders/:id/refunds/:refundId/proof** (baru)

Upload bukti transfer untuk refund manual (multipart, disimpan ke MinIO, update efund.proof_url).

**POST /payments/midtrans/webhook** — diubah

Logika tambahan:
- Identifikasi jenis transaksi dari midtrans_order_id (prefix RE- = order, MBR- = membership)
- Cek apakah order sudah CANCELLED: jika ya dan webhook PAID → catat payment PAID, pertahankan order CANCELLED, kirim alert Sentry
- Handle raud_status = challenge: tahan sebagai PENDING (bukan PAID), kirim alert admin
- Handle 	ransaction_status = refund: update payment.status = REFUNDED
- Handle chargeback: catat di udit_log, kirim alert Sentry/email, tidak ubah order status
- Semua efek samping bersifat idempoten (jika notifikasi sama datang dua kali, tidak ada duplikasi)

### Background Jobs (BullMQ)

**Job baru: order-auto-cancel**

Job terjadwal (setiap 5 menit) yang:
1. Query order WHERE status = PENDING AND expires_at < NOW()
2. Untuk setiap order: batalkan percobaan PENDING di Midtrans (Cancel API), update semua payment PENDING → EXPIRED, kembalikan kuota stok, set order.status = CANCELLED, set order.cancelled_at = NOW()

**Job baru: payment-reconcile**

Dipicu untuk setiap payment PENDING yang melewati expiry_time (setelah 1-2 menit dari expiry): panggil Get Transaction Status Midtrans, sinkronisasi status.

### Halaman Pembayaran (Frontend)

Satu komponen halaman /checkout/payment/[id] dan /reseller/payment/[id] yang berbagi logika. Komponen memiliki bagian instruksi dinamis berdasarkan payment_channel:

- ank_transfer (non-Mandiri): tampilkan nomor VA + kode bank
- echannel (Mandiri): tampilkan kode perusahaan + kode bayar
- cstore (Alfamart/Indomaret): tampilkan kode pembayaran toko
- gopay, shopeepay, qris: tampilkan gambar QR + tombol buka aplikasi (mobile)
- dana: tombol deeplink buka aplikasi Dana
- ovo: instruksi "Periksa notifikasi di aplikasi OVO"
- credit_card: iframe/redirect 3DS

Data instruksi diambil dari payment.payment_instruction (disimpan backend dari response Midtrans), bukan di-generate ulang di frontend.

### Validasi Idempotency

- POST /checkout wajib Idempotency-Key
- POST /orders/:id/payment/retry wajib Idempotency-Key
- Webhook handler idempoten: check apakah payment dengan midtrans_order_id yang sama sudah pernah diproses ke status final

---

## Testing Decisions

**Apa yang membuat test baik di codebase ini:**
- Test menguji perilaku HTTP (request masuk, response keluar, dan state database setelahnya) — bukan implementasi fungsi internal
- Setiap skenario pembayaran menggunakan payload webhook nyata dari Midtrans sandbox
- Test idempotensi selalu mengirim notifikasi yang sama dua kali dan memastikan efek samping tidak berganda

**Modul yang perlu ditest:**

- **POST /checkout dengan multi-attempt invariant** — test bahwa: (a) stok berkurang atomik saat order dibuat, (b) stok tidak berubah jika charge Midtrans gagal, (c) 3 order PENDING per user ditolak ke-4nya dengan PENDING_ORDER_LIMIT
- **POST /orders/:id/payment/retry** — test bahwa percobaan ke-6 ditolak, percobaan PENDING sebelumnya dibatalkan di Midtrans sebelum charge baru, midtrans_order_id selalu unik per percobaan
- **Webhook handler — idempotensi** — kirim payload settlement dua kali untuk midtrans_order_id yang sama, pastikan email receipt hanya terkirim sekali dan order.status tidak diubah dua kali
- **Webhook handler — order CANCELLED** — kirim payload PAID untuk order yang sudah CANCELLED, pastikan order tetap CANCELLED dan alert terkirim (mock Sentry)
- **order-auto-cancel job** — seed order PENDING dengan expires_at di masa lalu, jalankan job, verifikasi: order jadi CANCELLED, kuota dikembalikan, payment PENDING jadi EXPIRED
- **POST /admin/orders/:id/refund** — test bahwa total refund melebihi payment.amount ditolak, estore_quota=true benar-benar menambah stok, order jadi REFUNDED hanya jika total refund = total payment
- **GET /payment-methods** — test bahwa metode dengan is_active=false tidak muncul di response

**Prior art:**
- Pola test webhook yang sudah ada di route handler pp/api/payments/midtrans/ sebagai referensi struktur
- Test checkout yang sudah ada di __tests__/ (jika tersedia) sebagai baseline untuk test transaksi

---

## Out of Scope

- **Aktivasi channel Midtrans produksi**: verifikasi ke Midtrans dilakukan paralel dengan development. Setiap metode diuji di sandbox terlebih dahulu. Bukan keputusan desain.
- **Tutorial cara bayar**: konten panduan (ATM, mobile banking, kasir) ditulis oleh tim konten RoboEdu, bukan diambil dari Midtrans API. Implementasi hanya menyediakan slot per payment_channel.
- **Tokenisasi kartu berulang**: penyimpanan token kartu untuk pembelian berikutnya tidak termasuk MVP.
- **Refund untuk pembelian membership**: alur ini mungkin diperlukan tapi belum didefinisikan secara detail di PRD. Tabel efund menyediakan membership_purchase_id sebagai FK, tapi logika bisnis refund membership (pencabutan masa berlaku) tidak dicakup spec ini.
- **LinkAja, Google Pay, dan metode di luar PRD §11.4**: belum termasuk.
- **Pemberitahuan customer saat order auto-cancel**: email atau notifikasi ke customer ketika order dibatalkan otomatis karena expires_at — belum didefinisikan di PRD.
- **Stock movement log**: riwayat pergerakan stok yang detail direncanakan di Tahap 3 PRD, bukan MVP.
- **UI admin untuk melihat semua percobaan pembayaran per order**: halaman detail order admin hanya menampilkan status terkini; riwayat semua percobaan tidak diprioritaskan MVP.

---

## Further Notes

- **Urutan migrasi kritis**: migrasi payment (hapus UNIQUE order_id, tambah kolom baru) harus dilakukan sebelum endpoint POST /checkout diubah ke Core API — kombinasi schema lama + kode baru akan crash.
- **Backward compatibility sementara**: selama migrasi, route POST /api/checkout/midtrans lama dapat dipertahankan sebagai alias sementara menuju handler baru, untuk mencegah 404 pada sesi frontend yang masih di-cache. Hapus setelah deploy stabil.
- **payment_instruction adalah data sensitif parsial**: nomor VA dan kode toko bukan rahasia (perlu dibaca customer), tapi URL 3DS dan deeplink OVO memiliki batas waktu dan tidak boleh di-cache agresif atau diekspos ke pihak lain. Halaman pembayaran hanya bisa diakses pemilik transaksi (validasi order.user_id atau membership_purchase.user_id).
- **Koordinasi dengan spec 1**: spec ini bergantung pada tabel membership_purchase yang didefinisikan di 1-spec-backend-completion.md. Kedua spec perlu diimplementasikan secara berkoordinasi — spec 1 menyediakan tabel, spec ini menambahkan kolom membership_purchase_id ke payment.
- **OVO batas waktu 60 detik tidak bisa diubah**: tidak ada custom expiry untuk OVO. Job rekonsiliasi untuk OVO dijadwalkan ~70 detik setelah charge (bukan berdasarkan expiry_time umum).
- **Fraud status challenge**: jika Midtrans mengembalikan raud_status = challenge, payment ditahan sebagai PENDING dan admin mendapat alert. Pembayaran tidak dikonfirmasi otomatis sampai admin menyelesaikan review di dashboard Midtrans dan Midtrans mengirim webhook lanjutan.
