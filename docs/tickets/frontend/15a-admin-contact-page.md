# 15a: Buat halaman `/admin/contact` (Kelola Kontak & Media Sosial)

**Spec:** `docs/specs/3-spec-settings-atomic.md`
**Blocked by:** —
**Status:** ready-for-agent

## What to build

Buat halaman baru `/admin/contact` yang menggabungkan dua section:
1. **Kontak & Lokasi** — email operasional, nomor WhatsApp/telepon, alamat lengkap toko
2. **Media Sosial** — daftar platform + URL dengan dropdown platform terbatas

Data disimpan via `PATCH /api/admin/settings` (key: `store_email`, `store_phone`, `store_address`, `store_social_links`).

## Acceptance criteria

- [ ] Halaman `/admin/contact` dapat diakses dan menampilkan data dari DB saat mount (GET `/api/admin/settings`).
- [ ] Section Kontak: field email, telepon, alamat — submit PATCH key yang relevan; toast sukses/error; button disabled saat loading.
- [ ] Section Media Sosial: form berupa dynamic rows — tiap row punya **dropdown platform** (Instagram, TikTok, Facebook, YouTube, Twitter/X, WhatsApp, LinkedIn) + field URL. Admin bisa tambah row baru dan hapus row yang ada.
- [ ] Dropdown platform menampilkan ikon tiap platform di sebelah nama (SVG/inline, tidak butuh CDN eksternal).
- [ ] Submit Media Sosial menyimpan array `[{ platform, url }]` sebagai JSON ke `store_social_links`; row kosong (platform dan URL keduanya kosong) difilter sebelum dikirim.
- [ ] Loading skeleton ditampilkan saat fetch awal.
- [ ] Entry sidebar "Kelola Kontak" (`/admin/contact`, ikon `Phone` atau `MapPin`) ditambahkan ke `adminNavItems` di `components/admin/sidebar.tsx`, role: `SUPERADMIN`, `ADMIN`.

## Notes

- Gunakan `settingsService.getSettings()` dan `settingsService.patchSettings()` yang sudah ada — tidak perlu service baru.
- Pola komponen: ikuti `store-info-section.tsx` (useCallback fetch on mount, isSaving state, toast dari `@/components/admin/use-toast`).
- Komponen boleh dibuat di `components/admin/contact/` atau langsung inline di page — bebas selama tidak duplikasi logika fetch.
- Field email, telepon, alamat **dihapus** dari `store-info-section.tsx` di ticket ini juga (koordinasi dengan 15c).
