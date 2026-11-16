/**
 * src/lib/api/admin-membership.ts
 * ------------------------------------------------------------------
 * Client-side fetch helpers for the admin membership (formerly "resellers")
 * API routes. All functions throw on non-OK responses so callers can catch.
 * ------------------------------------------------------------------
 */

export interface AdminMemberRow {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  membership_status: string;
  membership_expires_at: string | null;
  is_active: boolean;
  purchase_count: number;
  created_at: string;
}

export interface AdminMembersMeta {
  current_page: number;
  per_page: number;
  total_pages: number;
  total_count: number;
  has_next_page: boolean;
  has_prev_page: boolean;
}

export interface AdminMembersListResponse {
  success: true;
  data: AdminMemberRow[];
  meta: AdminMembersMeta;
}

export interface AdminMemberPurchase {
  id: string;
  purchase_number: string;
  payment_id: string | null;
  price_snapshot: number;
  duration_months_snapshot: number;
  plan_name_snapshot: string;
  starts_at: string | null;
  ends_at: string | null;
  paid_at: string | null;
  status: string;
  created_at: string;
}

export interface AdminMemberDetail {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  gender: string | null;
  tax_id: string | null;
  tax_country: string | null;
  residential_address: string | null;
  avatar_url: string | null;
  role: string;
  membership_status: string;
  membership_expires_at: string | null;
  is_active: boolean;
  email_verified_at: string | null;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
  membership_purchases: AdminMemberPurchase[];
}

export interface AdminMemberDetailResponse {
  success: true;
  data: AdminMemberDetail;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const json = await res.json();
      if (json?.message) message = json.message;
    } catch {
      // ignore parse error
    }
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// GET /api/admin/resellers — paginated member list
// ---------------------------------------------------------------------------

export interface FetchAdminMembersParams {
  search?: string;
  page?: number;
  limit?: number;
}

export async function fetchAdminMembers(
  params: FetchAdminMembersParams = {},
): Promise<AdminMembersListResponse> {
  const q = new URLSearchParams();
  if (params.search) q.set("search", params.search);
  if (params.page)   q.set("page",   String(params.page));
  if (params.limit)  q.set("limit",  String(params.limit));

  const url = `/api/admin/resellers${q.size ? `?${q.toString()}` : ""}`;
  const res = await fetch(url, { credentials: "include" });
  return handleResponse<AdminMembersListResponse>(res);
}

// ---------------------------------------------------------------------------
// GET /api/admin/resellers/[id] — single member detail
// ---------------------------------------------------------------------------

export async function fetchAdminMemberDetail(
  id: string,
): Promise<AdminMemberDetailResponse> {
  const res = await fetch(`/api/admin/resellers/${encodeURIComponent(id)}`, {
    credentials: "include",
  });
  return handleResponse<AdminMemberDetailResponse>(res);
}

// ---------------------------------------------------------------------------
// PATCH /api/admin/resellers/[id] — approve or revoke membership
// ---------------------------------------------------------------------------

export type MemberAction = "approve" | "reject";

export async function patchMemberStatus(
  id: string,
  action: MemberAction,
  rejectionReason?: string,
): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`/api/admin/resellers/${encodeURIComponent(id)}`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, rejection_reason: rejectionReason }),
  });
  return handleResponse<{ success: boolean; message: string }>(res);
}
