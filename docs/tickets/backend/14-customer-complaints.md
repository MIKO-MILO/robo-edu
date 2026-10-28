# 14: Customer warranty complaints (submit + list)

**What to build:** `POST /api/complaints` (auth: customer) — body `{ order_item_id, reason, description, attachments? }`; validates that the `order_item_id` belongs to the logged-in user and the order status is DELIVERED; stores attachments; maps `reason` to the complaint `subject` (the schema uses `subject`/`description`). `GET /api/complaints` returns the logged-in user's own claims with status. A customer can file a warranty claim against a delivered item and track its status.

**Blocked by:** 01

**Status:** ready-for-agent

- [ ] A customer can submit a complaint only for their own DELIVERED order items; all other cases are rejected.
- [ ] Attachments are stored and returned.
- [ ] `GET /api/complaints` returns only the logged-in user's complaints, with status.
