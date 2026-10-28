# 16: Admin logs (audit instrumentation + audit-log & email-log viewers)

**What to build:** Write-side instrumentation that records an `audit_logs` row for critical admin actions — order status change, review moderation, user update — capturing actor, action, target type/id, description, and metadata. Then `GET /api/admin/audit-log` (paginated, filterable by action type + admin user) and `GET /api/admin/email-log` (paginated). (`email_logs` is already written by the email send path; only the GET endpoint is missing.)

**Blocked by:** 07, 13

**Status:** ready-for-agent

- [ ] Order status change, review moderation, and user update each create an `audit_logs` row with actor + target.
- [ ] `GET /api/admin/audit-log` is paginated and filterable by action + admin user.
- [ ] `GET /api/admin/email-log` is paginated and returns sent emails.
