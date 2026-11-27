# 34: Filter Status & Optimistic Toggle di Admin Review List Page

**What to build:** Halaman `/admin/reviews` belum mengirim parameter `status` ke API (backend sudah support `?status=PUBLISHED|HIDDEN|ALL` sejak awal). Tiket ini menambahkan dropdown filter Status di toolbar dan mewire handler `onToggleStatus` yang memanggil endpoint `PATCH /api/admin/reviews/[id]/status` dengan **optimistic update** (langsung update local state, rollback jika gagal).

**Filter Status:**
- Tambah state `statusFilter` (default `"ALL"`)
- Update helper `fetchAdminReviews` agar mengirim `status` ke query string jika bukan `"ALL"`
- Tambah filter dropdown di `filters` array: "Semua" (ALL), "Tampil" (PUBLISHED), "Disembunyikan" (HIDDEN)

**Toggle Handler dengan Optimistic Update:**
- Tambah state `isTogglingStatus` untuk disable button saat request
- Implementasi `handleToggleStatus`:
  1. Tentukan status baru (PUBLISHED ↔ HIDDEN)
  2. **Optimistic update** — langsung ubah `reviews` state agar UI terasa instant
  3. Panggil `PATCH /api/admin/reviews/${id}/status` dengan body `{ status: newStatus }`
  4. Jika response error → **rollback** status di local state, tampilkan toast error
  5. Jika success → tampilkan toast success, state sudah benar

**Wire ke ReviewTable:**
- Pass `onToggleStatus={handleToggleStatus}` ke `ReviewTable`
- Tombol toggle di tabel akan call handler ini

**Blocked by:** frontend/33 — tabel harus sudah punya prop `onToggleStatus` dan tombol toggle

**Status:** done

- [x] Dropdown filter "Status" muncul di toolbar dengan 3 pilihan: Semua, Tampil, Disembunyikan
- [x] Filter Status dikirim ke API dan tabel hanya menampilkan review sesuai filter
- [x] Tombol toggle di tabel langsung mengubah badge status (optimistic)
- [x] Jika API gagal, status di-rollback dan toast error muncul
- [x] Jika API sukses, toast success muncul dan status tetap berubah
- [x] Review yang di-toggle dari PUBLISHED → HIDDEN hilang dari tabel jika filter saat ini adalah "Tampil"

