# 10: Admin low-stock inventory

**What to build:** `GET /api/admin/inventory/low-stock` listing `product_variants` where `stock <= low_stock_threshold` (the per-variant threshold added in 01; the cutoff is configurable via admin settings), returning the product name, variant name, current stock, and threshold.

**Blocked by:** 01, 07

**Status:** ready-for-agent

- [ ] Endpoint returns only variants at or below their `low_stock_threshold`.
- [ ] Each row includes product name, variant name, current stock, and the threshold.
