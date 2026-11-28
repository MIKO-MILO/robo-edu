# 38: CMS Landing Page — editor Hero, About, InfoCards, Marquee

**What to build:** Buat halaman admin baru `/admin/landing-page` sebagai pusat CMS landing page. Tiket ini mencakup empat section pertama: Hero, About (ICardsInfo), InfoCardsList, dan TextMarquee.

**Blocked by:** 36 — DB schema & API: landing page CMS config

**Status:** ready-for-agent

## Halaman `/admin/landing-page`

Buat halaman baru di admin panel. Layout menggunakan tab atau accordion per section agar tidak terlalu panjang. Semua section pada tiket ini dan tiket 39 hidup di halaman yang sama.

Setiap section punya tombol **Simpan** masing-masing (atau satu tombol Simpan global — pilih yang paling konsisten dengan pola halaman admin lain). Saat disimpan, data langsung di-`PUT` ke `/api/admin/landing-config` dan perubahan langsung terlihat di halaman publik.

## Editor Section: Hero

Field yang bisa diedit:
- Headline utama (teks, bagian pertama sebelum highlight)
- Deskripsi / subtext
- Label CTA utama ("Jelajahi Mainan Robot") + URL CTA utama
- Label CTA sekunder ("Tonton Demo")

> Gambar/aset visual (robot, background, typewriter items) tidak termasuk scope — dikontrol oleh developer.

## Editor Section: About (ICardsInfo)

Field yang bisa diedit:
- Badge label ("Tentang Kami")
- Judul bagian 1 (titleMain) dan bagian 2 (titleHighlight)
- Deskripsi paragraf
- 4 feature checklist label (teks tiap item, jumlah tetap 4)

## Editor Section: InfoCardsList

4 kartu fitur dengan field per kartu:
- Judul kartu
- Deskripsi kartu

Jumlah kartu tetap 4, ikon tidak bisa diganti (dikontrol developer).

## Editor Section: TextMarquee

- Daftar item teks berjalan (array string)
- Bisa tambah item baru, edit teks item, hapus item
- Minimal 1 item harus ada

## Acceptance criteria

- [ ] Halaman `/admin/landing-page` dapat diakses oleh admin
- [ ] Editor Hero menampilkan nilai terkini dari DB (atau default jika belum ada)
- [ ] Simpan Hero: perubahan tersimpan dan langsung terlihat di landing publik
- [ ] Editor About menampilkan dan menyimpan semua field dengan benar
- [ ] Editor InfoCardsList menampilkan dan menyimpan judul & deskripsi 4 kartu
- [ ] Editor TextMarquee: tambah/edit/hapus item teks bekerja; minimal 1 item divalidasi
- [ ] Simpan TextMarquee: teks marquee di halaman publik berubah sesuai input
- [ ] Validasi: field wajib tidak boleh kosong sebelum bisa disimpan
- [ ] UI konsisten dengan pola halaman admin lain di repo ini
