# 01: DB schema migration & seed foundation

**What to build:** The Fase 1.1 schema change so every later endpoint has the tables it needs. Rename `users.reseller_status` → `membership_status` (enum `NOT_MEMBER`/`MEMBER`) and `reseller_approved_at` → `membership_expires_at` (nullable datetime); per the spec, old fields are dropped, not converted (`NOT_RESELLER`→`NOT_MEMBER`, `RESELLER`→`MEMBER`). Add a new `membership_purchase` table: `id`, `purchase_number` (unique, `MBR-` + timestamp + random), `user_id` FK, `payment_id` FK, `price_snapshot`, `duration_months_snapshot`, `plan_name_snapshot`, `starts_at`, `ends_at`, `paid_at`, `reminder_h7_sent_at`, `reminder_h3_sent_at`, `status`, `created_at`. Add a `settings` key-value table (`key` PK, `value` TEXT, `updated_at`) with seed rows: `membership_plus_price`, `membership_plus_duration_months`, `store_name`, `store_phone`, `store_email`, `store_address`. Make `payments.order_id` nullable and add a nullable `membership_purchase_id` FK, enforcing "exactly one of `order_id` / `membership_purchase_id`" at the insert sites (MySQL CHECK is loosely enforced). Add `orders.is_dropship` (bool, default false), `sender_name`, `sender_phone` (nullable). On `product_variants`, **keep the existing `reseller_price` column** (per PRD "nama kolom tidak diubah"), make it nullable, and treat it as the member price — exposed as `member_price` by APIs (null = no member discount for that variant). Add `product_variants.low_stock_threshold`. Update `src/db/relations` accordingly. Update all TS types and existing references (`types/user.ts`, `types/enums.ts` → `MembershipStatus`, `types/reseller.ts` legacy, and any frontend/admin code reading `reseller_status`/`reseller_approved_at`) so the build stays green — ripgrep first. Run `db:generate` + `db:migrate`; `npm run build` passes.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] `users` uses `membership_status` (NOT_MEMBER/MEMBER) + `membership_expires_at`; no `reseller_status`/`reseller_approved_at` remain in schema or generated migration.
- [ ] `membership_purchase` and `settings` tables exist; `settings` seeded with the six keys above.
- [ ] `payments.order_id` is nullable; `membership_purchase_id` FK present; the exactly-one constraint is enforced at every insert site.
- [ ] `orders` has `is_dropship`, `sender_name`, `sender_phone`.
- [ ] `product_variants.reseller_price` is nullable (treated as the member price); `low_stock_threshold` column exists with a sensible default.
- [ ] No TypeScript/`build` errors from the rename; `npm run build` and `db:migrate` succeed.
