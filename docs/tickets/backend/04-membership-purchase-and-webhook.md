# 04: Membership purchase flow + Midtrans Snap + webhook activation

**What to build:** `POST /api/checkout/membership` (auth: customer, body `{ package: "PLUS" }`): reads price + duration from `settings.membership_plus_price` / `membership_plus_duration_months` (never hardcoded), creates a pending `membership_purchase` (`purchase_number` = `MBR-` + timestamp + random) and a pending `payments` row (`order_id` null, `membership_purchase_id` set), calls Midtrans Snap, and returns `snap_token` + `redirect_url`. Add the `MBR-` branch to the Midtrans webhook: when the payload `order_id` starts with `MBR-`, resolve the `membership_purchase` (not `orders`); on success set `membership_purchase.paid_at`, `users.membership_status = MEMBER`, and compute `users.membership_expires_at = paid_at + duration_months_snapshot`. Idempotent across duplicate notifications. Behavior tests per spec: end-to-end checkout → webhook → membership active, and idempotency (same notification twice → membership activated exactly once).

**Blocked by:** 01, 02

**Status:** ready-for-agent

- [ ] `POST /api/checkout/membership` returns `snap_token`/`redirect_url` and creates a pending `membership_purchase` + `payments`; the price comes from `settings`, not code.
- [ ] A successful `MBR-` webhook sets `membership_status = MEMBER` and a correctly computed `membership_expires_at`.
- [ ] Duplicate webhook notifications do not double-activate membership or error (idempotent).
- [ ] A non-member can complete the purchase and become a MEMBER without admin approval.
- [ ] Tests cover the end-to-end flow and the idempotency case.
