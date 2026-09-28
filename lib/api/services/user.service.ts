import { http } from "../base-client";
import type {
  ApiResponse,
  ApiCollectionResponse,
  ListQueryParams,
  User,
  UserAddress,
  UpdateProfileRequestBody,
  UpdatePasswordRequestBody,
  UpsertAddressRequestBody,
  ResellerStatus,
} from "@/types";

export interface AdminUsersQueryParams extends ListQueryParams {
  role?: string;
  reseller_status?: string;
}

export const userService = {
  /** GET /users/me - Detail profil sendiri */
  async getProfile(): Promise<ApiResponse<User>> {
    return http.get<ApiResponse<User>>("/users/me");
  },

  /** PATCH /users/me - Update nama & telepon */
  async updateProfile(body: UpdateProfileRequestBody): Promise<ApiResponse<User>> {
    return http.patch<ApiResponse<User>>("/users/me", body);
  },

  /** PATCH /users/me/password - Ganti password */
  async updatePassword(body: UpdatePasswordRequestBody): Promise<ApiResponse<{ message: string }>> {
    return http.patch<ApiResponse<{ message: string }>>("/users/me/password", body);
  },

  /** GET /users/me/addresses - List alamat milik user */
  async getAddresses(): Promise<ApiCollectionResponse<UserAddress>> {
    return http.get<ApiCollectionResponse<UserAddress>>("/users/me/addresses");
  },

  /** POST /users/me/addresses - Tambah alamat baru */
  async createAddress(body: UpsertAddressRequestBody): Promise<ApiResponse<UserAddress>> {
    return http.post<ApiResponse<UserAddress>>("/users/me/addresses", body);
  },

  /** GET /users/me/addresses/{id} - Detail alamat */
  async getAddressById(id: string): Promise<ApiResponse<UserAddress>> {
    return http.get<ApiResponse<UserAddress>>(`/users/me/addresses/${id}`);
  },

  /** PATCH /users/me/addresses/{id} - Update alamat */
  async updateAddress(
    id: string,
    body: Partial<UpsertAddressRequestBody>
  ): Promise<ApiResponse<UserAddress>> {
    return http.patch<ApiResponse<UserAddress>>(`/users/me/addresses/${id}`, body);
  },

  /** DELETE /users/me/addresses/{id} - Hapus alamat */
  async deleteAddress(id: string): Promise<ApiResponse<{ message: string }>> {
    return http.delete<ApiResponse<{ message: string }>>(`/users/me/addresses/${id}`);
  },

  /** PATCH /users/me/addresses/{id}/set-primary - Jadikan alamat utama */
  async setPrimaryAddress(id: string): Promise<ApiResponse<UserAddress>> {
    return http.patch<ApiResponse<UserAddress>>(`/users/me/addresses/${id}/set-primary`);
  },

  /** GET /admin/users - List semua user (Admin only) */
  async getAdminUsers(
    params?: AdminUsersQueryParams
  ): Promise<ApiCollectionResponse<User>> {
    return http.get<ApiCollectionResponse<User>>("/admin/users", { params });
  },

  /** GET /admin/users/{id} - Detail user (Admin only) */
  async getAdminUserById(id: string): Promise<ApiResponse<User>> {
    return http.get<ApiResponse<User>>(`/admin/users/${id}`);
  },

  /** PATCH /admin/users/{id}/status - Aktif/nonaktifkan user */
  async updateUserStatus(id: string, is_active: boolean): Promise<ApiResponse<User>> {
    return http.patch<ApiResponse<User>>(`/admin/users/${id}/status`, { is_active });
  },

  /** PATCH /admin/users/{id}/reseller-status - Setujui/tolak reseller status */
  async updateUserResellerStatus(
    id: string,
    reseller_status: ResellerStatus
  ): Promise<ApiResponse<User>> {
    return http.patch<ApiResponse<User>>(`/admin/users/${id}/reseller-status`, {
      reseller_status,
    });
  },
};
