# 24: UX Complaint & Refund User — Toast Sukses, Lampiran, Layout Admin

**What to build:** Perbaikan UX pada alur complaint dan refund di sisi user dan admin:

**Toast sukses + auto-redirect** — Di halaman form komplain dan form pengembalian user, ganti tampilan sukses statis (`setSubmitted(true)` yang mengganti seluruh konten halaman) dengan: tampilkan toast/sonner sukses, lalu otomatis redirect ke halaman detail order (`/profile/orders/[id]`) setelah ~300ms.

**Form lampiran user** — Tambahkan komponen upload file di form komplain dan form pengembalian: input file yang menerima `image/*` dan `application/pdf`, maks 5 file, maks 5 MB per file. File diupload ke endpoint MinIO terlebih dahulu; URL hasilnya dikirim ke backend sebagai array `attachment_urls`. Tampilkan preview thumbnail untuk gambar dan nama file untuk PDF. Sertakan tombol hapus per file.

**Layout detail complaint admin lebih compact** — Rearrange layout halaman `/admin/complaints/[id]`: kolom kiri berisi deskripsi + lampiran + history update status; kolom kanan berisi info order, kontak customer (termasuk nomor WA yang kini sudah di-fix di backend), dan action panel. Kurangi padding dan spacing antar kartu agar lebih tight tanpa mengurangi keterbacaan.

**Blocked by:** 23-complaint-refund-attachment-and-wa-fix (backend harus bisa menerima attachment_urls dan mengembalikan customer_phone)

**Status:** ready-for-agent

- [ ] Setelah submit komplain berhasil, toast sukses muncul dan halaman redirect ke detail order secara otomatis.
- [ ] Setelah submit pengembalian berhasil, toast sukses muncul dan halaman redirect ke detail order secara otomatis.
- [ ] Form komplain user memiliki field upload lampiran (maks 5 file, maks 5 MB/file).
- [ ] Form pengembalian user memiliki field upload lampiran (maks 5 file, maks 5 MB/file).
- [ ] Thumbnail atau nama file tampil setelah file dipilih; ada tombol hapus per file.
- [ ] File diupload ke MinIO terlebih dahulu; URL-nya dikirim ke backend bersama form submission.
- [x] Layout detail complaint admin lebih compact dengan susunan 2 kolom yang rapi.
- [x] Nomor WhatsApp customer muncul dengan benar di detail complaint admin.
