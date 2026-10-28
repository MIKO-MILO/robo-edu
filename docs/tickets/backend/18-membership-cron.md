# 18: Membership cron (daily expire + h7/h3 reminders)

**What to build:** A daily 01:00 cron that queries MEMBERS with `membership_expires_at < now()` and batch-updates them to `NOT_MEMBER`. A reminder cron that finds `membership_purchase` rows ending in 7 or 3 days with `reminder_h7_sent_at` / `reminder_h3_sent_at` still null and enqueues the corresponding reminder email jobs (via the queue from 17), stamping the sent_at fields so each reminder fires at most once. Unit test per spec: a user with a past `membership_expires_at` flips to `NOT_MEMBER`. Crons run on their configured schedule from the worker process.

**Blocked by:** 04, 17, 02

**Status:** ready-for-agent

- [ ] The expire cron flips expired MEMBERS to `NOT_MEMBER` (unit-tested with a past-expiry user).
- [ ] The reminder cron enqueues h7 and h3 emails exactly once each (guarded by the `sent_at` stamps).
- [ ] Cron jobs run on the configured schedule from the worker process.
