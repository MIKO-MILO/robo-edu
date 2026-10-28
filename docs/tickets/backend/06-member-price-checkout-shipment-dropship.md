# 06: Member price in checkout + auto-shipment + dropship

**What to build:** `transaction-service` checks `users.membership_status == MEMBER && membership_expires_at > now()` before pricing and uses the member price per unit when present, so the Midtrans total reflects member pricing (fixes the core "member always pays normal price" bug). Checkout input gains `providerId` and dropship fields (`is_dropship`, `sender_name`, `sender_phone`) — validated and persisted on the order. After the order is inserted, the service creates exactly one `shipments` row (`provider_id` from the body, status `PENDING`) so admin never creates shipments manually. Tests: member vs non-member pricing at checkout, and that a `shipments` row always exists after checkout.

**Blocked by:** 01, 02

**Status:** ready-for-agent

- [ ] A MEMBER's Midtrans amount uses member pricing; a non-member's uses normal pricing.
- [ ] `providerId` and dropship fields are accepted, validated, and persisted on the order.
- [ ] Every successful checkout creates exactly one `shipments` row with status `PENDING`.
- [ ] Member price is null-safe (variants without a member price use normal price).
- [ ] Tests cover member-vs-normal pricing and shipment creation.
