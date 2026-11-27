# 35: Badge Status & Toggle Button di Admin Review Detail Page

**What to build:** Halaman detail review `/admin/reviews/[id]` saat ini tidak menampilkan status review (`PUBLISHED` atau `HIDDEN`) sama sekali — data sudah ada di response API tapi tidak dirender. Tiket ini menambahkan badge status di header dan tombol "Sembunyikan Ulasan"/"Tampilkan Ulasan" di sebelah tombol "Hapus Review" agar admin bisa toggle status dari detail page.

**Badge Status:**
- Tampilkan badge di bawah judul "Detail Ulasan Customer"
- Badge hijau "Tampil di Produk" jika status `PUBLISHED`
- Badge abu-abu "Disembunyikan" jika status `HIDDEN`

**Tombol Toggle:**
- Tambah state `isTogglingStatus: boolean` untuk disable button saat request
- Tambah tombol di sebelah kiri tombol "Hapus Review":
  - Jika status `PUBLISHED` → tombol "Sembunyikan Ulasan" dengan icon `EyeOff`, warna warning
  - Jika status `HIDDEN` → tombol "Tampilkan Ulasan" dengan icon `Eye`, warna success
- Handler `handleToggleStatus`:
  1. Set `isTogglingStatus = true`
  2. Panggil `PATCH /api/admin/reviews/${id}/status` dengan body `{ status: newStatus }`
  3. Jika success → update `review.status` di local state, tampilkan toast success
  4. Jika error → tampilkan toast error, status tidak berubah
  5. Set `isTogglingStatus = false`

**Component changes:**
- File `app/(admin)/admin/reviews/[id]/page.tsx`
- Import icon `Eye` dan `EyeOff` dari `lucide-react`
- Tambah badge status di header section
- Tambah tombol toggle di button group sebelah tombol Hapus

**Blocked by:** None (dapat dimulai segera — tidak tergantung tiket list page karena detail page standalone)

**Status:** done

- [x] Badge status muncul di header detail page dengan warna yang sesuai
- [x] Tombol "Sembunyikan Ulasan" atau "Tampilkan Ulasan" muncul di header dengan icon dan warna yang tepat
- [x] Klik tombol toggle memanggil API dan mengubah status lokal jika sukses
- [x] Toast success/error muncul sesuai hasil API
- [x] Badge dan label tombol berubah sesuai status baru setelah toggle berhasil

