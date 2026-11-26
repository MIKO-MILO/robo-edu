# Spec: UX Fixes Round 2 — Ulasan, Maintenance, Orders, Complaint/Refund, Invoice

> Status: **ready-for-agent**

---

## Problem Statement

Lima area di aplikasi RoboEdu memiliki masalah UX dan bug fungsional yang mengganggu pengalaman user maupun admin:

1. **Ulasan** — Form review produk tersembunyi di dalam modal sehingga sulit ditemukan. Admin melihat KPI card "Hidden" yang tidak relevan. Preview komentar di tabel terlalu lebar dan terpotong di 2 baris. User tidak memiliki riwayat ulasan yang pernah mereka tulis. User tidak bisa melampirkan foto sebagai bukti ulasan.

2. **Mode Maintenance** — Halaman `/maintenance` menampilkan link "login di sini" ke halaman admin, yang membuka celah bagi user awam untuk mengetahui jalur masuk admin. Ketika admin mematikan mode maintenance, user yang sedang berada di halaman `/maintenance` tidak diarahkan balik ke homepage secara otomatis — mereka harus refresh manual.

3. **Orders** — Timestamp "pembayaran diterima" pada timeline status pesanan tidak akurat (kemungkinan menggunakan waktu server saat webhook diterima, bukan waktu transaksi dari Midtrans). Pada halaman detail order admin, form tambah checkpoint pelacakan menggunakan input free-text untuk status dan menyertakan picker waktu yang membingungkan — keduanya perlu disederhanakan. Pada timeline status pesanan user, entri yang sudah selesai memakai ikon centang (`CheckCircle2`) padahal desain meminta dot berwarna.

4. **Complaint & Refund** — Setelah mengajukan komplain atau pengembalian, user melihat halaman sukses statis yang mengharuskan mereka klik tombol secara manual untuk kembali. Tidak ada form upload lampiran di halaman pengajuan complaint maupun refund sisi user. Layout detail complaint admin kurang compact. Bug: status refund di admin menampilkan "gagal" meskipun nominal sudah berkurang di DB (kemungkinan race condition atau field `method` yang salah diklasifikasikan). Nomor WA customer tidak muncul di detail complaint admin karena API tidak meng-JOIN data phone dari tabel users. User tidak memiliki halaman untuk melihat detail atau status komplain mereka. Admin tidak memiliki halaman terpisah untuk mengelola pengajuan refund; user tidak memiliki halaman detail refund.

5. **Invoice** — Tombol "Cetak" sebaiknya dihilangkan karena duplikat dengan "Unduh PDF". Tombol "Unduh PDF" saat ini hanya memanggil `window.print()` tanpa format struk yang sesuai — perlu diimplementasikan sebagai layout cetak vertikal compact bergaya struk kasir.

---

## Solution

Setiap area diperbaiki secara terpisah:

1. **Ulasan**: Buat halaman dedikasi `/profile/orders/[id]/review` yang menampilkan semua produk dari satu order langsung tanpa langkah pemilihan. Tambahkan upload foto (maks 10 MB). Hapus KPI card "Hidden" dari admin. Persempit preview komentar di tabel admin menjadi 1 baris. Buat halaman riwayat ulasan user (tab baru di profil atau embedded di detail order).

2. **Maintenance**: Hapus link admin login dari halaman `/maintenance`. Tambahkan polling `GET /api/maintenance-status` di halaman maintenance (interval ~5 detik) sehingga ketika mode dinonaktifkan, browser otomatis redirect ke `/`.

3. **Orders**: Pastikan `paidAt` menggunakan `transaction_time` dari payload Midtrans (bukan `new Date()` server-side). Ganti input free-text status checkpoint menjadi `<select>` dropdown predefined. Hapus field picker waktu dari form checkpoint — backend gunakan `now()`. Ganti ikon centang di timeline pesanan user dengan dot berwarna sesuai status.

4. **Complaint & Refund**: Ganti halaman sukses statis dengan sonner/toast, diikuti `router.push` otomatis ke detail order. Tambahkan field upload lampiran (foto/dokumen, maks beberapa file) di form complaint dan refund sisi user. Rearrange layout detail complaint admin lebih compact. Perbaiki bug status refund — identifikasi apakah field `method` salah diklasifikasikan untuk payment type testing atau ada masalah di response API. Pastikan API complaint detail meng-JOIN `users.phone`. Buat halaman detail/tracking komplain di sisi user. Buat tabel pengajuan refund di admin dan halaman detail refund di user.

