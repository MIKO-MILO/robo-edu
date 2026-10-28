# 07: Admin order tracking (resi + checkpoints) + requireAdmin helper

**What to build:** `PATCH /api/admin/orders/[id]/status` accepts optional `tracking_number` + `provider_id`; when the new status is SHIPPED and `tracking_number` is given, set `shipments.tracking_number`, `shipments.shipped_at`, and `shipments.status = SHIPPED`. New `POST /api/admin/orders/[id]/tracking` (admin) inserts a `shipment_trackings` row (`location`, `description`, optional `timestamp`). Introduce the shared `src/lib/auth/require-admin.ts` helper (validates the session cookie and the mock token for backward compat) and adopt it in the orders routes, replacing the inline `isAdminRole` logic. The customer-facing tracking view now surfaces real checkpoints.

**Blocked by:** 01

**Status:** ready-for-agent

- [ ] Admin can set a tracking number + provider when marking an order SHIPPED; the `shipments` row is updated.
- [ ] Admin can add tracking checkpoints that the customer's tracking view surfaces.
- [ ] The `requireAdmin(request)` helper exists at `src/lib/auth/require-admin.ts` and the orders routes use it; non-admins get 403.
- [ ] Both mock-token (backward compat) and session-cookie auth resolve correctly through the helper.
