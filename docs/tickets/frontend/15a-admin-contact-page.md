# 15a: Buat halaman `/admin/contact` (Kelola Kontak & Media Sosial)

**Spec:** `docs/specs/3-spec-settings-atomic.md`
**Blocked by:** —
**Status:** partial — admin done, user-facing pending

## What to build

Buat halaman baru `/admin/contact` yang menggabungkan dua section:
1. **Kontak & Lokasi** — email operasional, nomor WhatsApp/telepon, alamat lengkap toko
2. **Media Sosial** — daftar platform + URL dengan dropdown platform terbatas

Data disimpan via `PATCH /api/admin/settings` (key: `store_email`, `store_phone`, `store_address`, `store_social_links`).

## Acceptance criteria

- [x] Halaman `/admin/contact` dapat diakses dan menampilkan data dari DB saat mount (GET `/api/admin/settings`).
- [x] Section Kontak: field email, telepon, alamat — submit PATCH key yang relevan; toast sukses/error; button disabled saat loading.
- [x] Section Media Sosial: form berupa dynamic rows — tiap row punya **dropdown platform** (Instagram, TikTok, Facebook, YouTube, Twitter/X, WhatsApp, LinkedIn) + field URL. Admin bisa tambah row baru dan hapus row yang ada.
- [x] Dropdown platform menampilkan ikon tiap platform di sebelah nama (SVG/inline, tidak butuh CDN eksternal).
- [x] Submit Media Sosial menyimpan array `[{ platform, url }]` sebagai JSON ke `store_social_links`; row kosong (platform dan URL keduanya kosong) difilter sebelum dikirim.
- [x] Loading skeleton ditampilkan saat fetch awal.
- [x] Entry sidebar "Kelola Kontak" (`/admin/contact`, ikon `Phone` atau `MapPin`) ditambahkan ke `adminNavItems` di `components/admin/sidebar.tsx`, role: `SUPERADMIN`, `ADMIN`.

## Notes

- Gunakan `settingsService.getSettings()` dan `settingsService.patchSettings()` yang sudah ada — tidak perlu service baru.
- Pola komponen: ikuti `store-info-section.tsx` (useCallback fetch on mount, isSaving state, toast dari `@/components/admin/use-toast`).
- Komponen boleh dibuat di `components/admin/contact/` atau langsung inline di page — bebas selama tidak duplikasi logika fetch.
- Field email, telepon, alamat **dihapus** dari `store-info-section.tsx` di ticket ini juga (koordinasi dengan 15c).

---

## Part B: Wire halaman `/contact` user ke DB

**Status:** ready-for-agent
**Blocked by:** Part A (done)

### What to build

Halaman `/contact` user saat ini menampilkan data hardcoded (nomor WA, email, handle sosmed). Sambungkan ke data real dari DB yang sudah dikelola admin via `/admin/contact`.

Caranya: `app/(user)/contact/page.tsx` adalah Server Component — fetch langsung saat render di server, tanpa `useEffect` atau client-side fetch. Data dioper ke child components via props.

### Acceptance criteria

- [ ] `app/(user)/contact/page.tsx` fetch `store_email`, `store_phone`, `store_address`, `store_social_links` dari DB saat render (server-side, bukan client-side).
- [ ] `SocialSection` di `components/user/contact/social-section.tsx` menerima data via props — konstanta `DEFAULT_CONTACTS` tidak lagi dipakai sebagai sumber utama; fallback ke default hanya jika DB kosong.
- [ ] Nomor WA, email, handle sosmed yang tampil di halaman `/contact` user mencerminkan data yang admin simpan di `/admin/contact`.
- [ ] Jika fetch gagal atau data kosong, halaman tetap render dengan fallback graceful (tidak crash).

### Notes

- Gunakan Server Component fetch — tidak perlu `useEffect`, tidak perlu state. `page.tsx` sudah async-ready.
- `settingsService.getSettings()` dipanggil di level `page.tsx`, hasilnya di-destructure dan diteruskan sebagai props.
- Pastikan base URL untuk server-side fetch sudah dikonfigurasi (cek `NEXT_PUBLIC_BASE_URL` atau pola yang dipakai Server Components lain di project ini).