5. **Invoice**: Hapus tombol "Cetak". Implementasikan "Unduh PDF" dengan layout struk (bukan modal — tampilan cetak-ready, format vertikal, tipografi compact).

---

## User Stories

### Ulasan

1. Sebagai customer, saya ingin mengakses form ulasan dari halaman detail pesanan melalui tombol, sehingga saya bisa langsung menulis ulasan tanpa membuka modal.
2. Sebagai customer, saya ingin melihat semua produk dalam satu order sekaligus di halaman ulasan, sehingga saya tidak perlu memilih produk satu per satu.
3. Sebagai customer, saya ingin melampirkan foto (maks 10 MB) saat menulis ulasan, sehingga saya bisa menunjukkan kondisi produk yang saya terima.
4. Sebagai customer, saya ingin melihat riwayat semua ulasan yang pernah saya tulis, sehingga saya bisa mengingat produk apa yang sudah saya ulas.
5. Sebagai admin, saya ingin hanya melihat KPI yang relevan di halaman ulasan (Total Review, Rata-rata Rating, Visible), sehingga dashboard tidak menampilkan metrik yang tidak digunakan.
6. Sebagai admin, saya ingin preview komentar di tabel ulasan hanya 1 baris, sehingga tabel lebih rapi dan mudah dipindai.

### Maintenance

7. Sebagai customer yang mengunjungi `/maintenance`, saya tidak ingin melihat link ke halaman admin login, sehingga saya tidak tahu jalur masuk ke panel admin.
8. Sebagai customer yang menunggu di halaman maintenance, saya ingin halaman otomatis kembali ke homepage ketika maintenance selesai, sehingga saya tidak perlu refresh manual.
9. Sebagai admin yang mematikan mode maintenance, saya ingin user yang sedang di `/maintenance` langsung diarahkan ke halaman utama tanpa intervensi, sehingga alur terasa mulus.

### Orders

10. Sebagai customer, saya ingin waktu "Pembayaran Diterima" pada timeline pesanan akurat sesuai waktu transaksi aktual, sehingga saya bisa memverifikasi kapan pembayaran benar-benar diproses.
11. Sebagai admin, saya ingin memilih status checkpoint pengiriman dari dropdown predefined, sehingga data tracking konsisten dan tidak ada typo.
12. Sebagai admin, saya tidak ingin mengisi field waktu manual saat menambah checkpoint pengiriman — cukup sistem yang mencatat waktu sekarang, sehingga form lebih simpel.
13. Sebagai customer, saya ingin melihat indikator dot berwarna (bukan centang) pada timeline pesanan yang sudah selesai, sehingga tampilan konsisten dengan desain keseluruhan aplikasi.

### Complaint & Refund

14. Sebagai customer, setelah berhasil mengajukan komplain, saya ingin melihat notifikasi sukses lalu otomatis diarahkan ke detail pesanan, sehingga saya tidak perlu klik tombol lagi.
15. Sebagai customer, setelah berhasil mengajukan pengembalian, saya ingin melihat notifikasi sukses lalu otomatis diarahkan ke detail pesanan, sehingga alur terasa lebih cepat.
16. Sebagai customer, saya ingin melampirkan foto atau dokumen sebagai bukti saat mengajukan komplain, sehingga pengajuan saya lebih kuat dan mudah diproses admin.
17. Sebagai customer, saya ingin melampirkan bukti pembayaran atau kondisi barang saat mengajukan pengembalian, sehingga admin bisa memverifikasi lebih cepat.
18. Sebagai customer, saya ingin melihat status dan detail komplain yang sudah saya ajukan, sehingga saya tahu progres penanganannya tanpa harus menghubungi admin.
19. Sebagai customer, saya ingin melihat status dan detail pengajuan refund saya, sehingga saya tahu apakah refund sudah diproses atau belum.
20. Sebagai admin, saya ingin melihat tabel semua pengajuan refund dari seluruh pesanan, sehingga saya bisa mengelola antrian refund tanpa harus masuk ke masing-masing detail order.
21. Sebagai admin, saya ingin detail complaint menampilkan nomor WhatsApp customer dengan benar, sehingga saya bisa menghubungi customer langsung.
22. Sebagai admin, saya ingin status refund di panel refund akurat (tidak menampilkan "gagal" padahal nominal sudah diproses), sehingga data keuangan bisa dipercaya.
23. Sebagai admin, saya ingin layout detail complaint lebih compact dan terorganisir, sehingga saya bisa membaca informasi klaim dengan cepat tanpa scrolling berlebihan.

