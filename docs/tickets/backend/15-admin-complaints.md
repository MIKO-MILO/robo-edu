# 15: Admin complaint management

**What to build:** `GET /api/admin/complaints` (paginated, filterable by status + date), `GET /api/admin/complaints/[id]` (detail + attachments), and `PATCH /api/admin/complaints/[id]` (body `{ status, resolution_note? }`) updating status + resolution. Admin can triage and resolve warranty claims.

**Blocked by:** 14, 07

**Status:** ready-for-agent

- [ ] The list is paginated and filterable by status and date.
- [ ] The detail endpoint returns the complaint and its attachments.
- [ ] PATCH updates status and `resolution_note`; status transitions are validated.
