# 32: Tampilkan review images di halaman admin detail review

**What to build:** Halaman admin detail review saat ini hanya menampilkan rating dan komentar — gambar dari tabel `review_images` tidak tampil karena API belum mengembalikannya. Setelah tiket backend/28 menambahkan `images[]` ke response, tiket ini mewire data tersebut ke UI sebagai galeri foto, serupa dengan `ComplaintAttachmentGallery` yang sudah ada di detail complaint.

**Blocked by:** backend/28 — API harus sudah mengembalikan `images[]` sebelum UI bisa merendernya

**Status:** done

- [x] Halaman admin detail review menampilkan galeri foto jika review memiliki gambar (`images.length > 0`)
- [x] Jika review tidak memiliki gambar, bagian galeri tidak muncul (tidak ada placeholder kosong)
- [x] Setiap gambar bisa diklik untuk melihat ukuran penuh (lightbox atau tab baru), sejajar dengan perilaku di complaint detail
- [x] Tipe TypeScript untuk `ReviewDetail` diperbarui agar menyertakan field `images: { id: string; url: string }[]`
