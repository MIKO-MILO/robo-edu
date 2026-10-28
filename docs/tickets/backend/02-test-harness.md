# 02: Test harness (vitest + seeded test DB)

**What to build:** A behavior-test harness — none exists today. Add vitest (plus whatever MySQL test helpers are needed), a `test` script, and a deterministically-seeded test DB (real DB, no mocks) with a small fixture: users incl. one MEMBER and one non-member, products/variants (one variant with a member price, one without), orders, payments. Tests assert on response status/body and DB state, per the spec's testing decisions ("test harus menguji perilaku dari luar"). Provide a pattern/example test so later tickets follow the same shape.

**Blocked by:** 01

**Status:** ready-for-agent

- [ ] `npm run test` runs vitest against a seeded test DB and exits cleanly.
- [ ] The test DB is created/seeded deterministically and reset between runs (no leftover state).
- [ ] At least one example test asserts both an API response and a resulting DB row.
- [ ] Fixtures include a MEMBER user, a non-MEMBER user, and variants with and without a member price.
