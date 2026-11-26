# 25: Cart Item Selection — Scoped Checkout Service

**What to build:** Extend the transaction service and checkout handler so that a checkout request can target a specific subset of cart items rather than always ordering the entire cart. When a list of cart item IDs is supplied, only those items are read for the order and only those items are removed from the cart after the order is created — leaving any un-selected items in place. When no list is supplied the existing behaviour is preserved exactly (all items ordered, all items cleared), keeping the change fully backward-compatible.

**Blocked by:** None (can start immediately)

**Status:** done

- [x] `createPaymentTransaction` accepts an optional `itemIds` parameter (array of cart item ID strings).
- [x] When `itemIds` is provided and non-empty, the cart-item SELECT query filters to only those IDs (`WHERE id IN (...)`); stock reservation and price logic are otherwise unchanged.
- [x] When `itemIds` is omitted or empty, the SELECT query fetches all cart items for the user — existing behaviour, no regression.
- [x] After a successful order is created, only the ordered items are deleted from the cart when `itemIds` is present; the remaining cart items are untouched.
- [x] When `itemIds` is absent, the existing full-cart delete still runs.
- [x] The checkout handler (`/api/checkout/midtrans`) parses an optional `itemIds` field from the request body and forwards it to `createPaymentTransaction`.
- [x] If `itemIds` is present but references IDs that do not belong to the user's cart, the query naturally returns fewer rows; the existing "Cart is empty or contains unavailable products" guard fires if the result set is empty.
- [x] Server-side stock validation and `STOCK_INSUFFICIENT` error handling are unaffected.
- [x] No database schema changes are made.
