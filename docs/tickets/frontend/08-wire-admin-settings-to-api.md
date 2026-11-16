# 08: Wire admin settings page ke real API

**What to build:** Halaman `/admin/settings` memiliki empat tab (Identitas Toko, Pembayaran, Pengiriman, Umum) yang semuanya menggunakan nilai hardcode dan tombol "Simpan" yang hanya memanggil `setTimeout` tanpa mengirim data ke manapun. Backend `GET /api/admin/settings` dan `PATCH /api/admin/settings` sudah tersedia (backend ticket 11). Ticket ini menghubungkan setiap tab ke API nyata.

**Blocked by:** None (backend API sudah ada)

**Status:** done

- [x] Semua tab settings melakukan `GET /api/admin/settings` saat mount dan mengisi form dengan nilai dari DB — bukan nilai hardcode.
- [x] Tab Identitas Toko: submit memanggil `PATCH /api/admin/settings` dengan keys yang relevan (`store_name`, `store_tagline`, `store_logo_url`, `store_email`, `store_phone`, `store_address`, `store_social_links`); menampilkan toast sukses atau error.
- [x] Tab Pembayaran: menampilkan konfigurasi Midtrans dan toggle aktif/nonaktif per channel pembayaran dari `payment_methods_config`; submit persist ke DB via `PATCH /api/admin/settings`. Field `membership_plus_price` dan `membership_plus_duration_months` juga tersedia dan tersimpan di tab ini.
- [x] Tab Pengiriman: provider list fetch dari `GET /api/shipping-providers`; default provider fetch dari `GET /api/admin/settings` (key `shipping_default_provider_id`); perubahan provider default disimpan ke DB.
- [x] Tab Umum: `order_expires_hours` diambil dari DB dan disimpan kembali ke DB saat submit.
- [x] Tombol "Simpan" dinonaktifkan selama request berlangsung; menampilkan loading state.
- [x] Perubahan `membership_plus_price` dan `membership_plus_duration_months` langsung tercermin di halaman konfirmasi membership tanpa restart — backend `GET /api/membership/plan-info` dan `POST /api/checkout/membership` baca dari DB via `getSetting()` at request time (diverifikasi di `tests/membership/purchase-flow.test.ts`).

## Catatan implementasi

**Baru ditambahkan ke backend** (`app/api/admin/settings/route.ts`):
- `store_tagline` — string
- `store_logo_url` — string (URL, bukan file upload)
- `store_social_links` — JSON array `[{ platform, url }]`, divalidasi sebagai array

**Service layer**: `lib/api/services/settings.service.ts` — `getSettings()` dan `patchSettings()`

**Sosial media** disimpan sebagai satu JSON blob `store_social_links` (bukan flat keys per platform) agar admin bisa tambah/hapus platform bebas tanpa perubahan backend. Consumer (footer, halaman kontak) cukup `JSON.parse` satu key.

**Logo** disimpan sebagai URL string di `store_logo_url`. Upload file ke storage dilakukan terpisah, URL-nya di-paste ke field ini.

**Field yang belum ada backend key-nya** dan masih lokal-state: toggle fitur di Tab Umum (`enableReviewSystem`, `enableGuestCheckout`, `maintenanceMode`) — perlu ticket terpisah bila dibutuhkan.
