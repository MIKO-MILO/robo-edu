import { http } from "../base-client";
import type {
  ApiResponse,
  ApiCollectionResponse,
  // Reseller application types
  ResellerApplication,
  ResellerApplicationDetail,
  ResellerApplicationListQuery,
  ResellerStatusResponse,
  ApplyResellerRequestBody,
  RejectResellerRequestBody,
} from "@/types";

/**
 * reseller.service.ts
 * ------------------------------------------------------------------
 * API client untuk semua endpoint reseller.
 *
 * Endpoint customer (PRD Bab 6.4, reseller_todo §1.2):
 *   POST  /reseller/apply          → applyReseller()
 *   GET   /reseller/status         → getResellerStatus()
 *   GET   /reseller/application    → getResellerApplication()
 *
 * Endpoint admin (PRD Bab 6.7, reseller_todo §1.3):
 *   GET   /admin/reseller-applications           → getResellerApplications()
 *   GET   /admin/reseller-applications/[id]      → getResellerApplicationDetail()
 *   PATCH /admin/reseller-applications/[id]/approve → approveApplication()
 *   PATCH /admin/reseller-applications/[id]/reject  → rejectApplication()
 *
 * Catatan untuk backend:
 *   - Semua endpoint customer membutuhkan auth (cookie roboedu_session).
 *   - applyReseller() mengirim FormData jika ada file, JSON jika tidak ada.
 *   - Idempotency-Key header dikirim otomatis oleh base-client jika disediakan.
 *   - approve() memperbarui `user.reseller_status` + `user.reseller_approved_at`
 *     dan mencatat ke `audit_log` (FR-017).
 *   - reject() wajib ada `rejection_reason` di body dan mencatat ke `audit_log`.
 * ------------------------------------------------------------------
 */

