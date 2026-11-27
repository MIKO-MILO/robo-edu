# 19: Halaman Detail Review Admin + Bersihkan Tabel Review

**What to build:** Tabel review admin saat ini memiliki fitur hide/show yang tidak diperlukan dan tidak ada halaman detail review. Ticket ini membersihkan tabel dan membangun halaman detail yang proper.

**Bersihkan tabel review:**
- Hapus tombol hide/show (toggle PUBLISHED/HIDDEN) dari kolom aksi.
- Hapus kolom "Status" (VISIBLE/HIDDEN) dari tabel.
- Hapus filter "Status" dari toolbar.
- Hapus dialog modal inline yang muncul dari "Buka Modal".
- Hapus tombol "Baca selebihnya" dan "Buka Modal" dari cell komentar; truncate teks tetap ada tapi tanpa expand toggle.
- Ganti semua aksi tersebut dengan satu tombol "Lihat Detail" yang mengarahkan ke halaman detail.

**Buat API detail review:**
- `GET /api/admin/reviews/[id]`: ambil data review lengkap dengan join ke order items, order, produk, dan user. Kembalikan semua field review ditambah nama produk, nama user, email user, dan nomor order terkait.

**Buat halaman detail review:**
- Halaman `/admin/reviews/[id]` menampilkan: nama produk, nama user, email user, rating bintang, isi komentar lengkap, tanggal review, dan nomor order terkait.
- Tombol kembali ke daftar review.
- Tombol "Hapus Review" yang memanggil endpoint DELETE yang sudah ada, diikuti redirect ke daftar review.

API PATCH status review yang sudah ada di backend tidak diubah — cukup tidak dipanggil dari UI.

**Blocked by:** None (dapat dimulai segera)

**Status:** ready-for-agent

- [x] Tabel review tidak lagi memiliki kolom Status dan tombol hide/show.
- [x] Filter "Status" (VISIBLE/HIDDEN) tidak ada di toolbar.
- [x] Modal inline dan tombol "Buka Modal" / "Baca selebihnya" sudah dihapus dari tabel.
- [x] Setiap baris review memiliki tombol "Lihat Detail" yang mengarahkan ke `/admin/reviews/[id]`.
- [x] `GET /api/admin/reviews/[id]` mengembalikan data review beserta nama produk, nama user, email user, dan nomor order.
- [x] Halaman `/admin/reviews/[id]` menampilkan semua data tersebut dengan desain yang konsisten.
- [x] Tombol "Hapus Review" di halaman detail berfungsi dan mengarahkan kembali ke daftar setelah berhasil.
