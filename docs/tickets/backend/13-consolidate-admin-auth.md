# 13: Consolidate admin auth

**What to build:** Migrate every remaining admin route (reviews, categories, products, users, vouchers, and any other `app/api/admin/*` route still using inline `isAdminRole`) to the shared `requireAdmin` helper introduced in 07. Verify with a guard test that each returns 403 for non-admins/unauthenticated and 200 for admins. This also fixes the latent `session.role` bug — the helper resolves role from the DB user record, not the session payload (which `getSession()` does not return).

**Blocked by:** 07

**Status:** ready-for-agent

- [ ] No admin route uses inline `isAdminRole`; all go through `requireAdmin`.
- [ ] A guard test asserts each migrated route returns 403 for non-admin / unauthenticated and works for admin.
- [ ] The `session.role` bug is resolved (role is always read from the DB user record).
