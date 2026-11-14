# 15d: Refactor `/admin/settings` — hapus tab, sisakan Identitas Toko + Umum

**Spec:** `docs/specs/3-spec-settings-atomic.md`
**Blocked by:** 15a, 15b, 15c (konten tab Kontak, Pembayaran, Pengiriman harus sudah punya halaman sendiri sebelum dihapus dari sini)
**Status:** ready-for-agent

## What to build

Refactor halaman `/admin/settings` yang sekarang bertab menjadi halaman flat tanpa tab. Hanya dua section yang tersisa: **Identitas Toko** dan **Pengaturan Umum**.

## Acceptance criteria

- [ ] Halaman `/admin/settings` tidak lagi menggunakan tab-switcher — layout flat, dua section tampil langsung.
- [ ] Section Identitas Toko: field nama toko (`store_name`), tagline (`store_tagline`), URL logo (`store_logo_url`) dengan preview gambar; submit PATCH; toast sukses/error; button disabled saat loading.
- [ ] Section Pengaturan Umum: field `order_expires_hours`; submit PATCH; toast sukses/error; button disabled saat loading.
- [ ] Field kontak (email, telepon, alamat) dan field media sosial **dihapus** dari `store-info-section.tsx` — concern ini sudah pindah ke `/admin/contact`.
- [ ] Import `PaymentSection` dan `ShippingSection` **dihapus** dari settings page.
- [ ] Deskripsi halaman di page header diupdate mencerminkan scope yang lebih sempit ("Kelola identitas dan pengaturan umum toko").
- [ ] Sidebar entry "Settings" (`/admin/settings`) tetap ada dan aktif saat di halaman ini.

## Notes

- `store-info-section.tsx` perlu diupdate: hapus state dan field `email`, `contact`, `address`, `instagram`, `tiktok`, `facebook`; hapus Section Kontak & Lokasi dan Section Media Sosial dari render; hanya kirim `store_name`, `store_tagline`, `store_logo_url` saat PATCH.
- `general-section.tsx` tidak perlu diubah.
- Tab array `TABS` dan `useState<TabValue>` di `settings/page.tsx` dihapus seluruhnya.
- Pastikan tidak ada import yang tersisa dari komponen yang sudah dipindahkan.
