# 03: Membership status read API + frontend off mock

**What to build:** Real `GET /api/membership/me` (auth: customer) returning `{ status, expires_at, days_remaining, purchase_history: [...] }` from `users` joined to `membership_purchase` (history includes the payment method via `payments`). Swap the frontend membership hook off the `app/api/mock-membership-me` mock route and delete that mock route. A logged-in user sees their live membership status and purchase history on the membership page.

**Blocked by:** 01

**Status:** ready-for-agent

- [ ] `GET /api/membership/me` returns status, expires_at, days_remaining, and purchase history for the logged-in user; returns 401 without a session.
- [ ] The frontend membership UI reads the real endpoint; the `mock-membership-me` route is deleted and the hook updated.
- [ ] An active MEMBER and a NOT_MEMBER both render correctly on the profile page.
