# 17: BullMQ email queue + worker entry point + webhook enqueue refactor

**What to build:** `src/lib/queue/email-queue.ts` (ioredis, `REDIS_URL`), a worker handling job types `order-receipt`, `membership-receipt`, `membership-reminder-h7`, `membership-reminder-h3`, a separate `src/workers/index.ts` entry point, and an `npm run worker` script. Refactor the Midtrans webhook (both the order and the `MBR-` membership branches from 04) to enqueue email jobs instead of calling `sendEmail` directly, so the webhook never times out and retries don't duplicate emails. Requires `REDIS_URL` in all environments — document it in `.env.example`.

**Blocked by:** 04

**Status:** ready-for-agent

- [ ] `npm run worker` starts the BullMQ worker and processes email jobs.
- [ ] The webhook enqueues email jobs instead of sending synchronously; webhook response time no longer depends on Resend.
- [ ] Duplicate webhook notifications don't produce duplicate emails (job idempotency).
- [ ] `REDIS_URL` is documented in `.env.example`.
