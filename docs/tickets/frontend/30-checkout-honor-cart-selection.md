# 30: Cart Item Selection — Checkout Honors Selection

**What to build:** Wire the checkout page and the checkout API call to respect the item selection made on the cart page. The checkout page must show only the selected items (read from sessionStorage), compute all totals from that subset, and send the selected item IDs to the backend when submitting the order. After a successful order the selection is cleared from sessionStorage so a subsequent checkout of remaining cart items starts fresh.

**Blocked by:**
- 25 — Cart Item Selection — Scoped Checkout Service
- 29 — Cart Item Selection — Checkbox UI

**Status:** done

- [x] On mount, the checkout page reads `checkout_selected_ids` from sessionStorage. If the key is present and parses to a non-empty array, only cart items whose IDs are in that array are shown and used for all calculations.
- [x] If `checkout_selected_ids` is absent, empty, or unparseable (e.g. user navigated directly to `/checkout`), the checkout page falls back to using all items returned by `GET /api/cart` — matching the previous behaviour.
- [x] If the filtered item list is empty after applying the selection (e.g. all selected IDs have been removed from the cart since the user left the cart page), the page redirects to `/cart` — the existing empty-cart guard already handles this.
- [x] The checkout page subtotal matches what the shopper saw in the cart summary sidebar for the same selection; no discrepancy between pages.
- [x] Shipping cost, voucher discount, tax, and final total are all derived from the filtered item list — not the full cart.
- [x] When the shopper submits the order, the `itemIds` array (the selected cart item IDs) is included in the POST body sent to `/api/checkout/midtrans`.
- [x] After the API returns a successful order response and before navigating to the payment page, `checkout_selected_ids` is removed from sessionStorage.
- [x] Items the shopper did not select remain in their cart after the order is created (verified by navigating back to `/cart` and confirming they are still present).
- [x] The full payment flow (address selection, shipping, voucher, payment method, Midtrans redirect) continues to work correctly end-to-end for the selected items.
- [x] The idempotency key behaviour is unchanged — it is generated once per checkout page load regardless of selection.
