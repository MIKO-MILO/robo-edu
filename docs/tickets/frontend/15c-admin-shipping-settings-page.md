# 15c: Buat halaman `/admin/shipping-settings` (Kelola Pengiriman)

**Spec:** `docs/specs/3-spec-settings-atomic.md`
**Blocked by:** —
**Status:** ready-for-agent

## What to build

Buat halaman baru `/admin/shipping-settings` dengan konten yang dipindahkan dari tab Pengiriman di `/admin/settings` (komponen `ShippingSection`), tanpa mengubah logika yang sudah ada.

## Acceptance criteria

- [ ] Halaman `/admin/shipping-settings` dapat diakses dan menampilkan data dari DB saat mount.
- [ ] Daftar provider aktif di-fetch dari `GET /api/shipping-providers`; provider default di-fetch dari `GET /api/admin/settings` (key `shipping_default_provider_id`).
- [ ] Admin dapat memilih provider default dari daftar (radio-select); submit menyimpan ke DB via PATCH `shipping_default_provider_id`; toast sukses/error; button disabled saat loading dan saat pilihan sama dengan nilai DB.
- [ ] Loading skeleton ditampilkan saat fetch awal.
- [ ] Entry sidebar "Kelola Pengiriman" (`/admin/shipping-settings`, ikon `Truck`) ditambahkan ke `adminNavItems`, role: `SUPERADMIN`, `ADMIN`.

## Notes

- Komponen `ShippingSection` dari `components/admin/settings/shipping-section.tsx` **dipakai langsung** di halaman baru.
- Tab "Pengiriman" di `/admin/settings/page.tsx` **dihapus** di ticket 15d.
- Halaman baru cukup berupa wrapper page yang render `<ShippingSection />` dengan header halaman.
