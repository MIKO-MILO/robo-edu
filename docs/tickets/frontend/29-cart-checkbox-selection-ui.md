# 29: Cart Item Selection — Checkbox UI

**What to build:** Add a checkbox to every cart item row so shoppers can choose which items to include in their current order. The order summary sidebar must reflect only the selected items in real time. When the shopper proceeds to checkout, their selection is handed off to the checkout page via sessionStorage so the next page knows which items to show.

**Blocked by:** 25 — Cart Item Selection — Scoped Checkout Service

**Status:** done

- [x] Every in-stock cart item row shows a checkbox. Checking or unchecking it immediately updates the selection.
- [x] A "Pilih Semua" checkbox appears in the desktop column header. It checks all in-stock items when any are unchecked, and unchecks all when all are already checked.
- [x] Out-of-stock item checkboxes are rendered but permanently disabled and unchecked; they cannot be interacted with.
- [x] On cart mount (and after any cart refresh), all in-stock items are pre-selected by default.
- [x] When an item is removed from the cart, its ID is automatically pruned from the selection — no other item's selection state changes.
- [x] The order summary subtotal and total update in real time and reflect only the intersection of selected and in-stock items. Member pricing (already embedded in each item's price from the API) is preserved.
- [x] The order summary sidebar shows the count of currently selected items (e.g. "2 item dipilih").
- [x] The "Proceed to Checkout" button is disabled when zero items are selected.
- [x] An inline error message is shown if the shopper attempts to checkout with nothing selected.
- [x] Clicking a product image or product name still navigates to the product detail page; the checkbox interaction does not interfere.
- [x] On mobile, the checkbox appears inline to the left of the product image inside the item card; layout is not broken on small screens.
- [x] When the shopper clicks "Proceed to Checkout" with a valid non-empty selection, the selected item IDs are written to `sessionStorage` under the key `checkout_selected_ids` as a JSON array before navigating to `/checkout`.
