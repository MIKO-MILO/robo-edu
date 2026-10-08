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
import { orderService } from "./order.service";
import type { OrderListQueryParams } from "./order.service";

export interface AdminUsersQueryParams extends ListQueryParams {
  role?: string;
  reseller_status?: string;
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

  /** PATCH /admin/users/{id}/reseller-status - Setujui/tolak reseller status */
  async updateUserResellerStatus(
    id: string,
    reseller_status: ResellerStatus,
  ): Promise<ApiResponse<User>> {
    return http.patch<ApiResponse<User>>(`/admin/users/${id}/reseller-status`, {
      reseller_status,
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
          reseller_status: normalizeResellerStatus(user.reseller_status),
        }),
      ),
      meta: response.meta,
    };
  },

  /** GET /admin/users/{id} - Detail customer lengkap.
   *  Jika response BE hanya user dasar tanpa relasi, akan fetch orders secara paralel
   *  via orderService.getAdminOrders. Addresses/complaints/reviews fallback ke empty array
   *  sambil menunggu endpoint admin tersedia. */
  async getAdminCustomerDetail(
    id: string,
  ): Promise<ApiResponse<AdminCustomerDetailData>> {
    const userResp = await this.getAdminUserById(id);
    const user: User = {
      ...userResp.data,
      reseller_status: normalizeResellerStatus(userResp.data.reseller_status),
    };

    const typedUser = user as UserWithNestedRelations;

    let orders: OrderListItem[] = typedUser.orders ?? [];
    const addresses: UserAddress[] = typedUser.addresses ?? [];
    const complaints: AdminComplaintWithOrder[] = typedUser.complaints ?? [];
    const reviews: AdminReviewWithProduct[] = typedUser.reviews ?? [];

    if (!typedUser.orders) {
      try {
        const ordersParams: OrderListQueryParams = {
          user_id: id,
          limit: 100,
          sort: "-created_at",
        };
        const ordersResp = await orderService.getAdminOrders(ordersParams);
        orders = ordersResp.data ?? [];
      } catch {
        orders = [];
      }
    }

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
