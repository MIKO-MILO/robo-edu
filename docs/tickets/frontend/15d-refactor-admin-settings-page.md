# 15d: Refactor `/admin/settings` — hapus tab, sisakan Mode Pemeliharaan saja

**Spec:** `docs/specs/3-spec-settings-atomic.md`
**Blocked by:** 15a, 15b, 15c (konten tab Kontak, Pembayaran, Pengiriman harus sudah punya halaman sendiri sebelum dihapus dari sini)
**Status:** done

## What was built

Refactor halaman `/admin/settings` dari tab-switcher menjadi halaman flat. Scope dipersempit secara bertahap berdasarkan keputusan product:

1. Tab-switcher dihapus seluruhnya.
2. Section Identitas Toko dihapus (field kontak & media sosial sudah pindah ke `/admin/contact`, field identitas tidak lagi dikelola dari sini).
3. Section Pengaturan Umum disederhanakan: hanya menyisakan toggle **Mode Pemeliharaan**. Toggle Sistem Ulasan dan Checkout Tanpa Login dihapus.
4. Field `order_expires_hours` dipindah ke halaman **Kelola Pembayaran** (`/admin/payment-settings`), digabung ke dalam `PaymentSection` bersama metode pembayaran dan harga membership — satu tombol simpan untuk ketiganya.

## Hasil akhir

### `/admin/settings`
- Layout flat tanpa tab.
- Hanya menampilkan `GeneralSection`: satu toggle Mode Pemeliharaan (local state, belum terhubung ke backend).
- Deskripsi header: "Kelola konfigurasi umum sistem."

### `/admin/payment-settings`
- `PaymentSection` mengelola tiga concern sekaligus dalam satu card: metode pembayaran, harga membership, dan masa berlaku order (`order_expires_hours`).
- Satu PATCH request saat simpan mencakup `payment_methods_config`, `membership_plus_price`, `membership_plus_duration_months`, dan `order_expires_hours`.
- Validasi: `order_expires_hours` harus bilangan bulat positif sebelum PATCH dikirim.

### File yang diubah
- `app/(admin)/admin/settings/page.tsx` — hapus tab, hapus StoreInfoSection, sisakan GeneralSection
- `components/admin/settings/store-info-section.tsx` — hapus field kontak/sosial, hanya kirim `store_name`, `store_tagline`, `store_logo_url`
- `components/admin/settings/general-section.tsx` — hapus orderExpiresHours, hapus toggle Ulasan & Checkout; sisakan Mode Pemeliharaan
- `components/admin/settings/payment-section.tsx` — tambah state & fetch `order_expires_hours`, gabung ke PATCH body, tambah section UI di dalam card
- `app/(admin)/admin/payment-settings/page.tsx` — hapus OrderExpirySection, cukup render PaymentSection
- `components/admin/settings/order-expiry-section.tsx` — **dihapus** (logika dipindah ke PaymentSection)

## Acceptance criteria (direvisi)

- [x] Halaman `/admin/settings` tidak lagi menggunakan tab-switcher — layout flat.
- [x] Section Identitas Toko dihapus dari `/admin/settings`.
- [x] `store-info-section.tsx` hanya kirim `store_name`, `store_tagline`, `store_logo_url`; field kontak & sosial dihapus.
- [x] `GeneralSection` hanya menyisakan toggle Mode Pemeliharaan; toggle Ulasan & Checkout Tanpa Login dihapus.
- [x] `order_expires_hours` dipindah ke `PaymentSection` di `/admin/payment-settings`.
- [x] `PaymentSection` menggabungkan metode pembayaran, harga membership, dan masa berlaku order dalam satu card dengan satu tombol simpan.
- [x] Import `PaymentSection`, `ShippingSection`, `StoreInfoSection` dihapus dari `settings/page.tsx`.
- [x] Sidebar entry "Settings" (`/admin/settings`) tetap ada dan aktif.
- [x] Tidak ada import yang tersisa dari komponen yang sudah dipindahkan.
