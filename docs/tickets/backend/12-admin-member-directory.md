# 12: Admin member directory (list + detail)

**What to build:** `GET /api/admin/resellers` — paginated list of users with `membership_status = MEMBER`, including name, email, `membership_expires_at`, and total `membership_purchase` count. `GET /api/admin/resellers/[id]` — one member's full profile plus all their `membership_purchase` rows. (Route keeps the `resellers` path per the spec; the data is members.)

**Blocked by:** 01, 07

**Status:** ready-for-agent

- [ ] The list returns only MEMBERS, paginated, with `expires_at` + purchase count.
- [ ] The detail endpoint returns the member profile and all their `membership_purchase` rows.
- [ ] Non-members are excluded from the list.
