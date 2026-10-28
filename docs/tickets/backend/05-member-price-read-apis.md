# 05: Member price in product & cart read APIs

**What to build:** For logged-in MEMBERS, `GET /api/product` and `GET /api/product/[slug]` include `member_price` per variant (from `product_variants.reseller_price`, nullable → null when there is no member discount); for guests/non-members `member_price` is null/omitted. `GET /api/cart` recomputes subtotal using the member price when the user is an active MEMBER and adds `is_member_price: boolean` per item. Also remove the stray `route,ts` junk file sitting next to the product detail route.

**Blocked by:** 01

**Status:** ready-for-agent

- [ ] MEMBERS see `member_price` on the product list and detail endpoints; guests and non-members see null/omitted.
- [ ] Cart subtotal uses the member price for an active MEMBER; `is_member_price` per item is correct.
- [ ] A variant with a null member price is treated as no discount (normal price) for everyone.
- [ ] The stray `route,ts` junk file is removed.
