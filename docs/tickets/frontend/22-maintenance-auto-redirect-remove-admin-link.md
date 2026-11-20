# 22: Halaman Maintenance — Hapus Link Admin & Auto-Redirect saat Mode Mati

**What to build:** Dua perbaikan pada halaman `/maintenance`:

1. **Hapus link admin login** — Kalimat dan tautan "Jika Anda adalah admin, login di sini" dihapus sepenuhnya dari halaman, sehingga jalur masuk admin tidak terlihat oleh pengunjung biasa.

2. **Auto-redirect saat maintenance berakhir** — Halaman diubah menjadi client component yang melakukan polling ke `GET /api/maintenance-status` setiap 5 detik. Ketika respons mengembalikan `{ active: false }`, browser otomatis diarahkan ke homepage (`/`). Interval polling dibersihkan saat komponen unmount.

Endpoint `GET /api/maintenance-status` sudah ada dan tidak perlu diubah.

**Blocked by:** None (dapat dimulai segera)

**Status:** ready-for-agent

- [ ] Halaman `/maintenance` tidak menampilkan link atau teks yang mengarahkan ke halaman admin login.
- [ ] Halaman polling `GET /api/maintenance-status` setiap 5 detik.
- [ ] Ketika maintenance dinonaktifkan admin, halaman user otomatis redirect ke `/` tanpa perlu refresh manual.
- [ ] Polling berhenti saat komponen di-unmount (tidak ada memory leak).
