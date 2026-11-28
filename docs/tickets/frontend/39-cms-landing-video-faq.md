# 39: CMS Landing Page — editor Video Demo & FAQ

**What to build:** Lanjutan halaman `/admin/landing-page` (dari tiket 38). Tiket ini menambahkan editor untuk section VideoDemo dan FAQ, termasuk promo banner di dalam FAQ.

**Blocked by:** 38 — CMS Landing Page: editor Hero, About, InfoCards, Marquee

**Status:** done

## Editor Section: Video Demo

Field yang bisa diedit:
- Judul section
- Deskripsi section
- URL YouTube

Perilaku player di halaman publik: saat pengunjung klik tombol play, muncul popup modal yang embed video YouTube dari URL yang dikonfigurasi (bukan autoplay file lokal seperti saat ini). URL harus divalidasi sebagai URL YouTube yang valid sebelum bisa disimpan.

## Editor Section: FAQ

### Promo Banner (bagian atas FAQ)
- Judul prefix (teks sebelum highlight)
- Deskripsi
- 4 foto thumbnail: masing-masing bisa diisi URL gambar (upload file di luar scope — cukup input URL/path)

### Accordion Q&A
- Daftar pasangan pertanyaan–jawaban
- Bisa tambah item baru, edit pertanyaan dan jawaban, hapus item
- Bisa reorder (drag & drop atau tombol up/down)
- Minimal 1 item harus ada

## Acceptance criteria

- [x] Editor VideoDemo menampilkan nilai terkini dari DB
- [x] Validasi URL YouTube: format tidak valid ditolak sebelum simpan
- [x] Simpan VideoDemo: judul, deskripsi, dan URL tersimpan; popup di halaman publik memutar video YouTube yang baru
- [x] Editor FAQ promo banner: semua field tersimpan dan terlihat di halaman publik
- [x] Editor FAQ accordion: tambah/edit/hapus item bekerja
- [x] Reorder FAQ accordion: urutan tersimpan dan tercermin di halaman publik
- [x] Minimal 1 item FAQ divalidasi sebelum simpan
- [x] Halaman `/admin/landing-page` tetap satu halaman dengan tiket 38 (tab/accordion yang sama, section baru ditambahkan)