export const resellerService = {
  /* ============================================================
   * CUSTOMER ENDPOINTS
   * ============================================================ */

  /**
   * POST /reseller/apply
   * Submit form pengajuan reseller (status customer → PENDING).
   *
   * Jika ada file dokumen (NPWP/legalitas), fungsi ini otomatis
   * mengemas data sebagai FormData (multipart). Jika tidak ada file,
   * dikirim sebagai JSON biasa.
   *
   * Backend rules:
   *   - Cek `user.is_active` → false = 403 FORBIDDEN.
   *   - Cek pengajuan PENDING yang sudah ada → 409 CONFLICT.
   *   - Validasi semua field (server = sumber kebenaran).
   *   - Simpan file ke MinIO → isi `document_url`.
   *   - Set `user.reseller_status = PENDING`.
   *   - Kirim email konfirmasi ke customer (BullMQ).
   *
   * @param data - Body form pengajuan (tanpa agree_to_terms)
   * @param documentFile - File NPWP/legalitas (opsional, maks 5 MB)
   * @param idempotencyKey - UUID unik per submit (cegah double submit)
   */
  async applyReseller(
    data: ApplyResellerRequestBody,
    documentFile?: File | null,
    idempotencyKey?: string
  ): Promise<ApiResponse<ResellerApplication>> {
    const options = idempotencyKey ? { idempotencyKey } : {};

    if (documentFile) {
      // Kirim sebagai FormData jika ada file dokumen
      const formData = new FormData();
      // Append semua field JSON sebagai blob
      formData.append(
        "data",
        new Blob([JSON.stringify(data)], { type: "application/json" })
      );
      formData.append("document", documentFile);

      return http.post<ApiResponse<ResellerApplication>>(
        "/reseller/apply",
        formData,
        options
      );
    }

    // Kirim sebagai JSON biasa jika tidak ada file
    return http.post<ApiResponse<ResellerApplication>>(
      "/reseller/apply",
      data,
      options
    );
  },

  /**
   * GET /reseller/status
   * Cek status pengajuan reseller customer yang sedang login.
   * Endpoint ringan — hanya mengembalikan reseller_status & reseller_approved_at.
   *
   * Dipakai untuk:
   *   - Redirect logic di /reseller/apply (PENDING/APPROVED → ke /profile/reseller)
   *   - Badge status di navbar/profil
   */
  async getResellerStatus(): Promise<ApiResponse<ResellerStatusResponse>> {
    return http.get<ApiResponse<ResellerStatusResponse>>("/reseller/status");
  },

  /**
   * GET /reseller/application
   * Ambil data pengajuan lengkap milik customer yang sedang login.
   *
   * Dipakai untuk:
   *   - Halaman /profile/reseller (tampilkan data pengajuan read-only)
   *   - Pre-fill form /reseller/apply saat status = REJECTED (re-apply)
   *
   * Backend rules:
   *   - Return 404 jika customer belum pernah mengajukan.
   *   - DILARANG mengembalikan `document_url` di response customer
   *     (MinIO policy: hanya admin yang boleh akses dokumen).
   */
  async getResellerApplication(): Promise<ApiResponse<ResellerApplication>> {
    return http.get<ApiResponse<ResellerApplication>>("/reseller/application");
  },

  /* ============================================================
   * ADMIN ENDPOINTS
   * ============================================================ */

  /**
   * GET /admin/reseller-applications
   * Daftar semua pengajuan reseller, bisa difilter by status.
   * Default backend: filter PENDING (PRD Bab 6.7).
   *
   * @param params - Query params (page, limit, sort, status, search)
   */
  async getResellerApplications(
    params?: ResellerApplicationListQuery
  ): Promise<ApiCollectionResponse<ResellerApplicationDetail>> {
    return http.get<ApiCollectionResponse<ResellerApplicationDetail>>(
      "/admin/reseller-applications",
      { params }
    );
  },

  /**
   * GET /admin/reseller-applications/[id]
   * Detail pengajuan reseller beserta data pemohon.
   *
   * Backend menyertakan:
   *   - Semua kolom `reseller_application`
   *   - Data pemohon (JOIN ke `user`: id, name, email, phone, created_at)
   *   - Riwayat order pemohon (opsional, bisa di-expand via ?include=orders)
   *
   * @param id - ID record reseller_application (UUID)
   */
  async getResellerApplicationDetail(
    id: string
  ): Promise<ApiResponse<ResellerApplicationDetail>> {
    return http.get<ApiResponse<ResellerApplicationDetail>>(
      `/admin/reseller-applications/${id}`
    );
  },

  /**
   * PATCH /admin/reseller-applications/[id]/approve
   * Setujui pengajuan reseller.
   *
   * Backend rules (PRD Bab 6.7):
   *   - Set `reseller_application.status = APPROVED`.
   *   - Set `user.reseller_status = APPROVED`.
   *   - Set `user.reseller_approved_at = NOW()`.
   *   - Catat ke `audit_log` (action: "APPROVE_RESELLER").
   *   - Kirim email hasil ke customer via BullMQ.
   *   - Harga reseller berlaku pada sesi customer berikutnya.
   *
   * @param id - ID record reseller_application (UUID)
   */
  async approveApplication(
    id: string
  ): Promise<ApiResponse<ResellerApplicationDetail>> {
    return http.patch<ApiResponse<ResellerApplicationDetail>>(
      `/admin/reseller-applications/${id}/approve`
    );
  },

  /**
   * PATCH /admin/reseller-applications/[id]/reject
   * Tolak pengajuan reseller.
   *
   * Backend rules (PRD Bab 6.7):
   *   - `rejection_reason` wajib diisi dan tidak boleh kosong/whitespace.
   *   - Set `reseller_application.status = REJECTED`.
   *   - Set `reseller_application.rejection_reason = body.rejection_reason`.
   *   - Set `user.reseller_status = REJECTED`.
   *   - Catat ke `audit_log` (action: "REJECT_RESELLER", metadata: {reason}).
   *   - Kirim email hasil ke customer via BullMQ (sertakan alasan & info re-apply).
   *
   * @param id - ID record reseller_application (UUID)
   * @param body - Berisi rejection_reason yang wajib diisi
   */
  async rejectApplication(
    id: string,
    body: RejectResellerRequestBody
  ): Promise<ApiResponse<ResellerApplicationDetail>> {
    return http.patch<ApiResponse<ResellerApplicationDetail>>(
      `/admin/reseller-applications/${id}/reject`,
      body
    );
  },
};
