import { http } from "../base-client";
import type {
  ApiResponse,
  LoginRequestBody,
  LoginResponseData,
  RegisterRequestBody,
  User,
  UserRole,
} from "@/types";

/**
 * Interface data spesifik yang dikembalikan oleh GET /auth/me.
 * Catatan: reseller_status tidak di-expose di endpoint ini.
 */
export interface UserMeData {
  id: string;
  name: string;
  email: string;
  role: UserRole; // "superadmin" | "admin_sales" | "admin_laporan" | "customer"
}

export type UserMeResponse = ApiResponse<UserMeData>;

export const authService = {
  /**
   * POST /auth/login
   * Login customer/admin. Mengeset HTTP-only cookie `roboedu_session`.
   */
  async login(body: LoginRequestBody, options?: import("@/types").RequestOptions): Promise<ApiResponse<LoginResponseData>> {
    return http.post<ApiResponse<LoginResponseData>>("/auth/login", body, options);
  },

  /**
   * POST /auth/register
   * Registrasi customer baru.
   */
  async register(body: RegisterRequestBody, options?: import("@/types").RequestOptions): Promise<ApiResponse<User>> {
    return http.post<ApiResponse<User>>("/auth/register", body, options);
  },

  /**
   * POST /auth/logout
   * Invalidasi sesi/cookie aktif.
   */
  async logout(options?: import("@/types").RequestOptions): Promise<ApiResponse<{ message: string }>> {
    return http.post<ApiResponse<{ message: string }>>("/auth/logout", undefined, options);
  },

  /**
   * GET /auth/me
   * Mengambil data singkat user yang sedang login ({ id, name, email, role }).
   */
  async getMe(options?: import("@/types").RequestOptions): Promise<UserMeResponse> {
    return http.get<UserMeResponse>("/auth/me", options);
  },
};
