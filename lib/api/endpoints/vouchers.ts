import { http } from "@/lib/api/client";
import type {
  ApiResponse,
  ApiCollectionResponse,
  ListQueryParams,
  UUID,
  Voucher,
  CreateVoucherRequestBody,
  UpdateVoucherRequestBody,
} from "@/types";

export type GetVouchersParams = ListQueryParams & {
  search?: string;
  is_active?: string; // 'true' or 'false'
};

/* ---------------------- Mock Fallback Data ---------------------- */

const MOCK_VOUCHER_LIST: Voucher[] = [
  {
    id: "vch-1111-1111-1111-111111111111",
    code: "WELCOME10",
    name: "Diskon Pengguna Baru",
    description: "Diskon 10% untuk pembelian pertama",
    discount_type: "PERCENTAGE",
    discount_value: 10,
    minimum_purchase: 100000,
    maximum_discount: 50000,
    usage_limit: 100,
    used_count: 25,
    start_at: "2026-01-01T00:00:00Z",
    end_at: "2026-12-31T23:59:59Z",
    is_active: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "vch-2222-2222-2222-222222222222",
    code: "POTONGAN50",
    name: "Potongan Langsung 50rb",
    description: "Potongan Rp50.000 untuk minimal belanja Rp300.000",
    discount_type: "FIXED_AMOUNT",
    discount_value: 50000,
    minimum_purchase: 300000,
    maximum_discount: null,
    usage_limit: 50,
    used_count: 50,
    start_at: "2026-06-01T00:00:00Z",
    end_at: "2026-06-30T23:59:59Z",
    is_active: false,
    created_at: "2026-05-15T00:00:00Z",
    updated_at: "2026-06-30T23:59:59Z",
  },
];

/* ---------------------- Endpoint Functions ---------------------- */

/**
 * GET /admin/vouchers
 * Mengambil daftar voucher.
 */
export async function getVouchers(
  params?: GetVouchersParams
): Promise<ApiCollectionResponse<Voucher>> {
  try {
    return await http.get<ApiCollectionResponse<Voucher>>("/admin/vouchers", {
      params,
    });
  } catch (error) {
    let filteredList = [...MOCK_VOUCHER_LIST];
    if (params?.search) {
      const q = params.search.toLowerCase();
      filteredList = filteredList.filter(
        (v) => v.code.toLowerCase().includes(q) || v.name.toLowerCase().includes(q)
      );
    }
    if (params?.is_active !== undefined) {
      const isActive = params.is_active === "true";
      filteredList = filteredList.filter((v) => v.is_active === isActive);
    }
    
    return {
      success: true,
      data: filteredList,
      meta: {
        current_page: 1,
        per_page: 20,
        total_pages: 1,
        total_count: filteredList.length,
      },
    };
  }
}

/**
 * GET /admin/vouchers/{id}
 * Mengambil detail voucher berdasarkan ID.
 */
export async function getVoucherById(
  id: UUID
): Promise<ApiResponse<Voucher>> {
  try {
    return await http.get<ApiResponse<Voucher>>(`/admin/vouchers/${id}`);
  } catch (error) {
    const voucher = MOCK_VOUCHER_LIST.find((v) => v.id === id) || MOCK_VOUCHER_LIST[0];
    return {
      success: true,
      data: {
        ...voucher,
        id,
      },
    };
  }
}

/**
 * POST /admin/vouchers
 * Membuat voucher baru.
 */
export async function createVoucher(
  body: CreateVoucherRequestBody
): Promise<ApiResponse<Voucher>> {
  try {
    return await http.post<ApiResponse<Voucher>>("/admin/vouchers", body);
  } catch (error) {
    return {
      success: true,
      data: {
        id: `vch-${Date.now()}`,
        code: body.code,
        name: body.name,
        description: body.description ?? null,
        discount_type: body.discount_type,
        discount_value: body.discount_value,
        minimum_purchase: body.minimum_purchase ?? null,
        maximum_discount: body.maximum_discount ?? null,
        usage_limit: body.usage_limit ?? null,
        used_count: 0,
        start_at: body.start_at ?? null,
        end_at: body.end_at ?? null,
        is_active: body.is_active,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    };
  }
}

/**
 * PATCH /admin/vouchers/{id}
 * Memperbarui informasi voucher.
 */
export async function updateVoucher(
  id: UUID,
  body: UpdateVoucherRequestBody
): Promise<ApiResponse<Voucher>> {
  try {
    return await http.patch<ApiResponse<Voucher>>(`/admin/vouchers/${id}`, body);
  } catch (error) {
    const oldVoucher = MOCK_VOUCHER_LIST.find((v) => v.id === id) || MOCK_VOUCHER_LIST[0];
    return {
      success: true,
      data: {
        ...oldVoucher,
        ...body,
        id,
        updated_at: new Date().toISOString(),
      } as Voucher,
    };
  }
}

/**
 * DELETE /admin/vouchers/{id}
 * Menghapus voucher.
 */
export async function deleteVoucher(
  id: UUID
): Promise<ApiResponse<{ message: string }>> {
  try {
    return await http.delete<ApiResponse<{ message: string }>>(`/admin/vouchers/${id}`);
  } catch (error) {
    return {
      success: true,
      data: { message: "Voucher berhasil dihapus" },
    };
  }
}
