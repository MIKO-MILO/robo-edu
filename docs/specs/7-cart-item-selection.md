# 7 — Cart Item Selection (Checkbox)

**Label:** `ready-for-agent`

---

## Problem Statement

Saat ini, semua item yang ada di keranjang belanja selalu ikut dihitung dan wajib di-checkout semuanya sekaligus. User tidak bisa memilih subset item — misalnya ingin checkout dua dari tiga produk di keranjang, sementara menunda yang satu. Ini memaksa user menghapus item yang belum ingin dibeli, lalu menambahkannya kembali setelah checkout, yang merupakan pengalaman yang buruk dan tidak intuitif.

## Solution

Tambahkan checkbox pada setiap item di halaman keranjang sehingga user dapat memilih item mana saja yang ingin di-checkout. Hanya item yang dicentang yang akan masuk ke ringkasan pesanan, dikirim ke halaman checkout, dan diproses sebagai order. Item yang tidak dipilih tetap berada di keranjang setelah order berhasil dibuat.

## User Stories

1. As a shopper, I want to see a checkbox next to each cart item, so that I can choose which items to include in my current order.
2. As a shopper, I want all in-stock items to be pre-selected by default when I open the cart, so that I don't need extra steps for a normal checkout flow.
3. As a shopper, I want a "Select All" checkbox in the column header, so that I can select or deselect all eligible items in one click.
4. As a shopper, I want the "Select All" checkbox to reflect a checked state only when all in-stock items are selected, so that the state of the header is always accurate.
5. As a shopper, I want out-of-stock items to have their checkboxes disabled and permanently unchecked, so that I cannot accidentally include unavailable products.
6. As a shopper, I want the order summary subtotal and total to update in real time as I check and uncheck items, so that I always see the accurate amount for the items I intend to buy.
7. As a shopper, I want to see the count of selected items in the order summary sidebar, so that I have a quick confirmation of how many products I'm about to checkout.
8. As a shopper, I want the "Proceed to Checkout" button to be disabled when no items are selected, so that I cannot proceed with an empty selection.
9. As a shopper, I want to see a helpful inline error message when I try to checkout without selecting anything, so that I understand why the action is blocked.
10. As a shopper, I want clicking the product image or name to still navigate to the product detail page even when the row has a checkbox, so that the existing product browsing experience is preserved.
11. As a shopper, I want to remove an item from the cart without affecting the selection state of other items, so that my current selection is maintained after a deletion.
12. As a shopper, I want my selection to be honored when I am taken to the checkout page, so that the checkout summary only shows the items I chose.
13. As a shopper, I want the checkout page subtotal to match exactly what I saw in the cart summary, so that there are no surprises between pages.
14. As a shopper, I want items I did not select to remain in my cart after I successfully complete an order, so that I can buy them later without re-adding them.
15. As a shopper, I want the entire checkout and payment flow to continue working exactly as before for the selected items, so that the new selection feature does not break anything I already rely on.
16. As a shopper, I want the checkout page to redirect me back to the cart if my selection somehow arrives empty (e.g. navigating directly to checkout), so that I am never shown an empty checkout.

## Implementation Decisions

### 1. Selection persistence strategy: sessionStorage (client-only)

Selection state is **not** persisted to the database. It is held in component state on the cart page and transferred to the checkout page via `sessionStorage` under the key `checkout_selected_ids` (a JSON-serialised array of cart item IDs). This avoids a DB schema migration and is consistent with the fact that the checkout page already bypasses the cart context and fetches `/api/cart` independently.

Selection is cleared from sessionStorage after a successful order submission.

If the checkout page is loaded without a valid `checkout_selected_ids` entry (direct navigation), it falls back to using all items — matching the previous behaviour.

### 2. Default selection: all in-stock items pre-selected

When the cart page mounts (or the cart refreshes), selection initialises to the full set of in-stock item IDs. Out-of-stock items are excluded and their checkboxes are always disabled. When an item is removed from the cart, its ID is pruned from the selection set automatically via a `useEffect` that syncs selection against the current item list.

### 3. Subtotal recalculation is local to the cart page

The order summary subtotal on the cart page is derived client-side from `selected ∩ in-stock` items:

```
subtotal = items
  .filter(item => item.stock > 0 && selectedIds.has(item.id))
  .reduce((acc, item) => acc + item.price * item.quantity, 0)
```

No new API call is needed; the existing `CartItemDto.price` (which already reflects member pricing from the backend) is used directly.

### 4. Layout change: checkbox column in the cart item grid

A new checkbox column is inserted to the left of the product image/name area. The desktop header grid is adjusted to accommodate it (shifting product and quantity column spans accordingly). On mobile, the checkbox sits inline to the left of the product image, inside the item card.