### Invoice

24. Sebagai customer, saya ingin mengunduh invoice dalam format PDF bergaya struk, sehingga dokumen terlihat profesional dan mudah dicetak.
25. Sebagai customer, saya tidak ingin melihat tombol "Cetak" yang duplikat dengan tombol "Unduh PDF", sehingga interface lebih bersih.

---

## Implementation Decisions

### Ulasan

- Halaman `/profile/orders/[id]/review` menggantikan modal `OrderReviewModal`. Halaman ini langsung menampilkan semua item dalam order dalam satu form multi-section (satu section per produk), bukan stepper pilih-produk-dulu. Item yang sudah pernah direview ditampilkan dengan badge "Sudah Diulas" dan field-nya di-disable.
- Upload foto lampiran: komponen file input yang menerima `image/*`, maks 10 MB per file, maks 5 file. File diupload ke endpoint `/api/upload/minio` sebelum POST review, URL hasilnya disertakan dalam body `POST /api/reviews`. Schema DB untuk `review_images` perlu ditambahkan (table terpisah dengan FK ke `reviews.id`).
- Di tabel admin, kolom komentar diubah dari `line-clamp-2` ke `line-clamp-1` dan `max-w-[220px]`.
- KPI card "Disembunyikan (Hidden)" dihapus dari `ReviewStatsCards`. Grid diubah dari 4 kolom menjadi 3 kolom (Total, Rating Rata-rata, Visible).
- Halaman riwayat ulasan user dibuat di `/profile/my-reviews` atau sebagai tab di dalam profil — daftar ulasan yang pernah ditulis user, dengan info produk, rating, tanggal, dan link ke halaman produk.

### Maintenance

- Link `<a href="/admin/login">` di `app/maintenance/page.tsx` dihapus sepenuhnya (termasuk kalimat pembungkusnya).
- Halaman maintenance menjadi client component dan menambahkan `useEffect` yang memanggil `GET /api/maintenance-status` setiap 5 detik. Ketika respons `active: false`, jalankan `window.location.replace("/")` atau `router.replace("/")` untuk redirect ke homepage.
- Interval polling dihentikan (cleanup) saat komponen unmount.

### Orders

- Di backend `app/api/payments/midtrans/webhook/route.ts`: pastikan `timestamp` yang dipakai untuk `paidAt` berasal dari `notification.transaction_time` (string ISO dari Midtrans), bukan `new Date()`. Jika `transaction_time` tidak ada, fallback ke `new Date()`.
- Form tambah checkpoint di admin: field "Status" diganti dari `<Input>` free-text menjadi `<select>` / `AdminSelect` dengan opsi predefined: `PICKED_UP`, `IN_TRANSIT`, `AT_HUB`, `OUT_FOR_DELIVERY`, `DELIVERED`, `RETURNED`, `FAILED_ATTEMPT`. Field "Waktu" (`datetime-local`) dihapus dari form. Backend endpoint `POST /api/admin/orders/[id]/tracking` menggunakan `new Date()` jika tidak ada `timestamp` di body — pastikan ini sudah diimplementasikan.
- Timeline pesanan user (`TrackingTimeline`): semua entry menggunakan dot berwarna. Dot entry terbaru (`idx === 0`) pakai warna aksen status order saat ini; entry lama pakai warna muted. Ikon `CheckCircle2` dihapus dari seluruh entry timeline.

### Complaint & Refund

