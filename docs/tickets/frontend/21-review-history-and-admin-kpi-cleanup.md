<!-- # 21: Riwayat Ulasan User + Bersihkan KPI Admin Reviews

**What to build:** Dua perbaikan kecil namun terpisah secara lokasi:

**Riwayat ulasan user** — Tambahkan halaman `/profile/my-reviews` yang menampilkan semua ulasan yang pernah ditulis oleh user yang sedang login. Setiap baris menampilkan: nama produk, rating bintang, cuplikan komentar, tanggal ulasan, dan link ke halaman produk. Tambahkan link/tab "Ulasan Saya" ke menu navigasi profil user. API yang digunakan: `GET /api/reviews?my=true` (endpoint baru atau tambah filter ke endpoint reviews yang sudah ada).

**Bersihkan KPI admin reviews** — Di komponen `ReviewStatsCards`, hapus kartu "Disembunyikan (Hidden)" sehingga tersisa 3 kartu: Total Review, Rata-rata Rating, Tampil (Visible). Grid diubah dari 4 kolom menjadi 3 kolom. Di kolom komentar tabel review, ubah dari `line-clamp-2` menjadi `line-clamp-1` dan kurangi lebar kolom agar tabel lebih rapat.

**Blocked by:** None (dapat dimulai segera)

**Status:** done

- [x] Halaman `/profile/my-reviews` menampilkan daftar ulasan milik user yang sedang login.
- [x] Setiap entri menampilkan nama produk, rating bintang, komentar singkat, dan tanggal.
- [x] Link "Ulasan Saya" muncul di navigasi profil user.
- [ ] KPI card "Disembunyikan (Hidden)" tidak lagi muncul di halaman admin ulasan.
- [ ] Grid KPI admin reviews tampil dalam 3 kolom.- [x] Kolom komentar di tabel admin reviews terpotong setelah 1 baris (`line-clamp-1`). -->

FITUR HIDDEN REVIEW DIKEMBALIKAN