### 5. Checkout page: filters fetched cart items to selected IDs

The checkout page reads `checkout_selected_ids` from sessionStorage inside its `fetchPageData` function. After mapping the full `/api/cart` response, it filters the item list to only those whose `id` is in the session set. The downstream subtotal, shipping, voucher, and tax calculations all operate on this filtered list — no other changes are needed inside the checkout page.

### 6. API: checkout endpoint accepts an optional `itemIds` list

The `/api/checkout/midtrans` request body accepts a new optional field `itemIds: string[]`. The checkout handler parses this field and forwards it to `createPaymentTransaction`.

If `itemIds` is absent or empty, the service falls back to selecting all cart items — backward compatible with any direct API calls or existing integrations.

### 7. Transaction service: scoped SELECT and scoped DELETE

`createPaymentTransaction` receives an optional `itemIds` parameter. When present:

- The cart-item SELECT query adds a `WHERE cart_items.id IN (itemIds)` clause.
- After the order is created, only the ordered items are deleted from the cart (`DELETE WHERE cartId = ? AND id IN (itemIds)`).

When absent, the existing behaviour (select all, delete all) is preserved.

This is the only place in the backend where cart items are read for order creation and cleared afterward — no other service or route needs to change.

### 8. No changes to the database schema

The `cart_items` table gains no new column. The `carts` table is unchanged. No migration is required.

### 9. No changes to CartContext

The cart context (`contexts/cart-context.tsx`) is not modified. Selection is a page-level concern on the cart page only. The context continues to hold the full item list, and its `removeItem` optimistic update already filters the item from the array — the cart page's selection `useEffect` will prune the removed ID from the selection set on the next render.

### 10. Validation: server remains the authority

The backend still validates stock availability for each selected item at order-creation time (`STOCK_INSUFFICIENT` error path in `createPaymentTransaction`). The client-side selection does not bypass any server-side checks.

## Testing Decisions

### What makes a good test here

Tests should assert observable **user-facing or API-contract behaviour**, not implementation details like internal state shape or which React hooks fire. The two meaningful seams are:

1. **Cart page UI** — checkbox interaction, subtotal recalculation, button disable state.
2. **`createPaymentTransaction` service** — that it selects and deletes only the specified item IDs when `itemIds` is provided, and that it falls back to all items when `itemIds` is absent.

The checkout page's sessionStorage-read-and-filter logic is thin enough to be covered by an integration test that navigates from the cart page to checkout.

### Modules to test

- `createPaymentTransaction` (transaction-service): unit/integration test verifying that:
  - When `itemIds` contains a subset of cart item IDs, only those items appear in the created order.
  - After the order is created, only the specified items are removed from the cart; non-selected items remain.
  - When `itemIds` is omitted, all items are ordered and the cart is cleared (existing behaviour preserved).
- Cart page component: component test (using the project's existing component-test pattern) verifying that:
  - Unchecking an item removes it from the subtotal.
  - Unchecking all items disables the checkout button and shows an error.
  - "Select All" toggles all in-stock checkboxes.
  - OOS item checkboxes are disabled.

### Prior art

- Existing service-level tests for order creation live alongside other service tests in `src/lib/services/`.
- Cart page tests (if any) would follow the same pattern as other `app/(user)/` page component tests.

## Out of Scope

- **Saving selection across page reloads or browser sessions.** Selection is ephemeral; closing and reopening the cart resets it to all in-stock items selected.
- **Wishlist / save-for-later.** Unchecking an item does not move it to any persistent "saved" list; it simply stays in the cart unordered.
- **Bulk delete of selected items.** A "Delete selected" action is not part of this spec.
- **Selection-aware cart badge count.** The cart icon badge in the header continues to show the total number of items in the cart, not the number of selected items.
- **Admin-side visibility of which items were selected.** The order is created from the selected items and looks identical to any other order; no admin-facing UI change is needed.
- **Mobile-specific swipe-to-select gesture.** A standard checkbox tap interaction is sufficient.

## Further Notes

- The checkout page currently redirects to `/cart` when it finds zero items after fetching. This guard still applies after the filter — if the user's sessionStorage entry somehow references IDs that no longer exist in the cart, the filtered list will be empty and the redirect will trigger, landing the user back at the cart safely.
- Member pricing (`is_member_price`) is already applied per item by `GET /api/cart` and stored in `CartItemDto.price`. The client-side subtotal calculation on the cart page uses this pre-computed price, so member discounts are correctly reflected in the selection subtotal without any additional logic.
- The idempotency key on the checkout submit (a `crypto.randomUUID()` stored in a `useRef`) is generated once per checkout page load and is unaffected by this change.
- Clearing sessionStorage on successful order submission ensures that if the user immediately navigates back to checkout for remaining cart items, there is no stale selection from the previous order.
