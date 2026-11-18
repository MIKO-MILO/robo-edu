# 18: Mode Pemeliharaan — simpan ke DB, middleware redirect, halaman maintenance

**What to build:** Toggle "Mode Pemeliharaan" di halaman Settings saat ini hanya local state — tidak tersimpan ke database dan tidak mempengaruhi apapun. Ticket ini menghubungkan toggle ke database dan membuat middleware yang me-redirect guest ke halaman maintenance ketika mode aktif.

Tiga hal yang dibangun:

1. **Backend setting**: tambahkan `maintenance_mode` ke daftar setting yang valid di API settings. Nilai yang diterima adalah `"true"` atau `"false"` (string).

2. **GeneralSection UI**: fetch nilai `maintenance_mode` dari database saat halaman Settings dibuka agar toggle menampilkan kondisi tersimpan (bukan selalu OFF). Saat "Simpan Perubahan" ditekan, kirim nilai toggle ke API settings.

3. **Middleware + halaman maintenance**: tambahkan `middleware.ts` di root Next.js yang membaca status pemeliharaan via endpoint publik `GET /api/maintenance-status` (endpoint baru, tanpa auth, mengembalikan `{ active: boolean }`). Jika aktif dan request bukan dari admin dan bukan ke path `/admin/*`, `/api/*`, atau `/maintenance`, redirect ke `/maintenance`. Buat halaman `/maintenance` tanpa layout user/admin — desain menggunakan token desain yang sudah ada (font-heading, neo-shadow, warna dari sistem desain proyek), konten berisi pesan bahwa website sedang dalam pemeliharaan.

**Blocked by:** None (dapat dimulai segera)

**Status:** done

- [x] `PATCH /api/admin/settings` menerima field `maintenance_mode` dengan nilai `"true"` atau `"false"`.
- [x] `GET /api/maintenance-status` tersedia tanpa auth dan mengembalikan `{ active: boolean }`.
- [x] Toggle di halaman Settings membaca nilai tersimpan dari database saat halaman dibuka.
- [x] Menekan "Simpan Perubahan" menyimpan nilai toggle ke database.
- [x] Guest yang mengakses halaman user saat mode maintenance aktif di-redirect ke `/maintenance`.
- [x] Admin yang sudah login tetap bisa mengakses `/admin/*` meski mode maintenance aktif.
- [x] Halaman `/maintenance` tampil dengan pesan pemeliharaan yang jelas, desain konsisten dengan sistem desain proyek.
- [x] Menonaktifkan mode maintenance dan menyimpan kembali memulihkan akses guest ke halaman user.
