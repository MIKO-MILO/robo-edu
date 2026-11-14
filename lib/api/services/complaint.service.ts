import { http } from "../base-client";
import type {
  ApiResponse,
  ApiCollectionResponse,
  ListQueryParams,
  Complaint,
  ComplaintDetail,
  ComplaintAttachment,
  CreateComplaintRequestBody,
  ComplaintStatus,
} from "@/types";

export interface ComplaintListQueryParams extends ListQueryParams {
  status?: ComplaintStatus;
}

export interface AdminUpdateComplaintRequestBody {
  status: ComplaintStatus;
  resolution?: string;
  adminNotes?: string;
  contactMethodUsed?: string;
}

// ── Admin API response shapes ───────────────────────────────────────────────

/**
 * Shape of one row returned by GET /api/admin/complaints.
 * Status values from the backend are lowercase (open | in_review | resolved | closed).
 */
export interface AdminComplaintListItem {
  id: string;
  order_item_id: string;
  subject: string;
  /** Lowercase as stored in DB: open | in_review | resolved | closed */
  status: string;
  resolution: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
  customer: {
    id: string;
    name: string;
    email: string;
  };
  order_item: {
    id: string;
    product_name: string;
    variant_name: string | null;
  };
}

/**
 * Shape of the data object returned by GET /api/admin/complaints/[id].
 */
export interface AdminComplaintDetailItem {
  id: string;
  subject: string;
  description: string;
  status: string;
  resolution: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  };
  order_item: {
    id: string;
    product_name: string;
    variant_name: string | null;
    sku_snapshot: string;
    price_snapshot: number;
    quantity: number;
  };
  order: {
    id: string;
    order_number: string;
    status: string;
  };
  attachments: Array<{
    id: string;
    file_url: string;
    file_name: string;
    file_type: string | null;
    created_at: string;
  }>;
}

/** Response body from PATCH /api/admin/complaints/[id] */
export interface AdminUpdateComplaintResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    status: string;
    resolution: string | null;
    resolved_at: string | null;
  };
}

/** Body sent to PATCH /api/admin/complaints/[id] */
export interface AdminPatchComplaintBody {
  /** Lowercase status value as expected by the backend */
  status: string;
  /** Resolution / catatan tindak lanjut */
  resolution_note?: string;
}

export const complaintService = {
  /** GET /complaints - Riwayat klaim garansi milik user */
  async getComplaints(
    params?: ComplaintListQueryParams
  ): Promise<ApiCollectionResponse<Complaint>> {
    return http.get<ApiCollectionResponse<Complaint>>("/complaints", { params });
  },

  /** POST /complaints - Ajukan klaim garansi baru */
  async createComplaint(
    body: CreateComplaintRequestBody
  ): Promise<ApiResponse<Complaint>> {
    return http.post<ApiResponse<Complaint>>("/complaints", body);
  },

  /** GET /complaints/{id} - Detail klaim garansi + lampiran */
  async getComplaintById(id: string): Promise<ApiResponse<ComplaintDetail>> {
    return http.get<ApiResponse<ComplaintDetail>>(`/complaints/${id}`);
  },

  /** POST /complaints/{id}/attachments - Upload lampiran foto/video (multipart/form-data) */
  async uploadAttachment(
    id: string,
    formData: FormData
  ): Promise<ApiResponse<ComplaintAttachment>> {
    return http.post<ApiResponse<ComplaintAttachment>>(
      `/complaints/${id}/attachments`,
      formData
    );
  },

  /* ---------------------- Admin Endpoints ---------------------- */

  /**
   * GET /admin/complaints - List semua klaim garansi (Admin)
   * Returns the real API shape with nested customer / order_item objects.
   */
  async getAdminComplaints(params?: {
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
    sort?: string;
  }): Promise<{
    success: boolean;
    data: AdminComplaintListItem[];
    meta: {
      current_page: number;
      per_page: number;
      total_pages: number;
      total_count: number;
      has_next_page: boolean;
      has_prev_page: boolean;
    };
  }> {
    return http.get("/admin/complaints", { params });
  },

  /**
   * GET /admin/complaints/{id} - Detail satu klaim garansi (Admin)
   */
  async getAdminComplaintById(id: string): Promise<{
    success: boolean;
    data: AdminComplaintDetailItem;
  }> {
    return http.get(`/admin/complaints/${id}`);
  },

  /**
   * PATCH /admin/complaints/{id} - Update status & catatan resolution klaim garansi.
   * Backend expects lowercase status and the field name is `resolution_note`.
   */
  async patchAdminComplaint(
    id: string,
    body: AdminPatchComplaintBody
  ): Promise<AdminUpdateComplaintResponse> {
    return http.patch(`/admin/complaints/${id}`, body);
  },

  /**
   * @deprecated Use patchAdminComplaint instead — the old method sent the wrong
   * field name (`resolution` instead of `resolution_note`) and uppercase status.
   */
  async updateComplaintStatus(
    id: string,
    body: AdminUpdateComplaintRequestBody
  ): Promise<ApiResponse<Complaint>> {
    return http.patch<ApiResponse<Complaint>>(`/admin/complaints/${id}`, body);
  },
};
