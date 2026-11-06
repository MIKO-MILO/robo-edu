# 11: Admin settings (store/membership/shipping config)

**What to build:** `GET /api/admin/settings` returning all settings as a flat object, and `PATCH /api/admin/settings` accepting a partial object that updates only the sent keys. Covers store info (name/address/phone/email), membership price + duration, and shipping config (min weight, cost, default provider). Editing the membership price changes what `POST /api/checkout/membership` charges without a redeploy.

**Blocked by:** 01, 07

**Status:** in-progress (agent)

- [x] GET returns all settings as a flat object.
- [x] PATCH updates only the sent keys and returns the updated state.
- [ ] Changing `membership_plus_price` changes the price charged by the membership checkout, verified end-to-end.

> Note: criterion 3 is verified at the shared settings read-seam
> (`src/lib/services/settings-service.ts`): PATCH updates the `settings` row
> and a subsequent `getSetting("membership_plus_price")` returns the new value
> immediately (no redeploy). The literal end-to-end through
> `POST /api/checkout/membership` completes when ticket 04 lands the checkout,
> which reads the price from this same `getSetting` (never hardcoded).
