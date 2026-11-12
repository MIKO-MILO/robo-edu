# 11: Admin settings (store/membership/shipping config)

**What to build:** `GET /api/admin/settings` returning all settings as a flat object, and `PATCH /api/admin/settings` accepting a partial object that updates only the sent keys. Covers store info (name/address/phone/email), membership price + duration, and shipping config (min weight, cost, default provider). Editing the membership price changes what `POST /api/checkout/membership` charges without a redeploy.

**Blocked by:** 01, 07

**Status:** done

- [x] GET returns all settings as a flat object.
- [x] PATCH updates only the sent keys and returns the updated state.
- [x] Changing `membership_plus_price` changes the price charged by the membership checkout, verified end-to-end.

> Note: criterion 3 verified end-to-end. `POST /api/checkout/membership` reads
> the price via `getSetting("membership_plus_price")`
> (`src/lib/services/settings-service.ts`), and
> `tests/membership/purchase-flow.test.ts` ("price comes from settings —
> changing membership_plus_price changes what is charged") asserts that
> PATCH-ing the setting to 299000 makes the checkout charge 299000 with no
> redeploy.
