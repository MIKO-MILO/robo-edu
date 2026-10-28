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

  /** GET /admin/complaints - List semua klaim garansi (Admin) */
  async getAdminComplaints(
    params?: ComplaintListQueryParams
  ): Promise<ApiCollectionResponse<Complaint>> {
    return http.get<ApiCollectionResponse<Complaint>>("/admin/complaints", {
      params,
    });
  },

  /** PATCH /admin/complaints/{id} - Admin update status & catatan resolution klaim garansi */
  async updateComplaintStatus(
    id: string,
    body: AdminUpdateComplaintRequestBody
  ): Promise<ApiResponse<Complaint>> {
    return http.patch<ApiResponse<Complaint>>(`/admin/complaints/${id}`, body);
  },
};
