# 15: Pecah halaman `/admin/settings` menjadi halaman-halaman terpisah

**Status:** ready-for-agent

---

## Problem Statement

Halaman `/admin/settings` saat ini menggabungkan empat concern yang berbeda dalam satu halaman bertab:
- Identitas toko (nama, tagline, logo)
- Kontak & lokasi (email, telepon, alamat) + media sosial
- Konfigurasi pembayaran (channel toggle, harga membership)
- Konfigurasi pengiriman (provider default)

Penggabungan ini membuat navigasi membingungkan — admin harus tahu di tab mana sebuah setting berada. Selain itu, section Media Sosial saat ini hanya menyimpan URL mentah tanpa konteks platform, padahal consumer (footer, halaman kontak) butuh logo/ikon tiap platform. Section kontak dan sosmed secara konseptual adalah satu unit ("cara menghubungi toko") yang berbeda dari "konfigurasi teknis pembayaran."

---

## Solution

Pecah menjadi empat halaman terpisah, masing-masing dapat diakses langsung dari sidebar admin:

| Halaman | Route | Concern |
|---|---|---|
| Pengaturan | `/admin/settings` | Identitas toko (nama, tagline, logo URL) + pengaturan umum (`order_expires_hours`) |
| Kelola Kontak | `/admin/contact` | Kontak & lokasi (email, telepon, alamat) + media sosial |
| Kelola Pembayaran | `/admin/payment-settings` | Gateway Midtrans (read-only) + toggle channel + harga membership |
| Kelola Pengiriman | `/admin/shipping-settings` | Daftar provider + provider default |

Untuk section Media Sosial: form berubah dari input URL bebas menjadi daftar dengan **pilihan platform** (dropdown dengan ikon) + field URL. Platform yang disediakan: Instagram, TikTok, Facebook, YouTube, Twitter/X, WhatsApp, LinkedIn. Disimpan sebagai JSON array `store_social_links` di DB (sudah ada key-nya).

---

## User Stories

1. Sebagai admin, saya ingin mengakses pengaturan identitas toko dari sidebar langsung, sehingga saya tidak perlu tahu di tab mana setting tersebut berada.
2. Sebagai admin, saya ingin mengedit nama toko, tagline, dan URL logo di halaman `/admin/settings`, sehingga informasi brand tersimpan ke DB.
3. Sebagai admin, saya ingin mengatur `order_expires_hours` di halaman `/admin/settings`, sehingga batas waktu pembayaran order dapat dikonfigurasi.
4. Sebagai admin, saya ingin mengelola kontak toko (email, telepon, alamat) di halaman `/admin/contact` yang terpisah, sehingga perubahan kontak tidak tercampur dengan pengaturan teknis.
5. Sebagai admin, saya ingin menambah, mengedit, dan menghapus link media sosial toko di `/admin/contact`, sehingga footer dan halaman kontak selalu menampilkan link terkini dari DB.
6. Sebagai admin, saya ingin memilih platform media sosial dari daftar yang sudah ditentukan (Instagram, TikTok, Facebook, YouTube, Twitter/X, WhatsApp, LinkedIn), sehingga ikon platform muncul secara konsisten di seluruh halaman publik yang menampilkannya.
7. Sebagai admin, saya ingin mengatur toggle aktif/nonaktif per channel pembayaran di halaman `/admin/payment-settings`, sehingga channel yang bermasalah dapat dimatikan tanpa deploy ulang.
8. Sebagai admin, saya ingin mengatur harga dan durasi paket membership Plus di `/admin/payment-settings`, sehingga perubahan langsung tercermin di halaman konfirmasi membership.
9. Sebagai admin, saya ingin melihat status koneksi Midtrans (sandbox/production) di `/admin/payment-settings` secara read-only, sehingga saya dapat memverifikasi konfigurasi gateway.
10. Sebagai admin, saya ingin memilih provider pengiriman default di `/admin/shipping-settings`, sehingga provider yang dipilih tersimpan ke DB dan digunakan saat checkout.
11. Sebagai admin, saya ingin melihat daftar provider pengiriman aktif di `/admin/shipping-settings`, sehingga saya tahu provider apa saja yang tersedia.
12. Sebagai pengguna halaman publik (footer, kontak), saya ingin melihat link media sosial toko beserta ikon platform yang sesuai, sehingga tampilan lebih informatif dan konsisten.

---

## Implementation Decisions

### Routing

