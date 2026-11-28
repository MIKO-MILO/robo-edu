# 41: Sidebar admin — tambah menu Landing Page

**What to build:** Tambahkan entry navigasi "Landing Page" di sidebar admin yang mengarah ke `/admin/landing-page`.

**Blocked by:** 38 — CMS Landing Page: editor Hero, About, InfoCards, Marquee

**Status:** ready-for-agent

## Detail

- Tambahkan item "Landing Page" di `components/admin/sidebar.tsx`
- Posisi: di group yang paling logis sesuai struktur sidebar yang sudah ada (misalnya di group Content atau di antara Settings dan Vouchers)
- Gunakan ikon yang sesuai dari Lucide (misalnya `LayoutTemplate` atau `MonitorSmartphone`)
- Route aktif (`/admin/landing-page`) harus ter-highlight sesuai pola aktif sidebar yang sudah ada

## Acceptance criteria

- [ ] Item "Landing Page" muncul di sidebar admin
- [ ] Klik item mengarahkan ke `/admin/landing-page`
- [ ] Highlight aktif berfungsi saat berada di halaman `/admin/landing-page`
- [ ] Tampilan konsisten dengan item sidebar lainnya (ikon, tipografi, spacing)
