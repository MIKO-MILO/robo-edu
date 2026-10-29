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
  MembershipStatus,
  OrderListItem,
  Complaint,
  Review,
} from "@/types";
import {
  mapUserToCustomerRow,
  mapUserAndRelationsToCustomerDetail,
  normalizeResellerStatus,
} from "@/components/admin/customers";
import type {
  AdminCustomerRow,
  AdminCustomerDetailData,
} from "@/components/admin/customers";

export interface AdminUsersQueryParams extends ListQueryParams {
  role?: string;
  membership_status?: string;
  is_active?: boolean;
}

export type AdminCustomersQueryParams = AdminUsersQueryParams;
export type AdminCustomerDetailResponse = AdminCustomerDetailData;

type AdminComplaintWithOrder = Complaint & {
  order_id?: string;
  order_number?: string;
};
type AdminReviewWithProduct = Review & { product_name?: string };

interface UserWithNestedRelations extends User {
  addresses?: UserAddress[];
  orders?: OrderListItem[];
  complaints?: AdminComplaintWithOrder[];
  reviews?: AdminReviewWithProduct[];
}

export const userService = {
  /** GET /users/me - Detail profil sendiri */
  async getProfile(): Promise<ApiResponse<User>> {
    return http.get<ApiResponse<User>>("/users/me");
  },

  /** PATCH /users/me - Update nama & telepon */
  async updateProfile(
    body: UpdateProfileRequestBody,
  ): Promise<ApiResponse<User>> {
    return http.patch<ApiResponse<User>>("/users/me", body);
  },

  /** PATCH /users/me/password - Ganti password */
  async updatePassword(
    body: UpdatePasswordRequestBody,
  ): Promise<ApiResponse<{ message: string }>> {
    return http.patch<ApiResponse<{ message: string }>>(
      "/users/me/password",
      body,
    );
  },

  /** GET /users/me/addresses - List alamat milik user */
  async getAddresses(): Promise<ApiCollectionResponse<UserAddress>> {
    return http.get<ApiCollectionResponse<UserAddress>>("/users/me/addresses");
  },

  /** POST /users/me/addresses - Tambah alamat baru */
  async createAddress(
    body: UpsertAddressRequestBody,
  ): Promise<ApiResponse<UserAddress>> {
    return http.post<ApiResponse<UserAddress>>("/users/me/addresses", body);
  },

  /** GET /users/me/addresses/{id} - Detail alamat */
  async getAddressById(id: string): Promise<ApiResponse<UserAddress>> {
    return http.get<ApiResponse<UserAddress>>(`/users/me/addresses/${id}`);
  },

  /** PATCH /users/me/addresses/{id} - Update alamat */
  async updateAddress(
    id: string,
    body: Partial<UpsertAddressRequestBody>,
  ): Promise<ApiResponse<UserAddress>> {
    return http.patch<ApiResponse<UserAddress>>(
      `/users/me/addresses/${id}`,
      body,
    );
  },

  /** DELETE /users/me/addresses/{id} - Hapus alamat */
  async deleteAddress(id: string): Promise<ApiResponse<{ message: string }>> {
    return http.delete<ApiResponse<{ message: string }>>(
      `/users/me/addresses/${id}`,
    );
  },

  /** PATCH /users/me/addresses/{id}/set-primary - Jadikan alamat utama */
  async setPrimaryAddress(id: string): Promise<ApiResponse<UserAddress>> {
    return http.patch<ApiResponse<UserAddress>>(
      `/users/me/addresses/${id}/set-primary`,
    );
  },

  /** GET /admin/users - List semua user (Admin only) */
  async getAdminUsers(
    params?: AdminUsersQueryParams,
  ): Promise<ApiCollectionResponse<User>> {
    return http.get<ApiCollectionResponse<User>>("/admin/users", { params });
  },

  /** GET /admin/users/{id} - Detail user (Admin only) */
  async getAdminUserById(id: string): Promise<ApiResponse<User>> {
    return http.get<ApiResponse<User>>(`/admin/users/${id}`);
  },

  /** PATCH /admin/users/{id}/status - Aktif/nonaktifkan user */
  async updateUserStatus(
    id: string,
    is_active: boolean,
  ): Promise<ApiResponse<User>> {
    return http.patch<ApiResponse<User>>(`/admin/users/${id}/status`, {
      is_active,
    });
  },

  /** PATCH /admin/users/{id}/reseller-status - Update membership status */
  async updateUserResellerStatus(
    id: string,
    membership_status: MembershipStatus,
  ): Promise<ApiResponse<User>> {
    return http.patch<ApiResponse<User>>(`/admin/users/${id}/reseller-status`, {
      membership_status,
    });
  },

  /** GET /admin/users - List customers (role=customer) + mapping ke AdminCustomerRow.
   *  Sementara aggregate total_spent/total_orders diisi 0 jika BE belum mengembalikannya
   *  (TODO backend: tambahkan select aggregate dari tabel orders). */
  async getAdminCustomers(
    params?: AdminCustomersQueryParams,
  ): Promise<ApiCollectionResponse<AdminCustomerRow>> {
    const finalParams: AdminCustomersQueryParams = {
      ...(params ?? {}),
      role: params?.role ?? "customer",
    };
    const response = await this.getAdminUsers(finalParams);
    return {
      success: response.success,
      data: response.data.map((user) =>
        mapUserToCustomerRow({
          ...user,
          membership_status: normalizeResellerStatus(user.membership_status),
        }),
      ),
      meta: response.meta,
    };
  },

  /** GET /admin/users/{id} - Detail customer lengkap.
   *  Fetch orders via endpoint dedicated /admin/users/{id}/orders
   *  untuk memastikan data akurat dari DB. */
  async getAdminCustomerDetail(
    id: string,
  ): Promise<ApiResponse<AdminCustomerDetailData>> {
    // Fetch user data dan orders secara paralel
    const [userResp, ordersResp] = await Promise.all([
      this.getAdminUserById(id),
      http.get<{ success: boolean; data: OrderListItem[] }>(
        `/admin/users/${id}/orders`,
        { params: { limit: 200 } },
      ).catch(() => ({ success: true, data: [] as OrderListItem[] })),
    ]);

    const user: User = {
      ...userResp.data,
      membership_status: normalizeResellerStatus(userResp.data.membership_status),
    };

    const orders: OrderListItem[] = ordersResp.data ?? [];
    const addresses: UserAddress[] = [];
    const complaints: AdminComplaintWithOrder[] = [];
    const reviews: AdminReviewWithProduct[] = [];

    const detail = mapUserAndRelationsToCustomerDetail(
      user,
      addresses,
      orders,
      complaints,
      reviews,
    );

    return {
      success: userResp.success,
      data: detail,
    };
  },
};
