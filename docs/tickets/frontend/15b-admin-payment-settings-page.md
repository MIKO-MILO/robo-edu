# 15b: Buat halaman `/admin/payment-settings` (Kelola Pembayaran)

**Spec:** `docs/specs/3-spec-settings-atomic.md`
**Blocked by:** —
**Status:** ready-for-agent

## What to build

Buat halaman baru `/admin/payment-settings` dengan konten yang dipindahkan dari tab Pembayaran di `/admin/settings` (komponen `PaymentSection`), tanpa mengubah logika yang sudah ada.

## Acceptance criteria

- [ ] Halaman `/admin/payment-settings` dapat diakses dan menampilkan data dari DB saat mount.
- [ ] Section Gateway Midtrans: status koneksi (connected/sandbox/production) ditampilkan read-only — diambil dari config atau default, bukan dari DB.
- [ ] Section Channel Pembayaran: toggle aktif/nonaktif per channel dari `payment_methods_config`; submit PATCH; toast sukses/error; button disabled saat loading.
- [ ] Section Harga Membership: field harga (`membership_plus_price`) dan durasi (`membership_plus_duration_months`); submit disertakan bersama channel dalam satu PATCH; perubahan langsung tercermin di halaman konfirmasi membership (backend baca dari DB at request time).
- [ ] Loading skeleton ditampilkan saat fetch awal.
- [ ] Entry sidebar "Kelola Pembayaran" (`/admin/payment-settings`, ikon `CreditCard`) ditambahkan ke `adminNavItems`, role: `SUPERADMIN`, `ADMIN`.

## Notes

- Komponen `PaymentSection` dari `components/admin/settings/payment-section.tsx` **dipakai langsung** di halaman baru — tidak perlu rewrite, cukup import dan render.
- Tab "Pembayaran" di `/admin/settings/page.tsx` **dihapus** di ticket 15d.
- Halaman baru cukup berupa wrapper page yang render `<PaymentSection />` dengan header halaman.
