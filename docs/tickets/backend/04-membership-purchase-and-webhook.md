# 04: Membership purchase flow + Midtrans Snap + webhook activation

**What to build:** `POST /api/checkout/membership` (auth: customer, body `{ package: "PLUS" }`): reads price + duration from `settings.membership_plus_price` / `membership_plus_duration_months` (never hardcoded), creates a pending `membership_purchase` (`purchase_number` = `MBR-` + timestamp + random) and a pending `payments` row (`order_id` null, `membership_purchase_id` set), calls Midtrans Snap, and returns `snap_token` + `redirect_url`. Add the `MBR-` branch to the Midtrans webhook: when the payload `order_id` starts with `MBR-`, resolve the `membership_purchase` (not `orders`); on success set `membership_purchase.paid_at`, `users.membership_status = MEMBER`, and compute `users.membership_expires_at = paid_at + duration_months_snapshot`. Idempotent across duplicate notifications. Behavior tests per spec: end-to-end checkout → webhook → membership active, and idempotency (same notification twice → membership activated exactly once).

**Blocked by:** 01, 02

**Status:** done

- [x] `POST /api/checkout/membership` returns `snap_token`/`redirect_url` and creates a pending `membership_purchase` + `payments`; the price comes from `settings`, not code.
- [x] A successful `MBR-` webhook sets `membership_status = MEMBER` and a correctly computed `membership_expires_at`.
- [x] Duplicate webhook notifications do not double-activate membership or error (idempotent).
- [x] A non-member can complete the purchase and become a MEMBER without admin approval.
- [x] Tests cover the end-to-end flow and the idempotency case.

> Note (from ticket 11): read the price + duration from the `settings` table
> through the shared read-seam built in ticket 11
> (`src/lib/services/settings-service.ts` — `getSetting("membership_plus_price")`
> and `getSetting("membership_plus_duration_months")`), never a hardcoded
> constant and never a separate direct query of the table. Landing this checkout
> is also what completes ticket 11's acceptance criterion 3 end-to-end: after this
> ticket, verify that `PATCH /api/admin/settings { membership_plus_price }` changes
> what `POST /api/checkout/membership` charges, then tick ticket 11's third
> checkbox and replace its "deferred" note.