- Di halaman complaint user dan refund user: ganti `setSubmitted(true)` dengan `toast.success(...)` (menggunakan library sonner yang sudah ada di project) diikuti `router.push(`/profile/orders/${id}`)` setelah delay ~300ms.
- Form lampiran: tambahkan `<input type="file" multiple accept="image/*,application/pdf">` dengan validasi maks 5 file dan maks 5 MB per file. Upload ke MinIO sebelum POST. Backend endpoint complaint dan refund perlu menerima array `attachment_urls`.
- Bug refund "metode otomatis": audit fungsi `requiresManualProof()` — pastikan semua tipe pembayaran yang dipakai di environment testing (mis. `"manual_payment"`, `"midtrans_snap"`) masuk ke set `MANUAL_REFUND_PAYMENT_TYPES` jika memang manual. Juga audit endpoint `POST /api/admin/orders/[id]/refund` — pastikan response body pada error mencerminkan status DB sebenarnya (tidak silently succeed lalu return error).
- Nomor WA: audit query di `complaintService.getAdminComplaintById()` — pastikan JOIN ke tabel `users` menyertakan kolom `phone`.
- Halaman detail komplain user: buat `/profile/orders/[id]/complaint/[complaintId]` yang menampilkan status, deskripsi, lampiran, dan history update status komplain.
- Halaman daftar refund admin: buat `/admin/refunds` dengan tabel semua refund lintas order, kolom: Order No., Customer, Nominal, Metode, Status, Tanggal. Masing-masing baris link ke detail order terkait.
- Halaman detail refund user: buat `/profile/orders/[id]/refund/[refundId]` yang menampilkan status refund, nominal, metode, estimasi waktu, dan bukti transfer (jika ada).
- Layout detail complaint admin: rearrange menjadi 2 kolom (kiri: deskripsi + lampiran + history update; kanan: info order, kontak customer, action panel) dengan padding dan spacing yang lebih tight.

### Invoice

- Tombol "Cetak" (`<Button onClick={handlePrint}>`) dihapus dari `OrderInvoiceModal`.
- "Unduh PDF": implementasikan menggunakan `html2canvas` + `jsPDF` atau `@react-pdf/renderer`. Layout struk: lebar kertas 80mm (atau A5 potrait), header logo + nama toko, metadata pesanan (nomor, tanggal, nama penerima), daftar item (nama produk, qty, harga satuan, subtotal), ringkasan (subtotal, ongkir, diskon, total), footer terima kasih. Tidak ada modal — klik "Unduh PDF" langsung trigger download file `.pdf`.

---

## Testing Decisions

**Prinsip**: uji perilaku yang terlihat dari luar komponen, bukan implementasi internal. Gunakan seam tertinggi yang bisa dijangkau.

- **Ulasan halaman user**: render halaman dengan order yang memiliki 2 item (1 sudah diulas, 1 belum) → verifikasi item sudah diulas ter-disable, item belum diulas aktif, form submit memanggil `POST /api/reviews` dengan payload benar.
- **Polling maintenance**: mock `fetch('/api/maintenance-status')` yang awalnya return `{active: true}` lalu setelah beberapa tick return `{active: false}` → verifikasi `router.replace('/')` dipanggil.
- **Timestamp paidAt**: unit test helper yang mem-parse `transaction_time` dari Midtrans payload → verifikasi output adalah Date yang benar.
- **Checkpoint dropdown**: render form checkpoint → verifikasi dropdown berisi opsi predefined dan tidak ada field datetime.
- **Success toast complaint/refund**: submit form complaint/refund, mock `fetch` return sukses → verifikasi toast muncul dan router.push dipanggil.
- Prior art untuk test: lihat test yang sudah ada di `__tests__/` atau file `*.test.ts` di project untuk pola mock fetch dan render.

---

## Out of Scope

- Notifikasi real-time (WebSocket/SSE) untuk update status komplain atau refund.
- Fitur moderasi ulasan (approve/reject) di admin.
- Integrasi Midtrans Refund API (refund tetap manual atau via panel admin existing).
- Halaman `/admin/complaints` yang lebih lengkap (di luar rearrange layout yang sudah ada).
- Export tabel refund admin ke CSV/Excel.
- Paginasi pada halaman riwayat ulasan user (cukup semua ditampilkan untuk sekarang).
- Push notification ke user ketika status komplain atau refund berubah.

---

## Further Notes

- Spec ini mencakup 5 area berbeda. Implementasi sebaiknya dikerjakan area per area untuk memudahkan review.
- Bug status refund perlu investigasi lebih dulu sebelum implementasi — identifikasi apakah masalah di frontend (klassifikasi `paymentType`) atau backend (response body saat error) sebelum fix.
- Untuk "Unduh PDF struk", evaluasi dulu apakah `@react-pdf/renderer` sudah ada di dependencies project. Jika belum, `html2canvas` + `jsPDF` lebih ringan untuk case ini.
- Schema DB baru yang dibutuhkan: tabel `review_images` (FK ke `reviews.id`), field `attachment_urls` di tabel `complaints` dan `refunds` (atau tabel relasi terpisah).
