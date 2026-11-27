# 28: Tambah review images ke API admin detail review

**What to build:** `GET /api/admin/reviews/:id` saat ini hanya mereturn data review tanpa gambar — tabel `review_images` tidak diikutkan dalam query. Tiket ini menambahkan join ke `review_images` sehingga response menyertakan array gambar, yang kemudian bisa ditampilkan di halaman admin detail review (tiket frontend 32).

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] `GET /api/admin/reviews/:id` menyertakan array `images: [{ id, url }]` di response — empty array jika review tidak punya gambar
- [ ] Query mengambil semua baris dari `review_images` yang ber-`review_id` sesuai, dieksekusi dalam satu roundtrip (bukan N+1)
- [ ] Response shape tetap backward-compatible — field yang sudah ada tidak berubah nama atau tipe
