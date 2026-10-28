# 08: Admin dashboard summary

**What to build:** `GET /api/admin/dashboard` aggregating from the DB: total orders (this month & all-time), total revenue (from paid orders), total customers, pending orders, and the 5 most recent orders. Test that the aggregations match the seeded fixture exactly.

**Blocked by:** 01, 02, 07

**Status:** ready-for-agent

- [ ] Endpoint returns total orders (this month + all-time), total revenue, total customers, pending order count, and 5 recent orders.
- [ ] The numbers match the test fixture; tests assert the aggregation.
