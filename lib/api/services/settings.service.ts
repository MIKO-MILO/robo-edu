import { http } from "../base-client";

/**
 * Flat key-value shape returned by GET /api/admin/settings.
 * All values are strings (numbers are stored as strings in the DB).
 */
export interface AdminSettings {
  store_name?: string;
  store_phone?: string;
  store_email?: string;
  store_address?: string;
  shipping_default_provider_id?: string;
  membership_plus_price?: string;
  membership_plus_duration_months?: string;
  shipping_min_weight?: string;
  shipping_cost?: string;
  order_expires_hours?: string;
  payment_methods_config?: string;
}

export interface AdminSettingsResponse {
  success: boolean;
  data: AdminSettings;
}

export interface AdminSettingsPatchBody {
  store_name?: string;
  store_phone?: string;
  store_email?: string;
  store_address?: string;
  shipping_default_provider_id?: string;
  membership_plus_price?: number;
  membership_plus_duration_months?: number;
  shipping_min_weight?: number;
  shipping_cost?: number;
  order_expires_hours?: number;
  payment_methods_config?: string;
}

export interface AdminSettingsPatchResponse {
  success: boolean;
  message: string;
  data: AdminSettings;
}

export const settingsService = {
  /**
   * GET /api/admin/settings
   * Returns every setting as a flat { key: stringValue } object.
   */
  async getSettings(): Promise<AdminSettingsResponse> {
    return http.get<AdminSettingsResponse>("/api/admin/settings");
  },

  /**
   * PATCH /api/admin/settings
   * Partial update — only the sent keys are written.
   * Returns the full updated settings on success.
   */
  async patchSettings(
    body: AdminSettingsPatchBody,
  ): Promise<AdminSettingsPatchResponse> {
    return http.patch<AdminSettingsPatchResponse>("/api/admin/settings", body);
  },
};
