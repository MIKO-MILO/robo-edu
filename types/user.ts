import type { UUID, ISODateString } from "./common";
import type { UserRole, ResellerStatus } from "./enums";

/**
 * user.ts
 * ------------------------------------------------------------------
 * Mencerminkan tabel `user` & `user_address`.
 *
 * PENTING soal keamanan: kolom `password` (hash) di tabel `user`
 * TIDAK BOLEH pernah muncul di response API atau di tipe ini. Kalau
 * suatu saat kamu lihat field seperti `password` atau `password_hash`
 * masuk ke response backend, itu bug — lihat rest-api-standards-v2.md
 * §9 poin 9: "Jangan expose sensitive data di response".
 * ------------------------------------------------------------------
 */

export interface User {
  id: UUID;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  reseller_status: ResellerStatus;
  reseller_approved_at: ISODateString | null;
  is_active: boolean;
  last_login_at: ISODateString | null;
  created_at: ISODateString;
  updated_at: ISODateString;
}

/** Alamat milik user. `label` bebas isi (mis. "Rumah", "Kantor/Sekolah").
 * Juga dipakai untuk customer institusi (PRD Bab 4). */
export interface UserAddress {
  id: UUID;
  user_id: UUID;
  label: string | null;
  recipient_name: string;
  phone: string;
  address: string;
  province: string;
  city: string;
  district: string;
  village: string | null;
  postal_code: string | null;
  is_primary: boolean;
  created_at: ISODateString;
  updated_at: ISODateString;
}

/* ------------------------------------------------------------------
 * DTO khusus untuk request body, dipisah dari entity di atas karena
 * body request TIDAK mengirim field seperti id/created_at/updated_at.
 * ------------------------------------------------------------------ */

/** Body — POST /auth/register (api.md §2) */
export interface RegisterRequestBody {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

/** Body — POST /auth/login (api.md §2) */
export interface LoginRequestBody {
  email: string;
  password: string;
}

/** Response data — POST /auth/login (api.md §2, "200") */
export interface LoginResponseData {
  access_token: string;
  refresh_token: string;
  expires_in: number; // detik
  user: Pick<User, "id" | "name" | "role" | "reseller_status">;
}

/** Body — POST /users/me/addresses & PATCH /users/me/addresses/{id} */
export type UpsertAddressRequestBody = Omit<
  UserAddress,
  "id" | "user_id" | "created_at" | "updated_at"
>;

/** Body — PATCH /users/me (hanya nama & telepon, bukan email/password) */
export type UpdateProfileRequestBody = Partial<Pick<User, "name" | "phone">>;

/** Body — PATCH /users/me/password */
export interface UpdatePasswordRequestBody {
  current_password: string;
  new_password: string;
}
