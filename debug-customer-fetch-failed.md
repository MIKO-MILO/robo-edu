# Debug Session: customer-fetch-failed

**Status:** [CLOSED]
**Created:** 2026-10-08
**Closed:** 2026-10-08
**Session ID:** customer-fetch-failed
**Symptom:** Di halaman `/admin/customers` muncul error alert:

- Judul: "Gagal memuat data pelanggan"
- Detail: "Failed to fetch"
  **Expected:** Data pelanggan muncul dari API `/admin/users` (atau error server-side yang informative).

---

## Hypotheses (Falsifiable)

| ID  | Hypothesis                                                                                                                                                                                                            | Falsification Criteria                                                                                                       |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| H1  | `http` base-client memanggil URL yang salah / BASE_URL tidak terkonfigurasi (undefined / localhost port salah) → `fetch()` gagal karena origin tidak tersedia.                                                        | Instrument request URL di base-client: jika URL tidak valid / host tidak reachable → H1 confirmed.                           |
| H2  | Tidak ada auth token (access_token) di storage / header `Authorization` tidak terkirim → endpoint `/admin/users` butuh auth, sehingga CORS preflight OPTIONS gagal / 401 / network error berbentuk "Failed to fetch". | Instrument headers yang dikirim dan check keberadaan token sebelum request.                                                  |
| H3  | Server backend **tidak berjalan** (tidak ada yang listen di port BE) → `fetch()` throw `TypeError: Failed to fetch` karena connection refused.                                                                        | Coba `fetch(BASE_URL + "/health")` tanpa auth; jika gagal juga → H3 confirmed.                                               |
| H4  | CORS misconfig di backend: origin `http://localhost:3000` tidak di-allow → browser block response dan `fetch()` melempar generik "Failed to fetch" tanpa status code.                                                 | Instrument `mode: "no-cors"` sebagai test banding (hanya untuk debug, bukan fix); atau check browser console for CORS error. |
| H5  | Next.js App Router **membungkus error** dari Tanstack Query ke generik message; penyebab sebenarnya (mis. `NEXT_PUBLIC_API_BASE_URL` typo) hilang.                                                                    | Log `error.cause`, `error.name`, `error.stack` asli sebelum ditampilkan ke Alert.                                            |

---

## Instrumentation Plan

1. Tambah instrumentation di `lib/api/base-client.ts` (jika ada): report URL, method, headers, response/error ke Debug Server.
2. Tambah instrumentation di `hooks/admin/customers/use-customers.ts`: report error asli (name, message, cause, stack).
3. User buka `/admin/customers` sekali lagi → logs dikumpulkan → analisis.

---

## Evidence Log

| Step | Timestamp  | Finding                                                                                                                                                                                            | H Confirmed/Rejected                                                                         |
| ---- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| 1    | 2026-10-08 | **Runtime test:** `node -e "fetch('https://api.roboedu.id/api/v1/auth/me')"` throw **`TypeError: fetch failed`**. Error identik dengan laporan user "Failed to fetch".                             | **H3 CONFIRMED** — domain fallback tidak reachable                                           |
| 2    | 2026-10-08 | **Static code:** `.env` line 80 `NEXT_PUBLIC_API_URL` dikomentari. Default fallback [base-client.ts](file:///c:/ROBOEDU/robo-edu/lib/api/base-client.ts#L10-L11) = `https://api.roboedu.id/api/v1` | **H1 CONFIRMED** — BASE_URL salah karena env tidak aktif                                     |
| 3    | 2026-10-08 | **Integrated browser post-fix:** Buka `/admin/customers` → redirect ke `/admin/login?redirect=%2Fadmin%2Fcustomers` (redirect auth 401 NORMAL, TANPA error network)                                | **H4 REJECTED** — bukan CORS. **H5 REJECTED** — bukan error wrapping. H1+H3 100% root cause. |

## Root Cause (Ringkasan 2 Baris)

`NEXT_PUBLIC_API_URL` di `.env` **dikomentari**, sehingga base-client fallback ke default `https://api.roboedu.id/api/v1` — **domain/service ini tidak berjalan/reachable**. Akibatnya browser `fetch()` throw `TypeError: fetch failed` generik, yang ditampilkan UI sebagai: "Gagal memuat data pelanggan — Failed to fetch".

## Fix Patch (Minimal — 2 File)

1. **`lib/api/base-client.ts`** line 10-11:  
   `process.env.NEXT_PUBLIC_API_URL || "https://api.roboedu.id/api/v1"` →  
   `process.env.NEXT_PUBLIC_API_URL || "/api"`  
   (Default fallback ke URL relatif `/api` = origin Next.js yang sama, sesuai route handlers di `app/api/**/*.ts`.)

2. **`.env`** line 80:  
   Aktifkan (uncomment): `NEXT_PUBLIC_API_URL=/api`

Bonus: Bersihkan 8x `@typescript-eslint/no-explicit-any` pre-existing di base-client `http.post/patch/put` dan `jsonResponse` (cast ke `unknown` + `Record<string, unknown>` + `ApiErrorDetail[]`).

## Post-fix Verification

| Check                       | Hasil                                                                                     |
| --------------------------- | ----------------------------------------------------------------------------------------- |
| TypeScript `tsc --noEmit`   | **0 error**                                                                               |
| ESLint affected files       | **0 error** (hanya 1 warning pre-existing: `window.location.href` di 401 handler)         |
| Browser: `/admin/customers` | ✅ **No "Failed to fetch" error** → Normal redirect ke `/admin/login` (auth 401 redirect) |

## ⚠️ Catatan Penting: Endpoint Admin Belum Ada (Langkah Selanjutnya)

Route handlers admin `/api/admin/**` **BELUM ADA** di folder `app/api/admin/` (cek via Glob: no files found). Artinya:

- Setelah user login nanti, request `GET /api/admin/users` akan return **404 Not Found** (bukan Failed to fetch — sudah informative).
- Langkah selanjutnya: **Buat Route Handlers** untuk `GET /api/admin/users`, `GET /api/admin/users/:id`, `PATCH /api/admin/users/:id/status`, `PATCH /api/admin/users/:id/reseller-status` — atau arahkan `NEXT_PUBLIC_API_URL` ke backend eksternal yang benar (jika terpisah).

---
