import type { UUID, ISODateString } from "./common";
import type { ComplaintStatus } from "./enums";

/**
 * complaint.ts
 * ------------------------------------------------------------------
 * Mencerminkan tabel `complaints` & `complaint_attachments`.
 *
 * CATATAN: field kodebase (`subject`, `resolution`, `resolved_at`)
 * BEDA dari PRD Bab 25.7 (`contact_method_used`, `admin_notes`).
 * Tipe di bawah mengikuti kodebase — ini diskrepansi #2 di api.md §18
 * yang masih perlu diputuskan sebelum FE final dibangun.
 * ------------------------------------------------------------------
 */

export interface Complaint {
  id: UUID;
  order_item_id: UUID;
  user_id: UUID;
  subject: string;
  description: string; // kronologi kejadian dari customer
  status: ComplaintStatus;
  resolution: string | null; // catatan tindak lanjut admin
  resolved_at: ISODateString | null;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface ComplaintAttachment {
  id: UUID;
  complaint_id: UUID;
  file_url: string; // URL MinIO
  file_name: string;
  file_type: string | null; // mis. "image/jpeg", "video/mp4"
  created_at: ISODateString;
}

/** Response data — GET /complaints/{id} */
export interface ComplaintDetail extends Complaint {
  attachments: ComplaintAttachment[];
}

/** Body — POST /complaints (api.md §14) */
export interface CreateComplaintRequestBody {
  order_item_id: UUID;
  subject: string;
  description: string;
}

/** Body — PATCH /admin/complaints/{id} */
export interface UpdateComplaintRequestBody {
  status: ComplaintStatus;
  resolution?: string;
}
