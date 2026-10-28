# 09: Admin sales & top-products reports

**What to build:** `GET /api/admin/reports/sales` with `from`/`to` (ISO date) query params — aggregates paid orders per day/week/month, total revenue, and transaction count. `GET /api/admin/reports/top-products` with `from`/`to`/`limit` (default 10) — aggregates `order_items` joined to `products`, ordered by total units sold DESC. Tests assert both aggregations against seeded data.

**Blocked by:** 01, 02, 07

**Status:** ready-for-agent

- [ ] The sales report respects the date range and returns correct revenue + transaction count.
- [ ] The top-products report ranks by units sold DESC and respects `limit` + the date range.
- [ ] Tests assert both reports against the seeded data.
