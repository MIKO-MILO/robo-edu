# 17: Halaman Form Komplain dan Form Pengembalian User

**What to build:** Pembeli yang sudah menerima paket perlu cara untuk mengajukan komplain atau meminta pengembalian barang, tapi saat ini tidak ada halaman untuk itu. Ticket ini membangun dua halaman form baru di bawah rute profil order:

**Form Komplain** (`/profile/orders/[id]/complaint`): form untuk mengajukan komplain atas barang yang bermasalah. Berisi: pilihan item produk dari order (dropdown atau radio dari order items), input subjek/alasan, textarea deskripsi. Submit ke `POST /api/complaints`. Hanya dapat diakses jika status order `DELIVERED` atau `COMPLETED`; jika bukan, redirect ke halaman detail order. Setelah submit berhasil, tampilkan pesan sukses dan kembali ke halaman detail order.

**Form Pengembalian** (`/profile/orders/[id]/refund`): form untuk mengajukan pengembalian barang. Berisi: pilihan item produk, alasan pengembalian, deskripsi detail. Submit ke endpoint refund user-facing. Hanya dapat diakses jika status order `DELIVERED` atau `COMPLETED`; jika bukan, redirect ke halaman detail order. Setelah submit berhasil, tampilkan pesan sukses dan kembali ke halaman detail order.

Desain kedua halaman menggunakan komponen UI yang sudah ada di codebase. Prinsip DRY — reuse komponen; KISS — form sesederhana mungkin sesuai field yang diterima backend; YAGNI — tidak perlu draft, preview, atau multi-step.

**Blocked by:** 20 — API endpoint komplain dan refund user-facing harus tersedia; 16 — tombol link ke halaman ini harus sudah ada

**Status:** ready-for-agent

- [ ] Halaman `/profile/orders/[id]/complaint` tersedia dan dapat diakses dari tombol "Ajukan Komplain" di halaman detail order.
- [ ] Form komplain memuat daftar item produk dari order yang bersangkutan.
- [ ] Submit form komplain mengirim data ke `POST /api/complaints` dan menampilkan feedback sukses/error.
- [ ] Halaman `/profile/orders/[id]/refund` tersedia dan dapat diakses dari tombol "Ajukan Pengembalian".
- [ ] Form pengembalian memuat daftar item produk dari order yang bersangkutan.
- [ ] Submit form pengembalian mengirim data ke endpoint refund user-facing dan menampilkan feedback sukses/error.
- [ ] Kedua halaman redirect ke halaman detail order jika status order bukan `DELIVERED` atau `COMPLETED`.
- [ ] Desain konsisten dengan sistem desain yang sudah ada (font, button variant, layout kartu).
