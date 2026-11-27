# 33: Kolom Status & Toggle Quick-Action di Admin Review Table

**What to build:** Tabel review di halaman `/admin/reviews` saat ini tidak menampilkan status (PUBLISHED/HIDDEN) sama sekali — padahal data `status` sudah ada di response API. Tiket ini menambahkan kolom Status dengan badge warna dan tombol quick-toggle per baris agar admin bisa hide/show review langsung dari tabel tanpa masuk ke detail page.

**Kolom Status:**
- Tambah kolom baru "Status" di tabel setelah kolom "Tanggal" (sebelum kolom "Aksi")
- Badge hijau "Tampil" jika status `PUBLISHED`, badge abu-abu "Disembunyikan" jika status `HIDDEN`

**Tombol Quick-Toggle:**
- Tambah prop `onToggleStatus?: (review: AdminReviewRow) => Promise<void>` ke `ReviewTable` component
- Di kolom "Aksi", tambah tombol icon `Eye` (jika HIDDEN) atau `EyeOff` (jika PUBLISHED) di sebelah kiri tombol "Lihat Detail"
- Tombol memanggil `onToggleStatus` yang diterima dari parent (halaman akan menghandle API call dan optimistic update)

**Component changes:**
- File `components/admin/reviews/review-components.tsx`
- Import icon `Eye` dan `EyeOff` dari `lucide-react`
- Extend `ReviewTableProps` dengan field opsional `onToggleStatus`
- Tambah kolom status di `columns` array
- Update kolom actions untuk render tombol toggle

**Blocked by:** None (dapat dimulai segera)

**Status:** done

- [x] Kolom "Status" muncul di tabel dengan badge "Tampil" (hijau) atau "Disembunyikan" (abu-abu)
- [x] Tombol Eye/EyeOff muncul di kolom Aksi per baris
- [x] Prop `onToggleStatus` tersedia di `ReviewTable` interface dan bisa diwire dari parent
- [x] Tidak ada perubahan ke API atau page logic di tiket ini — hanya komponen tabel