Buat empat halaman di dalam `app/(admin)/admin/`:
- `settings/page.tsx` — refactor dari halaman existing, hanya tinggalkan Identitas Toko + Umum
- `contact/page.tsx` — halaman baru
- `payment-settings/page.tsx` — halaman baru
- `shipping-settings/page.tsx` — halaman baru

Halaman `/admin/settings` yang lama tetap ada di route yang sama, hanya kontennya dipersempit. Tab-based layout dihapus; masing-masing halaman berdiri sendiri.

### Sidebar / Navigasi Admin

Tambah tiga entry baru di sidebar admin (setelah atau di bawah Settings):
- "Kelola Kontak" → `/admin/contact`
- "Kelola Pembayaran" → `/admin/payment-settings`
- "Kelola Pengiriman" → `/admin/shipping-settings`

### Section Components

Refactor komponen dari `components/admin/settings/`:
- `store-info-section.tsx` → hilangkan field kontak (email, telepon, alamat) dan sosmed; pertahankan nama, tagline, logo URL
- `general-section.tsx` → tetap, hanya `order_expires_hours`
- `payment-section.tsx` → pindah ke halaman `/admin/payment-settings`; tambahkan field harga membership di sini juga (saat ini sudah ada)
- `shipping-section.tsx` → pindah ke halaman `/admin/shipping-settings`

Buat komponen baru untuk kontak:
- `contact-section.tsx` — email, telepon, alamat (PATCH `store_email`, `store_phone`, `store_address`)
- `social-links-section.tsx` — dynamic rows dengan dropdown platform + URL (PATCH `store_social_links`)

### Social Links: Platform Dropdown

Platform yang tersedia (fixed list, tidak perlu DB):

```
instagram | tiktok | facebook | youtube | twitter | whatsapp | linkedin
```

Tiap entry disimpan sebagai `{ platform: string; url: string }` dalam JSON array `store_social_links`. Ikon platform di-render dari komponen atau SVG yang di-bundle di frontend — tidak perlu CDN eksternal.

Shape yang sudah ada di DB tidak berubah, hanya form-nya yang membatasi input ke platform yang dikenal.

### Backend

Tidak ada perubahan backend. Key-key yang dipakai sudah ada di `SETTING_SPECS`:
- `store_name`, `store_tagline`, `store_logo_url`
- `store_email`, `store_phone`, `store_address`, `store_social_links`
- `payment_methods_config`, `membership_plus_price`, `membership_plus_duration_months`
- `shipping_default_provider_id`, `order_expires_hours`

### Data Fetching

Semua halaman baru tetap menggunakan `settingsService.getSettings()` dan `settingsService.patchSettings()` yang sudah ada. Tidak perlu hook atau service baru.

---

## Testing Decisions

Karena ini adalah perubahan UI murni (routing, layout, komponen) tanpa perubahan API atau logika bisnis baru, testing terfokus pada:

- **Verifikasi manual**: tiap halaman load data dari DB (GET) dan simpan ke DB (PATCH) dengan benar
- **Toast feedback**: sukses dan error muncul sesuai response API
- **Platform dropdown**: memilih platform dari daftar menampilkan ikon yang sesuai
- **Social links**: add row, hapus row, simpan — data masuk ke DB sebagai JSON array yang benar

Tidak ada unit test baru yang diperlukan untuk perubahan routing/layout. Jika ada regression test E2E, pastikan route `/admin/settings` masih bisa diakses (tidak dihapus, hanya dipersempit).

---

## Out of Scope

- Upload file logo langsung dari halaman (tetap menggunakan URL input)
- CRUD provider pengiriman dari UI (add/edit/delete provider — tidak ada backend endpoint-nya)
- Toggle fitur (review system, guest checkout, maintenance mode) — belum ada backend key
- Halaman publik yang mengonsumsi `store_social_links` (footer, halaman kontak) — ini scope ticket terpisah setelah data tersedia di DB

---

## Further Notes

Urutan pengerjaan yang disarankan:
1. Buat halaman `/admin/contact` dengan `contact-section` dan `social-links-section`
2. Buat halaman `/admin/payment-settings` (pindahkan `payment-section`)
3. Buat halaman `/admin/shipping-settings` (pindahkan `shipping-section`)
4. Refactor `/admin/settings` — hapus tab, sisakan identitas toko + umum
5. Update sidebar admin dengan tiga entry baru
6. Hapus komponen tab-switching dari `app/(admin)/admin/settings/page.tsx`

Komponen section yang sudah ada (`payment-section.tsx`, `shipping-section.tsx`) sudah terhubung ke API nyata — tinggal dipindahkan ke halaman baru tanpa perubahan logika.
