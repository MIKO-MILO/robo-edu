
# 23: Perbaikan UI Order — Dropdown Checkpoint & Dot Timeline

**What to build:** Dua perbaikan visual pada halaman order:

**Dropdown status checkpoint (admin)** — Di form "Tambah Checkpoint" pada halaman detail order admin, field "Status" saat ini berupa free-text input. Ganti dengan dropdown (`<select>` atau komponen `AdminSelect`) berisi opsi predefined: `PICKED_UP`, `IN_TRANSIT`, `AT_HUB`, `OUT_FOR_DELIVERY`, `DELIVERED`, `RETURNED`, `FAILED_ATTEMPT`. Hapus field "Waktu" (`datetime-local`) dari form sepenuhnya — backend sudah menggunakan `now()` jika tidak disertakan (lihat tiket backend 22).

**Dot berwarna di timeline pesanan user** — Di komponen tracking timeline pada halaman detail order user, semua entry saat ini memakai ikon `CheckCircle2` untuk entry terbaru. Ganti semua entry dengan indikator dot berwarna: dot entry terbaru (`idx === 0`) memakai warna aksen/primer; entry lama memakai warna muted. Hapus ikon `CheckCircle2` dari seluruh entry timeline.

**Blocked by:** 22-fix-paidat-timestamp-and-tracking-checkpoint (backend timestamp fix harus selesai agar form checkpoint tanpa waktu berjalan benar)

**Status:** done

> **Files changed:**
> - `app/(admin)/admin/orders/[id]/page.tsx` — status field diganti `<select>` dengan 7 opsi predefined; state `cpTimestamp` dan field datetime-local dihapus; `timestamp` tidak lagi dikirim ke API.
> - `app/(user)/profile/orders/[id]/page.tsx` — `TrackingTimeline` menggunakan dot berwarna (`bg-primary` untuk entry terbaru, `bg-muted` untuk entry lama) menggantikan ikon `CheckCircle2`/`Clock`.

- [x] Form tambah checkpoint admin menampilkan dropdown status dengan opsi predefined, bukan free-text input.
- [x] Field picker waktu tidak ada di form tambah checkpoint admin.
- [x] Submit form checkpoint tanpa field waktu berhasil dan checkpoint tersimpan dengan waktu server.
- [x] Timeline pesanan user menggunakan dot berwarna untuk semua entry, bukan ikon centang.
- [x] Dot entry pertama (terbaru) berwarna aksen/primer; dot entry lama berwarna muted.
