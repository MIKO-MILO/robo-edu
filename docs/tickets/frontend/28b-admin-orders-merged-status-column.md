# 28b: Admin orders table — merged status column

**What to build:** Replace the two separate "Status Pesanan" and "Pembayaran" columns in the admin orders table with a single "Status Pesanan" column. The column shows one badge per row whose label and color are derived from the combination of `order.status` and `payment.status`. The full mapping is:

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

No changes to the database, API response, or any TypeScript types — this is a UI-layer change only.

**Blocked by:** 28a (StatusBadge must accept `statusTheme` override before this ticket can use it)

**Status:** done

- [x] A pure helper function `deriveOrderDisplayStatus(orderStatus, paymentStatus)` exists, returning `{ label: string, theme: StatusTheme }` per the mapping table above.
- [x] The helper is covered by unit tests for all rows in the mapping table, with explicit coverage of the three edge cases: PENDING+EXPIRED, PENDING+FAILED, CANCELLED+PAID.
- [x] The admin orders table shows a single "Status Pesanan" column — the "Pembayaran" column is gone.
- [x] Each row renders one `StatusBadge` whose label and theme come from `deriveOrderDisplayStatus`.
- [x] The table's empty-state `colSpan` and skeleton column count reflect the new 6-column layout.
- [x] The filter tabs in `OrderFilters` are unchanged.
- [x] The API route `GET /api/admin/orders` is unchanged.
