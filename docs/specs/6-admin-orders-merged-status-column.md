# 28 — Admin Orders: Merged Status Column

**Label:** `ready-for-agent`

---

## Problem Statement

The admin orders table currently shows two separate columns: "Status Pesanan" (order status) and "Pembayaran" (payment status). This forces the admin to read two badges per row and mentally combine them to understand what action, if any, is needed. Some combinations produce two identical badges (e.g. both showing "Menunggu" or both showing "Dibayar"), which adds noise without adding information. Other combinations — such as an order that is CANCELLED but whose payment arrived late and is PAID — carry critical information that is easy to miss when each badge is read in isolation.

## Solution

Replace the two separate status columns with a single "Status Pesanan" column that derives one unified display label from the combination of `order.status` and `payment.status`. The derived label describes the full state of the order in plain language (e.g. "Menunggu Dibayar", "Sedang Diproses", "Dibatalkan · Perlu Refund") so the admin can read the table in a single glance.

No changes are made to the database, the API, or any type definitions — the merge is purely a UI-layer concern.

## User Stories

1. As an admin, I want to see one status badge per order row, so that I can read the table faster without having to mentally combine two separate columns.
2. As an admin, I want the badge to say "Menunggu Dibayar" when the order is waiting for payment, so that the action needed is immediately obvious.
3. As an admin, I want the badge to say "Pembayaran Gagal" (red) when a payment attempt failed, so that I know the order will not proceed without customer action.
4. As an admin, I want the badge to say "Kedaluwarsa" (grey) when a pending order's payment window has expired, so that I can distinguish it from an order still waiting for payment.
5. As an admin, I want the badge to say "Menunggu Diproses" when payment is confirmed, so that I know this order needs to be picked up by the warehouse team.
6. As an admin, I want the badge to say "Sedang Diproses" (purple) when the order is being packed, so that I know the warehouse is handling it.
7. As an admin, I want the badge to say "Dikirim" (dark blue) when the parcel is in transit, so that I know the courier has picked it up.
8. As an admin, I want the badge to say "Terkirim" (light blue) when the courier confirms delivery, so that I know the parcel has arrived but the customer has not yet confirmed receipt.
9. As an admin, I want the badge to say "Selesai" (green) when the customer confirms receipt, so that I know the transaction is fully complete.
10. As an admin, I want the badge to say "Dibatalkan" (red) when the order was cancelled and no payment was received, so that I know no financial action is needed.
11. As an admin, I want the badge to say "Dibatalkan · Perlu Refund" (red) when the order was cancelled but payment was already received, so that I know I must process a manual refund.
12. As an admin, I want the badge to say "Di-Refund" (orange) when a refund has been processed, so that I can confirm the case is closed.
13. As an admin, I want "Terkirim" and "Selesai" to have visually distinct colors, so that I can distinguish between courier-confirmed delivery and customer-confirmed receipt at a glance.

## Implementation Decisions

- **Derive at the UI layer only.** `order.status` and `payment.status` remain separate fields in the API response and in all TypeScript types. No new API params, no new DB columns, no changes to `AdminOrderRow`.

- **`order.status` is primary; `payment.status` is a tiebreaker.** For the majority of states (PROCESSING, SHIPPED, DELIVERED, COMPLETED, REFUNDED) `order.status` alone determines the display label. `payment.status` is only consulted for two edge cases: PENDING orders (to distinguish still-waiting vs failed vs expired) and CANCELLED orders (to flag when a refund is needed).

- **A pure helper function encapsulates all mapping logic.** The function signature is:
  ```
  deriveOrderDisplayStatus(orderStatus, paymentStatus) → { label: string, theme: StatusTheme }
  ```
  It is a plain TypeScript function with no side effects, living in the orders component folder.

- **Full mapping table (from design decisions in this conversation):**

  | order.status | payment.status | Label | Theme |
  |---|---|---|---|
  | PENDING | PENDING | Menunggu Dibayar | warning |
  | PENDING | EXPIRED | Kedaluwarsa | muted |
  | PENDING | FAILED | Pembayaran Gagal | danger |
  | PAID | PAID | Menunggu Diproses | info |
  | PROCESSING | PAID | Sedang Diproses | purple |
  | SHIPPED | PAID | Dikirim | info |
  | DELIVERED | PAID | Terkirim | softBlue |
  | COMPLETED | PAID | Selesai | success |
  | CANCELLED | PENDING/EXPIRED/FAILED | Dibatalkan | danger |
  | CANCELLED | PAID | Dibatalkan · Perlu Refund | danger |
  | REFUNDED | REFUNDED | Di-Refund | orange |

- **`StatusBadge` needs a non-breaking patch.** Audit revealed that `statusTheme` exists in the component's prop types (via `VariantProps`) but is not destructured inside the function body — the theme is always read from the internal `statusMap[status]`. The fix is to destructure `statusTheme` and use it as an override: `statusTheme ?? config.theme`. All existing call sites that do not pass `statusTheme` are unaffected.

- **The table drops from 7 columns to 6.** The "Pembayaran" column is removed. `colSpan` on the empty state and the skeleton row count must be updated accordingly.

- **The filter tabs are not changed.** Existing status filter tabs in `OrderFilters` are based on `OrderStatus` values and remain as-is. This is explicitly out of scope.

## Testing Decisions

- The only logic worth testing is `deriveOrderDisplayStatus`. It is a pure function with no dependencies, so it is straightforward to cover with unit tests.
- A good test checks the returned `{ label, theme }` for each row in the mapping table above. Edge cases to cover explicitly: PENDING+EXPIRED, PENDING+FAILED, CANCELLED+PAID.
- The `StatusBadge` patch is a one-line change with no branching logic — visual verification in the browser is sufficient; no unit test needed.
- The table column change is structural markup — visual verification is sufficient.

## Out of Scope

- Filter tabs: no changes to the `OrderFilters` component or the `ORDER_STATUS_TABS` constant.
- API changes: `GET /api/admin/orders` response shape is unchanged.
- DB / migration: no schema changes.
- Order detail page: the detail page has its own status display — not changed in this ticket.
- Payment status filter: adding a `payment_status` query param to the API is a separate concern.

## Further Notes

- The "Dibatalkan · Perlu Refund" case maps to the real production scenario where a customer transfers money after their order was auto-cancelled by the expiry cron job. The webhook sets `payment.status = PAID` but intentionally leaves `order.status = CANCELLED` and fires a Sentry alert. This badge gives the admin a visual signal that a manual refund is pending, without needing to open the detail page.
- SHIPPED and DELIVERED share the `info`/`softBlue` theme pair intentionally: SHIPPED (biru tua) = in transit, DELIVERED (biru muda) = arrived but not yet confirmed. The color progression leads naturally to COMPLETED (green) = fully done.
